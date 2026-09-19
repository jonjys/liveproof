import { notFound } from "next/navigation";
import { StampView } from "@/components/StampView";
import { getStamp, toClientStamp } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Stamp · ${id}` };
}

export default async function StampPage({ params }: Props) {
  const { id } = await params;
  if (id === "demo") {
    // Handled by dedicated /s/demo route; keep fallback
  }
  const stamp = await getStamp(id);
  if (!stamp) notFound();

  let videoSrc: string | null = null;
  if (stamp.hasVideo) {
    videoSrc = `/api/stamps/${stamp.id}/video`;
  }

  return <StampView stamp={toClientStamp(stamp)} videoSrc={videoSrc} />;
}
