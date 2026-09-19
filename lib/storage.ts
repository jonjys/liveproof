import { promises as fs } from "fs";
import path from "path";
import { DEMO_STAMP } from "./challenge";
import { newStampId, PROTECTED_STAMP_IDS, sanitizeInviteToken } from "./ids";

export type BlobAccess = "private" | "public";

export type StampMeta = {
  id: string;
  words: string[];
  code: string;
  /** Finger count shown in the presence challenge (1–5). */
  fingers?: number;
  createdAt: string;
  hasVideo: boolean;
  note?: string;
  /** Internal Blob URL — never send to clients. */
  videoUrl?: string | null;
  mimeType?: string | null;
  blobAccess?: BlobAccess | null;
  blobPath?: string | null;
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
  // eslint-disable-next-line no-var
  var __liveproofBlobAccess: BlobAccess | undefined;
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
  return !!process.env.BLOB_READ_WRITE_TOKEN || !!process.env.BLOB_STORE_ID;
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

function accessPreference(): BlobAccess[] {
  const env = process.env.BLOB_ACCESS;
  if (env === "public" || env === "private") {
    return globalThis.__liveproofBlobAccess
      ? [globalThis.__liveproofBlobAccess, env === globalThis.__liveproofBlobAccess ? (env === "private" ? "public" : "private") : env]
      : [env, env === "private" ? "public" : "private"];
  }
  if (globalThis.__liveproofBlobAccess) {
    const other: BlobAccess =
      globalThis.__liveproofBlobAccess === "private" ? "public" : "private";
    return [globalThis.__liveproofBlobAccess, other];
  }
  return ["private", "public"];
}

function rememberAccess(access: BlobAccess) {
  globalThis.__liveproofBlobAccess = access;
}

export function lastBlobAccess(): BlobAccess | undefined {
  return globalThis.__liveproofBlobAccess;
}

async function putBlob(
  pathname: string,
  body: Buffer | string,
  contentType: string,
  overwrite: boolean
): Promise<{ url: string; access: BlobAccess } | null> {
  if (!hasBlobToken()) return null;
  const { put } = await import("@vercel/blob");
  let lastErr: unknown;
  for (const access of accessPreference()) {
    try {
      const blob = await put(pathname, body, {
        access,
        contentType,
        addRandomSuffix: false,
        allowOverwrite: overwrite,
      });
      rememberAccess(access);
      return { url: blob.url, access };
    } catch (err) {
      lastErr = err;
    }
  }
  console.error("Blob put failed:", lastErr);
  return null;
}

async function getBlob(
  pathname: string
): Promise<{ stream: ReadableStream; contentType: string; url: string } | null> {
  if (!hasBlobToken()) return null;
  const { get } = await import("@vercel/blob");
  for (const access of accessPreference()) {
    try {
      const result = await get(pathname, { access });
      if (result?.statusCode === 200 && result.stream) {
        rememberAccess(access);
        return {
          stream: result.stream,
          contentType: result.blob.contentType || "application/octet-stream",
          url: result.blob.url,
        };
      }
    } catch {
      /* try next access */
    }
  }
  return null;
}

async function putBlobJson(
  pathname: string,
  data: unknown,
  overwrite = true
): Promise<void> {
  await putBlob(pathname, JSON.stringify(data, null, 2), "application/json", overwrite);
}

async function readBlobJson<T>(pathname: string): Promise<T | null> {
  const got = await getBlob(pathname);
  if (!got) return null;
  try {
    const text = await new Response(got.stream).text();
    return JSON.parse(text) as T;
  } catch (err) {
    console.error("Blob JSON parse failed:", err);
    return null;
  }
}

async function fetchPublicJson<T>(url: string): Promise<T | null> {
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
 * Load stamp meta from Vercel Blob (private get, then public list+fetch).
 */
async function getStampFromBlob(id: string): Promise<StampRecord | null> {
  if (!hasBlobToken()) return null;
  try {
    const fromPrivate = await readBlobJson<StampMeta>(`stamps/${id}/meta.json`);
    if (fromPrivate?.id) {
      const record: StampRecord = {
        ...fromPrivate,
        hasVideo: !!(fromPrivate.hasVideo || fromPrivate.videoUrl || fromPrivate.blobPath),
        mimeType: fromPrivate.mimeType || "video/webm",
      };
      memoryStore().set(id, record);
      return record;
    }

    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: `stamps/${id}/` });
    if (!blobs.length) return null;

    const metaBlob = blobs.find((b) => b.pathname.endsWith("/meta.json"));
    const videoBlob = blobs.find((b) => b.pathname.endsWith("/video.webm"));

    if (metaBlob) {
      const meta = await fetchPublicJson<StampMeta>(metaBlob.url);
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
    const direct = await readBlobJson<InviteMeta>(`invites/${token}.json`);
    if (direct?.token) {
      inviteStore().set(token, direct);
      return direct;
    }
    const { list } = await import("@vercel/blob");
    const pathname = `invites/${token}.json`;
    const { blobs } = await list({ prefix: pathname });
    const match =
      blobs.find((b) => b.pathname === pathname) ||
      blobs.find((b) => b.pathname.endsWith(`/${token}.json`)) ||
      blobs[0];
    if (!match) return null;
    const invite = await fetchPublicJson<InviteMeta>(match.url);
    if (!invite || !invite.token) return null;
    inviteStore().set(token, invite);
    return invite;
  } catch (err) {
    console.error("Blob getInvite failed:", err);
    return null;
  }
}

export async function allocateStampId(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const id = newStampId();
    if (PROTECTED_STAMP_IDS.has(id)) continue;
    const existing = await getStamp(id);
    if (!existing) return id;
  }
  throw new Error("Could not allocate stamp id");
}

