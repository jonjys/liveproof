import { NextResponse } from "next/server";
import { analyzeInbound } from "@/lib/check/analyze";
import { newCheckId, saveReport } from "@/lib/check/store";
import { toPublicReport } from "@/lib/check/public-report";
import type { CheckReport } from "@/lib/check/types";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const limited = rateLimit(`checks:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many checks. Try again in a minute." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    sourceText?: string;
    companyName?: string;
    contact?: string;
  };

  const sourceText = (body.sourceText ?? "").trim();
  if (sourceText.length < 40) {
    return NextResponse.json(
      { error: "Paste the full message — at least a few sentences." },
      { status: 400 }
    );
  }
  if (sourceText.length > 12000) {
    return NextResponse.json(
      { error: "Keep the paste under 12,000 characters." },
      { status: 400 }
    );
  }

  try {
    const analyzed = analyzeInbound({
      sourceText,
      companyName: body.companyName,
      contact: body.contact,
    });

    const report: CheckReport = {
      id: newCheckId(),
      createdAt: new Date().toISOString(),
      unlocked: false,
      paidAt: null,
      stripeSessionId: null,
      ...analyzed,
    };

    await saveReport(report);
    return NextResponse.json({ report: toPublicReport(report) });
  } catch (err) {
    console.error("checks POST failed:", err);
    return NextResponse.json(
      { error: "Could not save the check. Try again." },
      { status: 500 }
    );
  }
}
