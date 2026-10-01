import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import type { CheckReport } from "./types";

type BlobAccess = "private" | "public";

function hasBlobToken() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID
  );
}

function checksDir() {
  if (process.env.VERCEL === "1" || process.env.VERCEL_ENV) {
    return path.join("/tmp", "checks");
  }
  return path.join(process.cwd(), "data", "checks");
}

function blobPath(id: string) {
  return `checks/${id}.json`;
}

export function newCheckId() {
  return randomBytes(8).toString("base64url");
}

async function putJson(pathname: string, data: unknown) {
  const { put } = await import("@vercel/blob");
  const body = JSON.stringify(data);
  let lastErr: unknown;
  for (const access of ["private", "public"] as BlobAccess[]) {
    try {
      await put(pathname, body, {
        access,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
      return;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Blob put failed");
}

async function getJson<T>(pathname: string): Promise<T | null> {
  const { get } = await import("@vercel/blob");
  for (const access of ["private", "public"] as BlobAccess[]) {
    try {
      const result = await get(pathname, { access, useCache: false });
      if (result?.statusCode === 200 && result.stream) {
        const text = await new Response(result.stream).text();
        return JSON.parse(text) as T;
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function saveReport(report: CheckReport) {
  if (hasBlobToken()) {
    await putJson(blobPath(report.id), report);
    return report;
  }
  const dir = checksDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, `${report.id}.json`),
    JSON.stringify(report),
    "utf8"
  );
  return report;
}

export async function getReport(id: string): Promise<CheckReport | null> {
  const safe = String(id || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
  if (!safe) return null;

  if (hasBlobToken()) {
    return getJson<CheckReport>(blobPath(safe));
  }

  try {
    const raw = await fs.readFile(
      path.join(checksDir(), `${safe}.json`),
      "utf8"
    );
    return JSON.parse(raw) as CheckReport;
  } catch {
    return null;
  }
}

export async function unlockReport(id: string, stripeSessionId?: string) {
  const report = await getReport(id);
  if (!report) return null;
  report.unlocked = true;
  report.paidAt = new Date().toISOString();
  report.stripeSessionId = stripeSessionId ?? report.stripeSessionId;
  await saveReport(report);
  return report;
}
