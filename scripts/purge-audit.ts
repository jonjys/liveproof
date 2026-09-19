#!/usr/bin/env npx tsx
/**
 * Delete unpaid-audit leftover stamps/invites from disk + Vercel Blob.
 *
 * Usage:
 *   BLOB_READ_WRITE_TOKEN=... npx tsx scripts/purge-audit.ts
 *
 * Or via the admin API after deploy:
 *   curl -X POST https://liveproof.nyttolabs.com/api/admin/purge \
 *     -H "Authorization: Bearer $LIVEPROOF_ADMIN_SECRET" \
 *     -H "Content-Type: application/json" \
 *     -d '{"audit":true}'
 *
 * Dashboard fallback: Vercel → Storage → Blob → delete prefixes listed below.
 */
import { AUDIT_JUNK } from "../lib/audit-junk";
import { deleteInvite, deleteStamp } from "../lib/storage";

async function main() {
  console.log("Purging audit junk stamps:", AUDIT_JUNK.stamps.join(", "));
  for (const id of AUDIT_JUNK.stamps) {
    await deleteStamp(id);
    console.log("  deleted stamp", id);
  }
  console.log("Purging audit junk invites:", AUDIT_JUNK.invites.join(", "));
  for (const token of AUDIT_JUNK.invites) {
    await deleteInvite(token);
    console.log("  deleted invite", token);
  }
  console.log("Done. If Blob token was missing, delete in the Vercel Blob UI:");
  for (const id of AUDIT_JUNK.stamps) console.log(`  stamps/${id}/`);
  for (const t of AUDIT_JUNK.invites) console.log(`  invites/${t}.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
