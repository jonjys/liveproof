import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CreateClient } from "@/components/CreateClient";
import { StampView } from "@/components/StampView";
import { getInvite, getStamp } from "@/lib/storage";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props) {
  const { token } = await params;
  return { title: `Prove · ${token.slice(0, 8)}` };
}

export default async function ProveInvitePage({ params }: Props) {
  const { token } = await params;
  const invite = await getInvite(token);
  if (!invite) notFound();

  if (invite.stampId) {
    const stamp = await getStamp(invite.stampId);
    if (stamp) {
      let videoSrc: string | null = null;
      if (stamp.hasVideo) {
        videoSrc = stamp.videoUrl || `/api/stamps/${stamp.id}/video`;
      }
      return <StampView stamp={stamp} videoSrc={videoSrc} />;
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        right={
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-lp-cyan/20 px-3.5 py-1.5 text-sm font-semibold text-lp-text hover:border-lp-cyan hover:text-lp-cyan"
          >
            LiveProof
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-[980px] flex-1 px-4 py-6 pb-16">
        {invite.note ? (
          <p className="mb-3 rounded-xl border border-lp-cyan/25 bg-lp-cyan/5 px-3.5 py-2.5 text-sm text-lp-text">
            <span className="text-lp-muted">Request: </span>
            {invite.note}
          </p>
        ) : null}
        <h1 className="mb-1 text-xl font-bold sm:text-[1.85rem]">
          Record your presence stamp
        </h1>
        <p className="mb-2 text-sm text-lp-muted">
          Speak the words, hold up the fingers, max 8 seconds. Presence stamp —
          not government ID.
        </p>
        <CreateClient
          inviteToken={invite.token}
          inviteMode
          devBypass={false}
          presetWords={
            invite.wordsMode === "manual" && invite.words?.length
              ? invite.words
              : undefined
          }
        />
      </main>
      <Footer note="presence, not identity" />
    </div>
  );
}
