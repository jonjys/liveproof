import { NextRequest, NextResponse } from "next/server";
import { sanitizeManualWords } from "@/lib/challenge";
import { saveInvite, type InviteMeta } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function randomToken() {
  return (
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36).slice(-6)
  );
}

export async function POST(req: NextRequest) {
  try {
    let note = "";
    let wordsMode: "auto" | "manual" = "auto";
    let words: string[] | undefined;
    try {
      const body = await req.json();
      note = String(body?.note || "").slice(0, 280);
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

    const token = randomToken();
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
