import { getJosmRevision } from "./josm-revision";
import * as core from "@actions/core";
import * as cache from "@actions/cache";
import * as glob from "@actions/glob";
import * as exec from "@actions/exec";

async function cloneJosm(josmRevision: number): Promise<string> {
  await exec.exec("svn", [
    "checkout",
    "--depth=immediates",
    "https://josm.openstreetmap.de/osmsvn/applications/editors/josm",
    "josm",
  ]);
  await updateJosm("josm/core", josmRevision);
  const options = { cwd: "josm" };
  await exec
    .getExecOutput("svn", ["propget", "svn:externals"], options)
    .then((output) => output.stdout)
    .then((output) =>
      Promise.all(
        output
          .split("\n")
          .filter((str) => str.includes("core"))
          .map((repo) =>
            exec.exec("svn", ["checkout"].concat(repo.split(" ")), options)
          )
          .values()
      )
    );
  return "josm/core";
}

async function updateJosm(josmSource: string, josmRevision: number) {
  await exec.exec("svn", [
    "update",
    "--revision=" + josmRevision,
    "--set-depth=infinity",
    "--accept=theirs-full",
    josmSource,
  ]);
}

async function buildJosm(josmSource: string, josmRevision: number) {
  const buildHit = await cache.restoreCache(
    [josmSource + "/dist/josm-custom.jar"],
    "josm-r" + josmRevision
  );
  // Short-circuit
  if (buildHit != null && buildHit != "") {
    core.info("Cache hit for " + buildHit);
    return;
  }
  const ivyFiles = await glob.hashFiles("**/ivy.xml");
  const ivyHit = await cache.restoreCache(
    ["~/.ivy2/cache/", josmSource + "/tools"],
    "ivy-" + ivyFiles
  );
  if (ivyHit == null || ivyHit == "") {
    await exec.exec("ant", [
      "-buildfile",
      josmSource + "/build.xml",
      "resolve",
    ]);
    await cache.saveCache(
      ["~/.ivy2/cache/", josmSource + "/tools"],
      "ivy-" + ivyFiles
    );
  }
  await exec.exec("ant", ["-buildfile", josmSource + "/build.xml", "dist"]);
  await cache.saveCache(
    [josmSource + "/dist/josm-custom.jar"],
    "josm-r" + josmRevision
  );
}

async function buildJosmTests(josmSource: string, josmRevision: number) {
  const buildHit = await cache.restoreCache(
    [josmSource + "/test/build"],
    "josm-tests-r" + josmRevision
  );
  // Short-circuit
  if (buildHit != null && buildHit != "") {
    core.info("Cache hit for " + buildHit);
    return;
  }
  await buildJosm(josmSource, josmRevision);
  const ivyFiles = await glob.hashFiles("**/ivy.xml");
  const ivyHit = await cache.restoreCache(
    ["~/.ivy2/cache/", josmSource + "/tools"],
    "test-ivy-" + ivyFiles
  );
  if (ivyHit == null || ivyHit == "") {
    await exec.exec("ant", [
      "-buildfile",
      josmSource + "/build.xml",
      "test-init",
    ]);
    await cache.saveCache(
      ["~/.ivy2/cache/", josmSource + "/tools"],
      "test-ivy-" + ivyFiles
    );
  }
  await exec.exec("ant", [
    "-buildfile",
    josmSource + "/build.xml",
    "test-compile",
  ]);
  await cache.saveCache(
    [josmSource + "/test/build"],
    "josm-tests-r" + josmRevision
  );
}

async function run() {
  const josmRevision = await getJosmRevision(core.getInput("josm-revision"));
  core.setOutput("josm-revision", josmRevision);
  const josmSource = await core.group("JOSM clone r" + josmRevision, () =>
    cloneJosm(josmRevision)
  );
  await core.group("JOSM build r" + josmRevision, () =>
    buildJosm(josmSource, josmRevision)
  );
  const josmTestRevision = await getJosmRevision(
    core.getInput("josm-test-revision")
  );
  core.setOutput("josm-test-revision", josmTestRevision);
  await core.group("JOSM update r" + josmTestRevision, () =>
    updateJosm(josmSource, josmTestRevision)
  );
  await core.group("JOSM build tests r" + josmTestRevision, () =>
    buildJosmTests(josmSource, josmRevision)
  );
}

run().catch((err) => core.setFailed(err));
