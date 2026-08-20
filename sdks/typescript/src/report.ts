import { open } from "node:fs/promises";
import type { TestConfig } from "./config.js";

export type ErrorCode = "CONFIG_INVALID" | "AUTHORIZATION_REJECTED" | "TRIGGER_FAILED" | "WAIT_TIMEOUT"
  | "AMBIGUOUS_MESSAGE" | "EXTRACTION_FAILED" | "ASSERTION_FAILED" | "API_UNAVAILABLE" | "CLEANUP_FAILED";
export interface StageReport {
  name: string; startedAt: string; endedAt: string; durationMs: number; result: "passed" | "failed" | "skipped";
  retryCount?: number; candidateCount?: number; valueFound?: boolean;
}
export interface RunReport {
  schemaVersion: 1; runId: string; flowType: "email-otp"; environment: "local" | "test" | "staging";
  result: "passed" | "failed"; errorCode: ErrorCode | null; stages: StageReport[];
  cleanup: { attempted: boolean; result: "cleaned" | "failed" | "not-created" };
  versions: { cli: string; configSchema: string; apiContract: string };
}

export async function writeReports(path: string, report: RunReport, config: TestConfig): Promise<void> {
  if (!path.endsWith(".json")) throw new Error("Report path is invalid");
  if (config.report.formats.includes("json")) await writeNew(path, JSON.stringify(report) + "\n");
  if (config.report.formats.includes("junit")) {
    const xmlPath = path.slice(0, -5) + ".xml";
    const failure = report.result === "failed" ? `<failure message="${report.errorCode ?? "FAILED"}"/>` : "";
    await writeNew(xmlPath, `<?xml version="1.0" encoding="UTF-8"?>\n<testsuite name="once-email-test" tests="1" failures="${report.result === "failed" ? 1 : 0}"><testcase name="email-otp">${failure}</testcase></testsuite>\n`);
  }
}

async function writeNew(path: string, contents: string): Promise<void> {
  const file = await open(path, "wx", 0o600);
  try { await file.writeFile(contents, "utf8"); }
  finally { await file.close(); }
}
