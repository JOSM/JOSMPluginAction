import { parseData } from "./action";
import { describe, expect, test } from "@jest/globals";
import { expectProblem } from "./problem.test";

const JOSM_SINGLE_EXAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<pmd xmlns="http://pmd.sourceforge.net/report/2.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://pmd.sourceforge.net/report/2.0.0 http://pmd.sourceforge.net/report_2_0_0.xsd" version="6.53.0" timestamp="2023-02-20T08:21:51.082">
<file name="org/openstreetmap/josm/actions/JoinAreasAction.java">
<violation beginline="1339" endline="1339" begincolumn="23" endcolumn="26" rule="UnusedLocalVariable" ruleset="Best Practices" package="org.openstreetmap.josm.actions" class="JoinAreasAction" method="findBoundaryPolygons" variable="spec" externalInfoUrl="https://pmd.github.io/pmd-6.53.0/pmd_rules_java_bestpractices.html#unusedlocalvariable" priority="3">
Avoid unused local variables such as 'spec'.
</violation>
</file>
</pmd>`;

const JOSM_DOUBLE_EXAMPLE_DIFFERENT_FILES = `<?xml version="1.0" encoding="UTF-8"?>
<pmd xmlns="http://pmd.sourceforge.net/report/2.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://pmd.sourceforge.net/report/2.0.0 http://pmd.sourceforge.net/report_2_0_0.xsd" version="6.53.0" timestamp="2023-02-20T08:39:09.937">
<file name="org/openstreetmap/josm/actions/JoinAreasAction.java">
<violation beginline="1339" endline="1339" begincolumn="23" endcolumn="26" rule="UnusedLocalVariable" ruleset="Best Practices" package="org.openstreetmap.josm.actions" class="JoinAreasAction" method="findBoundaryPolygons" variable="spec" externalInfoUrl="https://pmd.github.io/pmd-6.53.0/pmd_rules_java_bestpractices.html#unusedlocalvariable" priority="3">
Avoid unused local variables such as 'spec'.
</violation>
</file>
<file name="org/openstreetmap/josm/tools/ExceptionUtil.java">
<violation beginline="71" endline="71" begincolumn="23" endcolumn="26" rule="UnusedLocalVariable" ruleset="Best Practices" package="org.openstreetmap.josm.tools" class="ExceptionUtil" method="explainOsmApiInitializationException" variable="spec" externalInfoUrl="https://pmd.github.io/pmd-6.53.0/pmd_rules_java_bestpractices.html#unusedlocalvariable" priority="3">
Avoid unused local variables such as 'spec'.
</violation>
</file>
</pmd>`;

const JOSM_DOUBLE_EXAMPLE_SAME_FILE = `<?xml version="1.0" encoding="UTF-8"?>
<pmd xmlns="http://pmd.sourceforge.net/report/2.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://pmd.sourceforge.net/report/2.0.0 http://pmd.sourceforge.net/report_2_0_0.xsd" version="6.53.0" timestamp="2023-02-20T08:54:06.548">
<file name="org/openstreetmap/josm/actions/JoinAreasAction.java">
<violation beginline="1339" endline="1339" begincolumn="23" endcolumn="26" rule="UnusedLocalVariable" ruleset="Best Practices" package="org.openstreetmap.josm.actions" class="JoinAreasAction" method="findBoundaryPolygons" variable="spec" externalInfoUrl="https://pmd.github.io/pmd-6.53.0/pmd_rules_java_bestpractices.html#unusedlocalvariable" priority="3">
Avoid unused local variables such as 'spec'.
</violation>
<violation beginline="1349" endline="1349" begincolumn="23" endcolumn="26" rule="UnusedLocalVariable" ruleset="Best Practices" package="org.openstreetmap.josm.actions" class="JoinAreasAction" method="fixTouchingPolygons" variable="spec" externalInfoUrl="https://pmd.github.io/pmd-6.53.0/pmd_rules_java_bestpractices.html#unusedlocalvariable" priority="3">
Avoid unused local variables such as 'spec'.
</violation>
</file>
</pmd>`;

const JOSM_EXAMPLE_NO_VIOLATIONS = `<?xml version="1.0" encoding="UTF-8"?>
<pmd xmlns="http://pmd.sourceforge.net/report/2.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://pmd.sourceforge.net/report/2.0.0 http://pmd.sourceforge.net/report_2_0_0.xsd" version="6.53.0" timestamp="2023-02-20T21:55:58.809">
</pmd>`;

describe("Test action/parseData", () => {
  test("JOSM Sample XML, no issues", () => {
    const problems = parseData("", JOSM_EXAMPLE_NO_VIOLATIONS);
    expect(problems.length).toBe(0);
  });
  test("JOSM Sample XML, single file", () => {
    const problems = parseData("", JOSM_SINGLE_EXAMPLE);
    expect(problems.length).toBe(1);
    expectProblem(
      {
        file: "org/openstreetmap/josm/actions/JoinAreasAction.java",
        startColumn: 23,
        endColumn: 26,
        startLine: 1339,
        endLine: 1339,
        title: "Best Practices/UnusedLocalVariable",
        info: "https://pmd.github.io/pmd-6.53.0/pmd_rules_java_bestpractices.html#unusedlocalvariable",
      },
      problems[0]
    );
  });
  test("JOSM Sample XML, two different files", () => {
    const problems = parseData("", JOSM_DOUBLE_EXAMPLE_DIFFERENT_FILES);
    expect(problems.length).toBe(2);
    expectProblem(
      {
        file: "org/openstreetmap/josm/actions/JoinAreasAction.java",
        startColumn: 23,
        endColumn: 26,
        startLine: 1339,
        endLine: 1339,
        title: "Best Practices/UnusedLocalVariable",
        info: "https://pmd.github.io/pmd-6.53.0/pmd_rules_java_bestpractices.html#unusedlocalvariable",
      },
      problems[0]
    );
    expectProblem(
      {
        file: "org/openstreetmap/josm/tools/ExceptionUtil.java",
        startColumn: 23,
        endColumn: 26,
        startLine: 71,
        endLine: 71,
        title: "Best Practices/UnusedLocalVariable",
        info: "https://pmd.github.io/pmd-6.53.0/pmd_rules_java_bestpractices.html#unusedlocalvariable",
      },
      problems[1]
    );
  });
  test("JOSM Example XML, two different problems in same file", () => {
    const problems = parseData("", JOSM_DOUBLE_EXAMPLE_SAME_FILE);
    expect(problems.length).toBe(2);
    expectProblem(
      {
        file: "org/openstreetmap/josm/actions/JoinAreasAction.java",
        startColumn: 23,
        endColumn: 26,
        startLine: 1339,
        endLine: 1339,
        title: "Best Practices/UnusedLocalVariable",
        info: "https://pmd.github.io/pmd-6.53.0/pmd_rules_java_bestpractices.html#unusedlocalvariable",
      },
      problems[0]
    );
    expectProblem(
      {
        file: "org/openstreetmap/josm/actions/JoinAreasAction.java",
        startColumn: 23,
        endColumn: 26,
        startLine: 1349,
        endLine: 1349,
        title: "Best Practices/UnusedLocalVariable",
        info: "https://pmd.github.io/pmd-6.53.0/pmd_rules_java_bestpractices.html#unusedlocalvariable",
      },
      problems[1]
    );
  });
});
