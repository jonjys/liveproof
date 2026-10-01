import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckReportView } from "@/components/CheckReportView";
import { getReport } from "@/lib/check/store";
import { toPublicReport } from "@/lib/check/public-report";

export const runtime = "nodejs";

export default async function CheckReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; session_id?: string; mock?: string }>;
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
        />
      </main>
      <Footer note="message check + presence stamp" />
    </div>
  );
}
