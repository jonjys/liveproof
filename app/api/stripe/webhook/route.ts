import { NextRequest, NextResponse } from "next/server";
import { recordPaidSession } from "@/lib/entitlements";
import { getStripe, sessionIsPaid } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json(
      { ok: false, error: "Webhook not configured" },
      { status: 503 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ ok: false, error: "Missing signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    console.error("Stripe webhook signature failed:", err);
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object;
    if (sessionIsPaid(session)) {
      await recordPaidSession(session);
    }
  }

  return NextResponse.json({ received: true });
}
