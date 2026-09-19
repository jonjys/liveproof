import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PaidClient } from "@/components/PaidClient";
import { fulfillCheckoutSessionId } from "@/lib/entitlements";
import { sanitizeCheckoutSessionId } from "@/lib/ids";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = { title: "Payment" };

type Props = { searchParams: Promise<{ session_id?: string; paid?: string }> };

export default async function PaidPage({ searchParams }: Props) {
  const sp = await searchParams;
  const sessionId = sanitizeCheckoutSessionId(sp.session_id);
  let kind: "stamp" | "invite" | null = null;

  if (sessionId && getStripe()) {
    const ent = await fulfillCheckoutSessionId(sessionId);
    if (ent?.clientReferenceId === "invite") kind = "invite";
    else if (ent?.clientReferenceId === "stamp") kind = "stamp";
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <PaidClient sessionId={sessionId || ""} kind={kind} />
      <Footer />
    </div>
  );
}
