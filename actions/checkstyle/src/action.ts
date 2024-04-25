import { getInput, setFailed } from "@actions/core";
import { run as realRun } from "./checkstyle";

async function run(): Promise<void> {
  const checkstyleFile = getInput("file");
  const pathTrim = getInput("pathTrim");
  realRun(checkstyleFile, pathTrim);
}

run().catch((err) => {
  console.log(err.stack);
  setFailed(err);
});
