# Ankit Anand — Terminal Portfolio

A terminal-inspired personal portfolio, built with [Next.js](https://nextjs.org) + TypeScript. Content and navigation are available immediately, with optional command-driven navigation (`work`, `about`, `genai`, `cv`, `consulting`, `contact`, `links`, `help`, …), and an ASK-ANKIT AI chat assistant backed by a server-side API route.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env.local` and fill in as needed:

- `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_AI_MODEL` — optional. Enables real answers from the ASK-ANKIT assistant via `/api/chat`, backed by Cloudflare Workers AI's free tier. Without them, the assistant responds in the selected language with an email fallback. **Server-side only** — never exposed to the browser.
- `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` — optional. Serves the protected PDFs from a private Cloudflare R2 bucket instead of `private/downloads/` on local disk. See [private/downloads/README.md](private/downloads/README.md).
- `NEXT_PUBLIC_SITE_URL` — optional. Used for OpenGraph/canonical metadata.

## Download library and payments

Type `library` in the portfolio terminal to show the Kafka Systems Field Guide and six free GenAI diagram collections. Handbook previews are public; paid full PDFs are sold by email — the buy dialog asks visitors to email anand.ankit093@gmail.com, they receive a PayPal payment link by reply, and the PDF is delivered to their inbox after payment. Store protected PDFs in `private/downloads/` or the private R2 bucket, using the catalog's configured file names.

## Public resource pages

`/resources` lists the public catalog. Each collection, diagram and handbook has its own server-rendered URL, canonical metadata, JSON-LD and generated social image. Marketplace titles link to these pages, and previews include copy-link controls. `/sitemap.xml` lists the resources; `/robots.txt` permits the social-image endpoint while excluding other APIs. Set `NEXT_PUBLIC_SITE_URL` to the deployed origin before building. The default is `https://ankitanand.dev`.

## Language and mobile rendering

The EN/DE switch covers the main interface, booking notice, onboarding, assistant and CV controls. The assistant receives the selected locale, including speech input/output. Marketplace documents and diagrams remain English, with an English-only notice. Language and theme choices are stored locally.

Mobile viewports (up to 767px) receive a lightweight desk poster with an optional 3D button. Desktop loads the scene automatically after an idle callback, including when a narrow window is widened; no play button is shown. Reduced motion is respected by the scene itself. Desktop data-saver and 2G connections retain the poster without automatically downloading 3D. Navigation and calls to action do not depend on the scene.

## Optional funnel analytics

Create a Plausible site and set `NEXT_PUBLIC_ANALYTICS_DOMAIN` to that site's domain before building. No analytics are sent without configuration **and** explicit permission in the shield-icon privacy settings. Do Not Track and Global Privacy Control override permission. Statistics can be disabled there at any time. Update the deployed site's privacy disclosure for your Plausible account and data-processing arrangements; this implementation is not a legal compliance certification.

Events: `pageview`, `section_view`, `resource_share`, `resource_download`, `cv_download`, `email_clicked`, `checkout_opened`, `checkout_started`, `assistant_opened`, `scene_requested`. Configure these custom-event goals in Plausible. Suggested funnels: resource page → checkout opened → checkout started; consulting/contact section → email clicked. Properties contain only locale, allowlisted section and resource identifier. Query strings, fragments, referrers, form fields, chat content and payment identifiers are excluded. The browser still connects to Plausible, so normal network metadata reaches the provider.

Downloads, shares and email events measure **intent**, not completed delivery. `checkout_opened` means the buy dialog was shown; `checkout_started` means the visitor clicked "email to buy", not a paid order. Use PayPal's transaction history as the purchase-conversion source; no client-side purchase-completed event is claimed. Opt-in counts underrepresent total traffic and are not a complete visitor census.

For local verification, set `NEXT_PUBLIC_ANALYTICS_DOMAIN=localhost` and `NEXT_PUBLIC_ANALYTICS_DEBUG=true`, restart, then opt in. Debug mode emits a `portfolio:analytics` browser event instead of contacting Plausible. Remove debug mode for production. Run `node --test scripts/check-analytics.mjs` for consent, privacy-signal and payload checks.

For production, Cloudflare is a good fit: use a **private** Cloudflare R2 bucket for the PDFs and a Worker or Pages Function to authorize each request. Add Cloudflare Rate Limiting for `/api/download/*`. Do not expose PDFs as public R2 objects or place them in `public/`, since either option bypasses the download gate. The current local rate limiter is per Node.js instance; use a Durable Object or Cloudflare's rate-limiting service for a global limit.

## Project structure

- `src/app` — App Router pages, layout, and the `/api/chat` route handler.
- `src/components` — UI components (boot screen, terminal shell, sidebar, command outputs, ASK-ANKIT chat widget, etc).
- `src/lib` — typed content/data (CV, projects, links, help text) and shared types.
- `src/hooks` — the typewriter-headline hook.

## Scripts

- `npm run dev` — start the dev server.
- `npm run build` — production build.
- `npm run lint` — ESLint.

### Mobile regression checks

With the dev server running, install isolated browser tooling and run the touch/layout checks:

```bash
npm install --prefix .tsupgrader/runtime-validation --no-save --package-lock=false playwright
npx --prefix .tsupgrader/runtime-validation playwright install chromium
node scripts/check-mobile.mjs
```

Set `TEST_URL` to test another server, or `CHROMIUM_PATH` to reuse an installed Chromium binary. The check covers touch rotation, Work layouts from 320 to 1440 pixels, English/German content, CV swipes, full-window viewing, focus restoration and real canvas pixels. Screenshots are written to the ignored `.tsupgrader/runtime-validation/mobile/` folder.

## GenAI fieldnotes

The GenAI section contains searchable diagrams grouped by topic, with full-size previews and original PNG downloads. Assets are local to the project, so the deployed site does not depend on a Windows folder path. Thumbnails are lazy-loaded and optimized by Next.js; the library component loads only when opened.

To refresh the collection from the original folder:

```bash
npm run import:genai -- "C:/Users/q1495302/Videos/GenAI"
```

The importer reads PNG files from `Chunking`, `Embedding`, `MCP`, `MCP_2`, `RAG`, and `Transformer`, preserves filename order, and skips byte-identical duplicates within each topic. It copies files into `public/genai/` and generates `src/lib/genai.json`. Include both in deployments. Original source files are never modified. Re-importing does not delete previously copied files; remove retired images from `public/genai/` manually if they should no longer be publicly accessible. These diagrams are public resources, separate from the paid marketplace PDFs.

## Deploying to Vercel

### Option A — no git push, no GitHub required

1. `npm install -g vercel`, then run `vercel` from the project root and follow the prompts. This uploads your local folder straight to Vercel — no git repo, no push, and the paid PDFs in `private/downloads/` never touch a public host.
2. Add env vars (Stripe, and optionally the Cloudflare/R2 ones above) under Project Settings → Environment Variables, then run `vercel --prod`.

### Option B — GitHub-connected (auto-deploys on every upload)

1. Upload this repo to GitHub (drag-and-drop via the web UI works fine — git isn't required locally). **Keep the repo private** if you haven't moved the PDFs in `private/downloads/` to R2 (see [private/downloads/README.md](private/downloads/README.md)) — a public repo lets anyone download them from the file browser, bypassing Stripe.
2. Import the repo in [Vercel](https://vercel.com/new) — no special configuration needed, it auto-detects Next.js.
3. Add the env vars above under Project Settings → Environment Variables.
4. Add your custom domain under Project Settings → Domains and follow Vercel's DNS instructions.

Cloudflare Pages is not recommended for this project as-is: `nodemailer` (SMTP email) and some of the PDF libraries need the full Node.js runtime, which Cloudflare's edge Workers runtime doesn't provide.
