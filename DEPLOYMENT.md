# GitHub and Cloudflare Deployment

## Prepared upload folder

Open `github-upload` in this project. Upload **the contents** of each batch,
not the enclosing `github-upload` or `batch-*` folders. Do not upload a ZIP:
GitHub will store it, not unpack it.

- `batch-01-code`: source, scripts, lockfile, and deployment configuration.
- `batch-02-assets`: the `public` folder, including both downloadable CVs.

Each batch has fewer than 100 files; every file is under 25 MiB, the GitHub
browser upload limits. Generated PDF.js files are deliberately omitted and
are restored by the existing npm `postinstall` script.

The copy excludes `.env*`, `node_modules`, build output, Git history, local
tooling, private PDFs, and transaction logs. A local scan rejects known secret
values from environment files and private-key blocks; it is not a guarantee
that arbitrary manually embedded credentials cannot exist. Review uploads.
Public CVs intentionally contain your public professional/contact information.

To prepare a fresh copy after later edits, move the old generated
`github-upload` folder elsewhere, then run `npm run prepare:github`.
The script refuses to overwrite an existing folder.

## 1. GitHub

1. Sign in at https://github.com/new and create `ankit-portfolio`. A private
   repository is suitable. Do not initialize a README, license, or gitignore.
2. In the empty repository choose **uploading an existing file**. In an
   existing repository use **Add file > Upload files**.
3. Open `batch-01-code` in File Explorer, select all its contents, and drag
   them onto GitHub. Include `.gitignore` and `.node-version` (enable hidden
   items if necessary). Commit to `main`.
4. Repeat with the **contents** of `batch-02-assets`: drag its `public` folder
   onto the root upload screen and commit to `main`.
5. Verify the repository root contains `package.json`, `package-lock.json`,
   `wrangler.jsonc`, `open-next.config.ts`, `src/`, `scripts/`, and `public/`.
   There must be no outer `batch-*` folder in the repository.

Finish both uploads before connecting Cloudflare. Do not enable GitHub Pages:
this app has server API routes and is hosted on Cloudflare Workers.

## 2. Cloudflare Workers Builds

1. Sign in to https://dash.cloudflare.com and open **Workers & Pages**.
2. Choose **Create application / Import a repository** and connect GitHub.
   Grant access only to the repository you just created. Choose **Workers**,
   not a static Pages upload. Dashboard labels can vary.
3. Select the repository and explicitly use these settings (this project
   uses OpenNext; do not accept an automatic vinext framework migration):

| Setting                                      | Value                          |
| -------------------------------------------- | ------------------------------ |
| Worker/project name                          | `ankit-portfolio`              |
| Production branch                            | `main`                         |
| Root directory                               | Repository root (blank or `/`) |
| Build command                                | `npm run build:cloudflare`     |
| Deploy command                               | `npm run deploy:cloudflare`    |
| Node version / build variable `NODE_VERSION` | `22.23.4`                      |

Workers Builds installs npm dependencies using the committed lockfile. Do not
disable npm lifecycle scripts: `postinstall` copies the PDF viewer assets.
There is no Pages output-directory setting; Wrangler uses `.open-next/worker.js`
and `.open-next/assets` from the configuration. The deploy command runs only
after the build succeeds. Leave preview/non-production branch builds disabled
for the initial setup.

4. Set build variable `NEXT_PUBLIC_SITE_URL` to your public origin, for example
   `https://ankit-portfolio.YOUR-SUBDOMAIN.workers.dev`. If you only learn this
   URL after the first deployment, set it then and trigger another build so
   metadata and sitemap URLs are correct. Do not include a trailing path.
5. Deploy and wait for the build log to report success. Open the assigned
   `workers.dev` URL. No custom domain or paid plan is required to try it.
6. In **Settings > Domains & Routes**, optionally add a domain you own and
   update `NEXT_PUBLIC_SITE_URL`, then rebuild. Domain registration is separate.

