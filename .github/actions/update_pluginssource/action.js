const core = require('@actions/core')
const github = require('@actions/github')
const httpm = require('@actions/http-client')
const httpmauth = require('@actions/http-client/lib/auth')

class rpc {
    constructor(endpoint, username, password) {
        this.endpoint = endpoint;
        this.http = new httpm.HttpClient("JOSMPluginAction/update_pluginssource", [new httpmauth.BasicCredentialHandler(username, password)]);
    }

    json_request(requestBody) {
        let realBody;
        if (requestBody instanceof String) {
            realBody = requestBody;
        } else if (requestBody instanceof Object || requestBody instanceof Array) {
            realBody = JSON.stringify(requestBody);
        } else {
            throw "Unknown type: " + (typeof requestBody);
        }
        return this.http.post(this.endpoint, realBody,
            {
                "Content-Type": "application/json"
            });
    }
}

function replace_page_text(page_text) {
    const base_url = build_base_url();
    if (!page_text.includes(base_url)) {
        throw "You need to do a manual release at least once, expected base url " + base_url;
    }
    let new_url;
    let input_jar_name = core.getInput("plugin-jar-name");
    let jar_name = (input_jar_name != null && input_jar_name.length > 0 ? core.getInput("plugin-jar-name") : github.context.repo.repo);
    // This should probably be replaced with github.context.refType/github.context.refProtected at some point when it is implemented
    if (process.env.GITHUB_REF_TYPE === "tag" && process.env.GITHUB_REF_PROTECTED === 'true') {
        // Release build
        jar_name += ".jar";
        new_url = base_url + '/releases/download/' + github.context.ref + '/' + jar_name + ".jar";
    } else {
        // dev build. We don't have a place to store the dev builds, so throw an exception for now.
        // jar_name += "-dev.jar";
        throw "We don't currently support dev builds";
    }
    let re = new RegExp(base_url + '/releases/download/' + '.*' + jar_name )
    let new_text = page_text.replace(re, new_url);
    if (new_text === page_text) {
        throw "No update is necessary for PluginsSource";
    }
    return new_text;
}

function update_page_text(server, page_name, page_text) {
    let repo = github.context.repo;
    return server.json_request({
        "params": [page_name, page_text, {"comment": repo.owner + '/' + repo.repo + ": Update plugin link"}],
        "method": "wiki.putPage",
        "id": 1
    })
}

function build_base_url() {
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    const base_url = github.context.serverUrl;
    return base_url + '/' + owner + '/' + repo;
}

async function run() {
    const username = core.getInput("trac-username");
    const password = core.getInput("trac-password");
    core.setSecret(username);
    core.setSecret(password);
    if (username == null && password == null) {
        core.setFailed("Username and password are not provided");
        return 1;
    }
    const josmTracEndpoint = "https://josm.openstreetmap.de/login/rpc";
    const server = new rpc(josmTracEndpoint, username, password);
    const page_name = "SandBox";
    let promise = server.json_request({
        "params": [page_name],
        "method": "wiki.getPage",
        "id": 1
    })
        .then(response => response.readBody())
        .then(text => JSON.parse(text))
        .then(json => json["result"])
        .then(pageText => replace_page_text(pageText))
        .then(pageText => update_page_text(server, page_name, pageText))
        .catch(err => core.setFailed(err));
    await promise;
}

run().catch(err => core.setFailed(err));