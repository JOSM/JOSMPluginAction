import * as core from "@actions/core";
import { describe, expect, test, jest } from "@jest/globals";
import { getJosmRevision } from "./josm-revision";
import * as nock from "nock";

describe("test revisions", () => {
  jest.spyOn(core, "getInput");
  const nockJosm = nock("https://josm.openstreetmap.de");
  test("head (empty)", () => {
    nockJosm
      .get("/svn/trunk/")
      .reply(
        200,
        "<html><head><title>svn - Revision 19000: /trunk</title></head>\n<body></body></html>"
      );
    return getJosmRevision("").then((revision) => expect(revision).toBe(19000));
  });
  test("head (null)", () => {
    nockJosm
      .get("/svn/trunk/")
      .reply(
        200,
        "<html><head><title>svn - Revision 19000: /trunk</title></head>\n<body></body></html>"
      );
    return getJosmRevision(null).then((revision) =>
      expect(revision).toBe(19000)
    );
  });
  test("latest", () => {
    nockJosm.get("/latest").reply(200, "18000");
    return getJosmRevision("latest").then((revision) =>
      expect(revision).toBe(18000)
    );
  });
  test("tested", () => {
    nockJosm.get("/tested").reply(200, "17000");
    return getJosmRevision("tested").then((revision) =>
      expect(revision).toBe(17000)
    );
  });
  test("r16000", () => {
    return getJosmRevision("r16000").then((revision) =>
      expect(revision).toBe(16000)
    );
  });
  test("15000", () => {
    return getJosmRevision("15000").then((revision) =>
      expect(revision).toBe(15000)
    );
  });
  nockJosm.done();
});
