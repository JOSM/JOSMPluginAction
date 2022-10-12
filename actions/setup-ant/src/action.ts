import * as core from "@actions/core";
import { downloadTool } from "./ant-setup";

async function run() {
  let version = core.getInput("ant-version");
  if (version == null || version.trim() === "") {
    version = "1.10.12";
  }
  return await downloadTool(version);
}

run().catch((err) => core.error(err));
