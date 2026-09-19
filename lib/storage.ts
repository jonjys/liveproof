import { promises as fs } from "fs";
import path from "path";
import { DEMO_STAMP } from "./challenge";

export type StampMeta = {
  id: string;
  words: string[];
  code: string;
  /** Finger count shown in the presence challenge (1–5). */
  fingers?: number;
  createdAt: string;
  hasVideo: boolean;
  note?: string;
  /** Public Blob URL when using @vercel/blob */
  videoUrl?: string | null;
  mimeType?: string | null;
};

export type InviteMeta = {
  token: string;
  note?: string;
  createdAt: string;
  /** Stamp id once the recipient completed the challenge */
  stampId?: string | null;
  /** auto = recipient gets random words; manual = requester-supplied words */
  wordsMode?: "auto" | "manual";
  /** Challenge words when wordsMode is manual (3–8 tokens / short phrase) */
  words?: string[];
};

type StampRecord = StampMeta & {
  videoBuffer?: Buffer;
};

declare global {
  // eslint-disable-next-line no-var
  var __liveproofStamps: Map<string, StampRecord> | undefined;
}

function memoryStore(): Map<string, StampRecord> {
  if (!globalThis.__liveproofStamps) {
    globalThis.__liveproofStamps = new Map();
  }
  return globalThis.__liveproofStamps;
}

export function isVercel(): boolean {
  return process.env.VERCEL === "1" || !!process.env.VERCEL_ENV;
}

export function hasBlobToken(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

/** Local disk: cwd/data/stamps. On Vercel: /tmp/stamps (ephemeral). */
export function stampsDir(): string {
  if (isVercel()) {
    return path.join("/tmp", "stamps");
  }
  return path.join(process.cwd(), "data", "stamps");
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function putBlobJson(pathname: string, data: unknown): Promise<void> {
  const { put } = await import("@vercel/blob");
  await put(pathname, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

async function fetchBlobJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err) {
    console.error("Blob JSON fetch failed:", err);
    return null;
  }
}

/**
 * Load stamp meta (+ video URL if present) from Vercel Blob.
 * Soft-fails: if meta.json is missing but video.webm exists, returns a minimal stamp.
 */
async function getStampFromBlob(id: string): Promise<StampRecord | null> {
  if (!hasBlobToken()) return null;
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: `stamps/${id}/` });
    if (!blobs.length) return null;

    const metaBlob = blobs.find((b) => b.pathname.endsWith("/meta.json"));
    const videoBlob = blobs.find((b) =>
      b.pathname.endsWith("/video.webm")
    );

    if (metaBlob) {
      const meta = await fetchBlobJson<StampMeta>(metaBlob.url);
      if (meta && meta.id) {
        const record: StampRecord = {
          ...meta,
          hasVideo: !!(meta.hasVideo || meta.videoUrl || videoBlob),
          videoUrl: meta.videoUrl || videoBlob?.url || null,
          mimeType: meta.mimeType || "video/webm",
        };
        memoryStore().set(id, record);
        return record;
      }
    }

    // Soft-fail: video exists without meta
    if (videoBlob) {
      const record: StampRecord = {
        id,
        words: [],
        code: "LIVE-????",
        createdAt: videoBlob.uploadedAt?.toISOString?.() || new Date().toISOString(),
        hasVideo: true,
        videoUrl: videoBlob.url,
        mimeType: "video/webm",
      };
      memoryStore().set(id, record);
      return record;
    }

    return null;
  } catch (err) {
    console.error("Blob getStamp failed:", err);
    return null;
  }
}

async function getInviteFromBlob(token: string): Promise<InviteMeta | null> {
  if (!hasBlobToken()) return null;
  try {
    const { list } = await import("@vercel/blob");
    const pathname = `invites/${token}.json`;
    const { blobs } = await list({ prefix: pathname });
    const match =
      blobs.find((b) => b.pathname === pathname) ||
      blobs.find((b) => b.pathname.endsWith(`/${token}.json`)) ||
      blobs[0];
    if (!match) return null;
    const invite = await fetchBlobJson<InviteMeta>(match.url);
    if (!invite || !invite.token) return null;
    inviteStore().set(token, invite);
    return invite;
  } catch (err) {
    console.error("Blob getInvite failed:", err);
    return null;
  }
}

