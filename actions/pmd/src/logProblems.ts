import { error } from "@actions/core";
import { Problem } from "./problem";

export function logProblems(problems: Problem[]): void {
  for (const problem of problems) {
    error(
      "file=" +
        problem.file +
        ",line=" +
        problem.line +
        ",endLine=" +
        problem.endLine +
        ",col=" +
        problem.column +
        ",endColumn=" +
        problem.endColumn +
        ",title=" +
        problem.title +
        "::" +
        problem.info
    );
  }
}
