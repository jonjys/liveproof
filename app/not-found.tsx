import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col items-start justify-center px-4 py-16">
        <h1 className="mb-2 text-3xl font-bold">Stamp not found</h1>
        <p className="mb-6 text-lp-muted">
          This presence stamp does not exist, or it expired on an ephemeral
          server instance.
        </p>
        <Link
          href="/create"
          className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-5 py-2.5 font-semibold text-[#042026] shadow-glow"
        >
          Create a new stamp
        </Link>
      </main>
      <Footer />
    </div>
  );
}
