import { randomUUID } from "node:crypto";
import type { TestConfig } from "./config.js";
import { ApiClientError, type Inbox, type Message, type MessagePage } from "./api-client.js";
import { AmbiguousMessageError } from "./matcher.js";
import { OtpExtractionError, extractContextualSixDigitOtp } from "./otp.js";
import { WaitTimeoutError, waitForUniqueMessage } from "./waiter.js";
import { AssertionFailedError, TriggerFailedError, type FlowAdapter } from "./adapter.js";
import type { ErrorCode, RunReport, StageReport } from "./report.js";

export interface RunApi {
  createInbox(idempotencyKey: string): Promise<Inbox>;
  listMessages(inboxId: string, since: string, cursor?: string, pageSize?: number, signal?: AbortSignal): Promise<MessagePage>;
  getMessage(inboxId: string, uid: number, signal?: AbortSignal): Promise<Message>;
  deleteInbox(inboxId: string): Promise<void>;
}

type WaitFunction = typeof waitForUniqueMessage;

export async function executeRun(config: TestConfig, api: RunApi, adapter: FlowAdapter,
  now: () => number = Date.now, wait: WaitFunction = waitForUniqueMessage,
  runId = randomUUID()): Promise<{ exitCode: number; report: RunReport }> {
  const stages: StageReport[] = [];
  let inbox: Inbox | null = null;
  let errorCode: ErrorCode | null = null;
  let exitCode = 0;
  try {
    inbox = await stage(stages, "inbox-create", now, () => api.createInbox(runId));
    const triggerStarted = now();
    await stage(stages, "target-trigger", now, () => adapter.start(inbox!.address,
      config.match.timeoutSeconds * 1000));
    const deadline = triggerStarted + config.match.timeoutSeconds * 1000;
    const summary = await stage(stages, "message-wait", now, () => wait(api, inbox!.id, {
      fromDomain: config.match.fromDomain, subjectIncludes: config.match.subjectIncludes,
      receivedAfter: new Date(triggerStarted),
    }, { timeoutMs: Math.max(1, deadline - now()) }));
    const message = await stage(stages, "message-read", now, () => api.getMessage(inbox!.id, summary.uid,
      AbortSignal.timeout(Math.max(1, deadline - now()))));
    const otp = await stage(stages, "otp-extract", now, async () => extractContextualSixDigitOtp(`${message.bodyPreview}\n${message.bodyHtml}`));
    await stage(stages, "adapter-assert", now, () => adapter.deliverOtp(otp, Math.max(1, deadline - now())));
  } catch (error) {
    ({ errorCode, exitCode } = classify(error));
  } finally {
    adapter.close();
    if (inbox !== null) {
      try { await stage(stages, "cleanup", now, () => api.deleteInbox(inbox!.id)); }
      catch { errorCode = "CLEANUP_FAILED"; exitCode = 60; }
    }
  }
  return { exitCode, report: {
    schemaVersion: 1, runId, flowType: "email-otp", environment: config.authorization.environment,
    result: exitCode === 0 ? "passed" : "failed", errorCode, stages,
    cleanup: { attempted: inbox !== null, result: inbox === null ? "not-created" : exitCode === 60 ? "failed" : "cleaned" },
    versions: { cli: "0.1.0-private.2", configSchema: "1", apiContract: "0.5.0-private-beta" },
  } };
}

async function stage<T>(stages: StageReport[], name: string, now: () => number, action: () => Promise<T>): Promise<T> {
  const started = now();
  try {
    const result = await action();
    const ended = now();
    stages.push({ name, startedAt: new Date(started).toISOString(), endedAt: new Date(ended).toISOString(), durationMs: Math.max(0, ended - started), result: "passed" });
    return result;
  } catch (error) {
    const ended = now();
    const extra = error instanceof AmbiguousMessageError ? { candidateCount: error.candidateCount } : error instanceof WaitTimeoutError ? { retryCount: error.retryCount } : {};
    stages.push({ name, startedAt: new Date(started).toISOString(), endedAt: new Date(ended).toISOString(), durationMs: Math.max(0, ended - started), result: "failed", ...extra });
    throw error;
  }
}

function classify(error: unknown): { errorCode: ErrorCode; exitCode: number } {
  if (error instanceof TriggerFailedError) return { errorCode: "TRIGGER_FAILED", exitCode: 20 };
  if (error instanceof WaitTimeoutError) return { errorCode: "WAIT_TIMEOUT", exitCode: 30 };
  if (error instanceof AmbiguousMessageError) return { errorCode: "AMBIGUOUS_MESSAGE", exitCode: 31 };
  if (error instanceof OtpExtractionError) return { errorCode: "EXTRACTION_FAILED", exitCode: 32 };
  if (error instanceof AssertionFailedError) return { errorCode: "ASSERTION_FAILED", exitCode: 40 };
  if (error instanceof ApiClientError) return { errorCode: error.status === 401 || error.status === 403 ? "AUTHORIZATION_REJECTED" : "API_UNAVAILABLE", exitCode: error.status === 401 || error.status === 403 ? 10 : 50 };
  return { errorCode: "API_UNAVAILABLE", exitCode: 50 };
}
