#!/usr/bin/env node
import { ConfigError, loadConfig, requireApiKey } from "./config.js";
import { pathToFileURL } from "node:url";
import { OnceEmailApiClient } from "./api-client.js";
import { ProcessFlowAdapter } from "./adapter.js";
import { JournalError, loadCleanupJournal, removeCleanupJournal } from "./journal.js";
import { executeManagedRun } from "./managed-run.js";

interface Output { [key: string]: boolean | number | string }

export async function runCli(args: string[], environment: NodeJS.ProcessEnv = process.env): Promise<{ exitCode: number; output: Output }> {
  const [command, flag, path, ...extra] = args;
  const simple = (command === "doctor" || command === "plan") && flag === "--config" && path !== undefined && extra.length === 0;
  const run = command === "run" && flag === "--config" && path !== undefined && extra.length === 2
    && extra[0] === "--report" && extra[1] !== undefined;
  const cleanup = command === "cleanup" && flag === "--run-file" && path !== undefined && extra.length === 0;
  if (!simple && !run && !cleanup) {
    return failure("CONFIG_INVALID");
  }
  try {
    if (command === "cleanup") {
      const journal = await loadCleanupJournal(path);
      const apiKey = environment[journal.apiKeyEnv];
      if (apiKey === undefined) throw new ConfigError();
      const api = new OnceEmailApiClient(apiKey);
      const inbox = await api.createInbox(journal.runId);
      await api.deleteInbox(inbox.id);
      await removeCleanupJournal(path);
      return { exitCode: 0, output: { schemaVersion: 1, command, result: "passed", cleanupResult: "cleaned" } };
    }
    const config = await loadConfig(path);
    if (command === "run") {
      const outcome = await executeManagedRun({ config, reportPath: extra[1]!,
        adapter: new ProcessFlowAdapter(config, environment), environment });
      return { exitCode: outcome.exitCode, output: {
        schemaVersion: 1, command, result: outcome.report.result, cleanupResult: outcome.report.cleanup.result,
        ...(outcome.report.errorCode === null ? {} : { errorCode: outcome.report.errorCode }),
      } };
    }
    if (command === "doctor") requireApiKey(config, environment);
    if (command === "doctor") {
      return { exitCode: 0, output: { schemaVersion: 1, command, result: "passed", environment: config.authorization.environment, apiKeyAvailable: true } };
    }
    return { exitCode: 0, output: {
      schemaVersion: 1, command, result: "passed", environment: config.authorization.environment,
      targetCount: config.authorization.targetHosts.length, commandArgumentCount: config.trigger.command.length,
      authorizationEvidencePresent: config.authorization.evidenceRef.length >= 3,
    } };
  } catch (error) {
    if (command === "cleanup" && !(error instanceof ConfigError) && !(error instanceof JournalError)) {
      return { exitCode: 60, output: { schemaVersion: 1, command, result: "failed", cleanupResult: "failed", errorCode: "CLEANUP_FAILED" } };
    }
    return failure(error instanceof ConfigError || error instanceof JournalError ? error.code : "CONFIG_INVALID");
  }
}

function failure(code: string): { exitCode: number; output: Output } {
  return { exitCode: 10, output: { schemaVersion: 1, result: "failed", errorCode: code } };
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await runCli(process.argv.slice(2));
  process.stdout.write(JSON.stringify(result.output) + "\n");
  process.exitCode = result.exitCode;
}
