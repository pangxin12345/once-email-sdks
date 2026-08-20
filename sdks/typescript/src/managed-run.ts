import { randomUUID } from "node:crypto";
import type { TestConfig } from "./config.js";
import { requireApiKey } from "./config.js";
import { OnceEmailApiClient } from "./api-client.js";
import type { FlowAdapter } from "./adapter.js";
import { createCleanupJournal, removeCleanupJournal } from "./journal.js";
import { executeRun, type RunApi } from "./runner.js";
import { writeReports } from "./report.js";

export interface ManagedRunOptions {
  config: TestConfig;
  reportPath: string;
  adapter: FlowAdapter;
  environment?: NodeJS.ProcessEnv;
  journalRoot?: string;
  apiFactory?: (apiKey: string) => RunApi;
}

export async function executeManagedRun(options: ManagedRunOptions) {
  const environment = options.environment ?? process.env;
  const apiKey = requireApiKey(options.config, environment);
  const runId = randomUUID();
  const journalPath = await createCleanupJournal(runId, options.config.api.apiKeyEnv, options.journalRoot ?? process.cwd());
  const api = options.apiFactory?.(apiKey) ?? new OnceEmailApiClient(apiKey);
  const outcome = await executeRun(options.config, api, options.adapter, Date.now, undefined, runId);
  if (outcome.report.cleanup.result === "cleaned") {
    try { await removeCleanupJournal(journalPath); }
    catch {
      outcome.exitCode = 60;
      outcome.report.result = "failed";
      outcome.report.errorCode = "CLEANUP_FAILED";
      outcome.report.cleanup.result = "failed";
    }
  }
  await writeReports(options.reportPath, outcome.report, options.config);
  return outcome;
}
