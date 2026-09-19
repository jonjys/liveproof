import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  newInviteToken,
  newStampId,
  sanitizeCheckoutSessionId,
  sanitizeInviteToken,
} from "./ids";

describe("ids", () => {
  it("generates unique stamp ids that are not demo", () => {
    const ids = new Set(Array.from({ length: 50 }, () => newStampId()));
    assert.equal(ids.size, 50);
    for (const id of ids) {
      assert.notEqual(id, "demo");
      assert.match(id, /^[A-Za-z0-9_-]+$/);
      assert.ok(id.length >= 16);
    }
  });

  it("generates long crypto invite tokens", () => {
    const a = newInviteToken();
    const b = newInviteToken();
    assert.notEqual(a, b);
    assert.ok(a.length >= 24);
    assert.equal(sanitizeInviteToken(a), a);
  });

  it("accepts Stripe checkout session ids only", () => {
    assert.equal(sanitizeCheckoutSessionId("cs_test_abcDEF1234567890"), "cs_test_abcDEF1234567890");
    assert.equal(sanitizeCheckoutSessionId("cs_live_abcDEF1234567890"), "cs_live_abcDEF1234567890");
    assert.equal(sanitizeCheckoutSessionId("paid=1"), null);
    assert.equal(sanitizeCheckoutSessionId("cs_test_"), null);
    assert.equal(sanitizeCheckoutSessionId("../etc/passwd"), null);
  });
});
