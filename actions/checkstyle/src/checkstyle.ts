import { debug } from "@actions/core";
import { readFileSync, existsSync } from "fs";
import { XMLParser } from "fast-xml-parser";
import { Problem } from "pmd/src/pmd";
import { logProblems } from "pmd/src/pmd";
import { sep, join } from "path";

interface Violations {
  "@_source": string;
  "@_message": string;
  "@_severity": string;
  "@_column": string;
  "@_line": string;
}

interface FileData {
  "@_name": string;
  error?: Array<Violations>;
}

function parseFile(trim: number, fileData: FileData): Problem[] {
  let subFile = fileData["@_name"].split(sep);
  let currentlyTrimmed = 0;
  while (!existsSync(join(...subFile))) {
    subFile = subFile.slice(1);
    currentlyTrimmed += 1;
    if (currentlyTrimmed >= trim) {
      break;
    }
  }
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
        startColumn: parseInt(violation["@_column"]),
        endColumn: parseInt(violation["@_column"]),
        startLine: parseInt(violation["@_line"]),
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

export function run(checkstyleFile: string, pathTrim: string = "") {
  let trim: number;
  if (pathTrim === "") {
    trim = process.cwd().split(sep).length;
  } else {
    trim = parseInt(pathTrim);
  }
  debug("trim: " + trim);
  debug("checkstyleFile: " + checkstyleFile);
  const data = readFileSync(checkstyleFile);
  debug(data.toString());
  logProblems(parseData(trim, data));
}
