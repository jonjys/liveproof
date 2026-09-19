# LiveProof (web)

Paid shareable **presence stamp** — prove you are a real human for dating chats, remote jobs, and applications.

Not a dating app. Not KYC. Not a PDF.

**Brand:** LiveProof only.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- API routes for stamp upload / video serve
- Stripe Payment Link + webhook for **server-side** payment verification
- Storage (MVP):
  - In-memory `Map` (process-local)
  - Disk: `data/stamps/{id}/` locally, or `/tmp/stamps/{id}/` on Vercel
  - Optional [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) when `BLOB_READ_WRITE_TOKEN` is set (private blobs preferred)

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing — sells the pain |
| `/create` | Challenge + selfie record + upload (requires paid Checkout Session) |
| `/request` | Pay once, mint an invite link |
| `/paid` | Stripe return URL (`?session_id={CHECKOUT_SESSION_ID}`) |
| `/s/[id]` | Public stamp viewer (video proxied through `/api/stamps/{id}/video`) |
| `/s/demo` | Static demo stamp (no video) |
| `/privacy` | Privacy policy |
| `/terms` | Terms |

## Local development

```bash
cp .env.example .env.local
# LIVEPROOF_DEV_BYPASS=1 is recommended for local demos without Stripe
npm install
npm run dev
```

Open http://localhost:3000

```bash
npm test   # payment-gate + id + rate-limit unit tests
```

### Flow

1. Landing → **Get stamp** or **Send a prove-you're-human link**
2. Pay via Stripe Payment Link
3. Stripe redirects to `/paid?session_id={CHECKOUT_SESSION_ID}` (must be set on the Payment Link)
4. `/create` or `/request` sends that `session_id` to the API
5. Server verifies the Checkout Session is **paid** and **unused**, then creates the stamp/invite
6. Public page `/s/{id}` shows video (via same-origin API), challenge, ISO timestamp, badge

`?paid=1` and `sessionStorage` alone are **not** accepted.

## Environment variables

Never commit secret values. Set them in Vercel → Project → Settings → Environment Variables.

| Variable | Required in prod | Description |
|----------|------------------|-------------|
| `STRIPE_SECRET_KEY` | **Yes** | Stripe secret (`sk_live_…` / `sk_test_…`). Used to retrieve Checkout Sessions and consume them (metadata). |
| `STRIPE_WEBHOOK_SECRET` | **Yes** | Webhook signing secret (`whsec_…`) for `POST /api/stripe/webhook`. |
| `STRIPE_PAYMENT_LINK` | No | Defaults to `https://buy.stripe.com/dRmdR89i93oGcKQ8f38og0K`. Keep this live Payment Link. |
| `BLOB_READ_WRITE_TOKEN` | Strongly recommended | Vercel Blob RW token (auto-set when a Blob store is connected). |
| `BLOB_STORE_ID` | No | Set when using Vercel OIDC instead of the static token. |
| `BLOB_ACCESS` | No | `private` (preferred) or `public`. App tries private first, then public if the store is public-only. |
| `LIVEPROOF_DEV_BYPASS` | No | `1` skips payment locally / preview. **Ignored when `VERCEL_ENV=production`.** Do not set in production. |
| `LIVEPROOF_ADMIN_SECRET` | No | Bearer token for `POST /api/admin/purge`. |

Copy from `.env.example`.

## Deploy on Vercel (required for the payment gate)

1. Import this repo as a Next.js project.
2. **Set env vars** (Production):
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PAYMENT_LINK=https://buy.stripe.com/dRmdR89i93oGcKQ8f38og0K` (optional; already the code default)
   - `BLOB_READ_WRITE_TOKEN` (or connect a Blob store)
   - Do **not** set `LIVEPROOF_DEV_BYPASS` in production
3. **Stripe Dashboard → Payment Links** → this link → After payment:
   - Don’t show confirmation page
   - Redirect to: `https://liveproof.nyttolabs.com/paid?session_id={CHECKOUT_SESSION_ID}`
   - The `{CHECKOUT_SESSION_ID}` placeholder is required (Stripe replaces it).
4. **Stripe Dashboard → Webhooks** (or Workbench → Webhooks) → Add endpoint:
   - URL: `https://liveproof.nyttolabs.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`
   - Copy the signing secret into `STRIPE_WEBHOOK_SECRET`
5. Deploy. Confirm `POST /api/stamps` and `POST /api/invites` without a session return **402**.

Until `STRIPE_SECRET_KEY` is set, paid customers also cannot create (fail-closed **503**).

### Storage notes on Vercel

- **Without Blob:** stamps write to `/tmp` + an in-memory Map. Both are **ephemeral**. Fine for demos only.
- **With Blob (private store):** video bytes are stored with `access: 'private'` and streamed through `/api/stamps/{id}/video`. JSON APIs do **not** return a world-readable `videoUrl`.
- **With Blob (public store):** the SDK cannot mint private objects. Uploads fall back to `access: 'public'`. Unguessable ids + same-origin video proxy reduce exposure, but **anyone who learns the Blob URL can still fetch the file**. Create a **private** Blob store (or set `BLOB_ACCESS=private` on a private store) to close that.
- Existing public audit objects: delete them (see below).

## Price

**$9 / 99 kr** per stamp or invite (Stripe Payment Link). One Checkout Session unlocks one create.

## Delete unpaid audit leftovers

Known junk from the public audit:

- Stamp: `audit-nopay-001`
- Invites: `bdobc6dw8q47wr`, `8ret4cqg8q48r9`, `7as2qgwt8q5okl`, `inux1sov8q5p9u`

**Option A — admin API** (set `LIVEPROOF_ADMIN_SECRET` on Vercel):

```bash
curl -X POST https://liveproof.nyttolabs.com/api/admin/purge \
  -H "Authorization: Bearer $LIVEPROOF_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"audit":true}'
```

**Option B — script** (needs `BLOB_READ_WRITE_TOKEN`, e.g. `vercel env pull`):

```bash
npx tsx scripts/purge-audit.ts
```

**Option C — Vercel Blob UI:** Storage → Blob → delete prefixes `stamps/audit-nopay-001/` and `invites/{token}.json` for the four invite tokens.

## Scripts

```bash
npm run dev    # development server
npm test       # unit / API unpaid-path tests
npm run build  # production build
npm start      # serve production build
```
