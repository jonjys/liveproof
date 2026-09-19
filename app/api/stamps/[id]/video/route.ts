import { NextResponse } from "next/server";
import { getStamp, getVideo } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const stamp = await getStamp(id);
  if (!stamp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Redirect to Blob URL when available
  if (stamp.videoUrl) {
    return NextResponse.redirect(stamp.videoUrl);
  }

  const video = await getVideo(id);
  if (!video) {
    return NextResponse.json({ error: "No video" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(video.buffer), {
    status: 200,
    headers: {
      "Content-Type": video.mimeType,
      "Cache-Control": "public, max-age=3600",
      "Content-Length": String(video.buffer.length),
    },
  });
}