The Worker name and the `WORKER_SELF_REFERENCE` service in `wrangler.jsonc`
must match if you rename the project. Let Workers Builds manage its deployment
token; do not put that token in GitHub files or client-side variables.

## 3. Optional AI chat

Without AI credentials the portfolio and public CV downloads work; chat returns
a friendly email fallback. This is the simplest initial deployment.

To enable AI later, use the Worker's **Settings > Variables & Secrets**:

| Runtime setting                  | Purpose                                           |
| -------------------------------- | ------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID`          | Your Cloudflare account ID                        |
| `CLOUDFLARE_API_TOKEN` (Secret)  | Token scoped to Workers AI access on this account |
| `CLOUDFLARE_AI_MODEL` (optional) | Defaults to `@cf/meta/llama-3.1-8b-instruct`      |

Use the Workers AI token template / account-scoped Workers AI permissions.
Never prefix secrets with `NEXT_PUBLIC_`. Runtime settings are distinct from
Workers Builds variables. Apply the runtime changes and deploy a new version
as prompted. Before enabling public AI, configure suitable abuse protection
and review Workers AI quotas/pricing. The chat endpoint currently has no
distributed rate limiter; a secret token alone does not prevent quota abuse.

## 4. Protected resource PDFs (optional)

Removing Marketplace navigation did not delete the existing `/resources` and
resource API routes. Their content remains in this upload. Protected PDF APIs
read from local `private/downloads` in development; that filesystem is not a
Cloudflare deployment storage solution. These private files are excluded.

For those downloads to work on Cloudflare, create a **private R2 bucket**, upload
the required PDFs from `private/downloads` under their exact relative keys
(for example `kafka-systems-field-guide.pdf`), and configure these runtime values:

- `R2_ACCOUNT_ID` and `R2_BUCKET`.
- `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` as secrets, using an R2 S3 API
  credential restricted to reading the selected bucket.

Do not make the bucket public. R2 may require billing activation and usage
beyond its included allowance is chargeable. This is **not needed** for the
public CV buttons: both CV files ship in `public/cv`. Without R2, protected PDF
previews/downloads remain unavailable. The resource pages themselves still load.

Analytics is optional; leave `NEXT_PUBLIC_ANALYTICS_DOMAIN` unset unless you
have configured the existing analytics service. No SMTP settings are needed
for the email-only contact link.

## Verification and limits

Locally verified: Next.js and ESLint config upgraded from 16.3.3 to 16.4.3;
TypeScript compilation, production build, three offline chat-route tests, and
production homepage HTTP startup passed before and after the upgrade. The
OpenNext build's Next.js phase also passed under temporary Node 22.

**Remaining deployment check:** native Windows blocked OpenNext's symlink
creation with `EPERM` during final Worker bundling. No system permissions were
changed. Worker bundling, dry-run size, and Worker runtime behavior are not yet
verified. Cloudflare's Linux build environment avoids that Windows restriction,
but its build and deployed smoke checks must pass before treating the site as
production-ready. Nothing has been uploaded or deployed on your behalf.

After a successful deployment, check the homepage, navigation, English/German
CV preview and download, email contact link, and chat fallback. If enabling R2
or AI, test those separately after adding runtime credentials. In a supported
local Node 22 environment, `npm run preview:cloudflare` builds and previews the
Worker; `npx wrangler deploy --dry-run` checks an already-built bundle without
deploying. Windows users should use WSL or Linux for these OpenNext commands.

Workers Free currently includes 100,000 requests/day with a 10 ms CPU budget
per invocation. Next.js dynamic requests may exceed that CPU budget; a free
deployment is not a guarantee that every route fits the free runtime limits.
Monitor actual usage/errors before enabling paid features. Workers AI and R2
have separate allowances. Review current limits before selecting a plan:

- https://developers.cloudflare.com/workers/platform/limits/
- https://opennext.js.org/cloudflare/get-started
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
