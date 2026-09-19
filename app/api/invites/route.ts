import { NextRequest, NextResponse } from "next/server";
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
    try {
      const body = await req.json();
      note = String(body?.note || "").slice(0, 280);
    } catch {
      note = "";
    }

    const token = randomToken();
    const invite: InviteMeta = {
      token,
      note: note || undefined,
      createdAt: new Date().toISOString(),
      stampId: null,
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
