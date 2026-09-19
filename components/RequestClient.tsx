"use client";

import { useEffect, useState } from "react";
import { CopyLinkButton } from "@/components/CopyLinkButton";

type Props = {
  stripePaymentLink?: string;
  devBypass: boolean;
};

type WordsMode = "auto" | "manual";

export function RequestClient({ stripePaymentLink, devBypass }: Props) {
  const [note, setNote] = useState("");
  const [wordsMode, setWordsMode] = useState<WordsMode>("auto");
  const [wordsText, setWordsText] = useState("");
  const [paid, setPaid] = useState(devBypass);
  const [sessionId, setSessionId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = sessionStorage.getItem("lp_note");
      if (saved) setNote(saved);
      const mode = sessionStorage.getItem("lp_words_mode");
      if (mode === "manual" || mode === "auto") setWordsMode(mode);
      const wt = sessionStorage.getItem("lp_words_text");
      if (wt) setWordsText(wt);
    } catch {
      /* ignore */
    }
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("session_id") || "";
    let stored = "";
    try {
      stored = sessionStorage.getItem("lp_session_id") || "";
    } catch {
      /* ignore */
    }
    const sid = fromQuery.startsWith("cs_") ? fromQuery : stored.startsWith("cs_") ? stored : "";
    if (sid) {
      try {
        sessionStorage.setItem("lp_session_id", sid);
      } catch {
        /* ignore */
      }
      setSessionId(sid);
      setPaid(true);
    } else if (params.get("paid") === "1" || params.get("paid") === "true") {
      setError(
        "Checkout returned without a session id. Update the Payment Link success URL to include session_id={CHECKOUT_SESSION_ID}. ?paid=1 is not accepted."
      );
    } else if (devBypass) {
      setPaid(true);
    }
  }, [devBypass]);

  function persistDraft() {
    try {
      sessionStorage.setItem("lp_intent", "invite");
      sessionStorage.setItem("lp_note", note);
      sessionStorage.setItem("lp_words_mode", wordsMode);
      sessionStorage.setItem("lp_words_text", wordsText);
    } catch {
      /* ignore */
    }
  }

  function goPay() {
    persistDraft();
    if (stripePaymentLink) {
      window.location.href = stripePaymentLink;
      return;
    }
    if (devBypass) {
      setPaid(true);
      return;
    }
    setError("Set STRIPE_PAYMENT_LINK or LIVEPROOF_DEV_BYPASS=1");
  }

  async function createInvite() {
    setBusy(true);
    setError("");
    persistDraft();
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note,
          wordsMode,
          wordsText: wordsMode === "manual" ? wordsText : undefined,
          sessionId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error || "Failed");
      const path = data.url || `/p/${data.token}`;
      const absolute =
        typeof window !== "undefined"
          ? `${window.location.origin}${path}`
          : path;
      setToken(data.token);
      setInviteUrl(absolute);
      try {
        sessionStorage.removeItem("lp_intent");
        sessionStorage.removeItem("lp_session_id");
      } catch {
        /* ignore */
      }
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6">
      <label className="mb-1.5 block text-sm font-semibold text-lp-text">
        Optional note for the recipient
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value.slice(0, 280))}
        rows={2}
        placeholder="e.g. before interview / dating profile / freelance gig"
        className="w-full rounded-xl border border-lp-cyan/25 bg-lp-card/80 px-3.5 py-2.5 text-sm text-lp-text outline-none placeholder:text-lp-muted focus:border-lp-cyan"
      />
      <p className="mt-1 text-xs text-lp-muted">{note.length}/280</p>

      <div className="mt-5">
        <div className="mb-2 text-sm font-semibold text-lp-text">
          Challenge words
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setWordsMode("auto")}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
              wordsMode === "auto"
                ? "bg-gradient-to-br from-lp-cyan to-lp-cyan2 text-[#042026]"
                : "border border-lp-cyan/25 text-lp-text hover:border-lp-cyan"
            }`}
          >
            Auto-generate words
          </button>
          <button
            type="button"
            onClick={() => setWordsMode("manual")}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
              wordsMode === "manual"
                ? "bg-gradient-to-br from-lp-cyan to-lp-cyan2 text-[#042026]"
                : "border border-lp-cyan/25 text-lp-text hover:border-lp-cyan"
            }`}
          >
            Manual words
          </button>
        </div>
        {wordsMode === "manual" ? (
          <>
            <input
              type="text"
              value={wordsText}
              onChange={(e) => setWordsText(e.target.value.slice(0, 80))}
              placeholder="Type 3–8 words or a short phrase"
              className="w-full rounded-xl border border-lp-cyan/25 bg-lp-card/80 px-3.5 py-2.5 text-sm text-lp-text outline-none placeholder:text-lp-muted focus:border-lp-cyan"
            />
            <p className="mt-1 text-xs text-lp-muted">
              Recipient must speak these exact words ({wordsText.length}/80).
              Finger count + LIVE code still random.
            </p>
          </>
        ) : (
          <p className="text-xs text-lp-muted">
            Recipient gets 6 random English words + finger count + LIVE-XXXX on
            camera overlay.
          </p>
        )}
      </div>

      {!paid ? (
        <div className="mt-6 rounded-2xl border border-lp-cyan/20 bg-gradient-to-b from-lp-card/95 to-lp-bg2/95 p-5 text-center shadow-card">
          <div className="mb-2 text-xl font-bold">$9 / 99 kr</div>
          <p className="mb-4 text-sm text-lp-muted">
            You pay once. They open the link, record the challenge, and you both
            see the stamp on the same URL.
          </p>
          <button
            type="button"
            onClick={goPay}
            className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-5 py-2.5 font-semibold text-[#042026] shadow-glow"
          >
            Pay with Stripe
          </button>
        </div>
      ) : inviteUrl ? (
        <div className="mt-6 rounded-2xl border border-lp-cyan/35 bg-lp-cyan/5 p-5 text-center">
          <p className="mb-2 text-sm font-semibold text-lp-ok">
            Invite ready — send this link
          </p>
          <p className="mb-4 break-all font-mono text-sm text-lp-cyan">
            {inviteUrl}
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <CopyLinkButton url={inviteUrl} />
            <a
              href={token ? `/p/${token}` : inviteUrl}
              className="inline-flex items-center rounded-full border border-lp-cyan/20 px-4 py-2.5 text-sm font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
            >
              Open invite page
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-lp-cyan/20 bg-gradient-to-b from-lp-card/95 to-lp-bg2/95 p-5 text-center shadow-card">
          <p className="mb-4 text-sm text-lp-ok">
            Payment verified. Create your prove-you&apos;re-human link.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={createInvite}
            className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-5 py-2.5 font-semibold text-[#042026] shadow-glow disabled:opacity-45"
          >
            {busy ? "Creating…" : "Create invite link"}
          </button>
        </div>
      )}

      {error ? (
        <p className="mt-3 text-center text-sm text-lp-danger">{error}</p>
      ) : null}

      <p className="mt-5 text-center text-sm text-lp-muted">
        Presence stamp — not government ID
      </p>
    </div>
  );
}
