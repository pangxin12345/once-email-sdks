import { test as base, expect } from "@playwright/test";
import { mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { extendWithEmailOtp } from "../dist/src/playwright.js";

const inboxId = "123e4567-e89b-42d3-a456-426614174001";
const address = "private@example.test";
const otp = "123456";
const test = extendWithEmailOtp(base, { ONCE_EMAIL_API_KEY: "oe_live_0000000000000000" });

test("fixture keeps sensitive values inside callbacks and returns a redacted report", async ({ onceEmailOtp }) => {
  const root = await mkdtemp(join(tmpdir(), "once-email-playwright-"));
  const configPath = join(root, "once-email.test.yaml");
  const reportPath = join(root, "report.json");
  await writeFile(configPath, JSON.stringify({
    version: 1, api: { baseUrl: "https://api.once-email.com", apiKeyEnv: "ONCE_EMAIL_API_KEY" },
    authorization: { environment: "staging", targetHosts: ["staging.example.test"], evidenceRef: "QA-123" },
    trigger: { command: ["node"], addressInput: "stdin-json" },
    match: { fromDomain: "example.test", subjectIncludes: "code", receivedAfterTrigger: true, timeoutSeconds: 10 },
    extract: { type: "otp", pattern: "contextual-6-digit" },
    report: { formats: ["json", "junit"], includeSensitiveValues: false }, cleanup: { required: true },
  }), { mode: 0o600 });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (init?.method === "POST") return new Response(JSON.stringify({ id: inboxId, address, expiresAt: new Date(Date.now() + 60_000).toISOString(), serverTime: new Date().toISOString() }), { status: 201 });
    if (init?.method === "DELETE") return new Response(null, { status: 204 });
    if (url.includes("?")) return new Response(JSON.stringify([{ uid: 1, subject: "login code", from: "sender@example.test", receivedAt: new Date(Date.now() + 1_000).toISOString(), attachmentsCount: 0 }]), { status: 200 });
    return new Response(JSON.stringify({ uid: 1, subject: "login code", from: "sender@example.test", receivedAt: new Date(Date.now() + 1_000).toISOString(), attachmentsCount: 0, bodyPreview: `Your verification code is ${otp}`, bodyHtml: "", attachments: [] }), { status: 200 });
  };
  const received: string[] = [];
  try {
    const result = await onceEmailOtp.run({ configPath, reportPath, journalRoot: root,
      requestOtp: async (value) => { received.push(value); },
      assertOtp: async (value) => { received.push(value); expect(value).toBe(otp); } });
    expect(result.exitCode).toBe(0);
    expect(received).toEqual([address, otp]);
    expect(await readdir(join(root, ".once-email", "run"))).toEqual([]);
    const rendered = `${JSON.stringify(result.report)}${await readFile(reportPath, "utf8")}`;
    for (const forbidden of [inboxId, address, otp, "sender@example.test", "oe_live_"]) expect(rendered).not.toContain(forbidden);
  } finally { globalThis.fetch = originalFetch; }
});
