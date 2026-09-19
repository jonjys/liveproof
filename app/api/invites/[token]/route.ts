import { NextRequest, NextResponse } from "next/server";
import { getInvite, getStamp } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params;
  const invite = await getInvite(token);
  if (!invite) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  let stamp = null;
  if (invite.stampId) {
    stamp = await getStamp(invite.stampId);
    if (stamp) {
      const { videoBuffer: _, ...meta } = stamp as typeof stamp & {
        videoBuffer?: Buffer;
      };
      stamp = meta;
    }
  }
  return NextResponse.json({ ok: true, invite, stamp });
}
