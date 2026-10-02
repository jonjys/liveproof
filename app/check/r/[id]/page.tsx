import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckReportView } from "@/components/CheckReportView";
import { getReport } from "@/lib/check/store";
import { toPublicReport } from "@/lib/check/public-report";

export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) return { title: "Report not found" };
  return {
    title: `${report.level} risk · score ${report.score}`,
    description: report.summary,
    robots: { index: false, follow: false },
  };
}

export default async function CheckReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    paid?: string;
    session_id?: string;
    mock?: string;
    from?: string;
  }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const report = await getReport(id);
  if (!report) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-[720px] flex-1 px-4 py-8 pb-16">
        <CheckReportView
          initial={toPublicReport(report)}
          paid={query.paid === "1"}
          sessionId={query.session_id}
          mock={query.mock === "1"}
          fromTry={query.from === "try"}
        />
      </main>
      <Footer note="message check + presence stamp" />
    </div>
  );
}
