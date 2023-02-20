import { getInput, setFailed } from "@actions/core";
import { readFileSync } from "fs";
import { XMLParser } from "fast-xml-parser";
import { Problem } from "./problem";
import { logProblems } from "./logProblems";
import { sep, join } from "path";

function parseFile(trim: number, fileData: Object): Problem[] {
  const subFile = fileData["@_name"].split(sep).slice(trim);
  const file = join(...subFile);
  const violations = fileData["error"];
  const problems: Problem[] = [];
  if (
    violations !== undefined &&
    violations !== null &&
    violations.length !== 0
  ) {
    for (const violation of violations) {
      const title = violation["@_source"];
      problems.push({
        file: file,
        title: title,
        column: parseInt(violation["@_column"]),
        endColumn: parseInt(violation["@_column"]),
        line: parseInt(violation["@_line"]),
        endLine: parseInt(violation["@_line"]),
        info: violation["@_message"],
      });
    }
  }
  return problems;
}

export function parseData(trim: number, data: string | Buffer): Problem[] {
  const alwaysArray = ["checkstyle.file", "checkstyle.file.error"];
  const parser = new XMLParser({
    ignoreAttributes: false,
    isArray: (name, jpath) => {
      return alwaysArray.indexOf(jpath) >= 0;
    },
  });
  const parsed = parser.parse(data);
  const files = parsed["checkstyle"]["file"];
  let problems: Problem[] = [];
  for (const file of files) {
    problems = problems.concat(parseFile(trim, file));
  }
  return problems;
}

async function run(): Promise<void> {
  const checkstyleFile = getInput("file");
  const pathTrim = getInput("pathTrim");
  let trim: number;
  if (pathTrim === "") {
    trim = process.cwd().split(sep).length;
  } else {
    trim = parseInt(pathTrim);
  }
  const data = readFileSync(checkstyleFile);
  logProblems(parseData(trim, data));
}

if (require.main === module) {
  run().catch((err) => setFailed(err));
}
