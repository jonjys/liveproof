import { NextRequest, NextResponse } from "next/server";
import { sanitizeManualWords } from "@/lib/challenge";
import { consumeCheckoutSession, consumeErrorResponse } from "@/lib/entitlements";
import { newInviteToken } from "@/lib/ids";
import {
  clientIpFromHeaders,
  rateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { saveInvite, type InviteMeta } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = clientIpFromHeaders(req.headers);
    const limited = rateLimit(`invites:${ip}`, 8, 10 * 60 * 1000);
    if (!limited.ok) {
      const r = rateLimitResponse(limited.retryAfterSec);
      return NextResponse.json(r.body, { status: r.status, headers: r.headers });
    }

    let note = "";
    let wordsMode: "auto" | "manual" = "auto";
    let words: string[] | undefined;
    let sessionId: unknown;
    try {
      const body = await req.json();
      note = String(body?.note || "").slice(0, 280);
      sessionId = body?.sessionId || body?.session_id;
      const mode = String(body?.wordsMode || "auto").toLowerCase();
      wordsMode = mode === "manual" ? "manual" : "auto";
      if (wordsMode === "manual") {
        const sanitized = sanitizeManualWords(
          String(body?.wordsText || body?.words || "")
        );
        if (sanitized.length < 3) {
          return NextResponse.json(
            {
              ok: false,
              error: "Manual challenge needs 3–8 words (letters/numbers, max ~80 chars).",
            },
            { status: 400 }
          );
        }
        words = sanitized;
      }
    } catch {
      note = "";
      wordsMode = "auto";
    }

    const paid = await consumeCheckoutSession(sessionId, "invite", "pending-invite");
    if (!paid.ok) {
      const r = consumeErrorResponse(paid);
      return NextResponse.json(r.body, { status: r.status });
    }

    const token = newInviteToken();
    const invite: InviteMeta = {
      token,
      note: note || undefined,
      createdAt: new Date().toISOString(),
      stampId: null,
      wordsMode,
      words,
    };
    await saveInvite(invite);

    return NextResponse.json({
      ok: true,
      token,
      url: `/p/${token}`,
      invite,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