export async function saveStamp(
  meta: StampMeta,
  video: Buffer,
  mimeType: string
): Promise<StampMeta> {
  if (PROTECTED_STAMP_IDS.has(meta.id)) {
    throw new Error("Protected stamp id");
  }

  const blobPath = `stamps/${meta.id}/video.webm`;
  const record: StampRecord = {
    ...meta,
    hasVideo: true,
    mimeType,
    videoBuffer: video,
    blobPath,
  };

  if (hasBlobToken()) {
    const uploaded = await putBlob(
      blobPath,
      video,
      mimeType || "video/webm",
      false
    );
    if (uploaded) {
      record.videoUrl = uploaded.url;
      record.blobAccess = uploaded.access;
      record.videoBuffer = undefined;
    }
  }

  memoryStore().set(meta.id, { ...record, videoBuffer: video });

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
    blobAccess: record.blobAccess ?? null,
    blobPath,
  };
  await fs.writeFile(
    path.join(dir, "meta.json"),
    JSON.stringify(metaOut, null, 2),
    "utf8"
  );
  await fs.writeFile(path.join(dir, "video.webm"), video);

  if (hasBlobToken()) {
    await putBlobJson(`stamps/${meta.id}/meta.json`, metaOut, true);
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
    return getStampFromBlob(id);
  }
}

async function readVideoFromDisk(
  id: string,
  mimeType: string
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  try {
    const buf = await fs.readFile(path.join(stampsDir(), id, "video.webm"));
    return { buffer: buf, mimeType };
  } catch {
    return null;
  }
}

