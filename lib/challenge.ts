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

export const DEMO_STAMP = {
  id: "demo",
  words: ["orchid", "velvet", "cascade", "lantern", "whisper", "ember"],
  code: "LIVE-DEMO",
  createdAt: "2026-09-18T12:00:00.000Z",
  hasVideo: false,
  note: "record your own",
  videoUrl: null as string | null,
  mimeType: null as string | null,
};
