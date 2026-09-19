import { NextResponse } from "next/server";
import { getStamp, getVideoStream } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const stamp = await getStamp(id);
  if (!stamp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const video = await getVideoStream(id);
  if (!video) {
    return NextResponse.json({ error: "No video" }, { status: 404 });
  }

  return new NextResponse(video.stream, {
    status: 200,
    headers: {
      "Content-Type": video.mimeType,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
