import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms" };

export default function Terms() {
  return (
    <LegalPage title="Terms">
      <p>
        These terms cover LiveProof, a paid presence-stamp service: a short live
        selfie challenge you can share as a URL. LiveProof is <strong>not</strong>{" "}
        a dating app, not KYC, and not government identity verification.
      </p>

      <h2>The product</h2>
      <p>
        For a one-time fee (currently $9 / 99 kr unless stated otherwise at
        checkout) you may create either one personal stamp or one invite. An
        invite lets a recipient record a single stamp on that invite URL.
        Payment is processed by Stripe. Client-side flags such as{" "}
        <code className="text-lp-text">?paid=1</code> are not proof of payment.
      </p>

      <h2>Your responsibilities</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Only record yourself, or someone who consented to be recorded.</li>
        <li>
          Do not use LiveProof to impersonate others, harass, or commit fraud.
        </li>
        <li>
          Do not treat a stamp as a background check, right-to-work check, or
          official ID.
        </li>
        <li>
          You understand stamp URLs can be opened by anyone who has the link.
        </li>
      </ul>

      <h2>License to host</h2>
      <p>
        You grant LiveProof a license to store, transcode if needed, and display
        the video and metadata at the stamp or invite URL so the service can
        function. We do not claim ownership of your likeness.
      </p>

      <h2>Payments and refunds</h2>
      <p>
        Fees are charged by Stripe when you complete Checkout / the Payment
        Link. Each successful payment unlocks one create (stamp or invite).
        Refunds are handled as required by applicable law; contact the operator
        if a payment succeeded but you could not create a stamp.
      </p>

      <h2>Availability</h2>
      <p>
        The service is provided as-is. Storage without Vercel Blob may be
        ephemeral. We may rate-limit, refuse, or delete abusive content
        (including unpaid audit uploads).
      </p>

      <h2>Limitation</h2>
      <p>
        To the extent allowed by law, LiveProof and its operator are not liable
        for decisions others make after viewing a stamp (hiring, dating,
        housing, etc.). A presence stamp only shows that someone recorded a
        short live clip with the on-screen challenge.
      </p>

      <h2>Privacy</h2>
      <p>
        See the <Link href="/privacy">Privacy</Link> page for how face video and
        payment data are handled.
      </p>
    </LegalPage>
  );
}
