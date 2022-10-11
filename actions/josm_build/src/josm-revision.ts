import * as core from "@actions/core";
import * as httpm from "@actions/http-client";

export async function getJosmRevision(
  defaultRevision: string
): Promise<number> {
  let revision = defaultRevision;
  const client = new httpm.HttpClient("JOSMPluginAction/josm-build");
  if (defaultRevision == null || defaultRevision === "") {
    await client
      .get("https://josm.openstreetmap.de/svn/trunk/")
      .then((result) => result.readBody())
      .then((output) => (revision = /Revision ([0-9]+)/.exec(output)[1]));
    //| grep Revision | awk '{print $2}'"
  } else if (defaultRevision == "tested") {
    await client
      .get("https://josm.openstreetmap.de/tested")
      .then((result) => result.readBody())
      .then((rev) => (revision = rev));
  } else if (defaultRevision == "latest") {
    await client
      .get("https://josm.openstreetmap.de/latest")
      .then((result) => result.readBody())
      .then((rev) => (revision = rev));
  } else if (defaultRevision.charAt(0) == "r") {
    revision = defaultRevision.substring(1, defaultRevision.length);
  }
  return Number.parseInt(revision);
}
