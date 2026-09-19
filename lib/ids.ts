import { randomBytes } from "crypto";

const DEMO_ID = "demo";

/** Cryptographically random stamp id (URL-safe). Never `demo`. */
export function newStampId(): string {
  for (let i = 0; i < 8; i++) {
    const id = randomBytes(12).toString("base64url");
    if (id && id !== DEMO_ID && id.length >= 16) return id;
  }
  throw new Error("Failed to generate stamp id");
}

/** Cryptographically random invite token (URL-safe, ~32 chars). */
export function newInviteToken(): string {
  return randomBytes(24).toString("base64url");
}

export function sanitizeStampId(raw: unknown): string {
  return String(raw || "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 32);
}

export function sanitizeInviteToken(raw: unknown): string {
  return String(raw || "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 64);
}

/** Stripe Checkout Session ids look like cs_test_... or cs_live_... */
export function sanitizeCheckoutSessionId(raw: unknown): string | null {
  const s = String(raw || "").trim();
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(s)) return null;
  if (s.length < 20 || s.length > 200) return null;
  return s;
}

export const PROTECTED_STAMP_IDS = new Set([DEMO_ID]);
