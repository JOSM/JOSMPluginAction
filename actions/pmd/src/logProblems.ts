import { error, setFailed } from "@actions/core";
import { Problem } from "./problem";

export function logProblems(problems: Problem[]): void {
  for (const problem of problems) {
    error(
      problem.info !== undefined && problem.info !== null ? problem.info : "",
      problem
    );
  }
  if (problems.length == 1) {
    setFailed(`There was ${problems.length} problem.`);
  } else if (problems.length > 0) {
    setFailed(`There were ${problems.length} problems.`);
  }
}
