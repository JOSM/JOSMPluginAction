import { Problem } from "./problem";
import { expect } from "@jest/globals";

export function expectProblem(expected: Problem, actual: Problem) {
  expect(actual.title).toBe(expected.title);
  expect(actual.startColumn).toBe(expected.startColumn);
  expect(actual.endColumn).toBe(expected.endColumn);
  expect(actual.startLine).toBe(expected.startLine);
  expect(actual.endLine).toBe(expected.endLine);
  expect(actual.file).toBe(expected.file);
  expect(actual.info).toBe(expected.info);
}
