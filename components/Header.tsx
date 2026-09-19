import Link from "next/link";
import { Logo } from "./Logo";

type Props = {
  right?: React.ReactNode;
};

export function Header({ right }: Props) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-lp-cyan/20 bg-lp-bg/85 px-5 py-3 backdrop-blur-md">
      <Link
        href="/"
        className="inline-flex items-center gap-2.5 font-bold tracking-wide text-lp-text no-underline hover:no-underline"
      >
        <Logo />
        <span className="text-[1.05rem]">LiveProof</span>
      </Link>
      <nav className="flex items-center gap-3">
        {right ?? (
          <>
            <Link
              href="/s/demo"
              className="inline-flex items-center rounded-full border border-lp-cyan/20 px-3.5 py-1.5 text-sm font-semibold text-lp-text transition hover:border-lp-cyan hover:text-lp-cyan"
            >
              See demo
            </Link>
            <Link
              href="/create"
              className="inline-flex items-center rounded-full bg-gradient-to-br from-lp-cyan to-lp-cyan2 px-3.5 py-1.5 text-sm font-semibold text-[#042026] shadow-glow"
            >
              Get stamp
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
