import { getInput, setFailed, setSecret } from "@actions/core";
import { HttpClient, HttpClientResponse } from "@actions/http-client";
import { BasicCredentialHandler } from "@actions/http-client/lib/auth";
import { context } from "@actions/github";

class RPC {
  private readonly endpoint: string;
  private readonly http: HttpClient;
  constructor(endpoint: string, username: string, password: string) {
    this.endpoint = endpoint;
    this.http = new HttpClient("JOSMPluginAction/update_pluginssource", [
      new BasicCredentialHandler(username, password),
    ]);
  }

  async json_request(requestBody): Promise<HttpClientResponse> {
    let realBody;
    if (requestBody instanceof String) {
      realBody = requestBody;
    } else if (requestBody instanceof Object || requestBody instanceof Array) {
      realBody = JSON.stringify(requestBody);
    } else {
      throw Error("Unknown type: " + typeof requestBody);
    }
    return await this.http.post(this.endpoint, realBody, {
      "Content-Type": "application/json",
    });
  }
}

function replacePageText(pageText: string): string {
  const baseUrl = buildBaseUrl();
  if (!pageText.includes(baseUrl)) {
    throw Error(
      "You need to do a manual release at least once, expected base url " +
        baseUrl
    );
  }
  let newUrl;
  const inputJarName = getInput("plugin-jar-name");
  let jarName =
    inputJarName != null && inputJarName.length > 0
      ? getInput("plugin-jar-name")
      : context.repo.repo;
  // This should probably be replaced with context.refType/context.refProtected at some point when it is implemented
  if (
    process.env.GITHUB_REF_TYPE === "tag" &&
    process.env.GITHUB_REF_PROTECTED === "true"
  ) {
    // Release build
    jarName += ".jar";
    newUrl =
      baseUrl + "/releases/download/" + context.ref + "/" + jarName + ".jar";
  } else {
    // dev build. We don't have a place to store the dev builds, so throw an exception for now.
    // jar_name += "-dev.jar";
    throw Error("We don't currently support dev builds");
  }
  const re = new RegExp(baseUrl + "/releases/download/" + ".*" + jarName);
  const newText = pageText.replace(re, newUrl);
  if (newText === pageText) {
    throw Error("No update is necessary for PluginsSource");
  }
  return newText;
}

async function updatePageText(
  server,
  pageName,
  pageText
): Promise<HttpClientResponse> {
  const repo = context.repo;
  return server.json_request({
    params: [
      "SandBox" /* TODO Replace with page_name */,
      pageText,
      { comment: repo.owner + "/" + repo.repo + ": Update plugin link" },
    ],
    method: "wiki.putPage",
    id: 1,
  });
}

function buildBaseUrl(): string {
  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const baseUrl = context.serverUrl;
  return baseUrl + "/" + owner + "/" + repo;
}

async function run(): Promise<HttpClientResponse> {
  const username = getInput("trac-username");
  const password = getInput("trac-password");
  if (
    (username == null || username === "") &&
    (password == null || password === "")
  ) {
    throw Error("Username and password are not provided");
  }
  setSecret(username);
  setSecret(password);
  const josmTracEndpoint = "https://josm.openstreetmap.de/login/rpc";
  const server = new RPC(josmTracEndpoint, username, password);
  const pageName = "PluginsSource";
  return await server
    .json_request({
      params: [pageName],
      method: "wiki.getPage",
      id: 1,
    })
    .then(async (response) => await response.readBody())
    .then((text) => JSON.parse(text))
    .then((json) => json.result)
    .then((pageText) => replacePageText(pageText))
    .then(async (pageText) => await updatePageText(server, pageName, pageText));
}

run().catch((err) => setFailed(err));
