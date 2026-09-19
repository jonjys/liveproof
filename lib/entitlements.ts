import { promises as fs } from "fs";
import path from "path";
import { sanitizeCheckoutSessionId } from "./ids";
import { allowDevBypass } from "./security";
import {
  getStripe,
  sessionIsPaid,
  type CheckoutSessionLike,
} from "./stripe";
import { hasBlobToken, isVercel } from "./storage";

export type EntitlementKind = "stamp" | "invite";

export type Entitlement = {
  sessionId: string;
  status: "paid" | "consumed";
  kind?: EntitlementKind;
  createdAt: string;
  consumedAt?: string;
  consumedBy?: string;
  clientReferenceId?: string | null;
};

export type ConsumeResult =
  | { ok: true; sessionId: string }
  | { ok: false; status: number; error: string };

const CONSUMED_META = "liveproof_consumed";
const KIND_META = "liveproof_kind";

declare global {
  // eslint-disable-next-line no-var
  var __liveproofEntitlements: Map<string, Entitlement> | undefined;
}

function memory(): Map<string, Entitlement> {
  if (!globalThis.__liveproofEntitlements) {
    globalThis.__liveproofEntitlements = new Map();
  }
  return globalThis.__liveproofEntitlements;
}

function entitlementsDir(): string {
  if (isVercel()) return path.join("/tmp", "entitlements");
  return path.join(process.cwd(), "data", "entitlements");
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export type EntitlementStore = {
  get(sessionId: string): Promise<Entitlement | null>;
  put(ent: Entitlement): Promise<void>;
};

async function putBlobEntitlement(ent: Entitlement): Promise<void> {
  if (!hasBlobToken()) return;
  try {
    const { put } = await import("@vercel/blob");
    const accessPref: Array<"private" | "public"> = ["private", "public"];
    for (const access of accessPref) {
      try {
        await put(
          `entitlements/${ent.sessionId}.json`,
          JSON.stringify(ent),
          {
            access,
            contentType: "application/json",
            addRandomSuffix: false,
            allowOverwrite: true,
          }
        );
        return;
      } catch {
        /* try next access mode */
      }
    }
  } catch (err) {
    console.error("Blob entitlement save failed:", err);
  }
}

async function getBlobEntitlement(sessionId: string): Promise<Entitlement | null> {
  if (!hasBlobToken()) return null;
  try {
    const { get } = await import("@vercel/blob");
    for (const access of ["private", "public"] as const) {
      try {
        const result = await get(`entitlements/${sessionId}.json`, { access });
        if (result?.statusCode === 200 && result.stream) {
          const text = await new Response(result.stream).text();
          const parsed = JSON.parse(text) as Entitlement;
          if (parsed?.sessionId) return parsed;
        }
      } catch {
        /* try next */
      }
    }
  } catch (err) {
    console.error("Blob entitlement read failed:", err);
  }
  return null;
}

export const defaultEntitlementStore: EntitlementStore = {
  async get(sessionId) {
    const mem = memory().get(sessionId);
    if (mem) return mem;
    try {
      const raw = await fs.readFile(
        path.join(entitlementsDir(), `${sessionId}.json`),
        "utf8"
      );
      const ent = JSON.parse(raw) as Entitlement;
      memory().set(sessionId, ent);
      return ent;
    } catch {
      const fromBlob = await getBlobEntitlement(sessionId);
      if (fromBlob) memory().set(sessionId, fromBlob);
      return fromBlob;
    }
  },
  async put(ent) {
    memory().set(ent.sessionId, ent);
    try {
      await ensureDir(entitlementsDir());
      await fs.writeFile(
        path.join(entitlementsDir(), `${ent.sessionId}.json`),
        JSON.stringify(ent, null, 2),
        "utf8"
      );
    } catch (err) {
      console.error("Disk entitlement save failed:", err);
    }
    await putBlobEntitlement(ent);
  },
};

export type StripeSessionApi = {
  retrieve(id: string): Promise<CheckoutSessionLike>;
  update(
    id: string,
    data: { metadata: Record<string, string> }
  ): Promise<unknown>;
};

function stripeSessions(): StripeSessionApi | null {
  const stripe = getStripe();
  if (!stripe) return null;
  return {
    retrieve: (id) => stripe.checkout.sessions.retrieve(id),
    update: (id, data) => stripe.checkout.sessions.update(id, data),
  };
}

export async function recordPaidSession(
  session: CheckoutSessionLike,
  store: EntitlementStore = defaultEntitlementStore
): Promise<Entitlement | null> {
  if (!session?.id || !sessionIsPaid(session)) return null;
  const existing = await store.get(session.id);
  if (existing?.status === "consumed") return existing;
  const ent: Entitlement = {
    sessionId: session.id,
    status: "paid",
    createdAt: existing?.createdAt || new Date().toISOString(),
    clientReferenceId: session.client_reference_id ?? existing?.clientReferenceId,
  };
  await store.put(ent);
  return ent;
}

export async function fulfillCheckoutSessionId(
  sessionId: string,
  deps?: { stripe?: StripeSessionApi; store?: EntitlementStore }
): Promise<Entitlement | null> {
  const api = deps?.stripe || stripeSessions();
  const store = deps?.store || defaultEntitlementStore;
  if (!api) return store.get(sessionId);
  try {
    const session = await api.retrieve(sessionId);
    return recordPaidSession(session, store);
  } catch (err) {
    console.error("fulfillCheckoutSessionId failed:", err);
    return store.get(sessionId);
  }
}

/**
 * Verify a Checkout Session is paid and consume it once.
 * Stripe metadata is the cross-instance lock; local store is a cache.
 */
export async function consumeCheckoutSession(
  sessionIdRaw: unknown,
  kind: EntitlementKind,
  consumedBy: string,
  deps?: { stripe?: StripeSessionApi; store?: EntitlementStore }
): Promise<ConsumeResult> {
  if (allowDevBypass()) {
    const sid = sanitizeCheckoutSessionId(sessionIdRaw);
    return { ok: true, sessionId: sid || "dev-bypass" };
  }

  const sessionId = sanitizeCheckoutSessionId(sessionIdRaw);
  if (!sessionId) {
    return {
      ok: false,
      status: 402,
      error: "Payment required. Complete Stripe checkout and retry with a valid session.",
    };
  }

  const api = deps?.stripe || stripeSessions();
  const store = deps?.store || defaultEntitlementStore;

  if (!api) {
    return {
      ok: false,
      status: 503,
      error:
        "Payment verification is not configured. Set STRIPE_SECRET_KEY on the server.",
    };
  }

  let session: CheckoutSessionLike;
  try {
    session = await api.retrieve(sessionId);
  } catch {
    return {
      ok: false,
      status: 402,
      error: "Payment session not found or invalid.",
    };
  }

  if (!sessionIsPaid(session)) {
    return {
      ok: false,
      status: 402,
      error: "Payment has not completed.",
    };
  }

  const meta = session.metadata || {};
  if (meta[CONSUMED_META] === "1") {
    return {
      ok: false,
      status: 402,
      error: "This payment has already been used.",
    };
  }

  const local = await store.get(sessionId);
  if (local?.status === "consumed") {
    return {
      ok: false,
      status: 402,
      error: "This payment has already been used.",
    };
  }

  try {
    await api.update(sessionId, {
      metadata: {
        ...meta,
        [CONSUMED_META]: "1",
        [KIND_META]: kind,
      },
    });
  } catch (err) {
    console.error("Stripe metadata consume failed:", err);
    return {
      ok: false,
      status: 503,
      error: "Could not lock payment entitlement. Retry once.",
    };
  }

  const ent: Entitlement = {
    sessionId,
    status: "consumed",
    kind,
    createdAt: local?.createdAt || new Date().toISOString(),
    consumedAt: new Date().toISOString(),
    consumedBy,
    clientReferenceId: session.client_reference_id ?? local?.clientReferenceId,
  };
  await store.put(ent);
  return { ok: true, sessionId };
}

export function consumeErrorResponse(result: Extract<ConsumeResult, { ok: false }>) {
  return {
    status: result.status,
    body: { ok: false as const, error: result.error },
  };
}
