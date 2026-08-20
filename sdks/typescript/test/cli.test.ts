import assert from "node:assert/strict";
import { mkdtemp, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { ConfigError, loadConfig } from "../src/config.js";
import { runCli } from "../src/cli.js";

const secret = "oe_live_0000000000000000";
const host = "private.staging.example.test";
const evidence = "QA-secret-reference";

test("doctor and plan expose only fixed output fields", async () => {
  const path = await configFile(validConfig());
  const doctor = await runCli(["doctor", "--config", path], { ONCE_EMAIL_API_KEY: secret });
  assert.equal(doctor.exitCode, 0);
  assert.deepEqual(Object.keys(doctor.output).sort(), ["apiKeyAvailable", "command", "environment", "result", "schemaVersion"].sort());
  const plan = await runCli(["plan", "--config", path], {});
  assert.equal(plan.exitCode, 0);
  const rendered = JSON.stringify([doctor.output, plan.output]);
  for (const forbidden of [secret, host, evidence, path, "npm", "request-otp"]) assert.equal(rendered.includes(forbidden), false);
});

test("doctor fails closed when key source is missing without naming it", async () => {
  const path = await configFile(validConfig());
  const result = await runCli(["doctor", "--config", path], {});
  assert.deepEqual(result, { exitCode: 10, output: { schemaVersion: 1, result: "failed", errorCode: "CONFIG_INVALID" } });
});

test("configuration rejects production, extra fields, shell command and symlink", async () => {
  for (const invalid of [
    validConfig().replace("environment: staging", "environment: production"),
    validConfig() + "unexpected: true\n",
    validConfig().replace("command:\n    - npm\n    - request-otp", "command: npm request-otp"),
  ]) await assert.rejects(loadConfig(await configFile(invalid)), ConfigError);
  const path = await configFile(validConfig());
  const link = path + ".link";
  await symlink(path, link);
  await assert.rejects(loadConfig(link), ConfigError);
});

test("configuration rejects oversized input with generic error", async () => {
  await assert.rejects(loadConfig(await configFile("x".repeat(65_537))), ConfigError);
});

test("executable prints one redacted JSON object and stable exit code", async () => {
  const path = await configFile(validConfig());
  const cli = join(process.cwd(), "dist/src/cli.js");
  const result = spawnSync(process.execPath, [cli, "doctor", "--config", path], {
    encoding: "utf8", env: { ...process.env, ONCE_EMAIL_API_KEY: secret },
  });
  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  const output = JSON.parse(result.stdout) as Record<string, unknown>;
  assert.equal(output.result, "passed");
  for (const forbidden of [secret, host, evidence, path]) assert.equal(result.stdout.includes(forbidden), false);
});

async function configFile(contents: string): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "once-email-cli-test-"));
  const path = join(directory, "once-email.test.yaml");
  await writeFile(path, contents, { mode: 0o600 });
  return path;
}

function validConfig(): string {
  return `version: 1
api:
  baseUrl: https://api.once-email.com
  apiKeyEnv: ONCE_EMAIL_API_KEY
authorization:
  environment: staging
  targetHosts:
    - ${host}
  evidenceRef: ${evidence}
trigger:
  command:
    - npm
    - request-otp
  addressInput: stdin-json
match:
  fromDomain: example.test
  subjectIncludes: Sign-in code
  receivedAfterTrigger: true
  timeoutSeconds: 90
extract:
  type: otp
  pattern: contextual-6-digit
report:
  formats: [json, junit]
  includeSensitiveValues: false
cleanup:
  required: true
`;
}
