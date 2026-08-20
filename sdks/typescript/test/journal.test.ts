import assert from "node:assert/strict";
import { chmod, lstat, mkdir, readFile, readdir, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdtemp } from "node:fs/promises";
import test from "node:test";
import { createCleanupJournal, loadCleanupJournal, removeCleanupJournal, validatePrivateMode } from "../src/journal.js";
import { runCli } from "../src/cli.js";

const runId = "123e4567-e89b-42d3-a456-426614174000";
const inboxId = "123e4567-e89b-42d3-a456-426614174001";

test("permission validation is strict on Unix and uses exclusive-file guarantees on Windows", () => {
  assert.equal(validatePrivateMode(0o100600, "linux"), true);
  assert.equal(validatePrivateMode(0o100644, "linux"), false);
  assert.equal(validatePrivateMode(0o100666, "darwin"), false);
  assert.equal(validatePrivateMode(0o100666, "win32"), true);
});

test("journal persists only the minimum recovery fields in restricted storage", async () => {
  const root = await mkdtemp(join(tmpdir(), "once-email-journal-"));
  const path = await createCleanupJournal(runId, "ONCE_EMAIL_API_KEY", root);
  assert.equal((await stat(join(root, ".once-email"))).mode & 0o777, 0o700);
  assert.equal((await stat(join(root, ".once-email", "run"))).mode & 0o777, 0o700);
  assert.equal((await stat(path)).mode & 0o777, 0o600);
  const raw = await readFile(path, "utf8");
  assert.deepEqual(Object.keys(JSON.parse(raw)).sort(), ["apiKeyEnv", "createdAt", "runId", "schemaVersion"].sort());
  for (const forbidden of [inboxId, "@", "oe_live_"]) assert.equal(raw.includes(forbidden), false);
  assert.equal((await loadCleanupJournal(path)).runId, runId);
  await removeCleanupJournal(path);
  await assert.rejects(lstat(path));
});

test("journal rejects broad permissions, extra fields and symlinks", async () => {
  const root = await mkdtemp(join(tmpdir(), "once-email-journal-invalid-"));
  const path = await createCleanupJournal(runId, "ONCE_EMAIL_API_KEY", root);
  await chmod(path, 0o644);
  await assert.rejects(loadCleanupJournal(path));
  await chmod(path, 0o600);
  const value = JSON.parse(await readFile(path, "utf8"));
  await writeFile(path, JSON.stringify({ ...value, inboxId }), { mode: 0o600 });
  await assert.rejects(loadCleanupJournal(path));
  const link = join(root, `${runId}.json`);
  await symlink(path, link);
  await assert.rejects(loadCleanupJournal(link));
});

test("journal creation rejects an existing broad or linked directory", async () => {
  const broad = await mkdtemp(join(tmpdir(), "once-email-journal-broad-"));
  await mkdir(join(broad, ".once-email"), { mode: 0o755 });
  await assert.rejects(createCleanupJournal(runId, "ONCE_EMAIL_API_KEY", broad));
  const linked = await mkdtemp(join(tmpdir(), "once-email-journal-link-"));
  const target = await mkdtemp(join(tmpdir(), "once-email-journal-target-"));
  await symlink(target, join(linked, ".once-email"));
  await assert.rejects(createCleanupJournal(runId, "ONCE_EMAIL_API_KEY", linked));
});

test("cleanup replays the idempotency key, deletes and removes the journal without leaking", async () => {
  const root = await mkdtemp(join(tmpdir(), "once-email-cleanup-"));
  const path = await createCleanupJournal(runId, "ONCE_EMAIL_API_KEY", root);
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    requests.push({ url: String(input), ...(init === undefined ? {} : { init }) });
    if (init?.method === "POST") return new Response(JSON.stringify({ id: inboxId, address: "private@example.test", expiresAt: new Date().toISOString(), serverTime: new Date().toISOString() }), { status: 201 });
    return new Response(null, { status: 204 });
  };
  try {
    const result = await runCli(["cleanup", "--run-file", path], { ONCE_EMAIL_API_KEY: "oe_live_0000000000000000" });
    assert.equal(result.exitCode, 0);
    assert.deepEqual(result.output, { schemaVersion: 1, command: "cleanup", result: "passed", cleanupResult: "cleaned" });
    assert.equal(requests[0]?.init?.headers instanceof Object, true);
    assert.equal((requests[0]?.init?.headers as Record<string, string>)["Idempotency-Key"], runId);
    await assert.rejects(lstat(path));
    const rendered = JSON.stringify(result.output);
    for (const forbidden of [runId, inboxId, path, "ONCE_EMAIL_API_KEY", "oe_live_"]) assert.equal(rendered.includes(forbidden), false);
  } finally { globalThis.fetch = originalFetch; }
});

