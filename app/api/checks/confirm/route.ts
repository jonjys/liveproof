import { NextResponse } from "next/server";
import { getStripe, sessionIsPaid } from "@/lib/stripe";
import { unlockReport } from "@/lib/check/store";
import { toPublicReport } from "@/lib/check/public-report";
import { sanitizeCheckoutSessionId } from "@/lib/ids";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    sessionId?: string;
    reportId?: string;
    mock?: boolean;
  };

  const stripe = getStripe();
  const bypass =
    process.env.LIVEPROOF_DEV_BYPASS === "1" &&
    process.env.VERCEL_ENV !== "production";

  if (stripe && body.sessionId) {
    const sessionId = sanitizeCheckoutSessionId(body.sessionId);
    if (!sessionId) {
      return NextResponse.json({ error: "Invalid session." }, { status: 400 });
    }
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!sessionIsPaid(session)) {
      return NextResponse.json({ error: "Payment incomplete." }, { status: 400 });
    }
    const reportId = session.metadata?.reportId ?? body.reportId;
    if (!reportId) {
      return NextResponse.json({ error: "Missing report id." }, { status: 400 });
    }
    const report = await unlockReport(reportId, session.id);
    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, report: toPublicReport(report) });
  }

  if ((body.mock || bypass) && body.reportId) {
    const report = await unlockReport(body.reportId, "mock");
    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      report: toPublicReport(report),
      mode: "mock",
    });
  }

  return NextResponse.json({ error: "Nothing to confirm." }, { status: 400 });
}
