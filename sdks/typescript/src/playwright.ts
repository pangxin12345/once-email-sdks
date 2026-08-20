import type { Fixtures, TestType } from "@playwright/test";
import type { FlowAdapter } from "./adapter.js";
import { AssertionFailedError, TriggerFailedError } from "./adapter.js";
import { loadConfig } from "./config.js";
import { executeManagedRun } from "./managed-run.js";
import type { RunReport } from "./report.js";

export interface EmailOtpFlowRequest {
  configPath: string;
  reportPath: string;
  journalRoot?: string;
  requestOtp: (address: string) => Promise<void>;
  assertOtp: (otp: string) => Promise<void>;
}

export interface EmailOtpFlowResult { exitCode: number; report: RunReport }
export interface EmailOtpFixture { run(request: EmailOtpFlowRequest): Promise<EmailOtpFlowResult> }

export function extendWithEmailOtp<T extends {}, W extends {}>(
  base: TestType<T, W>, environment: NodeJS.ProcessEnv = process.env,
): TestType<T & { onceEmailOtp: EmailOtpFixture }, W> {
  const fixtures = {
    onceEmailOtp: async ({}: T & W, use: (value: EmailOtpFixture) => Promise<void>) => {
      await use({ run: async (request) => {
        const config = await loadConfig(request.configPath);
        return executeManagedRun({ config, reportPath: request.reportPath,
          adapter: new CallbackFlowAdapter(request.requestOtp, request.assertOtp), environment,
          ...(request.journalRoot === undefined ? {} : { journalRoot: request.journalRoot }) });
      } });
    },
  } as unknown as Fixtures<{ onceEmailOtp: EmailOtpFixture }, {}, T, W>;
  return base.extend<{ onceEmailOtp: EmailOtpFixture }>(fixtures);
}

export class CallbackFlowAdapter implements FlowAdapter {
  constructor(private readonly requestOtp: (address: string) => Promise<void>,
    private readonly assertOtp: (otp: string) => Promise<void>) {}

  async start(address: string, timeoutMs: number): Promise<void> {
    try { await bounded(this.requestOtp(address), timeoutMs); } catch { throw new TriggerFailedError(); }
  }

  async deliverOtp(otp: string, timeoutMs: number): Promise<void> {
    try {
      await bounded(this.assertOtp(otp), timeoutMs);
    } catch (error) {
      if (error instanceof AssertionFailedError) throw error;
      throw new AssertionFailedError();
    }
  }

  close(): void {}
}

function bounded<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new AssertionFailedError()), Math.max(1, timeoutMs));
    promise.then((value) => { clearTimeout(timer); resolve(value); },
      (error: unknown) => { clearTimeout(timer); reject(error); });
  });
}
