import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-[980px] flex-1 px-4 py-8 pb-16">
        <section className="py-14 text-left">
          <h1 className="mb-4 text-[clamp(2.2rem,5vw,3.4rem)] font-bold leading-[1.08] tracking-tight">
            Prove you are a <span className="text-gradient">real human</span> —{" "}
            in 8 seconds.
          </h1>
          <p className="mb-7 max-w-xl text-lg text-lp-muted">
            Asia 2026: AI dating profiles and fake remote applicants flood
            inboxes. LiveProof is a paid, shareable presence stamp — a live
            selfie challenge you can link. Not a dating app. Not KYC. Not a PDF.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/create"
              className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-5 py-2.5 font-semibold text-[#042026] shadow-glow"
            >
              Get stamp
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-lp-cyan/20 bg-lp-card/70 px-3.5 py-1.5 text-sm text-lp-muted">
              <strong className="text-lp-text">$9</strong> /{" "}
              <strong className="text-lp-text">99 kr</strong> · one stamp
            </span>
          </div>
        </section>

        <div className="my-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Dating scams",
              body: "Deepfake faces and scripted chats. A live challenge video is harder to fake than a still photo.",
            },
            {
              title: "Fake applicants",
              body: "Remote hiring gets ghost résumés. Ask for a LiveProof link before the interview.",
            },
            {
              title: "Shareable proof",
              body: "One public URL: video + challenge words + timestamp + “not government ID” badge.",
            },
          ].map((c) => (
            <article
              key={c.title}
              className="rounded-2xl border border-lp-cyan/20 bg-gradient-to-b from-lp-card/95 to-lp-bg2/95 p-5 shadow-card"
            >
              <h3 className="mb-1.5 text-[1.05rem] font-semibold">{c.title}</h3>
              <p className="m-0 text-[0.95rem] text-lp-muted">{c.body}</p>
            </article>
          ))}
        </div>

        <h2 className="mb-4 mt-10 text-[1.35rem] font-semibold">How it works</h2>
        <ol className="grid gap-3">
          {[
            {
              t: "Get a challenge",
              d: "Six random English words + a LIVE-XXXX code.",
            },
            {
              t: "Record ≤8 seconds",
              d: "Front camera selfie. Say the words out loud. We never ask for passport or SSN.",
            },
            {
              t: "Share the stamp",
              d: "Public page with video, challenge, ISO timestamp. Copy the link into chats and applications.",
            },
          ].map((s, i) => (
            <li
              key={s.t}
              className="flex gap-4 rounded-xl border border-lp-cyan/20 bg-lp-card/55 p-4"
            >
              <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-lp-cyan/15 text-sm font-bold text-lp-cyan">
                {i + 1}
              </span>
              <div>
                <strong className="mb-0.5 block">{s.t}</strong>
                <span className="text-lp-muted">{s.d}</span>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-lp-cyan/20 bg-gradient-to-br from-lp-cyan/10 to-lp-cyan2/5 p-7">
          <div>
            <h2 className="m-0 text-[1.35rem] font-semibold">
              Ready to stamp presence?
            </h2>
            <p className="mt-1.5 text-lp-muted">
              Set STRIPE_PAYMENT_LINK for checkout, or LIVEPROOF_DEV_BYPASS=1 for
              preview.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/create"
              className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-5 py-2.5 font-semibold text-[#042026] shadow-glow"
            >
              Get stamp · $9 / 99 kr
            </Link>
            <Link
              href="/s/demo"
              className="inline-flex items-center rounded-full border border-lp-cyan/20 px-5 py-2.5 font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
            >
              See demo stamp
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
