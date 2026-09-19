import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RequestClient } from "@/components/RequestClient";

export const metadata = {
  title: "Send a prove-you're-human link",
};

export default function RequestPage() {
  const stripePaymentLink =
    process.env.STRIPE_PAYMENT_LINK ||
    "https://buy.stripe.com/dRmdR89i93oGcKQ8f38og0K";
  const devBypass = process.env.LIVEPROOF_DEV_BYPASS === "1";

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        right={
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-lp-cyan/20 px-3.5 py-1.5 text-sm font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
          >
            Home
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-[640px] flex-1 px-4 py-8 pb-16">
        <div className="mb-3">
          <span className="inline-block rounded-full border border-lp-cyan/35 bg-lp-cyan/10 px-3 py-1 text-xs font-semibold text-lp-cyan">
            Presence stamp — not government ID
          </span>
        </div>
        <h1 className="mb-2 text-[1.85rem] font-bold">
          Send a prove-you&apos;re-human link
        </h1>
        <p className="text-lp-muted">
          Pay once, share a private link. They land straight on the camera
          challenge — no marketing page. When they submit, you both see the
          stamp on the same URL.
        </p>
        <RequestClient
          stripePaymentLink={stripePaymentLink || undefined}
          devBypass={devBypass}
        />
      </main>
      <Footer note="presence, not identity" />
    </div>
  );
}
