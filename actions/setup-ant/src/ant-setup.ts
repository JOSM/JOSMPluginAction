import * as tc from "@actions/tool-cache";
import * as core from "@actions/core";

export async function downloadTool(version: string) {
  const toolName = "apache-ant";
  if (version.startsWith("apache-ant-")) {
    version = version.replace("apache-ant-", "");
  }
  let cachedPath = tc.find(toolName, version);
  if (cachedPath == null || cachedPath === "") {
    const downloadUrl =
      "https://downloads.apache.org/ant/binaries/apache-ant-" +
      version +
      "-bin.tar.gz";
    core.info("Ant URL: " + downloadUrl);
    const antPath = await tc.downloadTool(downloadUrl);
    const extracted = await tc.extractTar(antPath, version, [
      "-x",
      "--gunzip",
      "--strip-components",
      "1",
    ]);
    cachedPath = await tc.cacheDir(extracted, toolName, version);
  }
  core.addPath(cachedPath + "/bin");
  core.setOutput("ant-home", cachedPath);
  core.exportVariable("ANT_HOME", cachedPath);
  return cachedPath;
}
