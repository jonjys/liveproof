export function Footer({ note = "presence stamp — not government ID" }: { note?: string }) {
  return (
    <footer className="border-t border-lp-cyan/20 px-5 py-5 text-center text-sm text-lp-muted">
      LiveProof · {note}
    </footer>
  );
}
