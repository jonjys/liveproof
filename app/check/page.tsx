import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckForm } from "@/components/CheckForm";
import { REPORT_PRICE_LABEL } from "@/lib/check/types";

export const metadata: Metadata = {
  title: "Message check",
  description:
    "Paste an inbound hiring message or brief. Get a go/no-go risk score before you quote or start work.",
};

export default function CheckPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        right={
          <>
            <a
              href="#scan"
              className="inline-flex items-center rounded-full border border-lp-cyan/20 px-3.5 py-1.5 text-sm font-semibold text-lp-text transition hover:border-lp-cyan hover:text-lp-cyan"
            >
              Run a check
            </a>
            <a
              href="/request"
              className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-3.5 py-1.5 text-sm font-semibold text-[#042026] shadow-glow"
            >
              Person stamp
            </a>
          </>
        }
      />
      <main className="mx-auto w-full max-w-[980px] flex-1 px-4 py-8 pb-16">
        <section className="grid gap-10 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-lp-cyan uppercase">
              Before you start work
            </p>
            <h1 className="mb-4 text-[clamp(2.2rem,5vw,3.2rem)] font-bold leading-[1.08] tracking-tight">
              Is this <span className="text-gradient">message</span> safe?
            </h1>
            <p className="mb-4 max-w-xl text-lg text-lp-muted">
              Paste the inbound email, DM, or job invite. Get a go/no-go before
              you quote, book a call, or open Figma.
            </p>
            <p className="max-w-xl text-lp-muted">
              Same LiveProof idea as the person stamp — acute pain, no account,{" "}
              {REPORT_PRICE_LABEL} only if you unlock the sealed report.
            </p>
          </div>
          <div
            id="scan"
            className="rounded-2xl border border-lp-cyan/20 bg-gradient-to-b from-lp-card/95 to-lp-bg2/95 p-5 shadow-card sm:p-7"
          >
            <p className="mb-4 text-xs font-semibold tracking-[0.16em] text-lp-muted uppercase">
              Free scan → pay only if you need the seal
            </p>
            <CheckForm />
          </div>
        </section>
      </main>
      <Footer note="message check + presence stamp" />
    </div>
  );
}
