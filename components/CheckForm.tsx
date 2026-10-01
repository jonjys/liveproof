"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REPORT_PRICE_LABEL } from "@/lib/check/types";

export function CheckForm() {
  const router = useRouter();
  const [sourceText, setSourceText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
      <div>
        <label htmlFor="source" className="mb-1.5 block text-sm font-medium text-lp-text">
          Paste the inbound message
        </label>
        <textarea
          id="source"
          required
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Dear Freelancer, we found your profile… paste the email, LinkedIn DM, Upwork invite, or Slack dump here."
          className="min-h-44 w-full resize-y rounded-xl border border-lp-cyan/20 bg-lp-bg2/80 px-3.5 py-3 text-base text-lp-text outline-none placeholder:text-lp-muted focus:border-lp-cyan"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-lp-text">
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
          <label htmlFor="contact" className="mb-1.5 block text-sm font-medium text-lp-text">
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
