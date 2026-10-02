"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PublicReport } from "@/lib/check/public-report";
import { REPORT_PRICE_LABEL } from "@/lib/check/types";

const levelLabel = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
  critical: "Critical — do not start",
} as const;

const levelTone = {
  low: "text-lp-ok",
  medium: "text-lp-cyan",
  high: "text-amber-300",
  critical: "text-lp-danger",
} as const;

export function CheckReportView({
  initial,
  paid,
  sessionId,
  mock,
  fromTry,
}: {
  initial: PublicReport;
  paid?: boolean;
  sessionId?: string;
  mock?: boolean;
  fromTry?: boolean;
}) {
  const router = useRouter();
  const [report, setReport] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(
    Boolean(paid && !initial.unlocked)
  );
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!paid || report.unlocked) return;
    let cancelled = false;
    (async () => {
      setConfirming(true);
      setError(null);
      try {
        const res = await fetch("/api/checks/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            reportId: report.id,
            mock: mock || undefined,
          }),
        });
        const data = (await res.json()) as {
          report?: PublicReport;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || !data.report) {
          setError(data.error ?? "Could not confirm payment.");
          return;
        }
        setReport(data.report);
        router.replace(`/check/r/${report.id}`);
      } catch {
        if (!cancelled) setError("Could not confirm payment.");
      } finally {
        if (!cancelled) setConfirming(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paid, sessionId, mock, report.id, report.unlocked, router]);

  async function unlock() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/checks/${report.id}/unlock`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        url?: string;
        error?: string;
        report?: PublicReport;
      };
      if (!res.ok) {
        setError(data.error ?? "Checkout failed.");
        return;
      }
      if (data.report?.unlocked) {
        setReport(data.report);
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Checkout failed.");
    } finally {
      setPending(false);
    }
  }

  async function copy(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  }

  const scorePct = Math.max(4, Math.min(100, report.score));
  const needsPay = !report.unlocked;
  const hot =
    report.level === "critical" || report.level === "high" || report.score >= 45;

  return (
    <div className="space-y-8 pb-28 sm:pb-8">
      {fromTry && needsPay ? (
        <p className="rounded-xl border border-lp-cyan/25 bg-lp-cyan/10 px-4 py-2 text-sm text-lp-cyan">
          Demo scan ready — unlock the sealed report to see the full playbook.
        </p>
      ) : null}

      <div className="animate-rise">
        <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-lp-cyan uppercase">
          Message check
        </p>
        <h1
          className={`text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-tight tracking-tight ${levelTone[report.level]}`}
        >
          {levelLabel[report.level]}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-lp-muted">{report.summary}</p>
      </div>

      <div className="animate-rise-delay rounded-2xl border border-lp-cyan/20 bg-gradient-to-b from-lp-card/95 to-lp-bg2/95 p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-[140px]">
            <p className="text-xs tracking-[0.18em] text-lp-muted uppercase">
              Risk score
            </p>
            <p className="score-pop text-6xl font-bold tabular-nums text-gradient">
              {report.score}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-lp-bg">
              <div
                className="score-bar h-full rounded-full bg-gradient-to-r from-lp-cyan to-lp-danger"
                style={{ width: `${scorePct}%` }}
              />
            </div>
          </div>
          <div className="text-sm text-lp-muted">
            {report.companyName ? <p>Company: {report.companyName}</p> : null}
            {report.contact ? <p>Contact: {report.contact}</p> : null}
            <p className="mt-1 max-w-sm text-lp-muted/80">
              Preview: {report.sourcePreview}
              {report.sourcePreview.length >= 160 ? "…" : ""}
            </p>
          </div>
        </div>
      </div>

      <section className="animate-rise-delay-2 space-y-3">
        <h2 className="text-xl font-semibold">Flags</h2>
        <ul className="space-y-3">
          {report.flags.length === 0 ? (
            <li className="rounded-xl border border-lp-cyan/20 bg-lp-card/55 p-4 text-lp-muted">
              No strong scam signatures matched the paste.
            </li>
          ) : (
            report.flags.map((flag) => (
              <li
                key={flag.id}
                className="rounded-xl border border-lp-cyan/20 bg-lp-card/55 p-4"
              >
                <p
                  className={`text-xs font-semibold tracking-wide uppercase ${
                    flag.severity === "danger"
                      ? "text-lp-danger"
                      : flag.severity === "warn"
                        ? "text-amber-300"
                        : "text-lp-cyan"
                  }`}
                >
                  {flag.severity}
                </p>
                <p className="mt-1 font-medium">{flag.title}</p>
                <p className="mt-1 text-sm text-lp-muted">{flag.detail}</p>
              </li>
            ))
          )}
        </ul>
        {!report.unlocked && report.hiddenFlagCount > 0 ? (
          <p className="text-sm text-lp-muted">
            +{report.hiddenFlagCount} more flag
            {report.hiddenFlagCount === 1 ? "" : "s"} sealed below.
          </p>
        ) : null}
      </section>

      {report.unlocked ? (
        <>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">What to do next</h2>
            <ol className="list-decimal space-y-2 pl-5 text-lp-muted">
              {report.actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ol>
          </section>
          {report.replyTemplate ? (
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Copy-paste reply</h2>
                <button
                  type="button"
                  onClick={() => copy("reply", report.replyTemplate || "")}
                  className="rounded-full border border-lp-cyan/25 px-3.5 py-1.5 text-sm font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
                >
                  {copied === "reply" ? "Copied" : "Copy reply"}
                </button>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-lp-cyan/20 bg-lp-bg2 p-5 text-sm leading-relaxed text-lp-text">
                {report.replyTemplate}
              </pre>
            </section>
          ) : null}
          {(report.level === "high" || report.level === "critical") && (
            <section className="rounded-2xl border border-lp-cyan/20 bg-lp-card/40 p-5">
              <h2 className="text-lg font-semibold">
                Still unsure who they are?
              </h2>
              <p className="mt-1 text-sm text-lp-muted">
                Ask for a LiveProof person stamp before you schedule a call.
              </p>
              <Link
                href="/request"
                className="mt-3 inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-4 py-2 text-sm font-semibold text-[#042026] shadow-glow"
              >
                Send a person stamp link
              </Link>
            </section>
          )}
        </>
      ) : (
        <section
          id="unlock"
          className={`space-y-4 rounded-2xl border p-6 ${
            hot
              ? "border-lp-danger/40 bg-gradient-to-br from-lp-danger/15 to-lp-cyan2/5"
              : "border-lp-cyan/20 bg-gradient-to-br from-lp-cyan/10 to-lp-cyan2/5"
          }`}
        >
          <h2 className="text-xl font-semibold">
            {hot
              ? "This looks dangerous — unlock the playbook"
              : "Unlock sealed report"}
          </h2>
          <p className="text-lp-muted">
            Free score is the warning light. The sealed report is what you send
            back — or walk away with. One payment. No account.
          </p>
          <ul className="space-y-2 text-sm text-lp-muted">
            {(report.sealedPreview || []).map((item) => (
              <li
                key={item}
                className="flex gap-2 rounded-lg border border-lp-cyan/15 bg-lp-bg/40 px-3 py-2"
              >
                <span className="text-lp-cyan">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-3xl font-bold">{REPORT_PRICE_LABEL}</p>
          <button
            type="button"
            onClick={unlock}
            disabled={pending || confirming}
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-5 py-3 font-semibold text-[#042026] shadow-glow disabled:opacity-60 sm:w-auto"
          >
            {confirming
              ? "Confirming payment…"
              : pending
                ? "Opening Stripe…"
                : `Unlock now — ${REPORT_PRICE_LABEL}`}
          </button>
          <p className="text-xs text-lp-muted">
            Card / Klarna / Link · Instant unlock after payment
          </p>
          {error ? (
            <p className="text-sm text-lp-danger" role="alert">
              {error}
            </p>
          ) : null}
        </section>
      )}

      {needsPay ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-lp-cyan/20 bg-lp-bg/95 p-3 backdrop-blur-md sm:hidden">
          <button
            type="button"
            onClick={unlock}
            disabled={pending || confirming}
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-5 py-3 font-semibold text-[#042026] shadow-glow disabled:opacity-60"
          >
            {pending ? "Opening Stripe…" : `Unlock — ${REPORT_PRICE_LABEL}`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
