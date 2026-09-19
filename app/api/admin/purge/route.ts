import { NextRequest, NextResponse } from "next/server";
import { AUDIT_JUNK } from "@/lib/audit-junk";
import {
  clientIpFromHeaders,
  rateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { adminSecretOk, bearerToken } from "@/lib/security";
import { deleteInvite, deleteStamp } from "@/lib/storage";
import { sanitizeInviteToken, sanitizeStampId } from "@/lib/ids";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  const limited = rateLimit(`admin:${ip}`, 10, 10 * 60 * 1000);
  if (!limited.ok) {
    const r = rateLimitResponse(limited.retryAfterSec);
    return NextResponse.json(r.body, { status: r.status, headers: r.headers });
  }

  if (!process.env.LIVEPROOF_ADMIN_SECRET) {
    return NextResponse.json(
      { ok: false, error: "Admin API disabled (set LIVEPROOF_ADMIN_SECRET)" },
      { status: 503 }
    );
  }

  const token =
    bearerToken(req.headers.get("authorization")) ||
    req.headers.get("x-admin-secret");
  if (!adminSecretOk(token)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    audit?: boolean;
    stamps?: string[];
    invites?: string[];
  } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const stamps = new Set<string>();
  const invites = new Set<string>();
  if (body.audit) {
    for (const id of AUDIT_JUNK.stamps) stamps.add(id);
    for (const t of AUDIT_JUNK.invites) invites.add(t);
  }
  for (const id of body.stamps || []) {
    const clean = sanitizeStampId(id);
    if (clean) stamps.add(clean);
  }
  for (const t of body.invites || []) {
    const clean = sanitizeInviteToken(t);
    if (clean) invites.add(clean);
  }

  if (!stamps.size && !invites.size) {
    return NextResponse.json(
      {
        ok: false,
        error: "Nothing to delete. Pass { audit: true } or stamps/invites arrays.",
      },
      { status: 400 }
    );
  }

  const deleted = { stamps: [] as string[], invites: [] as string[] };
  for (const id of stamps) {
    await deleteStamp(id);
    deleted.stamps.push(id);
  }
  for (const t of invites) {
    await deleteInvite(t);
    deleted.invites.push(t);
  }

  return NextResponse.json({ ok: true, deleted });
}