export async function saveStamp(
  meta: StampMeta,
  video: Buffer,
  mimeType: string
): Promise<StampMeta> {
  const record: StampRecord = {
    ...meta,
    hasVideo: true,
    mimeType,
    videoBuffer: video,
  };

  // Optional durable Blob upload (video + meta so any instance can read)
  if (hasBlobToken()) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(`stamps/${meta.id}/video.webm`, video, {
        access: "public",
        contentType: mimeType || "video/webm",
        addRandomSuffix: false,
      });
      record.videoUrl = blob.url;
      record.videoBuffer = undefined; // prefer Blob URL; keep disk/memory as backup
    } catch (err) {
      console.error("Blob video upload failed, falling back to disk/memory:", err);
    }
  }

  memoryStore().set(meta.id, { ...record, videoBuffer: video });

  // Persist meta + video to disk (/tmp on Vercel, data/ locally)
  const dir = path.join(stampsDir(), meta.id);
  await ensureDir(dir);
  const metaOut: StampMeta = {
    id: record.id,
    words: record.words,
    code: record.code,
    fingers: record.fingers,
    createdAt: record.createdAt,
    hasVideo: true,
    videoUrl: record.videoUrl ?? null,
    mimeType: record.mimeType ?? mimeType,
    note: record.note,
  };
  await fs.writeFile(
    path.join(dir, "meta.json"),
    JSON.stringify(metaOut, null, 2),
    "utf8"
  );
  await fs.writeFile(path.join(dir, "video.webm"), video);

  if (hasBlobToken()) {
    try {
      await putBlobJson(`stamps/${meta.id}/meta.json`, metaOut);
    } catch (err) {
      console.error("Blob meta upload failed:", err);
    }
  }

  return metaOut;
}

export async function getStamp(id: string): Promise<StampRecord | null> {
  if (id === "demo") {
    return { ...DEMO_STAMP };
  }

  const mem = memoryStore().get(id);
  if (mem) return mem;

  const dir = path.join(stampsDir(), id);
  try {
    const raw = await fs.readFile(path.join(dir, "meta.json"), "utf8");
    const meta = JSON.parse(raw) as StampMeta;
    let videoBuffer: Buffer | undefined;
    try {
      videoBuffer = await fs.readFile(path.join(dir, "video.webm"));
    } catch {
      videoBuffer = undefined;
    }
    const record: StampRecord = {
      ...meta,
      hasVideo: !!(meta.hasVideo || meta.videoUrl || videoBuffer),
      videoBuffer,
    };
    memoryStore().set(id, record);
    return record;
  } catch {
    // Disk miss — try durable Blob (cross-instance on Vercel)
    return getStampFromBlob(id);
  }
}

export async function getVideo(
  id: string
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const stamp = await getStamp(id);
  if (!stamp || !stamp.hasVideo) return null;

  if (stamp.videoBuffer && stamp.videoBuffer.length) {
    return {
      buffer: stamp.videoBuffer,
      mimeType: stamp.mimeType || "video/webm",
    };
  }

  try {
    const buf = await fs.readFile(path.join(stampsDir(), id, "video.webm"));
    return { buffer: buf, mimeType: stamp.mimeType || "video/webm" };
  } catch {
    // Prefer redirecting clients to videoUrl; no buffer available remotely
    return null;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __liveproofInvites: Map<string, InviteMeta> | undefined;
}

function inviteStore(): Map<string, InviteMeta> {
  if (!globalThis.__liveproofInvites) {
    globalThis.__liveproofInvites = new Map();
  }
  return globalThis.__liveproofInvites;
}

export function invitesDir(): string {
  if (isVercel()) {
    return path.join("/tmp", "invites");
  }
  return path.join(process.cwd(), "data", "invites");
}

export async function saveInvite(invite: InviteMeta): Promise<InviteMeta> {
  inviteStore().set(invite.token, invite);
  const dir = invitesDir();
  await ensureDir(dir);
  await fs.writeFile(
    path.join(dir, `${invite.token}.json`),
    JSON.stringify(invite, null, 2),
    "utf8"
  );

  if (hasBlobToken()) {
    try {
      await putBlobJson(`invites/${invite.token}.json`, invite);
    } catch (err) {
      console.error("Blob invite upload failed:", err);
    }
  }

  return invite;
}

export async function getInvite(token: string): Promise<InviteMeta | null> {
  const clean = String(token || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
  if (!clean) return null;
  const mem = inviteStore().get(clean);
  if (mem) return mem;
  try {
    const raw = await fs.readFile(path.join(invitesDir(), `${clean}.json`), "utf8");
    const invite = JSON.parse(raw) as InviteMeta;
    inviteStore().set(clean, invite);
    return invite;
  } catch {
    return getInviteFromBlob(clean);
  }
}

export async function bindInviteStamp(
  token: string,
  stampId: string
): Promise<InviteMeta | null> {
  const invite = await getInvite(token);
  if (!invite) return null;
  const next: InviteMeta = { ...invite, stampId };
  return saveInvite(next);
}
