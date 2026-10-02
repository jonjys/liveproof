import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { REPORT_PRICE_LABEL } from "@/lib/check/types";

export const metadata: Metadata = {
  title: "Freelance scam checker — is this job offer legit?",
  description:
    "Free freelance scam checker for inbound job emails, Upwork invites, and LinkedIn DMs. Detect MacBook reimbursement scams, unpaid trials, crypto payouts, Telegram-only jobs. Unlock sealed report for $5 / 49:-.",
  keywords: [
    "freelance scam checker",
    "is this job offer a scam",
    "check hiring email",
    "upwork scam detector",
    "linkedin recruiter scam",
    "macbook reimbursement scam",
    "unpaid trial scam",
    "client verification freelance",
    "advance fee scam freelance",
    "telegram job scam",
  ],
  alternates: { canonical: "https://liveproof.nyttolabs.com/freelance-scam-check" },
  openGraph: {
    title: "Freelance scam checker · LiveProof",
    description:
      "Paste a weird job message. Free risk score. Sealed playbook $5 / 49:-.",
    url: "https://liveproof.nyttolabs.com/freelance-scam-check",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "LiveProof Message Check",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "5.00",
    priceCurrency: "USD",
    description: "Sealed freelance scam risk report",
  },
  description:
    "Paste an inbound freelance or hiring message to detect scam patterns before you reply.",
  url: "https://liveproof.nyttolabs.com/check",
};

export default function FreelanceScamCheckPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="mx-auto w-full max-w-[720px] flex-1 px-4 py-10 pb-16">
        <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-lp-cyan uppercase">
          Freelance scam checker
        </p>
        <h1 className="mb-4 text-[clamp(2rem,4.5vw,2.8rem)] font-bold leading-tight tracking-tight">
          Is this job offer a <span className="text-gradient">scam</span>?
        </h1>
        <p className="mb-6 text-lg text-lp-muted">
          Paste the inbound email, Upwork invite, or LinkedIn DM. LiveProof
          scores known freelance scam scripts — MacBook reimbursement, unpaid
          “trials”, crypto payouts, Telegram-only pressure — before you quote or
          start work.
        </p>
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/check"
            className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-5 py-2.5 font-semibold text-[#042026] shadow-glow"
          >
            Run a free check
          </Link>
          <Link
            href="/check/try/macbook-crypto"
            className="inline-flex items-center rounded-full border border-lp-cyan/25 px-5 py-2.5 font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
          >
            Try classic MacBook scam
          </Link>
        </div>
        <h2 className="mb-3 text-xl font-semibold">What it catches</h2>
        <ul className="mb-8 list-disc space-y-2 pl-5 text-lp-muted">
          <li>Advance-fee / buy equipment then get reimbursed</li>
          <li>Crypto or gift-card payment for normal project work</li>
          <li>Unpaid test projects that are real deliverables</li>
          <li>Telegram / WhatsApp-only moves off-platform</li>
          <li>Generic “Dear Freelancer” mass outreach + high vague pay</li>
          <li>Package-mule “remote assistant” scripts</li>
        </ul>
        <p className="text-lp-muted">
          Free risk score. Sealed report with actions + reply script:{" "}
          <strong className="text-lp-text">{REPORT_PRICE_LABEL}</strong>. No
          account. Part of{" "}
          <Link href="/" className="text-lp-cyan hover:underline">
            LiveProof
          </Link>
          .
        </p>
      </main>
      <Footer note="freelance scam checker" />
    </div>
  );
}
