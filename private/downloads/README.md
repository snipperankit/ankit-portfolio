# Private Download Library

Place the PDFs listed in `src/lib/content.ts` in this folder. These files are intentionally outside `public/`, so visitors can receive them only through `/api/download/[slug]`.

Current file names:

- `vscode-optimization-handbook.pdf`
- `production-rag-playbook.pdf`
- `event-driven-systems-checklist.pdf`

The Event-Driven Systems Checklist is free. The VS Code Optimization Handbook and Production RAG Playbook ($5 each) are sold by email: buyers email anand.ankit093@gmail.com, receive a PayPal payment link, and get the PDF sent to their inbox after payment — the download API returns 402 for paid slugs. The included Next.js route permits five downloads per IP address and resource within ten minutes when running on one Node.js instance.

## Cloudflare R2 (recommended before making the repo public)

The app already supports reading these PDFs from a private Cloudflare R2 bucket instead of this local folder — see `src/lib/downloads.ts`. To enable it:

1. Create an R2 bucket in the Cloudflare dashboard and keep it **private** (no public access, no custom domain).
2. Upload each PDF into the bucket using the exact same object key as its `fileName` in `src/lib/content.ts` (e.g. `kafka-systems-field-guide.pdf`).
3. Create an R2 API token (R2 → Manage R2 API Tokens) and set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` in your environment (see `.env.example`).
4. Once all four vars are set, every route that serves a protected PDF (`/api/download`, `/api/docs/full`, `/api/email-doc`, `/api/marketplace/preview`) automatically reads from R2 instead of this folder — no code changes needed. Leave the vars unset to keep using local disk.

This is the safest option if you plan to host the source on a public GitHub repo, since the PDFs then never live in the repo at all.

Also apply Cloudflare Rate Limiting (or equivalent) to `/api/download/*` and `/api/docs/full/*` for a global limit — the built-in limiter is per-Node-instance only.

Do not put protected PDFs in `public/downloads/`; public assets bypass application rate limits.
