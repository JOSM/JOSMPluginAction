import { debug, getInput, setFailed } from "@actions/core";
import { run as realRun } from "./checkstyle";

async function run(): Promise<void> {
  debug("start");
  const checkstyleFile = getInput("file");
  debug("checkstyleFile: " + checkstyleFile);
  const pathTrim = getInput("pathTrim");
  debug("pathTrim: " + pathTrim);
  realRun(checkstyleFile, pathTrim);
  debug("end");
}

run().catch((err) => {
  console.log(err.stack);
  setFailed(err);
});
