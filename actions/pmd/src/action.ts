import { debug, getInput, setFailed } from "@actions/core";
import { readFileSync } from "fs";
import { XMLParser } from "fast-xml-parser";
import { logProblems } from "./logProblems";
import { Problem } from "./problem";

export { Problem, logProblems };

function parseFile(sourceDirectory: string, fileData: Object): Problem[] {
  const file =
    (sourceDirectory.length > 0 && !sourceDirectory.endsWith("/")
      ? sourceDirectory + "/"
      : sourceDirectory) + fileData["@_name"];
  const violations = fileData["violation"];
  const problems: Problem[] = [];
  for (const violation of violations) {
    const title = violation["@_ruleset"] + "/" + violation["@_rule"];
    problems.push({
      file: file,
      title: title,
      startColumn: parseInt(violation["@_begincolumn"]),
      endColumn: parseInt(violation["@_endcolumn"]),
      startLine: parseInt(violation["@_beginline"]),
      endLine: parseInt(violation["@_endline"]),
      info: violation["@_externalInfoUrl"],
    });
  }
  return problems;
}

export function parseData(
  sourceDirectory: string,
  data: string | Buffer,
): Problem[] {
  const alwaysArray = ["pmd.file", "pmd.file.violation"];
  const parser = new XMLParser({
    ignoreAttributes: false,
    isArray: (name, jpath) => {
      return alwaysArray.indexOf(jpath) >= 0;
    },
  });
  const parsed = parser.parse(data);
  const files = parsed["pmd"]["file"];
  let problems: Problem[] = [];
  if (files !== undefined && files !== null) {
    for (const file of files) {
      problems = problems.concat(parseFile(sourceDirectory, file));
    }
  }
  return problems;
}

async function run(): Promise<void> {
  const pmdFile = getInput("file");
  const sourceDir = getInput("src");
  const data = readFileSync(pmdFile);
  debug(data.toString());
  logProblems(parseData(sourceDir, data));
}

run().catch((err) => setFailed(err));
