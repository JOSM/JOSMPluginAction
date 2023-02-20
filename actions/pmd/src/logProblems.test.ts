import { describe, expect, jest, test } from "@jest/globals";
import * as core from "@actions/core";
import { logProblems } from "./action";
describe("Test action/logProblems", function () {
  test("Simple logging", () => {
    const log = jest.spyOn(core, "error");
    const problem = {
      file: "org/openstreetmap/josm/actions/JoinAreasAction.java",
      startColumn: 23,
      endColumn: 26,
      startLine: 1349,
      endLine: 1349,
      title: "Best Practices/UnusedLocalVariable",
      info: "https://pmd.github.io/pmd-6.53.0/pmd_rules_java_bestpractices.html#unusedlocalvariable",
    };
    logProblems([problem]);
    expect(log).toBeCalledTimes(1);
    expect(log).toBeCalledWith(
      "https://pmd.github.io/pmd-6.53.0/pmd_rules_java_bestpractices.html#unusedlocalvariable",
      problem
    );
  });
});
