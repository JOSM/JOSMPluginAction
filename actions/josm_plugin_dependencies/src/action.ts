import {
  pluginDependencies,
  downloadPluginDependencies,
} from "./plugin-dependencies";
import { getInput, group, info, setFailed } from "@actions/core";
import { join } from "path";
import { saveCache, restoreCache } from "@actions/cache";
import { context } from "@actions/github";
import { hashFiles } from "@actions/glob";
import { existsSync } from "fs";
import { exec } from "@actions/exec";

async function josm(): Promise<string | undefined> {
  // Needed to build the plugin
  const josmRevision = getInput("josm-revision");
  await group(`Restore JOSM dist (josm-r${josmRevision})`, async () => {
    return await restoreCache(
      [join("josm", "core", "dist", "josm-custom.jar")],
      `josm-r${josmRevision}`
    );
  });
  // Needed to test the plugin
  const josmTestRevision = getInput("josm-test-revision");
  return await group(
    `Restore cached JOSM test build (josm-tests-r${josmTestRevision})`,
    async () => {
      return await restoreCache(
        [join("josm", "core", "test", "build")],
        `josm-tests-r${josmTestRevision}`
      );
    }
  );
}
async function dependencies(pluginDir: string): Promise<void> {
  const dependencies = await pluginDependencies(pluginDir);
  await group("Download plugin dependencies", async () => {
    await downloadPluginDependencies(join("josm", "dist"), dependencies);
    await restoreCache(
      ["~/.ivy2/cache", "~/.ant/cache", "josm/core/tools"],
      `${process.platform}-${process.arch}-ivy-${await hashFiles(
        "josm/core/**/ivy.xml"
      )}`
    );
    await group("Tool dependencies", async () => {
      const coreTools = join("josm", "plugins", "00_core_tools");
      const corePaths = ["~/.ivy2/cache", "~/.ant/cache"];
      const coreKey = await hashFiles(join(coreTools, "ivy.xml"));
      if ((await restoreCache(corePaths, coreKey)) == null) {
        await exec("ant", [
          "-buildfile",
          join(pluginDir, "build.xml"),
          "resolve-tools",
        ]);
        await saveCache(corePaths, coreKey);
      }
    });
    if (existsSync(join(pluginDir, "ivy.xml"))) {
      const ivyPluginCache = await restoreCache(
        ["~/.ivy2/cache", "~/.ant/cache"],
        `${process.platform}-${process.arch}-ivy-plugin-${await hashFiles(
          "josm/plugins/**/ivy.xml"
        )}`
      );
      if (ivyPluginCache == null) {
        await exec("ant", [
          "-buildfile",
          join(pluginDir, "build.xml"),
          "fetch_dependencies",
        ]);
        await saveCache(
          ["~/.ivy2/cache/", "~/.ant/cache"],
          `${process.platform}-${process.arch}-ivy-plugin-${await hashFiles(
            "josm/plugins/**/ivy.xml"
          )}`
        );
      }
    }
  });
}
async function run(): Promise<void> {
  const josmDist = join("josm", "dist");
  const pluginDir = getInput("plugin-dir");
  let pluginJarName = getInput("plugin-jar-name");
  if (pluginJarName == null || pluginJarName.trim().length === 0) {
    pluginJarName = context.repo.repo;
  }
  if (pluginJarName.endsWith(".jar")) {
    pluginJarName = pluginJarName.replace(/.jar$/, "");
  }
  await josm();
  const buildHit = await restoreCache(
    [
      join(josmDist, pluginJarName + ".jar"),
      join(josmDist, pluginJarName + "-javadoc.jar"),
      join(josmDist, pluginJarName + "-sources.jar"),
    ],
    `${context.repo.repo}-${context.sha}`
  );
  if (buildHit != null) {
    info(`Plugin already built: ${buildHit}`);
    return;
  }
  await dependencies(pluginDir);
}

run().catch((err) => setFailed(err));
