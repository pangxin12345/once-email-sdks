import assert from "node:assert/strict";
import test from "node:test";
import { AssertionFailedError, TriggerFailedError } from "../src/adapter.js";
import { CallbackFlowAdapter } from "../src/playwright.js";

test("in-process adapter bounds trigger and assertion callbacks without exposing values", async () => {
  const triggerTimeout = new CallbackFlowAdapter(async () => new Promise<void>(() => {}), async () => {});
  await assert.rejects(triggerTimeout.start("private@example.test", 5), TriggerFailedError);

  const assertionTimeout = new CallbackFlowAdapter(async () => {}, async () => new Promise<void>(() => {}));
  await assert.rejects(assertionTimeout.deliverOtp("123456", 5), AssertionFailedError);
});

test("in-process adapter maps callback details to stable generic failures", async () => {
  const trigger = new CallbackFlowAdapter(async () => { throw new Error("private trigger detail"); }, async () => {});
  await assert.rejects(trigger.start("private@example.test", 100),
    (error: unknown) => error instanceof TriggerFailedError && !error.message.includes("private"));
  const assertion = new CallbackFlowAdapter(async () => {}, async () => { throw new Error("private assertion detail"); });
  await assert.rejects(assertion.deliverOtp("123456", 100),
    (error: unknown) => error instanceof AssertionFailedError && !error.message.includes("private"));
});
