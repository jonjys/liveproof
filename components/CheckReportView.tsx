"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicReport } from "@/lib/check/public-report";
import { REPORT_PRICE_LABEL } from "@/lib/check/types";

const levelLabel = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
  critical: "Critical — do not start",
} as const;

export function CheckReportView({
  initial,
  paid,
  sessionId,
  mock,
}: {
  initial: PublicReport;
  paid?: boolean;
  sessionId?: string;
  mock?: boolean;
}) {
  const router = useRouter();
  const [report, setReport] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(
    Boolean(paid && !initial.unlocked)
  );

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

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-lp-cyan uppercase">
          Message check
        </p>
        <h1 className="text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-tight tracking-tight">
          {levelLabel[report.level]}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-lp-muted">{report.summary}</p>
      </div>

      <div className="rounded-2xl border border-lp-cyan/20 bg-gradient-to-b from-lp-card/95 to-lp-bg2/95 p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.18em] text-lp-muted uppercase">
              Risk score
            </p>
            <p className="text-6xl font-bold tabular-nums text-gradient">
              {report.score}
            </p>
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

      <section className="space-y-3">
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
                <p className="text-xs font-semibold tracking-wide text-lp-cyan uppercase">
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
            {report.hiddenFlagCount === 1 ? "" : "s"} sealed in the full report.
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
              <h2 className="text-xl font-semibold">Copy-paste reply</h2>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-lp-cyan/20 bg-lp-bg2 p-5 text-sm leading-relaxed text-lp-text">
                {report.replyTemplate}
              </pre>
            </section>
          ) : null}
        </>
      ) : (
        <section className="space-y-4 rounded-2xl border border-lp-cyan/20 bg-gradient-to-br from-lp-cyan/10 to-lp-cyan2/5 p-6">
          <h2 className="text-xl font-semibold">Unlock sealed report</h2>
          <p className="text-lp-muted">
            Every flag explained, a clear go/no-go action list, and a reply
            script. One payment. No account.
          </p>
          <p className="text-3xl font-bold">{REPORT_PRICE_LABEL}</p>
          <button
            type="button"
            onClick={unlock}
            disabled={pending || confirming}
            className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-5 py-2.5 font-semibold text-[#042026] shadow-glow disabled:opacity-60"
          >
            {confirming
              ? "Confirming payment…"
              : pending
                ? "Redirecting…"
                : `Unlock full report — ${REPORT_PRICE_LABEL}`}
          </button>
          {error ? (
            <p className="text-sm text-lp-danger" role="alert">
              {error}
            </p>
          ) : null}
        </section>
      )}
    </div>
  );
}
