import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CreateClient } from "@/components/CreateClient";

export const metadata = {
  title: "Get stamp",
};

export default function CreatePage() {
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
      <main className="mx-auto w-full max-w-[980px] flex-1 px-4 py-8 pb-16">
        <h1 className="mb-2 text-[1.85rem] font-bold">Get your presence stamp</h1>
        <p className="text-lp-muted">
          Speak the challenge words on camera. Max 8 seconds. Then submit and
          share the link.
        </p>
        <CreateClient
          stripePaymentLink={stripePaymentLink || undefined}
          devBypass={devBypass}
        />
      </main>
      <Footer note="presence, not identity" />
    </div>
  );
}
