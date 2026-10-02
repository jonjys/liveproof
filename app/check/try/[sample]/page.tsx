import { redirect, notFound } from "next/navigation";
import { SAMPLE_MESSAGES } from "@/lib/check/samples";
import { analyzeInbound } from "@/lib/check/analyze";
import { newCheckId, saveReport } from "@/lib/check/store";
import type { CheckReport } from "@/lib/check/types";

export const runtime = "nodejs";

/** One-tap demo → lands on a real report paywall (shareable). */
export default async function TrySamplePage({
  params,
}: {
  params: Promise<{ sample: string }>;
}) {
  const { sample: sampleId } = await params;
  const sample = SAMPLE_MESSAGES.find((s) => s.id === sampleId);
  if (!sample) notFound();

  const analyzed = analyzeInbound({
    sourceText: sample.sourceText,
    companyName: sample.companyName,
    contact: sample.contact,
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
  redirect(`/check/r/${report.id}?from=try`);
}
