import { NextResponse } from "next/server";
import { getStamp } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const stamp = await getStamp(id);
  if (!stamp) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  const { videoBuffer: _, ...meta } = stamp;
  return NextResponse.json({ ok: true, stamp: meta });
}
