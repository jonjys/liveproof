import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://liveproof.nyttolabs.com"),
  title: {
    default: "LiveProof · check before you trust",
    template: "%s · LiveProof",
  },
  description:
    "Person stamp + message scam check. Prove someone is live, or scan an inbound job/client email before you start. $5 / 49:-. No account.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
