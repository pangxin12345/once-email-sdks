import type { MessageSummary } from "./api-client.js";

export interface MatchCriteria {
  fromDomain: string;
  subjectIncludes: string;
  receivedAfter: Date;
}

export class AmbiguousMessageError extends Error {
  readonly code = "AMBIGUOUS_MESSAGE";
  constructor(readonly candidateCount: number) {
    super("More than one email matched the authorized test criteria");
    this.name = "AmbiguousMessageError";
  }
}

// The API contract serializes receivedAt at whole-second precision while the
// local trigger clock includes milliseconds. Only bridge that lost precision.
const RECEIVED_AT_PRECISION_MS = 1_000;

export function uniqueMatch(messages: MessageSummary[], criteria: MatchCriteria): MessageSummary | null {
  const domain = criteria.fromDomain.toLowerCase();
  const subject = criteria.subjectIncludes.toLowerCase();
  const candidates = messages.filter((message) => {
    const received = message.receivedAt === null ? Number.NaN : Date.parse(message.receivedAt);
    return Number.isFinite(received)
      && received + RECEIVED_AT_PRECISION_MS - 1 >= criteria.receivedAfter.getTime()
      && senderDomain(message.from) === domain
      && message.subject.toLowerCase().includes(subject);
  });
  if (candidates.length > 1) throw new AmbiguousMessageError(candidates.length);
  return candidates[0] ?? null;
}

function senderDomain(sender: string): string {
  const match = /@([^>\s]+)>?\s*$/.exec(sender.trim().toLowerCase());
  return match?.[1] ?? "";
}
