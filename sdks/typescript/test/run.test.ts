import assert from "node:assert/strict";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { Ajv2020 } from "ajv/dist/2020.js";
import type { TestConfig } from "../src/config.js";
import type { FlowAdapter } from "../src/adapter.js";
import { ProcessFlowAdapter, TriggerFailedError } from "../src/adapter.js";
import type { RunApi } from "../src/runner.js";
import { executeRun } from "../src/runner.js";
import { AmbiguousMessageError } from "../src/matcher.js";
import { WaitTimeoutError } from "../src/waiter.js";
import { writeReports } from "../src/report.js";

const inboxId = "123e4567-e89b-12d3-a456-426614174000";
const address = "sensitive@example.test";
const otp = "123456";

test("run delivers sensitive values only to adapter and always cleans", async () => {
  const adapter = recordingAdapter();
  const api = successfulApi();
  const outcome = await executeRun(config(), api, adapter, () => Date.parse("2026-08-15T01:00:00Z"),
    async () => ({ uid: 7, subject: "hidden", from: "hidden@example.test", receivedAt: "2026-08-15T01:00:01Z", attachmentsCount: 0 }));
  assert.equal(outcome.exitCode, 0);
  assert.deepEqual(adapter.received, [address, otp]);
  assert.deepEqual(api.deleted, [inboxId]);
  const rendered = JSON.stringify(outcome.report);
  for (const forbidden of [address, otp, inboxId, "hidden@example.test", "hidden"]) assert.equal(rendered.includes(forbidden), false);
});

test("cleanup failure overrides a successful main flow", async () => {
  const api = successfulApi();
  api.deleteInbox = async () => { throw new Error("private dependency detail"); };
  const outcome = await executeRun(config(), api, recordingAdapter(), Date.now,
    async () => ({ uid: 7, subject: "hidden", from: "hidden@example.test", receivedAt: new Date(Date.now() + 1).toISOString(), attachmentsCount: 0 }));
  assert.equal(outcome.exitCode, 60);
  assert.equal(outcome.report.errorCode, "CLEANUP_FAILED");
  assert.equal(outcome.report.cleanup.result, "failed");
  assert.equal(JSON.stringify(outcome.report).includes("dependency"), false);
});

test("timeout and ambiguity keep distinct codes and still clean", async () => {
  for (const [error, exitCode, code] of [
    [new WaitTimeoutError(3), 30, "WAIT_TIMEOUT"],
    [new AmbiguousMessageError(2), 31, "AMBIGUOUS_MESSAGE"],
  ] as const) {
    const api = successfulApi();
    const outcome = await executeRun(config(), api, recordingAdapter(), Date.now, async () => { throw error; });
    assert.equal(outcome.exitCode, exitCode);
    assert.equal(outcome.report.errorCode, code);
    assert.deepEqual(api.deleted, [inboxId]);
  }
});

test("trigger and extraction failures still clean without leaking", async () => {
  const triggerAdapter = recordingAdapter();
  triggerAdapter.start = async () => { throw new TriggerFailedError(); };
  const triggerApi = successfulApi();
  const trigger = await executeRun(config(), triggerApi, triggerAdapter);
  assert.equal(trigger.exitCode, 20);
  assert.deepEqual(triggerApi.deleted, [inboxId]);

  const extractApi = successfulApi();
  extractApi.getMessage = async () => ({ ...message(), bodyPreview: "Order 123456", bodyHtml: "" });
  const extraction = await executeRun(config(), extractApi, recordingAdapter(), Date.now,
    async () => ({ uid: 7, subject: "hidden", from: "hidden@example.test", receivedAt: new Date(Date.now() + 1).toISOString(), attachmentsCount: 0 }));
  assert.equal(extraction.exitCode, 32);
  assert.deepEqual(extractApi.deleted, [inboxId]);
});

test("process adapter strips API key environment and uses stdin protocol", async () => {
  const configured = config();
  configured.trigger.command = [process.execPath, "-e", `
    const readline=require('node:readline').createInterface({input:process.stdin});
    const lines=[]; readline.on('line', line => lines.push(JSON.parse(line)));
    readline.on('close', () => process.exit(process.env.ONCE_EMAIL_API_KEY || lines[0]?.type!=='inbox' || lines[1]?.type!=='otp' ? 2 : 0));
  `];
  const adapter = new ProcessFlowAdapter(configured, { ONCE_EMAIL_API_KEY: "oe_live_never-child" });
  await adapter.start(address, 3000);
  await adapter.deliverOtp(otp, 3000);
  adapter.close();
});

