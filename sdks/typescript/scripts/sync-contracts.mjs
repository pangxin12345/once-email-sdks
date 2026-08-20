import { cp, mkdir, rm } from "node:fs/promises";

const source = new URL("../../mail-web/src/main/resources/developer-api/", import.meta.url);
const target = new URL("../schemas/", import.meta.url);
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
for (const name of ["openapi.json", "cli-config.schema.json", "run-report.schema.json"]) {
  await cp(new URL(name, source), new URL(name, target));
}
