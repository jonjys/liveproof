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

function randomId() {
  return (
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36).slice(-4)
  );
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
};

export function CreateClient({ stripePaymentLink, devBypass }: Props) {
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
  const [stampId, setStampId] = useState("");
  const [camOn, setCamOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [timer, setTimer] = useState("0.0s");
  const [status, setStatus] = useState("Enable your camera to begin.");
  const [statusKind, setStatusKind] = useState<"" | "ok" | "err">("");
  const [submitting, setSubmitting] = useState(false);
  const [paid, setPaid] = useState(devBypass);

  const refreshChallenge = useCallback(() => {
    setWords(pickWords(6));
    setCode(randomCode());
    setStampId(randomId());
  }, []);

  useEffect(() => {
    refreshChallenge();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (tickRef.current) clearInterval(tickRef.current);
      if (stopRef.current) clearTimeout(stopRef.current);
    };
  }, [refreshChallenge]);

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
      setMsg("Camera ready. Say the challenge words, then hit Record.");
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
    setMsg("Recording… speak the words clearly.");
  }

  async function submit() {
    if (!blob) {
      setMsg("Record a clip first.", "err");
      return;
    }
    if (!paid && !devBypass) {
      setMsg("Complete payment (or enable LIVEPROOF_DEV_BYPASS) before submit.", "err");
      return;
    }
    setSubmitting(true);
    setMsg("Uploading stamp…");
    const fd = new FormData();
    fd.append("video", blob, "video.webm");
    fd.append(
      "meta",
      new Blob(
        [
          JSON.stringify({
            id: stampId,
            words,
            code,
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
      router.push(data.url || `/s/${data.id}`);
    } catch (e) {
      console.error(e);
      setMsg(String(e instanceof Error ? e.message : e), "err");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="my-5 rounded-2xl border border-dashed border-lp-cyan/45 bg-lp-cyan/5 p-5 text-center">
        <div className="text-xs uppercase tracking-wider text-lp-muted">
          Your challenge
        </div>
        <div className="my-3 text-[clamp(1.1rem,3vw,1.45rem)] font-bold leading-snug tracking-wide">
          {words.length ? words.join(" · ") : "…"}
        </div>
        <div className="font-mono text-2xl font-bold tracking-widest text-lp-cyan">
          {code}
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
            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-lp-danger" />
              {timer}
            </div>
          )}
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
            disabled={!blob || submitting || (!paid && !devBypass)}
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

      <div className="mt-6 border-t border-lp-cyan/20 pt-5 text-center">
        <div className="mb-3 text-xl font-bold">$9 / 99 kr</div>
        {devBypass ? (
          <p className="mb-3 text-sm text-lp-ok">
            Dev bypass on — payment not required.
          </p>
        ) : paid ? (
          <p className="mb-3 text-sm text-lp-ok">Payment marked complete.</p>
        ) : null}
        {stripePaymentLink ? (
          <a
            href={stripePaymentLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setPaid(true)}
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
          One stamp · shareable public URL · not government ID
        </p>
      </div>
    </div>
  );
}
