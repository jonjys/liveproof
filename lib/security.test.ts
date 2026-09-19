import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { paymentLinkWithRef, allowDevBypass } from "./security";

describe("security helpers", () => {
  it("appends client_reference_id to the payment link", () => {
    const url = paymentLinkWithRef(
      "invite",
      "https://buy.stripe.com/dRmdR89i93oGcKQ8f38og0K"
    );
    assert.ok(url.includes("client_reference_id=invite"));
    assert.ok(url.startsWith("https://buy.stripe.com/dRmdR89i93oGcKQ8f38og0K"));
  });

  it("ignores dev bypass in production", () => {
    const prevB = process.env.LIVEPROOF_DEV_BYPASS;
    const prevV = process.env.VERCEL_ENV;
    process.env.LIVEPROOF_DEV_BYPASS = "1";
    process.env.VERCEL_ENV = "production";
    assert.equal(allowDevBypass(), false);
    process.env.VERCEL_ENV = "preview";
    assert.equal(allowDevBypass(), true);
    process.env.LIVEPROOF_DEV_BYPASS = prevB;
    process.env.VERCEL_ENV = prevV;
  });
});
