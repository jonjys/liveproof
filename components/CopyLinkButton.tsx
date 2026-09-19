"use client";

import { useState } from "react";

type Props = {
  /** Defaults to current page URL */
  url?: string;
};

export function CopyLinkButton({ url }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const value = url || window.location.href;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", value);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-4 py-2.5 text-sm font-semibold text-[#042026] shadow-glow"
      >
        Copy link
      </button>
      {copied && (
        <p className="mt-2 text-sm text-lp-muted">Link copied.</p>
      )}
    </div>
  );
}
