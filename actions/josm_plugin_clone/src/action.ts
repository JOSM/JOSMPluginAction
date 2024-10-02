import { group, setFailed, setOutput } from "@actions/core";
import { exec, getExecOutput } from "@actions/exec";
import { join } from "path";

async function cloneCoreSubRepos(
  directory: string,
  depth: string | null,
): Promise<number[]> {
  return await getExecOutput("svn", [
    "propget",
    "svn:externals",
    directory,
  ]).then(async (output) => {
    const promises: Array<Promise<number>> = [];
    for (const line of output.stdout.split("\n")) {
      if (line.includes("core")) {
        const parts = line.split(" ");
        const repo = parts[0];
        const dir = join(directory, parts[1]);
        const args: string[] = ["checkout"];
        if (depth != null) {
          args.push(`--depth=${depth}`);
        }
        args.push(repo);
        args.push(dir);
        promises.push(exec("svn", args));
      }
    }
    return await Promise.all(promises);
  });
}

async function cloneJosmFiles(directory: string): Promise<void> {
  await exec("svn", [
    "checkout",
    "--depth=immediates",
    "https://josm.openstreetmap.de/osmsvn/applications/editors/josm",
    join(directory, "josm"),
  ]);
  await exec("svn", [
    "update",
    "--set-depth=immediates",
    join(directory, "josm", "core"),
  ]);
  await exec("svn", [
    "update",
    "--set-depth=immediates",
    join(directory, "josm", "plugins"),
  ]);
  for (const dir of [
    "00_core_test_config",
    "00_core_test_lib",
    "00_core_tools",
    "00_tools",
  ]) {
    await exec("svn", [
      "update",
      "--set-depth=infinity",
      "--accept=theirs-full",
      join(directory, "josm", "plugins", dir),
    ]);
  }
  await exec("svn", [
    "update",
    "--set-depth=infinity",
    "--accept=theirs-full",
    join(directory, "josm", "i18n"),
  ]);
  await cloneCoreSubRepos(join(directory, "josm"), "empty");
  await exec("svn", [
    "update",
    join(directory, "josm", "core", "ivy.xml"),
    join(directory, "josm", "core", "ivysettings.xml"),
    join(directory, "josm", "core", "pom.xml"),
    join(directory, "josm", "core", "nodist", "ivysettings.xml"),
  ]);
  await cloneCoreSubRepos(join(directory, "josm", "plugins"), null);
}

async function run(): Promise<void> {
  await group("Clone JOSM files", async () => {
    await cloneJosmFiles(".");
  });
  setOutput("plugin-dir", join("josm", "plugins"));
}

run().catch((err) => {
  setFailed(err);
});
