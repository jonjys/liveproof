import { StampView } from "@/components/StampView";
import { DEMO_STAMP } from "@/lib/challenge";

export const metadata = {
  title: "Stamp · demo",
};

export default function DemoStampPage() {
  return <StampView stamp={DEMO_STAMP} videoSrc={null} />;
}
