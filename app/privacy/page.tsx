import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy">
      <p>
        LiveProof is a paid <strong>presence stamp</strong> product. You record a
        short live selfie while speaking a challenge. This is not government ID,
        not KYC, and not identity verification against official documents.
      </p>

      <h2>What we collect</h2>
      <p>When you create a stamp or invite we may process:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>A short face video (about 8 seconds) that you record in the browser</li>
        <li>Challenge metadata (words, LIVE code, finger count, timestamp)</li>
        <li>An optional note you attach to an invite</li>
        <li>Payment confirmation from Stripe (Checkout Session id, paid/consumed state)</li>
        <li>Basic request metadata used for abuse prevention (e.g. IP for rate limits)</li>
      </ul>
      <p>
        We do not ask for passports, national IDs, Social Security numbers, or
        government KYC documents. Payment card data is handled by Stripe, not
        stored on LiveProof servers.
      </p>

      <h2>How we use it</h2>
      <p>
        Video and challenge data are used to produce a shareable presence stamp
        page. Invite links let a requester collect one stamp from a recipient.
        We use Stripe only to confirm that a stamp or invite was paid for.
      </p>

      <h2>Sharing and public pages</h2>
      <p>
        Stamp pages (<code className="text-lp-text">/s/{"{id}"}</code>) are
        reachable by anyone with the link. Treat the URL as the sharing
        mechanism. Do not put sensitive footage in a stamp you do not want
        others to see. Invite pages (
        <code className="text-lp-text">/p/{"{token}"}</code>) are unlisted; the
        token is a secret capability.
      </p>

      <h2>Storage</h2>
      <p>
        Videos and metadata are stored on this application&apos;s host (Vercel)
        and, when configured, in Vercel Blob. Payment entitlements are stored so
        a Checkout Session cannot be reused. Storage may be ephemeral without
        Blob configured.
      </p>

      <h2>Retention</h2>
      <p>
        We keep stamps and invites while the service needs them to serve the
        public or invite URL. The operator may delete content (including
        abuse/audit leftovers) from Blob or via an admin purge. Contact the
        operator of{" "}
        <a href="https://liveproof.nyttolabs.com/">liveproof.nyttolabs.com</a>{" "}
        if you want a stamp or invite removed.
      </p>

      <h2>Your choices</h2>
      <p>
        Camera access is requested in the browser and can be denied. Do not
        submit a stamp if you do not want the clip hosted at a shareable URL.
      </p>

      <h2>Contact</h2>
      <p>
        Questions: the operator of this site (Nytto Labs / LiveProof). See also{" "}
        <Link href="/terms">Terms</Link>.
      </p>
    </LegalPage>
  );
}
