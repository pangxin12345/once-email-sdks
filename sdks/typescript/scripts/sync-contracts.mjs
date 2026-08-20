import { cp, mkdir } from "node:fs/promises";

const source = new URL("../../../spec/openapi.json", import.meta.url);
const target = new URL("../schemas/", import.meta.url);
await mkdir(target, { recursive: true });
await cp(source, new URL("openapi.json", target));
