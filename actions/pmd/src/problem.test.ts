import { Problem } from "./problem";
import { describe, expect, test } from "@jest/globals";

export function expectProblem(expected: Problem, actual: Problem) {
  expect(actual.title).toBe(expected.title);
  expect(actual.startColumn).toBe(expected.startColumn);
  expect(actual.endColumn).toBe(expected.endColumn);
  expect(actual.startLine).toBe(expected.startLine);
  expect(actual.endLine).toBe(expected.endLine);
  expect(actual.file).toBe(expected.file);
  expect(actual.info).toBe(expected.info);
}

describe("Test problem", function () {
  const problem = {
    file: "org/openstreetmap/josm/actions/JoinAreasAction.java",
    startColumn: 23,
    endColumn: 26,
    startLine: 1349,
    endLine: 1349,
    title: "Best Practices/UnusedLocalVariable",
    info: "https://pmd.github.io/pmd-6.53.0/pmd_rules_java_bestpractices.html#unusedlocalvariable",
  };
  test("Equality", () => {
    const problem2 = { ...problem, startLine: 1000, endLine: 1001 };
    expect(problem).not.toEqual(problem2);
    const problem3 = { ...problem };
    expect(problem).toEqual(problem3);
  });
});
