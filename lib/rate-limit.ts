type Bucket = { count: number; resetAt: number };

declare global {
  // eslint-disable-next-line no-var
  var __liveproofRateLimit: Map<string, Bucket> | undefined;
}

function store(): Map<string, Bucket> {
  if (!globalThis.__liveproofRateLimit) {
    globalThis.__liveproofRateLimit = new Map();
  }
  return globalThis.__liveproofRateLimit;
}

export type RateLimitResult =
  | { ok: true; remaining: number; resetAt: number }
  | { ok: false; remaining: 0; resetAt: number; retryAfterSec: number };

/**
 * In-memory per-instance limiter. Fine as a first pass on a single Fluid/serverless
 * region; not a global guarantee across many concurrent instances.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): RateLimitResult {
  const buckets = store();
  const current = buckets.get(key);
  if (!current || now >= current.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }
  if (current.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }
  current.count += 1;
  return {
    ok: true,
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
  };
}

export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 128);
  }
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 128);
  return "unknown";
}

export function rateLimitResponse(retryAfterSec: number) {
  return {
    status: 429 as const,
    body: { ok: false as const, error: "Too many requests. Try again shortly." },
    headers: {
      "Retry-After": String(retryAfterSec),
      "Cache-Control": "no-store",
    },
  };
}

/** Reset in-process buckets (tests). */
export function resetRateLimitForTests() {
  store().clear();
}
