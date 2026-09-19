"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PaidClient({
  sessionId,
  kind,
}: {
  sessionId: string;
  kind: "stamp" | "invite" | null;
}) {
  const router = useRouter();

  useEffect(() => {
    let intent: "stamp" | "invite" = kind || "stamp";
    try {
      if (sessionId) sessionStorage.setItem("lp_session_id", sessionId);
      if (!kind && sessionStorage.getItem("lp_intent") === "invite") {
        intent = "invite";
      }
      sessionStorage.removeItem("lp_intent");
    } catch {
      /* ignore */
    }

    if (!sessionId) {
      return;
    }
    const path = intent === "invite" ? "/request" : "/create";
    router.replace(`${path}?session_id=${encodeURIComponent(sessionId)}`);
  }, [kind, router, sessionId]);

  if (!sessionId) {
    return (
      <main className="mx-auto w-full max-w-[640px] flex-1 px-4 py-16 text-center">
        <h1 className="mb-3 text-2xl font-bold">Payment confirmation missing</h1>
        <p className="mb-6 text-lp-muted">
          Stripe did not return a Checkout Session id. The Payment Link success
          URL must include <code className="text-lp-text">session_id={"{CHECKOUT_SESSION_ID}"}</code>.
          Client-only flags like <code className="text-lp-text">?paid=1</code> are
          not accepted.
        </p>
        <a
          href="/create"
          className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-5 py-2.5 font-semibold text-[#042026] shadow-glow"
        >
          Back to create
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[640px] flex-1 px-4 py-16 text-center">
      <h1 className="mb-3 text-2xl font-bold">Payment received</h1>
      <p className="text-lp-muted">Redirecting so you can create your stamp or invite…</p>
    </main>
  );
}
