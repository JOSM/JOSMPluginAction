import { parseData, run as actionRun } from "./checkstyle";
import { describe, expect, test } from "@jest/globals";
import { expectProblem } from "pmd/src/problem.test";

const JOSM_SINGLE_EXAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<checkstyle version="9.3">
<file name="/Users/user/workspace/josm/core/test/unit/org/openstreetmap/josm/tools/bugreport/BugReportSenderTest.java">
</file>
<file name="/Users/user/workspace/josm/core/test/unit/org/openstreetmap/josm/tools/bugreport/BugReportTest.java">
<error line="141" column="101" severity="warning" message="&apos;}&apos; is not preceded with whitespace." source="com.puppycrawl.tools.checkstyle.checks.whitespace.WhitespaceAroundCheck"/>
</file>
</checkstyle>
`;

describe("Test action/parseData", () => {
  test("JOSM Sample XML, single file", () => {
    const problems = parseData(6, JOSM_SINGLE_EXAMPLE);
    expect(problems.length).toBe(1);
    expectProblem(
      {
        file: "test/unit/org/openstreetmap/josm/tools/bugreport/BugReportTest.java",
        startColumn: 101,
        endColumn: 101,
        startLine: 141,
        endLine: 141,
        title:
          "com.puppycrawl.tools.checkstyle.checks.whitespace.WhitespaceAroundCheck",
        info: "'}' is not preceded with whitespace.",
      },
      problems[0],
    );
  });
  test("JOSM Checkstyle XML, single file", () => {
    expect(() =>
      actionRun("/Users/tsmock/workspace/josm/core/checkstyle-josm.xml", ""),
    ).not.toThrow();
  });
});
