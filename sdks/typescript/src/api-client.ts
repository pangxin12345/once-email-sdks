import type { components } from "./generated/api.js";

export type Inbox = components["schemas"]["Inbox"];
export type MessageSummary = components["schemas"]["MessageSummary"];
export type Message = components["schemas"]["Message"];

export class ApiClientError extends Error {
  constructor(
    readonly code: string,
    readonly status: number | null,
    readonly retryable: boolean,
    readonly retryAfterSeconds: number | null,
  ) {
    super("Once Email API request failed");
    this.name = "ApiClientError";
  }
}

export interface MessagePage {
  items: MessageSummary[];
  nextCursor: string | null;
}

export class OnceEmailApiClient {
  constructor(
    private readonly apiKey: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly baseUrl = "https://api.once-email.com",
    private readonly requestTimeoutMs = 10_000,
  ) {
    if (!apiKey.startsWith("oe_live_") || apiKey.length > 180) throw new Error("API key configuration is invalid");
    if (baseUrl !== "https://api.once-email.com") throw new Error("API base URL is not allowed");
  }

  createInbox(idempotencyKey: string): Promise<Inbox> {
    if (!/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyKey)) throw new Error("Idempotency key is invalid");
    return this.json<Inbox>("/v1/inboxes", { method: "POST", headers: { "Idempotency-Key": idempotencyKey } });
  }

  async listMessages(inboxId: string, since: string, cursor?: string, pageSize = 50, signal?: AbortSignal): Promise<MessagePage> {
    const query = new URLSearchParams({ since, pageSize: String(pageSize) });
    if (cursor) query.set("cursor", cursor);
    const response = await this.request(`/v1/inboxes/${validatedInboxId(inboxId)}/messages?${query}`,
      signal === undefined ? {} : { signal });
    const items = await safeJson<MessageSummary[]>(response);
    if (!Array.isArray(items)) throw malformed();
    return { items, nextCursor: response.headers.get("X-Next-Cursor") };
  }

  getMessage(inboxId: string, uid: number, signal?: AbortSignal): Promise<Message> {
    if (!Number.isSafeInteger(uid) || uid < 1) throw new Error("Message reference is invalid");
    return this.json<Message>(`/v1/inboxes/${validatedInboxId(inboxId)}/messages/${uid}`,
      signal === undefined ? undefined : { signal });
  }

  async deleteInbox(inboxId: string): Promise<void> {
    await this.request(`/v1/inboxes/${validatedInboxId(inboxId)}`, { method: "DELETE" });
  }

  private async json<T>(path: string, init?: RequestInit): Promise<T> {
    return safeJson<T>(await this.request(path, init));
  }

  private async request(path: string, init: RequestInit = {}): Promise<Response> {
    let response: Response;
    try {
      response = await this.fetcher(this.baseUrl + path, {
        ...init,
        headers: { ...init.headers, Authorization: `Bearer ${this.apiKey}`, Accept: "application/json" },
        redirect: "error",
        signal: init.signal === undefined || init.signal === null
          ? AbortSignal.timeout(this.requestTimeoutMs)
          : AbortSignal.any([init.signal, AbortSignal.timeout(this.requestTimeoutMs)]),
      });
    } catch {
      throw new ApiClientError("network_unavailable", null, true, null);
    }
    if (response.ok) return response;
    let error: { code?: unknown; retryable?: unknown } = {};
    try { error = await response.json() as typeof error; } catch { /* Stable fallback below. */ }
    const code = typeof error.code === "string" ? error.code : "malformed_response";
    const retryable = error.retryable === true && (response.status === 409 || response.status === 429 || response.status === 503);
    throw new ApiClientError(code, response.status, retryable, retryAfter(response.headers.get("Retry-After")));
  }
}

function validatedInboxId(value: string): string {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error("Inbox reference is invalid");
  }
  return value;
}

async function safeJson<T>(response: Response): Promise<T> {
  try { return await response.json() as T; }
  catch { throw malformed(); }
}

function malformed(): ApiClientError { return new ApiClientError("malformed_response", null, false, null); }

function retryAfter(raw: string | null): number | null {
  if (raw === null || !/^\d{1,3}$/.test(raw)) return null;
  const seconds = Number(raw);
  return seconds >= 1 && seconds <= 300 ? seconds : null;
}
