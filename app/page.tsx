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
            Hiring, freelance, marketplaces, housing — and dating. When you need
            to trust that someone is a real person before you invest time, send a
            LiveProof link. Paid presence stamp: live selfie challenge, shareable
            URL. Not KYC. Not a PDF. Not government ID.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/request"
              className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-5 py-2.5 font-semibold text-[#042026] shadow-glow"
            >
              Send a prove-you&apos;re-human link
            </Link>
            <Link
              href="/create"
              className="inline-flex items-center rounded-full border border-lp-cyan/20 px-5 py-2.5 font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
            >
              Get your own stamp
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-lp-cyan/20 bg-lp-card/70 px-3.5 py-1.5 text-sm text-lp-muted">
              <strong className="text-lp-text">$5</strong> /{" "}
              <strong className="text-lp-text">49 kr</strong>
            </span>
          </div>
        </section>

        <div className="my-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Before the interview",
              body: "Remote hiring and CVs get ghost applicants. Ask for a LiveProof link before you schedule time.",
            },
            {
              title: "Freelance & marketplaces",
              body: "Gigs, housing, and peer-to-peer deals — confirm presence before you wire money or hand over keys.",
            },
            {
              title: "Dating & messaging",
              body: "Deepfake faces and scripted chats. A live challenge video is harder to fake than a still photo.",
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
              d: "Six random English words + a LIVE-XXXX code + hold up 1–5 fingers.",
            },
            {
              t: "Record ≤8 seconds",
              d: "Front camera selfie. Say the words and show your fingers. We never ask for passport or SSN.",
            },
            {
              t: "Share the stamp — or send an invite",
              d: "Public page with video, challenge, ISO timestamp. Or pay once and send a prove-you&apos;re-human link.",
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
              Presence stamp — not government ID. Ask someone to prove they are
              real, or get your own stamp.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/request"
              className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-5 py-2.5 font-semibold text-[#042026] shadow-glow"
            >
              Send a prove-you&apos;re-human link
            </Link>
            <Link
              href="/create"
              className="inline-flex items-center rounded-full border border-lp-cyan/20 px-5 py-2.5 font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
            >
              Get your own stamp · $5 / 49 kr
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
