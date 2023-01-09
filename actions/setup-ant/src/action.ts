import { getInput, error } from "@actions/core";
import { downloadAntTool } from "./ant-setup";

async function run(): Promise<string> {
  let version = getInput("ant-version");
  if (version == null || version.trim() === "") {
    version = "1.10.12";
  }
  return await downloadAntTool(version);
}

run().catch((err) => {
  error(err);
});
