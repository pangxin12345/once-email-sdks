import assert from "node:assert/strict";
import test from "node:test";
import { ApiClientError, OnceEmailApiClient } from "../src/api-client.js";
import { AmbiguousMessageError, uniqueMatch } from "../src/matcher.js";
import { extractContextualSixDigitOtp, OtpExtractionError } from "../src/otp.js";
import { waitForUniqueMessage, WaitTimeoutError } from "../src/waiter.js";

const inboxId = "123e4567-e89b-12d3-a456-426614174000";
const receivedAt = "2026-08-15T01:00:01Z";
const message = { uid: 1, subject: "Your sign-in code", from: "Auth <mail@example.test>", receivedAt, attachmentsCount: 0 };

test("API client keeps credentials out of URL and stable errors", async () => {
  let capturedUrl = "", capturedAuth = "";
  const fetcher: typeof fetch = async (input, init) => {
    capturedUrl = String(input);
    capturedAuth = new Headers(init?.headers).get("Authorization") ?? "";
    return new Response(JSON.stringify({ code: "service_unavailable", message: "hidden", retryable: true }),
      { status: 503, headers: { "Content-Type": "application/json", "Retry-After": "5" } });
  };
  const secret = "oe_live_0000000000000000";
  const client = new OnceEmailApiClient(secret, fetcher);
  let error: ApiClientError | undefined;
  try { await client.listMessages(inboxId, receivedAt); }
  catch (caught) { if (caught instanceof ApiClientError) error = caught; else throw caught; }
  assert.ok(error);
  assert.equal(error.code, "service_unavailable");
  assert.equal(error.retryAfterSeconds, 5);
  assert.equal(capturedUrl.includes(secret), false);
  assert.equal(capturedAuth, `Bearer ${secret}`);
  assert.equal(JSON.stringify(error).includes(secret), false);
});

test("matcher returns one authorized candidate and rejects ambiguity", () => {
  const criteria = { fromDomain: "example.test", subjectIncludes: "sign-in", receivedAfter: new Date("2026-08-15T01:00:00Z") };
  assert.equal(uniqueMatch([message], criteria)?.uid, 1);
  assert.equal(uniqueMatch([{ ...message, receivedAt: "2026-08-15T00:59:59Z" }], criteria), null);
  assert.equal(uniqueMatch([{ ...message, receivedAt: "2026-08-15T01:00:00Z" }], criteria)?.uid, 1);
  assert.throws(() => uniqueMatch([message, { ...message, uid: 2 }], criteria), AmbiguousMessageError);
  assert.equal(uniqueMatch([{ ...message, from: "mail@other.test" }], criteria), null);
});

test("OTP extractor requires one contextual value", () => {
  assert.equal(extractContextualSixDigitOtp("Your verification code is 123456."), "123456");
  assert.throws(() => extractContextualSixDigitOtp("Order 123456"), OtpExtractionError);
  assert.throws(() => extractContextualSixDigitOtp("OTP 123456 and security code 654321"), OtpExtractionError);
});

test("waiter respects retry-after inside one deadline", async () => {
  let calls = 0, clock = 0;
  const client = { listMessages: async () => {
    calls += 1;
    if (calls === 1) throw new ApiClientError("service_unavailable", 503, true, 2);
    return { items: [message], nextCursor: null };
  } };
  const found = await waitForUniqueMessage(client, inboxId,
    { fromDomain: "example.test", subjectIncludes: "sign-in", receivedAfter: new Date("2026-08-15T01:00:00Z") },
    { timeoutMs: 10_000, now: () => clock, sleep: async (ms) => { clock += ms; }, random: () => 0.5 });
  assert.equal(found.uid, 1);
  assert.equal(clock, 2000);
});

test("waiter classifies empty inbox as timeout rather than API failure", async () => {
  let clock = 0;
  const client = { listMessages: async () => ({ items: [], nextCursor: null }) };
  await assert.rejects(waitForUniqueMessage(client, inboxId,
    { fromDomain: "example.test", subjectIncludes: "sign-in", receivedAfter: new Date("2026-08-15T01:00:00Z") },
    { timeoutMs: 3000, now: () => clock, sleep: async (ms) => { clock += ms; }, random: () => 0.5 }), WaitTimeoutError);
});
