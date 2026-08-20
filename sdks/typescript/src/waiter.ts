import { ApiClientError, type MessagePage, type MessageSummary } from "./api-client.js";
import { uniqueMatch, type MatchCriteria } from "./matcher.js";

export interface MessageLister {
  listMessages(inboxId: string, since: string, cursor?: string, pageSize?: number, signal?: AbortSignal): Promise<MessagePage>;
}

export class WaitTimeoutError extends Error {
  readonly code = "WAIT_TIMEOUT";
  constructor(readonly retryCount: number) {
    super("No unique matching email arrived before the deadline");
    this.name = "WaitTimeoutError";
  }
}

export interface WaitOptions {
  timeoutMs: number;
  now?: () => number;
  sleep?: (milliseconds: number) => Promise<void>;
  random?: () => number;
}

export async function waitForUniqueMessage(
  client: MessageLister,
  inboxId: string,
  criteria: MatchCriteria,
  options: WaitOptions,
): Promise<MessageSummary> {
  const now = options.now ?? Date.now;
  const sleep = options.sleep ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)));
  const random = options.random ?? Math.random;
  const deadline = now() + options.timeoutMs;
  let attempt = 0;
  while (now() < deadline) {
    try {
      const messages = await allPages(client, inboxId, new Date(criteria.receivedAfter.getTime() - 999).toISOString(),
        AbortSignal.timeout(Math.max(1, deadline - now())));
      const match = uniqueMatch(messages, criteria);
      if (match) return match;
    } catch (error) {
      if (!(error instanceof ApiClientError) || !error.retryable) throw error;
      const requested = error.retryAfterSeconds === null ? backoff(attempt, random) : error.retryAfterSeconds * 1000;
      await sleepWithinDeadline(requested, deadline, now, sleep);
      attempt += 1;
      continue;
    }
    await sleepWithinDeadline(backoff(attempt, random), deadline, now, sleep);
    attempt += 1;
  }
  throw new WaitTimeoutError(attempt);
}

async function allPages(client: MessageLister, inboxId: string, since: string, signal: AbortSignal): Promise<MessageSummary[]> {
  const messages: MessageSummary[] = [];
  let cursor: string | undefined;
  for (let pages = 0; pages < 10; pages += 1) {
    const page = await client.listMessages(inboxId, since, cursor, 100, signal);
    messages.push(...page.items);
    if (page.nextCursor === null) return messages;
    cursor = page.nextCursor;
  }
  throw new ApiClientError("malformed_response", null, false, null);
}

function backoff(attempt: number, random: () => number): number {
  const sequence = [2000, 3000, 5000, 8000, 10000];
  const base = sequence[Math.min(attempt, sequence.length - 1)]!;
  return Math.round(base * (0.8 + random() * 0.4));
}

async function sleepWithinDeadline(
  requested: number,
  deadline: number,
  now: () => number,
  sleep: (milliseconds: number) => Promise<void>,
): Promise<void> {
  const remaining = deadline - now();
  if (remaining > 0) await sleep(Math.min(requested, remaining));
}
