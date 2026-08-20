import { createHash, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { connect, type Socket } from "node:net";

const MAX_BODY_BYTES = 4096;
const OTP_TTL_MS = 5 * 60_000;
const MAX_ATTEMPTS = 5;

export interface OtpMail {
  to: string;
  otp: string;
}

export interface OtpMailTransport {
  send(mail: OtpMail): Promise<void>;
}

interface PendingOtp {
  digest: Buffer;
  expiresAt: number;
  attemptsLeft: number;
}

export interface OtpStagingAppOptions {
  transport: OtpMailTransport;
  now?: () => number;
  allowedHost?: string;
}

export class OtpStagingApp {
  private readonly pending = new Map<string, PendingOtp>();
  private readonly now: () => number;
  private readonly allowedHost: string;
  private server: Server | null = null;

  constructor(private readonly options: OtpStagingAppOptions) {
    this.now = options.now ?? Date.now;
    this.allowedHost = options.allowedHost ?? "127.0.0.1";
  }

  async listen(port = 0): Promise<{ origin: string; close: () => Promise<void> }> {
    if (this.server !== null) throw new Error("OTP staging app is already running");
    const server = createServer((request, response) => void this.handle(request, response));
    this.server = server;
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(port, this.allowedHost, resolve);
    });
    const address = server.address();
    if (address === null || typeof address === "string") throw new Error("OTP staging app failed to bind");
    return {
      origin: `http://${this.allowedHost}:${address.port}`,
      close: async () => {
        this.pending.clear();
        await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
        this.server = null;
      },
    };
  }

  private async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    setSecurityHeaders(response);
    if (!isLoopback(request.socket.remoteAddress) || !isAllowedHost(request.headers.host, this.allowedHost)) {
      respondJson(response, 403, { code: "FORBIDDEN" });
      return;
    }
    if (request.method === "GET" && request.url === "/") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end(PAGE);
      return;
    }
    if (request.method === "POST" && request.url === "/api/register") {
      await this.register(request, response);
      return;
    }
    if (request.method === "POST" && request.url === "/api/verify") {
      await this.verify(request, response);
      return;
    }
    respondJson(response, 404, { code: "NOT_FOUND" });
  }

  private async register(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const body = await readJson(request);
    if (!isObject(body) || !isEmail(body.email) || typeof body.password !== "string" || body.password.length < 8 || body.password.length > 128) {
      respondJson(response, 400, { code: "INVALID_REGISTRATION" });
      return;
    }
    if (this.pending.size > 0) {
      respondJson(response, 429, { code: "FLOW_IN_PROGRESS" });
      return;
    }
    const sessionId = randomUUID();
    const otp = randomInt(100000, 1_000_000).toString();
    this.pending.set(sessionId, { digest: digest(otp), expiresAt: this.now() + OTP_TTL_MS, attemptsLeft: MAX_ATTEMPTS });
    try {
      await this.options.transport.send({ to: body.email, otp });
      respondJson(response, 202, { sessionId });
    } catch {
      this.pending.delete(sessionId);
      respondJson(response, 503, { code: "MAIL_UNAVAILABLE" });
    }
  }

  private async verify(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const body = await readJson(request);
    if (!isObject(body) || typeof body.sessionId !== "string" || typeof body.otp !== "string" || !/^\d{6}$/.test(body.otp)) {
      respondJson(response, 400, { code: "INVALID_OTP" });
      return;
    }
    const pending = this.pending.get(body.sessionId);
    if (pending === undefined) {
      respondJson(response, 404, { code: "FLOW_NOT_FOUND" });
      return;
    }
    if (pending.expiresAt <= this.now()) {
      this.pending.delete(body.sessionId);
      respondJson(response, 410, { code: "OTP_EXPIRED" });
      return;
    }
    pending.attemptsLeft -= 1;
    if (!timingSafeEqual(pending.digest, digest(body.otp))) {
      if (pending.attemptsLeft <= 0) this.pending.delete(body.sessionId);
      respondJson(response, 400, { code: "INVALID_OTP" });
      return;
    }
    this.pending.delete(body.sessionId);
    response.writeHead(204);
    response.end();
  }
}

export class DirectSmtpTransport implements OtpMailTransport {
  constructor(private readonly host: string, private readonly port = 25,
    private readonly from = "otp-staging@once-email.com", private readonly timeoutMs = 15_000) {}

  async send(mail: OtpMail): Promise<void> {
    if (!isEmail(mail.to) || /[\r\n]/.test(mail.to) || !/^\d{6}$/.test(mail.otp)) throw new Error("Invalid SMTP message");
    const socket = connect({ host: this.host, port: this.port });
    socket.setTimeout(this.timeoutMs, () => socket.destroy(new Error("SMTP timeout")));
    try {
      await smtpReply(socket, 220);
      await smtpCommand(socket, "EHLO otp-staging.once-email.com\r\n", 250);
      // The fixture is not an authenticated relay for the visible From domain.
      // A null reverse-path avoids spoofing that domain at the SMTP envelope layer.
      await smtpCommand(socket, "MAIL FROM:<>\r\n", 250);
      await smtpCommand(socket, `RCPT TO:<${mail.to}>\r\n`, 250);
      await smtpCommand(socket, "DATA\r\n", 354);
      const message = createMailMessage(mail, this.from);
      await smtpCommand(socket, `${message}\r\n.\r\n`, 250);
      await smtpCommand(socket, "QUIT\r\n", 221);
    } finally {
      socket.destroy();
    }
  }
}

export class SshSendmailTransport implements OtpMailTransport {
  constructor(private readonly target = "root@staging-mail-host.example.invalid", private readonly timeoutMs = 15_000) {
    if (target !== "root@staging-mail-host.example.invalid") throw new Error("SSH mail target is not allowed");
  }

