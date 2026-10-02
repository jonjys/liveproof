import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeInbound } from "./analyze";

test("flags classic equipment + crypto scam", () => {
  const report = analyzeInbound({
    sourceText:
      "Dear Freelancer, we found your profile and want you for an urgent confidential project paying $5000/week. Please buy a MacBook first and we will reimburse you via crypto. Message me on Telegram only.",
    contact: "boss123@gmail.com",
  });
  assert.equal(report.level, "critical");
  assert.ok(report.score >= 70);
  assert.ok(report.flags.some((f) => f.id === "pay-for-equipment"));
  assert.ok(report.flags.some((f) => f.id === "crypto-or-gift-card"));
});

test("clean brief stays low/medium", () => {
  const report = analyzeInbound({
    sourceText:
      "Hi Alex — we're Northwind AB (org 556677-8899). Need a homepage redesign with discovery, two directions, one revision. Deadline in three weeks. Happy to pay a 40% deposit against a fixed scope before kickoff.",
    companyName: "Northwind AB",
    contact: "sara@northwind.se",
  });
  assert.ok(report.score < 45);
  assert.ok(report.level === "low" || report.level === "medium");
});

test("flags package-mule assistant script", () => {
  const report = analyzeInbound({
    sourceText:
      "We need a remote personal assistant to receive packages and forward money for our overseas office. Urgent start this week.",
  });
  assert.ok(report.flags.some((f) => f.id === "remote-assistant-kit"));
  assert.ok(report.score >= 22);
});
