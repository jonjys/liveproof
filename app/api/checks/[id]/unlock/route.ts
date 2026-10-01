import { NextResponse } from "next/server";
import { getReport, unlockReport } from "@/lib/check/store";
import { getStripe } from "@/lib/stripe";
import { toPublicReport } from "@/lib/check/public-report";
import {
  REPORT_CURRENCY,
  REPORT_PRICE_ORE,
} from "@/lib/check/types";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const report = await getReport(id);
  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }
  if (report.unlocked) {
    return NextResponse.json({ report: toPublicReport(report), already: true });
  }

  const origin = new URL(request.url).origin;
  const stripe = getStripe();
  const bypass =
    process.env.LIVEPROOF_DEV_BYPASS === "1" &&
    process.env.VERCEL_ENV !== "production";

  if (stripe && !bypass) {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/check/r/${id}?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/check/r/${id}?canceled=1`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: REPORT_CURRENCY,
            unit_amount: REPORT_PRICE_ORE,
            product_data: {
              name: "LiveProof message check — sealed report",
              description: `Full go/no-go report ${id}`,
            },
          },
        },
      ],
      metadata: {
        kind: "message_check",
        reportId: id,
      },
    });
    return NextResponse.json({ url: session.url, mode: "stripe" });
  }

  const unlocked = await unlockReport(id, "mock");
  return NextResponse.json({
    url: `${origin}/check/r/${id}?paid=1&mock=1`,
    mode: "mock",
    report: unlocked ? toPublicReport(unlocked) : null,
  });
}
