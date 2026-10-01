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
            Before you trust them.{" "}
            <span className="text-gradient">Two checks.</span>
          </h1>
          <p className="mb-7 max-w-xl text-lg text-lp-muted">
            LiveProof is the moment your stomach drops — a stranger on Blocket,
            a remote hire, a weird freelance email. Prove the person is live, or
            scan the message for scam scripts. No account.{" "}
            <strong className="text-lp-text">$5 / 49:-</strong> per paid check.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/request"
              className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-5 py-2.5 font-semibold text-[#042026] shadow-glow"
            >
              Check the person
            </Link>
            <Link
              href="/check"
              className="inline-flex items-center rounded-full border border-lp-cyan/20 px-5 py-2.5 font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
            >
              Check the message
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-lp-cyan/20 bg-lp-card/70 px-3.5 py-1.5 text-sm text-lp-muted">
              <strong className="text-lp-text">$5</strong> /{" "}
              <strong className="text-lp-text">49:-</strong>
            </span>
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
              fingers. You both see the clip on a stamped page — for dating,
              Blocket, remote hiring.
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
              Paste the inbound email or DM. Get a go/no-go risk score before
              you quote, buy equipment, or start unpaid “trials”.
            </p>
            <Link
              href="/check"
              className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-4 py-2 text-sm font-semibold text-[#042026] shadow-glow"
            >
              Paste a message
            </Link>
          </article>
        </div>

        <h2 className="mb-4 mt-10 text-[1.35rem] font-semibold">
          When people use it
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Before the interview",
              body: "Remote hiring and CVs get ghost applicants. Ask for a person stamp before you schedule time.",
            },
            {
              title: "Freelance inbox",
              body: "Weird “Dear Freelancer” jobs and reimbursement scams. Scan the message before you reply.",
            },
            {
              title: "Dating & marketplaces",
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

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-lp-cyan/20 bg-gradient-to-br from-lp-cyan/10 to-lp-cyan2/5 p-7">
          <div>
            <h2 className="m-0 text-[1.35rem] font-semibold">
              Ready to check before you trust?
            </h2>
            <p className="mt-1.5 text-lp-muted">
              Person stamp or message scan. Presence proof, not government ID.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/request"
              className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-5 py-2.5 font-semibold text-[#042026] shadow-glow"
            >
              Check the person
            </Link>
            <Link
              href="/check"
              className="inline-flex items-center rounded-full border border-lp-cyan/20 px-5 py-2.5 font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
            >
              Check the message · $5 / 49:-
            </Link>
          </div>
        </div>
      </main>
      <Footer note="person stamp + message check" />
    </div>
  );
}
