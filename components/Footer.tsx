import Link from "next/link";

export function Footer({ note = "presence stamp — not government ID" }: { note?: string }) {
  return (
    <footer className="border-t border-lp-cyan/20 px-5 py-5 text-center text-sm text-lp-muted">
      <div>LiveProof · {note}</div>
      <nav className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link href="/privacy" className="hover:text-lp-cyan">
          Privacy
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/terms" className="hover:text-lp-cyan">
          Terms
        </Link>
      </nav>
    </footer>
  );
}
