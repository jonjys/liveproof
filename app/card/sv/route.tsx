import { renderCard, CARD_SV } from "@/lib/card";

export const runtime = "edge";

export function GET() {
  return renderCard(CARD_SV);
}
