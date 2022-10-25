import { HttpClient } from "@actions/http-client";

export async function getJosmRevision(
  defaultRevision: string | null
): Promise<number> {
  let revision = defaultRevision;
  const client = new HttpClient("JOSMPluginAction/josm-build");
  if (defaultRevision == null || defaultRevision === "") {
    revision = await client
      .get("https://josm.openstreetmap.de/svn/trunk/")
      .then(async (result) => await result.readBody())
      .then((output) => {
        const match = /Revision ([0-9]+)/.exec(output);
        if (match != null && match.length > 1) {
          return match[1];
        }
        throw Error(`Unknown revision for output\n${output}`);
      });
  } else if (defaultRevision === "tested") {
    revision = await client
      .get("https://josm.openstreetmap.de/tested")
      .then(async (result) => await result.readBody());
  } else if (defaultRevision === "latest") {
    revision = await client
      .get("https://josm.openstreetmap.de/latest")
      .then(async (result) => await result.readBody());
  } else if (defaultRevision.charAt(0) === "r") {
    revision = defaultRevision.substring(1, defaultRevision.length);
  }
  return revision != null ? Number.parseInt(revision) : Number.NaN;
}
