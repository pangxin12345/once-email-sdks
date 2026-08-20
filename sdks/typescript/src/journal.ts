import { lstat, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

export interface CleanupJournal {
  schemaVersion: 1;
  runId: string;
  apiKeyEnv: string;
  createdAt: string;
}

export class JournalError extends Error {
  readonly code = "CONFIG_INVALID";
  constructor() { super("Cleanup journal is invalid"); this.name = "JournalError"; }
}

export function validatePrivateMode(mode: number, platform: NodeJS.Platform = process.platform): boolean {
  return platform === "win32" || (mode & 0o077) === 0;
}

export async function createCleanupJournal(runId: string, apiKeyEnv: string, root = process.cwd()): Promise<string> {
  if (!isUuid(runId) || !isEnvironmentName(apiKeyEnv)) throw new JournalError();
  const parent = join(root, ".once-email");
  const directory = join(parent, "run");
  await secureDirectory(parent);
  await secureDirectory(directory);
  const path = join(directory, `${runId}.json`);
  const journal: CleanupJournal = { schemaVersion: 1, runId, apiKeyEnv, createdAt: new Date().toISOString() };
  try { await writeFile(path, JSON.stringify(journal), { encoding: "utf8", flag: "wx", mode: 0o600 }); }
  catch { throw new JournalError(); }
  return path;
}

export async function loadCleanupJournal(path: string): Promise<CleanupJournal> {
  try {
    const info = await lstat(path);
    if (!info.isFile() || info.isSymbolicLink() || info.size < 2 || info.size > 4096 || !validatePrivateMode(info.mode)) throw new JournalError();
    const value: unknown = JSON.parse(await readFile(path, "utf8"));
    if (!isJournal(value) || basename(path) !== `${value.runId}.json`) throw new JournalError();
    return value;
  } catch (error) {
    if (error instanceof JournalError) throw error;
    throw new JournalError();
  }
}

export async function removeCleanupJournal(path: string): Promise<void> {
  try { await unlink(path); } catch { throw new JournalError(); }
}

function isJournal(value: unknown): value is CleanupJournal {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return Object.keys(record).sort().join(",") === "apiKeyEnv,createdAt,runId,schemaVersion"
    && record.schemaVersion === 1 && typeof record.runId === "string" && isUuid(record.runId)
    && typeof record.apiKeyEnv === "string" && isEnvironmentName(record.apiKeyEnv)
    && typeof record.createdAt === "string" && !Number.isNaN(Date.parse(record.createdAt));
}

async function secureDirectory(path: string): Promise<void> {
  try { await mkdir(path, { mode: 0o700 }); } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw new JournalError();
  }
  try {
    const info = await lstat(path);
    if (!info.isDirectory() || info.isSymbolicLink() || !validatePrivateMode(info.mode)) throw new JournalError();
  } catch (error) {
    if (error instanceof JournalError) throw error;
    throw new JournalError();
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isEnvironmentName(value: string): boolean { return /^[A-Z][A-Z0-9_]{1,63}$/.test(value); }
