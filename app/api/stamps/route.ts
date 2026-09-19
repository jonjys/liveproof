import { NextRequest, NextResponse } from "next/server";
import { consumeCheckoutSession, consumeErrorResponse } from "@/lib/entitlements";
import {
  clientIpFromHeaders,
  rateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { sanitizeInviteToken } from "@/lib/ids";
import {
  allocateStampId,
  bindInviteStamp,
  getInvite,
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
    const ip = clientIpFromHeaders(req.headers);
    const limited = rateLimit(`stamps:${ip}`, 8, 10 * 60 * 1000);
    if (!limited.ok) {
      const r = rateLimitResponse(limited.retryAfterSec);
      return NextResponse.json(r.body, { status: r.status, headers: r.headers });
    }

    if (isVercel() && !hasBlobToken()) {
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

    let parsed: {
      id?: string;
      words?: string[];
      code?: string;
      fingers?: number;
      inviteToken?: string;
      sessionId?: string;
    } = {};
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

    const inviteToken = sanitizeInviteToken(
      form.get("inviteToken") || parsed.inviteToken
    );
    const sessionIdField = form.get("sessionId") || parsed.sessionId;

    let invitePaid = false;
    if (inviteToken) {
      const invite = await getInvite(inviteToken);
      if (!invite) {
        return NextResponse.json(
          { ok: false, error: "Invite not found" },
          { status: 404 }
        );
      }
      if (invite.stampId) {
        return NextResponse.json(
          { ok: false, error: "This invite already has a stamp." },
          { status: 409 }
        );
      }
      invitePaid = true;
    }

    if (!invitePaid) {
      const paid = await consumeCheckoutSession(
        sessionIdField,
        "stamp",
        "pending-stamp"
      );
      if (!paid.ok) {
        const r = consumeErrorResponse(paid);
        return NextResponse.json(r.body, { status: r.status });
      }
    }

    const id = await allocateStampId();

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
