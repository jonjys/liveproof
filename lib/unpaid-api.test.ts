import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { NextRequest } from "next/server";

describe("unpaid POST APIs", () => {
  const prev = {
    bypass: process.env.LIVEPROOF_DEV_BYPASS,
    vercel: process.env.VERCEL_ENV,
    stripe: process.env.STRIPE_SECRET_KEY,
  };

  before(() => {
    process.env.LIVEPROOF_DEV_BYPASS = "";
    process.env.VERCEL_ENV = "production";
    delete process.env.STRIPE_SECRET_KEY;
  });

  after(() => {
    process.env.LIVEPROOF_DEV_BYPASS = prev.bypass;
    process.env.VERCEL_ENV = prev.vercel;
    if (prev.stripe) process.env.STRIPE_SECRET_KEY = prev.stripe;
    else delete process.env.STRIPE_SECRET_KEY;
  });

  it("POST /api/stamps without payment returns 402", async () => {
    const { POST } = await import("../app/api/stamps/route");
    const fd = new FormData();
    fd.append("video", new Blob([new Uint8Array([1, 2, 3])], { type: "video/webm" }), "v.webm");
    fd.append("meta", JSON.stringify({ words: ["a", "b"], code: "LIVE-1", fingers: 2 }));
    const req = new NextRequest("http://localhost/api/stamps", { method: "POST", body: fd });
    const res = await POST(req);
    assert.equal(res.status, 402);
    const json = (await res.json()) as { ok: boolean; error: string };
    assert.equal(json.ok, false);
  });

  it("POST /api/stamps ignores client-chosen ids and still requires payment", async () => {
    const { POST } = await import("../app/api/stamps/route");
    const fd = new FormData();
    fd.append("video", new Blob([new Uint8Array([1, 2, 3])], { type: "video/webm" }), "v.webm");
    fd.append(
      "meta",
      JSON.stringify({ id: "audit-nopay-001", words: ["a"], code: "LIVE-1" })
    );
    const req = new NextRequest("http://localhost/api/stamps", { method: "POST", body: fd });
    const res = await POST(req);
    assert.equal(res.status, 402);
  });

  it("POST /api/invites without payment returns 402", async () => {
    const { POST } = await import("../app/api/invites/route");
    const req = new NextRequest("http://localhost/api/invites", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ note: "audit" }),
    });
    const res = await POST(req);
    assert.equal(res.status, 402);
  });
});
