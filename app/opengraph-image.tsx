import { renderCard, CARD_EN } from "@/lib/card";

export const runtime = "edge";
export const alt = "LiveProof. Is this person real? Send one link, 8 second live check.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderCard({ ...CARD_EN, code: false }, 1200, 630);
}
