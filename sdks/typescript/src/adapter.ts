import { spawn, type ChildProcessByStdio } from "node:child_process";
import type { Writable } from "node:stream";
import type { TestConfig } from "./config.js";

export class TriggerFailedError extends Error { readonly code = "TRIGGER_FAILED"; }
export class AssertionFailedError extends Error { readonly code = "ASSERTION_FAILED"; }

export interface FlowAdapter {
  start(address: string, timeoutMs: number): Promise<void>;
  deliverOtp(otp: string, timeoutMs: number): Promise<void>;
  close(): void;
}

export class ProcessFlowAdapter implements FlowAdapter {
  private child: ChildProcessByStdio<Writable, null, null> | null = null;
  private exited = false;
  private failed = false;

  constructor(private readonly config: TestConfig, private readonly environment: NodeJS.ProcessEnv = process.env) {}

  async start(address: string, timeoutMs: number): Promise<void> {
    const [executable, ...args] = this.config.trigger.command;
    if (executable === undefined) throw new TriggerFailedError();
    const childEnvironment = { ...this.environment };
    delete childEnvironment[this.config.api.apiKeyEnv];
    const child = spawn(executable, args, { shell: false, stdio: ["pipe", "ignore", "ignore"], env: childEnvironment });
    this.child = child;
    child.once("exit", () => { this.exited = true; });
    await bounded(new Promise<void>((resolve, reject) => {
      child.once("spawn", resolve);
      child.once("error", () => { this.failed = true; reject(new TriggerFailedError()); });
    }), timeoutMs, () => { child.kill("SIGTERM"); return new TriggerFailedError(); });
    await bounded(write(child, { type: "inbox", address }), timeoutMs,
      () => { child.kill("SIGTERM"); return new TriggerFailedError(); });
  }

  async deliverOtp(otp: string, timeoutMs: number): Promise<void> {
    const child = this.child;
    if (child === null || this.exited || this.failed) throw new TriggerFailedError();
    await write(child, { type: "otp", value: otp });
    child.stdin.end();
    const code = await exitCode(child, timeoutMs);
    if (code !== 0) throw new AssertionFailedError();
  }

  close(): void {
    if (this.child !== null && !this.exited) this.child.kill("SIGTERM");
  }
}

function write(child: ChildProcessByStdio<Writable, null, null>, value: object): Promise<void> {
  return new Promise((resolve, reject) => {
    child.stdin.write(JSON.stringify(value) + "\n", (error) => error ? reject(new TriggerFailedError()) : resolve());
  });
}

function exitCode(child: ChildProcessByStdio<Writable, null, null>, timeoutMs: number): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { child.kill("SIGTERM"); reject(new AssertionFailedError()); }, Math.max(1, timeoutMs));
    child.once("error", () => { clearTimeout(timer); reject(new TriggerFailedError()); });
    child.once("exit", (code) => { clearTimeout(timer); resolve(code); });
  });
}

function bounded<T>(promise: Promise<T>, timeoutMs: number, error: () => Error): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(error()), Math.max(1, timeoutMs));
    promise.then((value) => { clearTimeout(timer); resolve(value); },
      (reason: unknown) => { clearTimeout(timer); reject(reason); });
  });
}
