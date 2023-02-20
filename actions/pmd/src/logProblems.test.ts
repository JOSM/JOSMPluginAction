import { describe, expect, jest, test } from "@jest/globals";
import * as core from "@actions/core";
import { logProblems } from "./action";
describe("Test action/logProblems", function () {
  test("Simple logging", () => {
    const log = jest.spyOn(core, "error");
    logProblems([
      {
        file: "org/openstreetmap/josm/actions/JoinAreasAction.java",
        column: 23,
        endColumn: 26,
        line: 1349,
        endLine: 1349,
        title: "Best Practices/UnusedLocalVariable",
        info: "https://pmd.github.io/pmd-6.53.0/pmd_rules_java_bestpractices.html#unusedlocalvariable",
      },
    ]);
    expect(log).toBeCalledTimes(1);
    expect(log).toBeCalledWith(
      "file=org/openstreetmap/josm/actions/JoinAreasAction.java,line=1349,endLine=1349,col=23,endColumn=26,title=Best Practices/UnusedLocalVariable::https://pmd.github.io/pmd-6.53.0/pmd_rules_java_bestpractices.html#unusedlocalvariable"
    );
  });
});
