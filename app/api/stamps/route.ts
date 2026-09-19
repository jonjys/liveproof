import { NextRequest, NextResponse } from "next/server";
import {
  bindInviteStamp,
  hasBlobToken,
  isVercel,
  saveStamp,
  type StampMeta,
} from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    // On Vercel without Blob and without writable disk fallback messaging:
    // we still write to /tmp which works for short-lived demos.
    if (isVercel() && !hasBlobToken()) {
      // Allow /tmp + memory for MVP demo; warn in response meta
      console.warn(
        "BLOB_READ_WRITE_TOKEN not set — storing stamp in /tmp + memory (ephemeral on Vercel)."
      );
    }

    const form = await req.formData();
    const video = form.get("video");
    const metaField = form.get("meta");

    if (!(video instanceof Blob)) {
      return NextResponse.json(
        { ok: false, error: "Missing video file" },
        { status: 400 }
      );
    }

    if (video.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Video too large (max 10 MB)" },
        { status: 413 }
      );
    }

    let parsed: { id?: string; words?: string[]; code?: string; fingers?: number; inviteToken?: string } = {};
    if (typeof metaField === "string") {
      parsed = JSON.parse(metaField);
    } else if (metaField instanceof Blob) {
      parsed = JSON.parse(await metaField.text());
    } else {
      return NextResponse.json(
        { ok: false, error: "Missing meta" },
        { status: 400 }
      );
    }

    const id =
      (parsed.id && String(parsed.id).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32)) ||
      `${Date.now().toString(36)}`;
    if (!id || id === "demo") {
      return NextResponse.json(
        { ok: false, error: "Invalid stamp id" },
        { status: 400 }
      );
    }

    const words = Array.isArray(parsed.words)
      ? parsed.words.map(String).slice(0, 8)
      : [];
    const code = String(parsed.code || "LIVE-0000").slice(0, 16);
    const fingersRaw = Number(parsed.fingers);
    const fingers =
      Number.isFinite(fingersRaw) && fingersRaw >= 1 && fingersRaw <= 5
        ? Math.floor(fingersRaw)
        : undefined;

    const buffer = Buffer.from(await video.arrayBuffer());
    const mimeType = video.type || "video/webm";

    const meta: StampMeta = {
      id,
      words,
      code,
      fingers,
      createdAt: new Date().toISOString(),
      hasVideo: true,
      mimeType,
    };

    const saved = await saveStamp(meta, buffer, mimeType);

    const inviteToken =
      parsed.inviteToken &&
      String(parsed.inviteToken).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
    if (inviteToken) {
      await bindInviteStamp(inviteToken, saved.id);
    }

    return NextResponse.json({
      ok: true,
      id: saved.id,
      url: inviteToken ? `/p/${inviteToken}` : `/s/${saved.id}`,
      inviteToken: inviteToken || undefined,
      ephemeral: isVercel() && !hasBlobToken(),
      message:
        isVercel() && !hasBlobToken()
          ? "Stored in /tmp + memory. Set BLOB_READ_WRITE_TOKEN for durable production storage."
          : undefined,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
