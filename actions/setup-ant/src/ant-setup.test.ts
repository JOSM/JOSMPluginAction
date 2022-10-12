import * as core from "@actions/core";
import {
  describe,
  expect,
  test,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { downloadTool } from "./ant-setup";
import * as path from "path";
import * as io from "@actions/io";

describe("test downloadTool", () => {
  const tempDir = path.join(__dirname, "runner");
  process.env["RUNNER_TEMP"] = path.join(tempDir, "temp");
  process.env["RUNNER_TOOL_CACHE"] = path.join(tempDir, "cache");
  const coreAddPath = jest.spyOn(core, "addPath");

  beforeEach(async () => {
    await io.mkdirP(tempDir);
    await io.mkdirP(process.env["RUNNER_TEMP"]);
    await io.mkdirP(process.env["RUNNER_TOOL_CACHE"]);
  });

  afterEach(async () => {
    await io.rmRF(tempDir);
  });

  test("1.10.12", async () => {
    await downloadTool("1.10.12");
    expect(coreAddPath).toBeCalledTimes(1);
    expect(coreAddPath).toBeCalledWith(
      path.join(tempDir, "cache", "apache-ant", "1.10.12", process.arch, "bin")
    );
  }, 15_000);
});
