import Stripe from "stripe";

let cached: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    cached = null;
    return null;
  }
  if (cached) return cached;
  cached = new Stripe(key);
  return cached;
}

/** Test helper */
export function resetStripeClientForTests() {
  cached = undefined;
}

export type CheckoutSessionLike = {
  id: string;
  payment_status?: string | null;
  status?: string | null;
  metadata?: Record<string, string> | null;
  client_reference_id?: string | null;
};

export function sessionIsPaid(session: CheckoutSessionLike): boolean {
  if (session.payment_status === "paid") return true;
  if (session.payment_status === "no_payment_required") return true;
  return false;
}
