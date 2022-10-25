import { find, extractTar, cacheDir, downloadTool } from "@actions/tool-cache";
import { addPath, setOutput, exportVariable, info } from "@actions/core";

export async function downloadAntTool(version: string): Promise<string> {
  const toolName = "apache-ant";
  if (version.startsWith("apache-ant-")) {
    version = version.replace("apache-ant-", "");
  }
  let cachedPath = find(toolName, version);
  if (cachedPath == null || cachedPath === "") {
    const downloadUrl =
      "https://downloads.apache.org/ant/binaries/apache-ant-" +
      version +
      "-bin.tar.gz";
    info("Ant URL: " + downloadUrl);
    const antPath = await downloadTool(downloadUrl);
    const extracted = await extractTar(antPath, version, [
      "-x",
      "--gunzip",
      "--strip-components",
      "1",
    ]);
    cachedPath = await cacheDir(extracted, toolName, version);
  }
  addPath(cachedPath + "/bin");
  setOutput("ant-home", cachedPath);
  exportVariable("ANT_HOME", cachedPath);
  return cachedPath;
}
