import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import type { StampMeta } from "@/lib/storage";

type Props = {
  stamp: StampMeta;
  videoSrc?: string | null;
};

export function StampView({ stamp, videoSrc }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        right={
          <Link
            href="/create"
            className="inline-flex items-center rounded-full border border-lp-cyan/20 px-3.5 py-1.5 text-sm font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
          >
            Get stamp
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-[640px] flex-1 px-4 py-8 pb-16">
        <div className="mb-3">
          <span className="inline-block rounded-full border border-lp-cyan/35 bg-lp-cyan/10 px-3 py-1 text-xs font-semibold text-lp-cyan">
            Presence stamp — not government ID
          </span>
        </div>
        <h1 className="mb-2 text-3xl font-bold">Verified presence</h1>
        <p className="mb-5 text-lp-muted">
          Someone recorded this live selfie while speaking the challenge words and showing the finger count.
          Share the link — don&apos;t treat it as KYC.
        </p>

        {videoSrc ? (
          <div className="mb-5 overflow-hidden rounded-[18px] border border-lp-cyan/20 bg-black">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={videoSrc}
              controls
              playsInline
              className="block max-h-[520px] w-full bg-black"
            />
          </div>
        ) : (
          <div className="mb-5 flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-[18px] border border-lp-cyan/20 bg-lp-card p-8 text-center">
            <p className="m-0 text-lg font-bold">No video on this demo stamp</p>
            <p className="m-0 mb-3 text-lp-muted">
              {stamp.note || "record your own"}
            </p>
            <Link
              href="/create"
              className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-5 py-2.5 font-semibold text-[#042026] shadow-glow"
            >
              Get your stamp
            </Link>
          </div>
        )}

        <section className="rounded-2xl border border-lp-cyan/20 bg-gradient-to-b from-lp-card/95 to-lp-bg2/95 p-5 shadow-card">
          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-xs uppercase tracking-wider text-lp-muted">
                Challenge words
              </div>
              <div className="font-mono text-[0.98rem] break-words">
                {stamp.words.join(" · ")}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs uppercase tracking-wider text-lp-muted">
                Live code
              </div>
              <div className="font-mono text-[0.98rem] text-lp-cyan">
                {stamp.code}
              </div>
            </div>
            {typeof stamp.fingers === "number" ? (
              <div>
                <div className="mb-1 text-xs uppercase tracking-wider text-lp-muted">
                  Finger check
                </div>
                <div className="font-mono text-[0.98rem]">
                  Hold up {stamp.fingers} finger{stamp.fingers === 1 ? "" : "s"}
                </div>
              </div>
            ) : null}
            <div>
              <div className="mb-1 text-xs uppercase tracking-wider text-lp-muted">
                Recorded (UTC)
              </div>
              <div className="font-mono text-[0.98rem]">{stamp.createdAt}</div>
            </div>
            <div>
              <div className="mb-1 text-xs uppercase tracking-wider text-lp-muted">
                Stamp ID
              </div>
              <div className="font-mono text-[0.98rem]">{stamp.id}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-start gap-2.5">
            <CopyLinkButton />
            <Link
              href="/create"
              className="inline-flex items-center rounded-full border border-lp-cyan/20 px-4 py-2.5 text-sm font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
            >
              Make your own · $9 / 99 kr
            </Link>
          </div>
        </section>
      </main>
      <Footer note="presence, not identity" />
    </div>
  );
}
