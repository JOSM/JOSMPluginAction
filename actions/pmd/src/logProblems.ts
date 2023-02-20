import { error } from "@actions/core";
import { Problem } from "./problem";

export function logProblems(problems: Problem[]): void {
  for (const problem of problems) {
    error(
      problem.info !== undefined && problem.info !== null ? problem.info : "",
      problem
    );
  }
}
