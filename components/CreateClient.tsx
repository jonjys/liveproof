"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const WORD_BANK = [
  "orchid", "velvet", "cascade", "lantern", "whisper", "ember", "harbor", "quartz",
  "maple", "silver", "pebble", "aurora", "cinder", "meadow", "cobalt", "nectar",
  "falcon", "glacier", "honey", "ivory", "jasper", "kettle", "lotus", "marble",
  "nebula", "olive", "prism", "ripple", "saffron", "timber", "umbra", "violet",
  "willow", "xenon", "yarrow", "zephyr", "anchor", "breeze", "coral", "drift",
];

const MAX_MS = 8000;

function pickWords(n: number) {
  const pool = WORD_BANK.slice();
  const out: string[] = [];
  for (let i = 0; i < n && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

function randomCode() {
  const hex = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");
  return `LIVE-${hex}`;
}

function mimeType() {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  for (const t of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }
  return "";
}

type Props = {
  stripePaymentLink?: string;
  devBypass: boolean;
  /** When set, recipient records for an invite — payment already done by requester */
  inviteToken?: string;
  /** Hide pay section / marketing chrome (invite recipient flow) */
  inviteMode?: boolean;
  /** Requester-supplied challenge words (manual invite mode) */
  presetWords?: string[];
};

export function CreateClient({
  stripePaymentLink,
  devBypass,
  inviteToken,
  inviteMode = false,
  presetWords,
}: Props) {
  const router = useRouter();
  const previewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef(0);

  const [words, setWords] = useState<string[]>([]);
  const [code, setCode] = useState("LIVE-····");
  const [camOn, setCamOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [timer, setTimer] = useState("0.0s");
  const [status, setStatus] = useState("Enable your camera to begin.");
  const [statusKind, setStatusKind] = useState<"" | "ok" | "err">("");
  const [submitting, setSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [paid, setPaid] = useState(devBypass || !!inviteToken);
  const [fingers, setFingers] = useState(3);

  const refreshChallenge = useCallback(() => {
    if (presetWords && presetWords.length >= 3) {
      setWords(presetWords.slice(0, 8));
    } else {
      setWords(pickWords(6));
    }
    setCode(randomCode());
    setFingers(1 + Math.floor(Math.random() * 5));
  }, [presetWords]);

  useEffect(() => {
    refreshChallenge();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (tickRef.current) clearInterval(tickRef.current);
      if (stopRef.current) clearTimeout(stopRef.current);
    };
  }, [refreshChallenge]);

  useEffect(() => {
    if (typeof window === "undefined") return;
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
      setStatus("Payment received. You can record and submit your stamp.");
      setStatusKind("ok");
    }

    try {
      if (
        sessionStorage.getItem("lp_intent") === "invite" &&
        !inviteToken &&
        sid
      ) {
        sessionStorage.removeItem("lp_intent");
        window.location.replace(`/request?session_id=${encodeURIComponent(sid)}`);
        return;
      }
    } catch {
      /* ignore */
    }

    if (!sid && (params.get("paid") === "1" || params.get("paid") === "true")) {
      setStatus(
        "Checkout returned without a session id. Update the Payment Link success URL to include session_id={CHECKOUT_SESSION_ID}, then pay again. ?paid=1 is not accepted."
      );
      setStatusKind("err");
    }
  }, [inviteToken]);

  function setMsg(msg: string, kind: "" | "ok" | "err" = "") {
    setStatus(msg);
    setStatusKind(kind);
  }

  async function enableCam() {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 720 },
          height: { ideal: 960 },
        },
        audio: true,
      });
      streamRef.current = stream;
      const video = previewRef.current;
      if (video) {
        video.srcObject = stream;
        video.muted = true;
        video.controls = false;
        await video.play();
      }
      setCamOn(true);
      setBlob(null);
      setMsg("Camera ready. Say the words, hold up the fingers, then hit Record.");
    } catch (e) {
      console.error(e);
      setMsg("Camera permission denied or unavailable.", "err");
    }
  }

  function clearTimers() {
    if (tickRef.current) clearInterval(tickRef.current);
    if (stopRef.current) clearTimeout(stopRef.current);
    tickRef.current = null;
    stopRef.current = null;
  }

  function stopRec() {
    const rec = recorderRef.current;
    if (rec && rec.state === "recording") {
      rec.stop();
    }
    clearTimers();
    setRecording(false);
  }

  function startRec() {
    const stream = streamRef.current;
    if (!stream) {
      setMsg("Enable the camera first.", "err");
      return;
    }
    chunksRef.current = [];
    setBlob(null);
    const type = mimeType();
    let recorder: MediaRecorder;
    try {
      recorder = type
        ? new MediaRecorder(stream, { mimeType: type })
        : new MediaRecorder(stream);
    } catch {
      setMsg("MediaRecorder not supported in this browser.", "err");
      return;
    }
    recorderRef.current = recorder;
    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size) chunksRef.current.push(ev.data);
    };
    recorder.onstop = () => {
      clearTimers();
      setRecording(false);
      const b = new Blob(chunksRef.current, {
        type: recorder.mimeType || "video/webm",
      });
      setBlob(b);
      const video = previewRef.current;
      if (video) {
        video.srcObject = null;
        video.src = URL.createObjectURL(b);
        video.muted = false;
        video.controls = true;
        video.play().catch(() => {});
      }
      setMsg(
        `Recording saved (${(b.size / 1024).toFixed(0)} KB). Submit when ready.`,
        "ok"
      );
    };
    recorder.start(200);
    startedAtRef.current = performance.now();
    setRecording(true);
    setTimer("0.0s");
    tickRef.current = setInterval(() => {
      const s = (performance.now() - startedAtRef.current) / 1000;
      setTimer(`${s.toFixed(1)}s`);
    }, 100);
    stopRef.current = setTimeout(() => {
      if (recorderRef.current?.state === "recording") stopRec();
    }, MAX_MS);
    setMsg("Recording… speak the words and show your fingers.");
  }

  async function submit() {
    if (!blob) {
      setMsg("Record a clip first.", "err");
      return;
    }
    if (!paid && !devBypass && !inviteToken) {
      setMsg("Complete payment before submit. We verify the Stripe session on the server.", "err");
      return;
    }
    setSubmitting(true);
    setMsg("Uploading stamp…");
    const fd = new FormData();
    fd.append("video", blob, "video.webm");
    if (sessionId) fd.append("sessionId", sessionId);
    if (inviteToken) fd.append("inviteToken", inviteToken);
    fd.append(
      "meta",
      new Blob(
        [
          JSON.stringify({
            words,
            code,
            fingers,
            ...(inviteToken ? { inviteToken } : {}),
            ...(sessionId ? { sessionId } : {}),
          }),
        ],
        { type: "application/json" }
      )
    );
    try {
      const res = await fetch("/api/stamps", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Upload failed");
      }
      setMsg("Stamp created. Redirecting…", "ok");
      try {
        sessionStorage.removeItem("lp_session_id");
      } catch {
        /* ignore */
      }
      router.push(data.url || (inviteToken ? `/p/${inviteToken}` : `/s/${data.id}`));
    } catch (e) {
      console.error(e);
      setMsg(String(e instanceof Error ? e.message : e), "err");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-3 mt-5">
        <span className="inline-block rounded-full border border-lp-cyan/35 bg-lp-cyan/10 px-3 py-1 text-xs font-semibold text-lp-cyan">
          Presence stamp — not government ID
        </span>
      </div>

      <div className="mb-4 hidden rounded-2xl border border-dashed border-lp-cyan/45 bg-lp-cyan/5 px-4 py-3 text-center sm:block">
        <div className="text-[10px] uppercase tracking-wider text-lp-muted">
          Your challenge
        </div>
        <div className="mt-1 text-sm font-bold leading-snug tracking-wide">
          {words.length ? words.join(" · ") : "…"}
        </div>
        <div className="mt-1 font-mono text-lg font-bold tracking-widest text-lp-cyan">
          {code}
        </div>
        <div className="mt-1 text-sm font-semibold text-lp-text">
          Hold up {fingers} finger{fingers === 1 ? "" : "s"}
        </div>
      </div>

      <section className="rounded-2xl border border-lp-cyan/20 bg-gradient-to-b from-lp-card/95 to-lp-bg2/95 p-5 shadow-card">
        <div className="relative mx-auto mb-4 aspect-[3/4] max-w-[360px] overflow-hidden rounded-[18px] border border-lp-cyan/20 bg-black">
          <video
            ref={previewRef}
            playsInline
            muted
            autoPlay
            className="h-full w-full scale-x-[-1] object-cover"
          />
          {recording && (
            <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-lp-danger" />
              {timer}
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/65 to-transparent px-3 pb-3 pt-10 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
              Speak these · hold up fingers
            </div>
            <div className="mt-1 text-[clamp(0.85rem,3.6vw,1.05rem)] font-bold leading-snug tracking-wide text-white drop-shadow">
              {words.length ? words.join(" · ") : "…"}
            </div>
            <div className="mt-1 font-mono text-base font-bold tracking-widest text-lp-cyan drop-shadow">
              {code}
            </div>
            <div className="mt-1 text-sm font-semibold text-white drop-shadow">
              Hold up {fingers} finger{fingers === 1 ? "" : "s"}
            </div>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={enableCam}
            className="inline-flex items-center rounded-full border border-lp-cyan/20 px-4 py-2.5 text-sm font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
          >
            {camOn ? "Camera on" : "Enable camera"}
          </button>
          <button
            type="button"
            onClick={startRec}
            disabled={!camOn || recording || submitting}
            className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-4 py-2.5 text-sm font-semibold text-[#042026] shadow-glow disabled:cursor-not-allowed disabled:opacity-45"
          >
            Record
          </button>
          <button
            type="button"
            onClick={stopRec}
            disabled={!recording}
            className="inline-flex items-center rounded-full border border-lp-danger/40 bg-lp-danger/15 px-4 py-2.5 text-sm font-semibold text-lp-danger disabled:cursor-not-allowed disabled:opacity-45"
          >
            Stop
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!blob || submitting || (!paid && !devBypass && !inviteToken)}
            className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-4 py-2.5 text-sm font-semibold text-[#042026] shadow-glow disabled:cursor-not-allowed disabled:opacity-45"
          >
            {submitting ? "Uploading…" : "Submit stamp"}
          </button>
        </div>
        <p
          className={`min-h-[1.4em] text-center text-[0.95rem] ${
            statusKind === "err"
              ? "text-lp-danger"
              : statusKind === "ok"
                ? "text-lp-ok"
                : "text-lp-muted"
          }`}
        >
          {status}
        </p>
      </section>

      {inviteMode ? (
        <p className="mt-5 text-center text-sm text-lp-muted">
          Presence stamp — not government ID · reply for this invite
        </p>
      ) : (
        <div className="mt-6 border-t border-lp-cyan/20 pt-5 text-center">
          <div className="mb-3 text-xl font-bold">$9 / 99 kr</div>
          {devBypass ? (
            <p className="mb-3 text-sm text-lp-ok">
              Dev bypass on — payment not required.
            </p>
          ) : paid ? (
            <p className="mb-3 text-sm text-lp-ok">Payment verified — you can submit.</p>
          ) : null}
          {stripePaymentLink ? (
            <a
              href={stripePaymentLink}
              onClick={() => {
                try {
                  sessionStorage.setItem("lp_intent", "stamp");
                } catch {
                  /* ignore */
                }
              }}
              className="inline-flex items-center rounded-full border border-lp-cyan/20 px-4 py-2.5 text-sm font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
            >
              Pay with Stripe
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (devBypass) setPaid(true);
                else
                  setMsg(
                    "Set STRIPE_PAYMENT_LINK or LIVEPROOF_DEV_BYPASS=1",
                    "err"
                  );
              }}
              className="inline-flex items-center rounded-full border border-lp-cyan/20 px-4 py-2.5 text-sm font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
            >
              Pay (configure STRIPE_PAYMENT_LINK)
            </button>
          )}
          <p className="mt-3 text-sm text-lp-muted">
            One stamp · shareable public URL · Presence stamp — not government ID
          </p>
        </div>
      )}
    </div>
  );
}