test("process adapter classifies an unavailable executable without leaking its path", async () => {
  const configured = config();
  configured.trigger.command = ["/definitely-missing/private-adapter"];
  const adapter = new ProcessFlowAdapter(configured, { ONCE_EMAIL_API_KEY: "oe_live_never-child" });
  await assert.rejects(adapter.start(address, 3000), TriggerFailedError);
  adapter.close();
});

test("reports are new 0600 files and contain only redacted schema fields", async () => {
  const outcome = await executeRun(config(), successfulApi(), recordingAdapter(), Date.now,
    async () => ({ uid: 7, subject: "hidden", from: "hidden@example.test", receivedAt: new Date(Date.now() + 1).toISOString(), attachmentsCount: 0 }));
  const directory = await mkdtemp(join(tmpdir(), "once-email-report-test-"));
  const path = join(directory, "report.json");
  await writeReports(path, outcome.report, config());
  if (process.platform !== "win32") assert.equal((await stat(path)).mode & 0o777, 0o600);
  const json = await readFile(path, "utf8");
  const xml = await readFile(join(directory, "report.xml"), "utf8");
  for (const forbidden of [address, otp, inboxId, "hidden@example.test", "hidden"]) {
    assert.equal(json.includes(forbidden), false); assert.equal(xml.includes(forbidden), false);
  }
  const schema = JSON.parse(await readFile(new URL("../../schemas/run-report.schema.json", import.meta.url), "utf8"));
  const ajv = new Ajv2020({ strict: true, formats: {
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    "date-time": { type: "string", validate: (value: string) => !Number.isNaN(Date.parse(value)) },
  } });
  assert.equal(ajv.compile(schema)(JSON.parse(json)), true);
  await assert.rejects(writeReports(path, outcome.report, config()));
});

test("message detail read receives the remaining transaction deadline", async () => {
  const api = successfulApi();
  let signal: AbortSignal | undefined;
  api.getMessage = async (_inboxId, _uid, value) => { signal = value; return message(); };
  const outcome = await executeRun(config(), api, recordingAdapter(), Date.now,
    async () => ({ uid: 7, subject: "hidden", from: "hidden@example.test", receivedAt: new Date().toISOString(), attachmentsCount: 0 }));
  assert.equal(outcome.exitCode, 0);
  assert.ok(signal instanceof AbortSignal);
});

function successfulApi(): RunApi & { deleted: string[] } {
  const api: RunApi & { deleted: string[] } = {
    deleted: [],
    createInbox: async () => ({ id: inboxId, address, expiresAt: "2026-08-15T02:00:00Z", serverTime: "2026-08-15T01:00:00Z" }),
    listMessages: async () => ({ items: [], nextCursor: null }),
    getMessage: async () => message(),
    deleteInbox: async (id) => { api.deleted.push(id); },
  };
  return api;
}

function message() {
  return { uid: 7, subject: "hidden", from: "hidden@example.test", receivedAt: "2026-08-15T01:00:01Z",
    attachmentsCount: 0, bodyPreview: `Your verification code is ${otp}`, bodyHtml: "", attachments: [] };
}

function recordingAdapter(): FlowAdapter & { received: string[] } {
  const adapter = { received: [] as string[], start: async (value: string) => { adapter.received.push(value); },
    deliverOtp: async (value: string) => { adapter.received.push(value); }, close: () => {} };
  return adapter;
}

function config(): TestConfig {
  return {
    version: 1, api: { baseUrl: "https://api.once-email.com", apiKeyEnv: "ONCE_EMAIL_API_KEY" },
    authorization: { environment: "staging", targetHosts: ["staging.example.test"], evidenceRef: "QA-123" },
    trigger: { command: ["node"], addressInput: "stdin-json" },
    match: { fromDomain: "example.test", subjectIncludes: "code", receivedAfterTrigger: true, timeoutSeconds: 10 },
    extract: { type: "otp", pattern: "contextual-6-digit" }, report: { formats: ["json", "junit"], includeSensitiveValues: false },
    cleanup: { required: true },
  };
}
