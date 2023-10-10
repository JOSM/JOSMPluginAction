import * as core from "@actions/core";
import {
  describe,
  expect,
  test,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { downloadAntTool } from "./ant-setup";
import { join } from "path";
import { mkdirP, rmRF } from "@actions/io";
import { existsSync } from "fs";

describe("test downloadTool", () => {
  const tempDir = join(__dirname, "runner");
  process.env.RUNNER_TEMP = join(tempDir, "temp");
  process.env.RUNNER_TOOL_CACHE = join(tempDir, "cache");
  const coreAddPath = jest.spyOn(core, "addPath");

  beforeEach(async () => {
    await mkdirP(tempDir);
    if (process.env.RUNNER_TEMP != null) {
      await mkdirP(process.env.RUNNER_TEMP);
    }
    if (process.env.RUNNER_TOOL_CACHE != null) {
      await mkdirP(process.env.RUNNER_TOOL_CACHE);
    }
  });

  afterEach(async () => {
    if (existsSync(tempDir)) {
      await rmRF(tempDir);
    }
  });

  test("1.10.14", async () => {
    await downloadAntTool("1.10.14");
    try {
      expect(coreAddPath).toBeCalledTimes(1);
      expect(coreAddPath).toBeCalledWith(
          join(tempDir, "cache", "apache-ant", "1.10.14", process.arch, "bin"),
      );
    } finally {
      await rmRF("1.10.14");
    }
  }, 15_000);
});
