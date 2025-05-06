import { getJosmRevision } from "./josm-revision";
import { group, info, getInput, setOutput, setFailed } from "@actions/core";
import { saveCache, restoreCache } from "@actions/cache";
import { hashFiles } from "@actions/glob";
import { getExecOutput, exec } from "@actions/exec";

async function cloneJosm(josmRevision: number): Promise<string> {
  await exec("svn", [
    "checkout",
    "--depth=immediates",
    "https://josm.openstreetmap.de/osmsvn/applications/editors/josm",
    "josm",
  ]);
  await updateJosm("josm/core", josmRevision);
  const options = { cwd: "josm" };
  await getExecOutput("svn", ["propget", "svn:externals"], options)
    .then((output) => output.stdout)
    .then(
      async (output) =>
        await Promise.all(
          output
            .split("\n")
            .filter((str) => str.includes("core"))
            .map(
              async (repo) =>
                await exec(
                  "svn",
                  ["checkout"].concat(repo.split(" ")),
                  options,
                ),
            )
            .values(),
        ),
    );
  return "josm/core";
}

async function updateJosm(
  josmSource: string,
  josmRevision: number,
): Promise<number> {
  return await exec("svn", [
    "update",
    `--revision=${josmRevision}`,
    "--set-depth=infinity",
    "--accept=theirs-full",
    josmSource,
  ]);
}

async function buildJosm(
  josmSource: string,
  josmRevision: number,
): Promise<void> {
  const buildHit = await restoreCache(
    [josmSource + "/dist/josm-custom.jar"],
    `josm-r${josmRevision}`,
  );
  // Short-circuit
  if (buildHit != null && buildHit !== "") {
    info("Cache hit for " + buildHit);
    return;
  }
  const ivyFiles = await hashFiles("**/ivy.xml\n**/pom.xml");
  const ivyHit = await restoreCache(
    ["~/.ivy2/cache", "~/.ant/cache", "~/.m2", josmSource + "/tools"],
    `${process.platform}-${process.arch}-ivy-${ivyFiles}`,
  );
  if (ivyHit == null || ivyHit === "") {
    await exec("ant", ["-buildfile", josmSource + "/build.xml", "resolve"]);
    await exec("mvn", [
      "--file",
      josmSource + "/pom.xml",
      "--no-transfer-progress",
      "clean",
      "validate",
    ]);
    await saveCache(
      ["~/.ivy2/cache", "~/.ant/cache", "~/.m2", josmSource + "/tools"],
      `${process.platform}-${process.arch}-ivy-${ivyFiles}`,
    );
  }
  // Build with maven
  await exec("mvn", [
    "--file",
    josmSource + "/pom.xml",
    "package",
    "install",
    "-DskipTests",
  ]);
  // And then ant, since that is currently the "official" distribution source.
  await exec("ant", ["-buildfile", josmSource + "/build.xml", "dist"]);
  await saveCache(
    [josmSource + "/dist/josm-custom.jar"],
    `josm-r${josmRevision}`,
  );
}

async function buildJosmTests(
  josmSource: string,
  josmRevision: number,
): Promise<void> {
  const buildHit = await restoreCache(
    [josmSource + "/test/build"],
    `josm-tests-r${josmRevision}`,
  );
  // Short-circuit
  if (buildHit != null && buildHit !== "") {
    info("Cache hit for " + buildHit);
    return;
  }
  await buildJosm(josmSource, josmRevision);
  const ivyFiles = await hashFiles(
    josmSource + "/**/ivy.xml" + "\n" + josmSource + "/**/pom.xml",
  );
  const ivyHit = await restoreCache(
    ["~/.ivy2/cache", "~/.ant/cache", "~/.m2", josmSource + "/tools"],
    `${process.platform}-${process.arch}-test-ivy-${ivyFiles}`,
  );
  if (ivyHit == null || ivyHit === "") {
    await exec("ant", ["-buildfile", josmSource + "/build.xml", "test-init"]);
    await saveCache(
      ["~/.ivy2/cache", "~/.ant/cache", "~/.m2", josmSource + "/tools"],
      `${process.platform}-${process.arch}-test-ivy-${ivyFiles}`,
    );
  }
  await exec("ant", ["-buildfile", josmSource + "/build.xml", "test-compile"]);
  await exec("mvn", [
    "--file",
    josmSource + "/test/pom.xml",
    "package",
    "install",
    "-DskipTests",
  ]);
  await saveCache([josmSource + "/test/build"], `josm-tests-r${josmRevision}`);
}

async function run(): Promise<void> {
  const josmRevision = await getJosmRevision(getInput("josm-revision"));
  setOutput("josm-revision", josmRevision);
  const josmSource = await group(
    `JOSM clone r${josmRevision}`,
    async () => await cloneJosm(josmRevision),
  );
  await group(`JOSM build r${josmRevision}`, async () => {
    await buildJosm(josmSource, josmRevision);
  });
  const josmTestRevision = await getJosmRevision(
    getInput("josm-test-revision"),
  );
  setOutput("josm-test-revision", josmTestRevision);
  const testBuildHit = await restoreCache(
    [josmSource + "/test/build"],
    `josm-tests-r${josmTestRevision}`,
  );
  if (testBuildHit == null) {
    await group(
      `JOSM update r${josmTestRevision}`,
      async () => await updateJosm(josmSource, josmTestRevision),
    );
    await group(`JOSM build tests r${josmTestRevision}`, async () => {
      await buildJosmTests(josmSource, josmTestRevision);
    });
  }
}

run().catch((err) => {
  setFailed(err);
});
