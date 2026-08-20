import { lstat, readFile } from "node:fs/promises";
import { Ajv2020 } from "ajv/dist/2020.js";
import { parseDocument } from "yaml";

export interface TestConfig {
  version: 1;
  api: { baseUrl: "https://api.once-email.com"; apiKeyEnv: string };
  authorization: { environment: "local" | "test" | "staging"; targetHosts: string[]; evidenceRef: string };
  trigger: { command: string[]; addressInput: "stdin-json" };
  match: { fromDomain: string; subjectIncludes: string; receivedAfterTrigger: true; timeoutSeconds: number };
  extract: { type: "otp"; pattern: "contextual-6-digit" };
  report: { formats: Array<"json" | "junit">; includeSensitiveValues: false };
  cleanup: { required: true };
}

export class ConfigError extends Error {
  readonly code = "CONFIG_INVALID";
  constructor() { super("Configuration did not pass the authorized test policy"); this.name = "ConfigError"; }
}

export async function loadConfig(path: string): Promise<TestConfig> {
  try {
    const info = await lstat(path);
    if (!info.isFile() || info.isSymbolicLink() || info.size < 2 || info.size > 65_536) throw new ConfigError();
    const text = await readFile(path, "utf8");
    const document = parseDocument(text, { uniqueKeys: true });
    if (document.errors.length > 0) throw new ConfigError();
    const value: unknown = document.toJS({ maxAliasCount: 0 });
    const schema = JSON.parse(await readFile(new URL("../../schemas/cli-config.schema.json", import.meta.url), "utf8")) as object;
    const ajv = new Ajv2020({ allErrors: false, strict: true, formats: { uri: true } });
    if (!ajv.compile(schema)(value)) throw new ConfigError();
    return value as TestConfig;
  } catch (error) {
    if (error instanceof ConfigError) throw error;
    throw new ConfigError();
  }
}

export function requireApiKey(config: TestConfig, environment: NodeJS.ProcessEnv = process.env): string {
  const value = environment[config.api.apiKeyEnv];
  if (value === undefined || !value.startsWith("oe_live_") || value.length > 180) throw new ConfigError();
  return value;
}
