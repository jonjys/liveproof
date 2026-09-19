import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        right={
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-lp-cyan/20 px-3.5 py-1.5 text-sm font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
          >
            Home
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-[720px] flex-1 px-4 py-10 pb-16">
        <h1 className="mb-6 text-3xl font-bold">{title}</h1>
        <div className="space-y-4 text-[0.98rem] leading-relaxed text-lp-muted [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-lp-text [&_a]:text-lp-cyan [&_a]:underline [&_strong]:text-lp-text">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