  async send(mail: OtpMail): Promise<void> {
    if (!isEmail(mail.to) || !/^\d{6}$/.test(mail.otp)) throw new Error("Invalid sendmail message");
    const child = spawn("ssh", [this.target, "/usr/sbin/sendmail", "-i", "-t"], {
      shell: false,
      stdio: ["pipe", "ignore", "ignore"],
    });
    child.stdin.end(createMailMessage(mail, "otp-staging@once-email.com") + "\r\n");
    const code = await new Promise<number | null>((resolve, reject) => {
      const timer = setTimeout(() => { child.kill("SIGTERM"); reject(new Error("sendmail timeout")); }, this.timeoutMs);
      child.once("error", () => { clearTimeout(timer); reject(new Error("sendmail unavailable")); });
      child.once("exit", (value) => { clearTimeout(timer); resolve(value); });
    });
    if (code !== 0) throw new Error("sendmail rejected message");
  }
}

function createMailMessage(mail: OtpMail, from: string): string {
  return [
    `From: Once Email OTP staging <${from}>`,
    `To: <${mail.to}>`,
    "Subject: Once Email staging verification code",
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${randomUUID()}@once-email.com>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "",
    `Your verification code is ${mail.otp}. It expires in 5 minutes.`,
  ].join("\r\n");
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/[\r\n]/.test(value);
}

function isLoopback(value: string | undefined): boolean {
  return value === "127.0.0.1" || value === "::1" || value === "::ffff:127.0.0.1";
}

function isAllowedHost(value: string | undefined, host: string): boolean {
  if (value === undefined) return false;
  const name = value.startsWith("[") ? value.slice(1, value.indexOf("]")) : value.split(":", 1)[0];
  return name === host || (host === "127.0.0.1" && name === "localhost");
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_BYTES) return null;
    chunks.push(buffer);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown; }
  catch { return null; }
}

function setSecurityHeaders(response: ServerResponse): void {
  response.setHeader("content-security-policy", "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  response.setHeader("x-content-type-options", "nosniff");
  response.setHeader("x-frame-options", "DENY");
  response.setHeader("referrer-policy", "no-referrer");
  response.setHeader("x-robots-tag", "noindex, nofollow, noarchive");
}

function respondJson(response: ServerResponse, status: number, value: object): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(value));
}

async function smtpCommand(socket: Socket, command: string, expected: number): Promise<void> {
  socket.write(command);
  await smtpReply(socket, expected);
}

function smtpReply(socket: Socket, expected: number): Promise<void> {
  return new Promise((resolve, reject) => {
    let text = "";
    const onData = (chunk: Buffer) => {
      text += chunk.toString("utf8");
      const lines = text.split("\r\n");
      const complete = lines.find((line) => /^\d{3} /.test(line));
      if (complete === undefined) return;
      cleanup();
      if (Number(complete.slice(0, 3)) === expected) resolve(); else reject(new Error("SMTP rejected request"));
    };
    const onError = () => { cleanup(); reject(new Error("SMTP unavailable")); };
    const cleanup = () => { socket.off("data", onData); socket.off("error", onError); };
    socket.on("data", onData);
    socket.once("error", onError);
  });
}

const PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive"><title>OTP staging registration</title>
<style>body{font-family:system-ui,sans-serif;background:#f4f6f8;color:#18212b;margin:0}.card{box-sizing:border-box;max-width:28rem;margin:8vh auto;padding:2rem;background:#fff;border-radius:1rem;box-shadow:0 12px 32px #18212b1a}h1{font-size:1.5rem}label{display:block;margin:1rem 0 .35rem;font-weight:600}input,button{box-sizing:border-box;width:100%;min-height:44px;font:inherit;border-radius:.5rem}input{border:1px solid #8794a1;padding:.7rem}button{margin-top:1.25rem;border:0;background:#1769e0;color:#fff;font-weight:700}button:focus-visible,input:focus-visible{outline:3px solid #f0a500;outline-offset:2px}[hidden]{display:none}.status{min-height:1.5rem;margin-top:1rem}@media(max-width:32rem){.card{margin:0;min-height:100vh;border-radius:0;padding:1.25rem}}</style></head>
<body><main class="card"><h1>Test registration</h1><p>This isolated page sends one email verification code.</p>
<form id="register"><label for="email">Email</label><input id="email" data-testid="email" type="email" autocomplete="email" required>
<label for="password">Password</label><input id="password" data-testid="password" type="password" minlength="8" maxlength="128" autocomplete="new-password" required>
<button data-testid="send" type="submit">Send verification code</button></form>
<form id="verify" hidden><label for="otp">Verification code</label><input id="otp" data-testid="otp" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" required>
<button data-testid="verify" type="submit">Verify registration</button></form><p id="status" class="status" role="status" aria-live="polite"></p></main>
<script>let sessionId=null;const status=document.querySelector('#status');const register=document.querySelector('#register');const verify=document.querySelector('#verify');register.addEventListener('submit',async(e)=>{e.preventDefault();status.textContent='Sending…';const r=await fetch('/api/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:email.value,password:password.value})});if(!r.ok){status.textContent='Could not send the code.';return}sessionId=(await r.json()).sessionId;register.hidden=true;verify.hidden=false;status.textContent='Code sent.';otp.focus()});verify.addEventListener('submit',async(e)=>{e.preventDefault();status.textContent='Checking…';const r=await fetch('/api/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sessionId,otp:otp.value})});if(r.status===204){verify.hidden=true;status.textContent='Registration verified.'}else status.textContent='The code is invalid or expired.'});</script></body></html>`;
