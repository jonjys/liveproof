import { timingSafeEqual } from "crypto";

export const DEFAULT_PAYMENT_LINK =
  "https://buy.stripe.com/dRmdR89i93oGcKQ8f38og0K";

export const SITE_ORIGIN = "https://liveproof.nyttolabs.com";

export { securityHeaders } from "./security-headers";

/** Dev bypass is ignored in Vercel production. */
export function allowDevBypass(): boolean {
  if (process.env.LIVEPROOF_DEV_BYPASS !== "1") return false;
  if (process.env.VERCEL_ENV === "production") return false;
  return true;
}

export function paymentLinkWithRef(
  kind: "stamp" | "invite",
  base = process.env.STRIPE_PAYMENT_LINK || DEFAULT_PAYMENT_LINK
): string {
  try {
    const url = new URL(base);
    url.searchParams.set("client_reference_id", kind);
    return url.toString();
  } catch {
    return base;
  }
}

export function adminSecretOk(provided: string | null | undefined): boolean {
  const expected = process.env.LIVEPROOF_ADMIN_SECRET || "";
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function bearerToken(header: string | null): string | null {
  if (!header) return null;
  const m = header.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
}
