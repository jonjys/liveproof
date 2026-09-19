import { notFound } from "next/navigation";
import { StampView } from "@/components/StampView";
import { getStamp } from "@/lib/storage";

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
    if (stamp.videoUrl) {
      videoSrc = stamp.videoUrl;
    } else {
      videoSrc = `/api/stamps/${stamp.id}/video`;
    }
  }

  return <StampView stamp={stamp} videoSrc={videoSrc} />;
}
