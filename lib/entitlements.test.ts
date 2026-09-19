import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  consumeCheckoutSession,
  recordPaidSession,
  type Entitlement,
  type EntitlementStore,
  type StripeSessionApi,
} from "./entitlements";

function memoryStore(seed: Entitlement[] = []): EntitlementStore {
  const map = new Map(seed.map((e) => [e.sessionId, e]));
  return {
    async get(id) {
      return map.get(id) || null;
    },
    async put(ent) {
      map.set(ent.sessionId, ent);
    },
  };
}

const SID = "cs_test_abcdefghijklmnopqrstuvwx";

describe("consumeCheckoutSession", () => {
  const prevBypass = process.env.LIVEPROOF_DEV_BYPASS;
  const prevVercel = process.env.VERCEL_ENV;

  afterEach(() => {
    process.env.LIVEPROOF_DEV_BYPASS = prevBypass;
    process.env.VERCEL_ENV = prevVercel;
  });

  it("rejects missing session id with 402", async () => {
    process.env.LIVEPROOF_DEV_BYPASS = "0";
    process.env.VERCEL_ENV = "production";
    const result = await consumeCheckoutSession(undefined, "stamp", "x", {
      stripe: {
        retrieve: async () => {
          throw new Error("should not retrieve");
        },
        update: async () => {
          throw new Error("should not update");
        },
      },
      store: memoryStore(),
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 402);
  });

  it("rejects unpaid sessions with 402", async () => {
    process.env.LIVEPROOF_DEV_BYPASS = "";
    process.env.VERCEL_ENV = "production";
    const stripe: StripeSessionApi = {
      async retrieve() {
        return { id: SID, payment_status: "unpaid", metadata: {} };
      },
      async update() {
        throw new Error("should not consume unpaid");
      },
    };
    const result = await consumeCheckoutSession(SID, "stamp", "x", {
      stripe,
      store: memoryStore(),
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 402);
  });

  it("consumes a paid session once", async () => {
    process.env.LIVEPROOF_DEV_BYPASS = "";
    process.env.VERCEL_ENV = "production";
    const meta: Record<string, string> = {};
    const stripe: StripeSessionApi = {
      async retrieve() {
        return { id: SID, payment_status: "paid", metadata: { ...meta } };
      },
      async update(_id, data) {
        Object.assign(meta, data.metadata);
      },
    };
    const store = memoryStore();
    const first = await consumeCheckoutSession(SID, "invite", "tok", { stripe, store });
    assert.equal(first.ok, true);
    assert.equal(meta.liveproof_consumed, "1");
    const second = await consumeCheckoutSession(SID, "invite", "tok2", { stripe, store });
    assert.equal(second.ok, false);
    if (!second.ok) assert.equal(second.status, 402);
  });

  it("records paid webhook sessions without consuming", async () => {
    const store = memoryStore();
    const ent = await recordPaidSession(
      { id: SID, payment_status: "paid", client_reference_id: "invite" },
      store
    );
    assert.ok(ent);
    assert.equal(ent?.status, "paid");
    const again = await store.get(SID);
    assert.equal(again?.status, "paid");
  });
});
