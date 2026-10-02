import type { CheckReport } from "./types";
import { teaserFlags } from "./analyze";
import { REPORT_PRICE_LABEL } from "./types";

/** Strip paid fields until unlocked. */
export function toPublicReport(report: CheckReport) {
  if (report.unlocked) {
    return {
      id: report.id,
      createdAt: report.createdAt,
      companyName: report.companyName,
      contact: report.contact,
      score: report.score,
      level: report.level,
      summary: report.summary,
      flags: report.flags,
      actions: report.actions,
      replyTemplate: report.replyTemplate,
      unlocked: true as const,
      hiddenFlagCount: 0,
      sealedPreview: [] as string[],
      priceLabel: REPORT_PRICE_LABEL,
      sourcePreview: report.sourceText.slice(0, 280),
    };
  }

  const sealedPreview = [
    report.flags.length > 2
      ? `Full explanation of all ${report.flags.length} flags`
      : "Full explanation of every flag",
    "Go / no-go action list (what to do in the next 5 minutes)",
    "Copy-paste reply you can send without sounding panicked",
    report.level === "critical" || report.level === "high"
      ? "Hard-stop wording if you should walk away"
      : "How to take a deposit safely if you proceed",
  ];

  return {
    id: report.id,
    createdAt: report.createdAt,
    companyName: report.companyName,
    contact: report.contact,
    score: report.score,
    level: report.level,
    summary: report.summary,
    flags: teaserFlags(report.flags).map((f) => ({
      id: f.id,
      severity: f.severity,
      title: f.title,
      detail: "Unlock the sealed report to read the full explanation.",
    })),
    hiddenFlagCount: Math.max(0, report.flags.length - 2),
    actions: [] as string[],
    replyTemplate: null as string | null,
    unlocked: false as const,
    sealedPreview,
    priceLabel: REPORT_PRICE_LABEL,
    sourcePreview: report.sourceText.slice(0, 160),
  };
}

export type PublicReport = ReturnType<typeof toPublicReport>;
