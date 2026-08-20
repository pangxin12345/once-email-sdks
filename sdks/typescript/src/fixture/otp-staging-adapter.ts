import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline";
import { chromium, type Browser, type Page } from "@playwright/test";
import { DirectSmtpTransport, OtpStagingApp, SshSendmailTransport } from "./otp-staging-app.js";

const smtpHost = process.env.OTP_FIXTURE_SMTP_HOST ?? "mail.once-email.com";
const smtpPort = Number(process.env.OTP_FIXTURE_SMTP_PORT ?? "25");
const transportMode = process.env.OTP_FIXTURE_TRANSPORT ?? "direct";
if (!/^[a-z0-9.-]+$/i.test(smtpHost) || !Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) process.exit(2);
if (transportMode !== "direct" && transportMode !== "ssh-sendmail") process.exit(2);

let browser: Browser | null = null;
let page: Page | null = null;
let closeApp: (() => Promise<void>) | null = null;
let started = false;

const input = createInterface({ input: process.stdin, crlfDelay: Infinity, terminal: false });
input.on("line", (line) => void handle(line).catch(() => void shutdown(1)));
input.on("close", () => { if (!started) void shutdown(1); });
process.once("SIGTERM", () => void shutdown(143));
process.once("SIGINT", () => void shutdown(130));

async function handle(line: string): Promise<void> {
  const message = JSON.parse(line) as unknown;
  if (!isRecord(message)) throw new Error("Invalid adapter input");
  if (message.type === "inbox" && typeof message.address === "string" && !started) {
    started = true;
    const transport = transportMode === "ssh-sendmail" ? new SshSendmailTransport() : new DirectSmtpTransport(smtpHost, smtpPort);
    const app = new OtpStagingApp({ transport });
    const running = await app.listen();
    closeApp = running.close;
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
    await page.goto(running.origin, { waitUntil: "domcontentloaded" });
    await page.getByTestId("email").fill(message.address);
    await page.getByTestId("password").fill(randomBytes(18).toString("base64url"));
    await page.getByTestId("send").click();
    await page.getByText("Code sent.", { exact: true }).waitFor();
    return;
  }
  if (message.type === "otp" && typeof message.value === "string" && page !== null) {
    await page.getByTestId("otp").fill(message.value);
    await page.getByTestId("verify").click();
    await page.getByText("Registration verified.", { exact: true }).waitFor();
    await shutdown(0);
    return;
  }
  throw new Error("Invalid adapter state");
}

async function shutdown(code: number): Promise<void> {
  input.close();
  await browser?.close().catch(() => undefined);
  await closeApp?.().catch(() => undefined);
  process.exitCode = code;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