export async function getVideo(
  id: string
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const stamp = await getStamp(id);
  if (!stamp || !stamp.hasVideo) return null;
  const mimeType = stamp.mimeType || "video/webm";

  if (stamp.videoBuffer && stamp.videoBuffer.length) {
    return { buffer: stamp.videoBuffer, mimeType };
  }

  const disk = await readVideoFromDisk(id, mimeType);
  if (disk) return disk;

  const blobPath = stamp.blobPath || `stamps/${id}/video.webm`;
  const fromBlob = await getBlob(blobPath);
  if (fromBlob) {
    const buf = Buffer.from(await new Response(fromBlob.stream).arrayBuffer());
    return { buffer: buf, mimeType: stamp.mimeType || fromBlob.contentType };
  }

  if (stamp.videoUrl) {
    try {
      const res = await fetch(stamp.videoUrl, { cache: "no-store" });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        return {
          buffer: buf,
          mimeType: stamp.mimeType || res.headers.get("content-type") || mimeType,
        };
      }
    } catch (err) {
      console.error("Public blob video fetch failed:", err);
    }
  }

  return null;
}

export async function getVideoStream(
  id: string
): Promise<{ stream: ReadableStream; mimeType: string } | null> {
  const stamp = await getStamp(id);
  if (!stamp || !stamp.hasVideo) return null;
  const mimeType = stamp.mimeType || "video/webm";

  const blobPath = stamp.blobPath || `stamps/${id}/video.webm`;
  const fromBlob = await getBlob(blobPath);
  if (fromBlob) {
    return { stream: fromBlob.stream, mimeType: stamp.mimeType || fromBlob.contentType };
  }

  if (stamp.videoUrl) {
    try {
      const res = await fetch(stamp.videoUrl, { cache: "no-store" });
      if (res.ok && res.body) {
        return {
          stream: res.body,
          mimeType: stamp.mimeType || res.headers.get("content-type") || mimeType,
        };
      }
    } catch (err) {
      console.error("Public blob video fetch failed:", err);
    }
  }

  if (stamp.videoBuffer && stamp.videoBuffer.length) {
    return {
      stream: new Blob([new Uint8Array(stamp.videoBuffer)], { type: mimeType }).stream(),
      mimeType,
    };
  }

  const disk = await readVideoFromDisk(id, mimeType);
  if (!disk) return null;
  return {
    stream: new Blob([new Uint8Array(disk.buffer)], { type: disk.mimeType }).stream(),
    mimeType: disk.mimeType,
  };
}

/** Strip internal storage fields before JSON / RSC to the browser. */
export function toClientStamp(stamp: StampMeta): StampMeta {
  const { videoUrl: _v, blobPath: _p, ...rest } = stamp;
  return {
    ...rest,
    hasVideo: !!stamp.hasVideo,
    videoUrl: undefined,
    blobPath: undefined,
  };
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
    await putBlobJson(`invites/${invite.token}.json`, invite, true);
  }

  return invite;
}

export async function getInvite(token: string): Promise<InviteMeta | null> {
  const clean = sanitizeInviteToken(token);
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
  if (invite.stampId && invite.stampId !== stampId) {
    return invite;
  }
  const next: InviteMeta = { ...invite, stampId };
  return saveInvite(next);
}

export async function deletePrefixFromBlob(prefix: string): Promise<number> {
  if (!hasBlobToken()) return 0;
  try {
    const { list, del } = await import("@vercel/blob");
    const { blobs } = await list({ prefix });
    if (!blobs.length) return 0;
    await del(blobs.map((b) => b.url));
    return blobs.length;
  } catch (err) {
    console.error("Blob delete failed:", prefix, err);
    return 0;
  }
}

export async function deleteStamp(id: string): Promise<boolean> {
  if (PROTECTED_STAMP_IDS.has(id) || !id) return false;
  memoryStore().delete(id);
  try {
    await fs.rm(path.join(stampsDir(), id), { recursive: true, force: true });
  } catch {
    /* ignore */
  }
  await deletePrefixFromBlob(`stamps/${id}/`);
  return true;
}

export async function deleteInvite(token: string): Promise<boolean> {
  const clean = sanitizeInviteToken(token);
  if (!clean) return false;
  inviteStore().delete(clean);
  try {
    await fs.unlink(path.join(invitesDir(), `${clean}.json`));
  } catch {
    /* ignore */
  }
  await deletePrefixFromBlob(`invites/${clean}.json`);
  return true;
}