test("cleanup retains the journal and returns a stable code when deletion fails", async () => {
  const root = await mkdtemp(join(tmpdir(), "once-email-cleanup-fail-"));
  const path = await createCleanupJournal(runId, "ONCE_EMAIL_API_KEY", root);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => init?.method === "POST"
    ? new Response(JSON.stringify({ id: inboxId, address: "private@example.test", expiresAt: new Date().toISOString(), serverTime: new Date().toISOString() }), { status: 201 })
    : new Response(JSON.stringify({ code: "dependency_unavailable", retryable: true }), { status: 503 });
  try {
    const result = await runCli(["cleanup", "--run-file", path], { ONCE_EMAIL_API_KEY: "oe_live_0000000000000000" });
    assert.equal(result.exitCode, 60);
    assert.equal(result.output.errorCode, "CLEANUP_FAILED");
    assert.equal((await loadCleanupJournal(path)).runId, runId);
    assert.equal(JSON.stringify(result.output).includes(inboxId), false);
  } finally { globalThis.fetch = originalFetch; }
});

test("run creates recovery state before the API call and removes it after finally cleanup", async () => {
  const root = await mkdtemp(join(tmpdir(), "once-email-run-journal-"));
  const configPath = join(root, "once-email.test.yaml");
  const reportPath = join(root, "report.json");
  await writeFile(configPath, `version: 1
api:
  baseUrl: https://api.once-email.com
  apiKeyEnv: ONCE_EMAIL_API_KEY
authorization:
  environment: staging
  targetHosts: [staging.example.test]
  evidenceRef: QA-123
trigger:
  command: [${JSON.stringify(process.execPath)}, -e, "const r=require('node:readline').createInterface({input:process.stdin});let n=0;r.on('line',()=>{if(++n===2)process.exit(0)})"]
  addressInput: stdin-json
match:
  fromDomain: example.test
  subjectIncludes: code
  receivedAfterTrigger: true
  timeoutSeconds: 10
extract: {type: otp, pattern: contextual-6-digit}
report: {formats: [json, junit], includeSensitiveValues: false}
cleanup: {required: true}
`, { mode: 0o600 });
  const originalFetch = globalThis.fetch;
  const originalCwd = process.cwd();
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (init?.method === "POST") return new Response(JSON.stringify({ id: inboxId, address: "private@example.test", expiresAt: new Date(Date.now() + 60_000).toISOString(), serverTime: new Date().toISOString() }), { status: 201 });
    if (init?.method === "DELETE") return new Response(null, { status: 204 });
    if (url.includes("?")) return new Response(JSON.stringify([{ uid: 1, subject: "login code", from: "sender@example.test", receivedAt: new Date(Date.now() + 1_000).toISOString(), attachmentsCount: 0 }]), { status: 200 });
    return new Response(JSON.stringify({ uid: 1, subject: "login code", from: "sender@example.test", receivedAt: new Date(Date.now() + 1_000).toISOString(), attachmentsCount: 0, bodyPreview: "Your verification code is 123456", bodyHtml: "", attachments: [] }), { status: 200 });
  };
  try {
    process.chdir(root);
    const result = await runCli(["run", "--config", configPath, "--report", reportPath], { ONCE_EMAIL_API_KEY: "oe_live_0000000000000000" });
    assert.equal(result.exitCode, 0);
    assert.deepEqual(await readdir(join(root, ".once-email", "run")), []);
    const rendered = `${JSON.stringify(result.output)}${await readFile(reportPath, "utf8")}`;
    for (const forbidden of [inboxId, "private@example.test", "123456", "oe_live_"]) assert.equal(rendered.includes(forbidden), false);
  } finally {
    process.chdir(originalCwd);
    globalThis.fetch = originalFetch;
  }
});
