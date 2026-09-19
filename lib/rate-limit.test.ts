import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rateLimit, resetRateLimitForTests } from "./rate-limit";

describe("rateLimit", () => {
  it("allows up to the limit then blocks", () => {
    resetRateLimitForTests();
    const now = 1_000_000;
    for (let i = 0; i < 3; i++) {
      const r = rateLimit("t:ip", 3, 60_000, now);
      assert.equal(r.ok, true);
    }
    const blocked = rateLimit("t:ip", 3, 60_000, now + 10);
    assert.equal(blocked.ok, false);
    if (!blocked.ok) assert.ok(blocked.retryAfterSec >= 1);
  });

  it("resets after the window", () => {
    resetRateLimitForTests();
    const now = 2_000_000;
    rateLimit("t:b", 1, 1000, now);
    const blocked = rateLimit("t:b", 1, 1000, now + 10);
    assert.equal(blocked.ok, false);
    const after = rateLimit("t:b", 1, 1000, now + 1001);
    assert.equal(after.ok, true);
  });
});
