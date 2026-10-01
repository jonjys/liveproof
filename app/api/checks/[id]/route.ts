import { NextResponse } from "next/server";
import { getReport } from "@/lib/check/store";
import { toPublicReport } from "@/lib/check/public-report";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const report = await getReport(id);
  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }
  return NextResponse.json({ report: toPublicReport(report) });
}
