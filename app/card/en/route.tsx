import { renderCard, CARD_EN } from "@/lib/card";

export const runtime = "edge";

export function GET() {
  return renderCard(CARD_EN);
}
