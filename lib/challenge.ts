const WORD_BANK = [
  "orchid", "velvet", "cascade", "lantern", "whisper", "ember", "harbor", "quartz",
  "maple", "silver", "pebble", "aurora", "cinder", "meadow", "cobalt", "nectar",
  "falcon", "glacier", "honey", "ivory", "jasper", "kettle", "lotus", "marble",
  "nebula", "olive", "prism", "ripple", "saffron", "timber", "umbra", "violet",
  "willow", "xenon", "yarrow", "zephyr", "anchor", "breeze", "coral", "drift",
];

export function pickWords(n = 6): string[] {
  const pool = WORD_BANK.slice();
  const out: string[] = [];
  for (let i = 0; i < n && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

export function randomCode(): string {
  const hex = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");
  return `LIVE-${hex}`;
}

export function randomId(): string {
  return (
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36).slice(-4)
  );
}

/** Random finger count for presence challenge (1–5). */
export function pickFingers(): number {
  return 1 + Math.floor(Math.random() * 5);
}

export const DEMO_STAMP = {
  id: "demo",
  words: ["orchid", "velvet", "cascade", "lantern", "whisper", "ember"],
  code: "LIVE-DEMO",
  fingers: 3,
  createdAt: "2026-09-18T12:00:00.000Z",
  hasVideo: false,
  note: "record your own",
  videoUrl: null as string | null,
  mimeType: null as string | null,
};

/** Sanitize requester-supplied challenge text into 3–8 word tokens (max ~80 chars). */
export function sanitizeManualWords(raw: string): string[] {
  const cleaned = String(raw || "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[^a-zA-Z0-9\s'-]/g, " ")
    .trim()
    .slice(0, 80);
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length < 3) return [];
  return parts.slice(0, 8).map((w) => w.slice(0, 24));
}
