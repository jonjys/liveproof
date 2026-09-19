# LiveProof (web)

Paid shareable **presence stamp** — prove you are a real human for dating chats, remote jobs, and applications.

Not a dating app. Not KYC. Not a PDF.

**Brand:** LiveProof only.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- API routes for stamp upload / video serve
- Storage (MVP):
  - In-memory `Map` (process-local)
  - Disk: `data/stamps/{id}/` locally, or `/tmp/stamps/{id}/` on Vercel
  - Optional [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) when `BLOB_READ_WRITE_TOKEN` is set

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing — sells the pain |
| `/create` | Challenge + selfie record + upload |
| `/s/[id]` | Public stamp viewer |
| `/s/demo` | Static demo stamp (no video) |

## Local development

```bash
cd /workspace/liveproof-web
cp .env.example .env.local
# LIVEPROOF_DEV_BYPASS=1 is recommended for local demos
npm install
npm run dev
```

Open http://localhost:3000

### Flow

1. Landing → **Get stamp**
2. `/create` shows 6 random English words + `LIVE-XXXX`
3. Record ≤8s selfie (`getUserMedia` + `MediaRecorder`)
4. `POST /api/stamps` saves meta + video
5. Public page `/s/{id}` shows video, challenge, ISO timestamp, badge

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LIVEPROOF_DEV_BYPASS` | No | Set to `1` to skip payment gate (**local / preview only** — do not set in production) |
| `STRIPE_PAYMENT_LINK` | No | Stripe Payment Link URL on `/create`. Example (live, 99 SEK): `https://buy.stripe.com/dRmdR89i93oGcKQ8f38og0K`. Code falls back to this link if unset. |
| `BLOB_READ_WRITE_TOKEN` | Prod recommended | Vercel Blob RW token for durable videos |

Copy from `.env.example`.

After Stripe Payment Link checkout, customers redirect to `https://liveproof-sigma.vercel.app/create?paid=1`, which unlocks submit on `/create`.

## Deploy on Vercel

1. Import this folder as a Next.js project (or connect the repo root that contains `liveproof-web` and set Root Directory to `liveproof-web`).
2. Set env vars in the Vercel project:
   - `STRIPE_PAYMENT_LINK=https://buy.stripe.com/dRmdR89i93oGcKQ8f38og0K` (optional — app already defaults to this live link)
   - `BLOB_READ_WRITE_TOKEN` for durable video storage (**strongly recommended in production**)
   - Do **not** set `LIVEPROOF_DEV_BYPASS` in production. Use it only for local/preview demos without Stripe.
3. Deploy.

### Storage notes on Vercel

- **Without Blob:** stamps write to `/tmp` + an in-memory Map. Both are **ephemeral** (instance may cold-start and lose data). Fine for demos only.
- **With Blob:** video bytes upload to Vercel Blob; the stamp page uses the public Blob URL. Meta still lives in memory/`/tmp` for this MVP — for full durability add a DB later.
- Without a Blob token the API still accepts uploads for demo (writes `/tmp`); response includes `ephemeral: true`.

## Price

**$9 / 99 kr** per stamp (Stripe Payment Link).

## Scripts

```bash
npm run dev    # development server
npm run build  # production build
npm start      # serve production build
```
