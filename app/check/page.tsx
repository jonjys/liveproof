import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckForm } from "@/components/CheckForm";
import { REPORT_PRICE_LABEL } from "@/lib/check/types";

export const metadata: Metadata = {
  title: "Message check — is this client safe?",
  description:
    "Paste an inbound hiring message or brief. Free go/no-go risk score. Unlock the sealed report for $5 / 49:-. No account.",
  openGraph: {
    title: "LiveProof Message check",
    description:
      "Paste a weird job email. Get a risk score before you reply. $5 / 49:- sealed report.",
    url: "https://liveproof.nyttolabs.com/check",
  },
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
            <Link
              href="/request"
              className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-3.5 py-1.5 text-sm font-semibold text-[#042026] shadow-glow"
            >
              Person stamp
            </Link>
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
            <div className="hero-rule mb-5 h-1 w-20 rounded-full bg-lp-cyan" />
            <p className="mb-4 max-w-xl text-lg text-lp-muted">
              Paste the inbound email, DM, or job invite. Get a go/no-go before
              you quote, book a call, or open Figma.
            </p>
            <p className="mb-6 max-w-xl text-lp-muted">
              Catches MacBook reimbursement scams, unpaid “trials”, crypto
              payouts, Telegram-only pressure, and more. Free score —{" "}
              {REPORT_PRICE_LABEL} for the sealed actions + reply script.
            </p>
            <ul className="space-y-2 text-sm text-lp-muted">
              <li>· No account</li>
              <li>· Works on LinkedIn / Upwork / email dumps</li>
              <li>· Swedish + English patterns</li>
              <li>
                · Shareable demo:{" "}
                <a
                  className="text-lp-cyan hover:underline"
                  href="/check/try/macbook-crypto"
                >
                  /check/try/macbook-crypto
                </a>
              </li>
            </ul>
          </div>
          <div
            id="scan"
            className="hero-panel rounded-2xl border border-lp-cyan/20 bg-gradient-to-b from-lp-card/95 to-lp-bg2/95 p-5 shadow-card sm:p-7"
          >
            <p
              id="samples"
              className="mb-4 text-xs font-semibold tracking-[0.16em] text-lp-muted uppercase"
            >
              Free scan → pay only if you need the seal
            </p>
            <CheckForm autoFocus />
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              t: "1 · Paste",
              d: "Drop the weird message while it’s still open.",
            },
            {
              t: "2 · Score",
              d: "Instant risk level + top flags. Free.",
            },
            {
              t: "3 · Unlock",
              d: `${REPORT_PRICE_LABEL} for full flags, actions, reply script.`,
            },
          ].map((s) => (
            <article
              key={s.t}
              className="rounded-xl border border-lp-cyan/20 bg-lp-card/40 p-4"
            >
              <h2 className="font-semibold">{s.t}</h2>
              <p className="mt-1 text-sm text-lp-muted">{s.d}</p>
            </article>
          ))}
        </section>
      </main>
      <Footer note="message check + presence stamp" />
    </div>
  );
}
