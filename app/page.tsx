import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-[980px] flex-1 px-4 py-8 pb-16">
        <section className="grid gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="animate-rise mb-3 text-xs font-semibold tracking-[0.2em] text-lp-cyan uppercase">
              Trust desk · $5 / 49:-
            </p>
            <h1 className="animate-rise-delay mb-4 text-[clamp(2.4rem,5.5vw,3.6rem)] font-bold leading-[1.05] tracking-tight">
              Before you trust them.{" "}
              <span className="text-gradient">Two checks.</span>
            </h1>
            <div className="hero-rule mb-5 h-1 w-24 rounded-full bg-lp-cyan" />
            <p className="animate-rise-delay-2 mb-7 max-w-xl text-lg text-lp-muted">
              Stomach-drop moment: weird freelance email, remote hire, Blocket
              stranger. Prove the person is live — or scan the message for scam
              scripts. No account. Pay only when you need the seal.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/check"
                className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-5 py-2.5 font-semibold text-[#042026] shadow-glow"
              >
                Check the message
              </Link>
              <Link
                href="/request"
                className="inline-flex items-center rounded-full border border-lp-cyan/20 px-5 py-2.5 font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
              >
                Check the person
              </Link>
            </div>
          </div>

          <div className="hero-panel relative overflow-hidden rounded-2xl border border-lp-cyan/25 bg-gradient-to-b from-lp-card to-lp-bg2 p-5 shadow-card sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-[0.16em] text-lp-muted uppercase">
                Live demo · message check
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-lp-danger/40 bg-lp-danger/10 px-2.5 py-1 text-xs font-semibold text-lp-danger">
                <span className="live-dot bg-lp-danger" />
                Critical
              </span>
            </div>
            <p className="text-5xl font-bold tabular-nums text-gradient">100</p>
            <p className="mt-1 text-sm text-lp-muted">Risk score</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-lp-bg">
              <div className="score-bar h-full w-full rounded-full bg-gradient-to-r from-lp-cyan to-lp-danger" />
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              <li className="rounded-lg border border-lp-danger/30 bg-lp-bg/50 px-3 py-2 text-lp-danger">
                Danger · You must buy something first
              </li>
              <li className="rounded-lg border border-lp-danger/30 bg-lp-bg/50 px-3 py-2 text-lp-danger">
                Danger · Crypto / gift card payment
              </li>
              <li className="rounded-lg border border-lp-cyan/20 bg-lp-bg/40 px-3 py-2 text-lp-muted">
                +6 flags sealed · unlock {""}
                <strong className="text-lp-text">$5 / 49:-</strong>
              </li>
            </ul>
            <Link
              href="/check"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-4 py-2.5 text-sm font-semibold text-[#042026] shadow-glow"
            >
              Paste your own message
            </Link>
          </div>
        </section>

        <div className="my-10 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-lp-cyan/20 bg-gradient-to-b from-lp-card/95 to-lp-bg2/95 p-6 shadow-card">
            <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-lp-cyan uppercase">
              Person stamp
            </p>
            <h2 className="mb-2 text-[1.25rem] font-semibold">
              Is this person real?
            </h2>
            <p className="mb-5 text-[0.95rem] text-lp-muted">
              Send one link. They say six random words on camera and hold up
              fingers. Stamped page for dating, Blocket, remote hiring.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/request"
                className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-4 py-2 text-sm font-semibold text-[#042026] shadow-glow"
              >
                Send a proof link
              </Link>
              <Link
                href="/s/demo"
                className="inline-flex items-center rounded-full border border-lp-cyan/20 px-4 py-2 text-sm font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
              >
                See demo
              </Link>
            </div>
          </article>

          <article className="rounded-2xl border border-lp-cyan/20 bg-gradient-to-b from-lp-card/95 to-lp-bg2/95 p-6 shadow-card">
            <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-lp-cyan uppercase">
              Message check
            </p>
            <h2 className="mb-2 text-[1.25rem] font-semibold">
              Is this client / job safe?
            </h2>
            <p className="mb-5 text-[0.95rem] text-lp-muted">
              Paste the inbound email or DM. Go/no-go before you quote, buy
              equipment, or start unpaid “trials”.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/check"
                className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-4 py-2 text-sm font-semibold text-[#042026] shadow-glow"
              >
                Paste a message
              </Link>
              <Link
                href="/check#samples"
                className="inline-flex items-center rounded-full border border-lp-cyan/20 px-4 py-2 text-sm font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
              >
                Try a sample scam
              </Link>
            </div>
          </article>
        </div>

        <h2 className="mb-4 mt-10 text-[1.35rem] font-semibold">
          When people use it
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Before the interview",
              body: "Ghost applicants. Ask for a person stamp before you schedule time.",
            },
            {
              title: "Freelance inbox",
              body: "“Dear Freelancer” + MacBook reimbursement. Scan before you reply.",
            },
            {
              title: "Dating & marketplaces",
              body: "Deepfake faces. A live challenge beats a still photo.",
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

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-lp-cyan/20 bg-gradient-to-br from-lp-cyan/10 to-lp-cyan2/5 p-7">
          <div>
            <h2 className="m-0 text-[1.35rem] font-semibold">
              Ready to check before you trust?
            </h2>
            <p className="mt-1.5 text-lp-muted">
              Message scan or person stamp. Presence proof, not government ID.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/check"
              className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-5 py-2.5 font-semibold text-[#042026] shadow-glow"
            >
              Check the message · $5 / 49:-
            </Link>
            <Link
              href="/request"
              className="inline-flex items-center rounded-full border border-lp-cyan/20 px-5 py-2.5 font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
            >
              Check the person
            </Link>
          </div>
        </div>
      </main>
      <Footer note="person stamp + message check" />
    </div>
  );
}
