"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REPORT_PRICE_LABEL } from "@/lib/check/types";
import { SAMPLE_MESSAGES } from "@/lib/check/samples";

export function CheckForm({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [sourceText, setSourceText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function applySample(id: string) {
    const sample = SAMPLE_MESSAGES.find((s) => s.id === id);
    if (!sample) return;
    setSourceText(sample.sourceText);
    setCompanyName(sample.companyName);
    setContact(sample.contact);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceText, companyName, contact }),
      });
      const data = (await res.json()) as {
        report?: { id: string };
        error?: string;
      };
      if (!res.ok || !data.report) {
        setError(data.error ?? "Could not run the check.");
        return;
      }
      router.push(`/check/r/${data.report.id}`);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SAMPLE_MESSAGES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => applySample(sample.id)}
            className="rounded-full border border-lp-cyan/25 bg-lp-bg2/60 px-3 py-1 text-xs font-semibold text-lp-muted transition hover:border-lp-cyan hover:text-lp-cyan"
          >
            Try: {sample.label}
          </button>
        ))}
      </div>
      <div>
        <label
          htmlFor="source"
          className="mb-1.5 block text-sm font-medium text-lp-text"
        >
          Paste the inbound message
        </label>
        <textarea
          id="source"
          required
          autoFocus={autoFocus}
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Dear Freelancer, we found your profile… paste the email, LinkedIn DM, Upwork invite, or Slack dump here."
          className="min-h-44 w-full resize-y rounded-xl border border-lp-cyan/20 bg-lp-bg2/80 px-3.5 py-3 text-base text-lp-text outline-none placeholder:text-lp-muted focus:border-lp-cyan"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="company"
            className="mb-1.5 block text-sm font-medium text-lp-text"
          >
            Company name (optional)
          </label>
          <input
            id="company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Northwind AB"
            className="w-full rounded-xl border border-lp-cyan/20 bg-lp-bg2/80 px-3.5 py-2.5 text-sm text-lp-text outline-none placeholder:text-lp-muted focus:border-lp-cyan"
          />
        </div>
        <div>
          <label
            htmlFor="contact"
            className="mb-1.5 block text-sm font-medium text-lp-text"
          >
            Their email / handle (optional)
          </label>
          <input
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="hiring@company.com"
            className="w-full rounded-xl border border-lp-cyan/20 bg-lp-bg2/80 px-3.5 py-2.5 text-sm text-lp-text outline-none placeholder:text-lp-muted focus:border-lp-cyan"
          />
        </div>
      </div>
      {error ? (
        <p className="text-sm text-lp-danger" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-5 py-2.5 font-semibold text-[#042026] shadow-glow disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Scanning…" : "Check before I reply"}
      </button>
      <p className="text-sm text-lp-muted">
        Free risk score in seconds. Full sealed report is {REPORT_PRICE_LABEL}{" "}
        when you need the actions and reply script.
      </p>
    </form>
  );
}
