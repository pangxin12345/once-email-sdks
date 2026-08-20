import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const entries = await readdir(new URL("../dist/test/", import.meta.url));
const tests = entries
  .filter((name) => name.endsWith(".test.js"))
  .sort()
  .map((name) => fileURLToPath(new URL(`../dist/test/${name}`, import.meta.url)));

if (tests.length === 0) {
  throw new Error("No compiled unit tests found");
}

const result = spawnSync(process.execPath, ["--test", ...tests], { stdio: "inherit" });
process.exit(result.status ?? 1);
