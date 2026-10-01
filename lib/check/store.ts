import { promises as fs } from "fs";
import path from "path";
import { get, put } from "@vercel/blob";
import { randomBytes } from "crypto";
import type { CheckReport } from "./types";

function useBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
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

export async function saveReport(report: CheckReport) {
  const body = JSON.stringify(report);
  if (useBlob()) {
    await put(blobPath(report.id), body, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return report;
  }
  const dir = checksDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${report.id}.json`), body, "utf8");
  return report;
}

export async function getReport(id: string): Promise<CheckReport | null> {
  const safe = String(id || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
  if (!safe) return null;

  if (useBlob()) {
    try {
      const blob = await get(blobPath(safe), {
        access: "private",
        useCache: false,
      });
      if (!blob || blob.statusCode !== 200 || !blob.stream) return null;
      const text = await new Response(blob.stream).text();
      return JSON.parse(text) as CheckReport;
    } catch {
      return null;
    }
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
