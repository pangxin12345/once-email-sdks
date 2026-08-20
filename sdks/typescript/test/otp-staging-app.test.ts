import assert from "node:assert/strict";
import test from "node:test";
import { OtpStagingApp, type OtpMail } from "../src/fixture/otp-staging-app.js";

test("isolated registration sends one OTP and consumes it once", async () => {
  const sent: OtpMail[] = [];
  const app = new OtpStagingApp({ transport: { send: async (mail) => { sent.push(mail); } } });
  const running = await app.listen();
  try {
    const page = await fetch(running.origin);
    assert.equal(page.status, 200);
    assert.match(page.headers.get("x-robots-tag") ?? "", /noindex/);
    assert.match(await page.text(), /data-testid="otp"/);

    const registration = await fetch(`${running.origin}/api/register`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "private@example.test", password: "not-stored-password" }) });
    assert.equal(registration.status, 202);
    const { sessionId } = await registration.json() as { sessionId: string };
    assert.equal(sent.length, 1);
    assert.equal(sent[0]?.to, "private@example.test");
    assert.match(sent[0]?.otp ?? "", /^\d{6}$/);

    const verify = () => fetch(`${running.origin}/api/verify`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId, otp: sent[0]?.otp }) });
    assert.equal((await verify()).status, 204);
    assert.equal((await verify()).status, 404);
  } finally {
    await running.close();
  }
});

test("registration validates input, limits concurrency and closes on mail failure", async () => {
  let release: (() => void) | undefined;
  const waiting = new Promise<void>((resolve) => { release = resolve; });
  const app = new OtpStagingApp({ transport: { send: async () => waiting } });
  const running = await app.listen();
  try {
    const invalid = await fetch(`${running.origin}/api/register`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "bad", password: "short" }) });
    assert.equal(invalid.status, 400);
    const first = fetch(`${running.origin}/api/register`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "one@example.test", password: "long-enough" }) });
    await new Promise((resolve) => setTimeout(resolve, 10));
    const second = await fetch(`${running.origin}/api/register`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "two@example.test", password: "long-enough" }) });
    assert.equal(second.status, 429);
    release?.();
    assert.equal((await first).status, 202);
  } finally {
    await running.close();
  }

  const failed = new OtpStagingApp({ transport: { send: async () => { throw new Error("sensitive detail"); } } });
  const failedRunning = await failed.listen();
  try {
    const response = await fetch(`${failedRunning.origin}/api/register`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "private@example.test", password: "long-enough" }) });
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { code: "MAIL_UNAVAILABLE" });
  } finally {
    await failedRunning.close();
  }
});
