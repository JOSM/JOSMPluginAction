import { getInput, setFailed } from "@actions/core";
import { run as realRun } from "./pmd";

async function run(): Promise<void> {
  const pmdFile = getInput("file");
  const sourceDir = getInput("src");
  realRun(sourceDir, pmdFile);
}

run().catch((err) => setFailed(err));
