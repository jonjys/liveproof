import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://liveproof.nyttolabs.com"),
  title: {
    default: "LiveProof · is this person real?",
    template: "%s · LiveProof",
  },
  description:
    "Paid shareable presence stamp. Record a live selfie challenge. Not KYC. Not a dating app.",
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
