import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { exec, getExecOutput } from "@actions/exec";
import { restoreCache, saveCache } from "@actions/cache";

export async function pluginDependencies(directory: string): Promise<string[]> {
  if (existsSync(join(directory, "gradle.properties"))) {
    const data = readFileSync(
      join(directory, "gradle.properties"),
      "utf8"
    ).split("\n");
    for (const line of data) {
      const match = line.match(/^ *plugin.requires/);
      if (match != null && match.length > 0) {
        return line.split("=")[1].trim().split(";");
      }
    }
  }
  if (existsSync(join(directory, "build.xml"))) {
    const data = readFileSync(join(directory, "build.xml"), "utf8").split("\n");
    for (const line of data) {
      if (line.includes("plugin.requires")) {
        return line.split("=")[2].split('"')[1].trim().split(";");
      }
    }
  }
  return [];
}

export async function downloadPluginDependencies(
  svnDirectory: string,
  dependencies: string[]
): Promise<void> {
  const paths: string[] = [];
  const maxRevision: number = await getExecOutput("svn", ["info", svnDirectory])
    .then((output) => output.stdout.split("\n"))
    .then((lines) => {
      for (const line of lines) {
        const match = /^ *Revision:(\d+)/.exec(line);
        if (match != null && match.length > 1) {
          return Number.parseInt(match[1]);
        }
      }
      return Number.NaN;
    });
  for (const dependency of dependencies) {
    const path = join(
      svnDirectory,
      dependency.endsWith(".jar") ? dependency : dependency + ".jar"
    );
    paths.push(path);
  }
  if (
    !Number.isNaN(maxRevision) &&
    (await restoreCache(paths, `${paths.join(";")}-${maxRevision}`)) != null
  ) {
    return;
  }
  for (const path of paths) {
    await exec("svn", ["update", path]);
  }
  if (!Number.isNaN(maxRevision)) {
    await saveCache(paths, `${paths.join(";")}-${maxRevision}`);
  }
}
