# MCC: construction company website

Marketing site and content admin for a construction company, built to run on Cloudflare's free tier.

- **Public site:** home page with services, featured projects, about, testimonials, client logos and a quote form; `/projects` with a category filter; one page per project with gallery and video; `/contact` with a quote form, map and WhatsApp.
- **Admin (`/admin`):** edit projects (photo/video upload, ordering, cover), services, testimonials, client logos and site settings; manage leads (status, notes, CSV export); dashboard with lead and WhatsApp-click counts.
- **Leads:** saved in the database and emailed to the company. Turnstile blocks spam.
- **WhatsApp:** click-to-chat buttons with a pre-filled message per page, and click tracking per page.
- **SEO:** pre-rendered pages, per-page titles and descriptions, canonical URLs, Open Graph, `sitemap.xml`, `robots.txt`, schema.org `GeneralContractor` data.

## Stack

| Part | Service | Free tier |
|---|---|---|
| App (frontend + backend) | Next.js 16 on Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare) | 100k requests/day |
| Database | Cloudflare D1 (SQLite) + Drizzle ORM | 5 GB |
| Images & videos | Cloudflare R2 | 10 GB, free egress |
| Page cache | R2 (pages) + D1 (invalidations) | included above |
| Admin login | Cloudflare Access (Zero Trust) | 50 users |
| Spam protection | Cloudflare Turnstile | unlimited |
| Email | [Resend](https://resend.com) HTTP API | 3,000/month |
| Analytics | Cloudflare Web Analytics | unlimited |

> Email uses Resend's HTTP API instead of nodemailer. Workers can't open regular SMTP connections reliably, and port 25 is blocked.

## How content updates work

Public pages are pre-rendered and served from the R2 cache, so visits use almost no Worker CPU and stay within the free plan's 10 ms CPU limit. When an admin saves anything, the app calls `revalidatePath()`, and each page is re-rendered from D1 on its next visit.

The build has no access to the production database, so pages built during `next build` hold placeholder content. Each `npm run deploy:<env>` therefore calls `POST /api/revalidate` right after deploying (`scripts/post-deploy.mjs`). You can also click **Refresh public site** on the admin dashboard.

## Local development

Requirements: Node.js 20+.

```bash
npm install
cp .dev.vars.example .dev.vars
npm run db:migrate:local   # create tables in the local D1
npm run db:seed:local      # optional demo content
npm run dev                # http://localhost:3000, admin at /admin (no login locally)
```

Local D1 and R2 are simulated by Wrangler inside `.wrangler/`. To test the production build in the real Workers runtime:

```bash
npm run preview            # http://localhost:8787
curl -X POST -H "x-revalidate-secret: change-me" http://localhost:8787/api/revalidate
```

Other scripts: `npm run lint`, `npm run typecheck`, `npm run db:generate` (creates a new SQL migration in `drizzle/` after editing `lib/db/schema.ts`), `npm run cf-typegen` (regenerates binding types after editing `wrangler.jsonc`).

## Environments and branches

| Branch | Cloudflare environment | Worker | Database / buckets | URL | Indexed by Google |
|---|---|---|---|---|---|
| `dev` (default) | top level of `wrangler.jsonc` | `mcc-dev` | `mcc-db-dev`, `mcc-media-dev`, `mcc-cache-dev` | `https://mcc-dev.<account>.workers.dev` | no |
| `staging` | `env.staging` | `mcc-staging` | `mcc-db-staging`, `mcc-media-staging`, `mcc-cache-staging` | `https://staging.example.com` | no |
| `production` | `env.production` | `mcc` | `mcc-db`, `mcc-media`, `mcc-cache` | `https://example.com` | yes |

Each environment has its own data, so testing on dev or staging never touches the live site. Dev and staging send `noindex` and a `Disallow: /` robots.txt (driven by `APP_ENV`).

**Workflow:** branch off `dev` → pull request into `dev` (deploys to dev) → pull request `dev` → `staging` (deploys to staging, where you check it) → pull request `staging` → `production` (deploys the live site). Every pull request runs lint, typecheck and a build. See `.github/workflows/ci-deploy.yml`.

Everything stays on the free tier. D1 allows 10 databases and R2's 10 GB is shared by all buckets, so keep dev and staging media small.

## First deployment

All commands run from the project folder. Log in once with `npx wrangler login`. Repeat steps 2–7 for each environment you want: `dev`, `staging`, `production`. Pass `--env staging` or `--env production` to wrangler for those two; dev uses no `--env`.

### 1. Move the domain's DNS to Cloudflare

Cloudflare dashboard → **Add a domain** → choose the Free plan → change the nameservers at your registrar to the two Cloudflare gives you. Wait until the domain shows as **Active**.

To send `www.example.com` to `example.com`, add a free **Redirect Rule** (domain → Rules → Redirect Rules → "Redirect from WWW to root" template).

### 2. Create the database and buckets

```bash
npx wrangler d1 create mcc-db-staging
npx wrangler r2 bucket create mcc-media-staging
npx wrangler r2 bucket create mcc-cache-staging
```

(For dev: `mcc-db-dev`, `mcc-media-dev`, `mcc-cache-dev`. For production: `mcc-db`, `mcc-media`, `mcc-cache`.)

Copy the printed `database_id` into **both** D1 entries of that environment in `wrangler.jsonc` (`DB` and `NEXT_TAG_CACHE_D1` point at the same database). Then create the tables:

```bash
npm run db:migrate:staging
```

### 3. Configure the environment in `wrangler.jsonc`

- Replace `example.com` in `routes` and `SITE_URL` with your domain. For dev, set `SITE_URL` to the `workers.dev` address printed by the first deploy.
- Set `EMAIL_FROM` and `LEADS_NOTIFY_TO` (comma-separated addresses that receive new leads).

### 4. Serve media from your own subdomain (recommended for production)

R2 → `mcc-media` → **Settings → Custom Domains → Connect domain** → `media.example.com`. Then set `MEDIA_URL` to `https://media.example.com` for that environment. Files are then served straight from R2 and never touch the Worker. If `MEDIA_URL` is empty, files are served through the app's `/media/*` route instead, which also works but counts against Worker requests. Dev and staging can stay on the `/media/*` route.

### 5. Turnstile (spam protection)

Dashboard → **Turnstile → Add widget** → add all hostnames (`example.com`, `staging.example.com`, the dev `workers.dev` host) → choose **Managed**. Put the site key in each environment's `TURNSTILE_SITE_KEY` and store the secret:

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY --env staging
```

### 6. Email (Resend)

Create a free Resend account, add and verify your domain (Resend shows the DNS records; add them in Cloudflare DNS), create an API key, then:

```bash
npx wrangler secret put RESEND_API_KEY --env staging
```

`EMAIL_FROM` must use the verified domain, e.g. `Website <noreply@example.com>`. To receive mail at `info@example.com` for free, use **Cloudflare Email Routing** (domain → Email → Email Routing) to forward it to an existing inbox.

### 7. Revalidation secret

Use a different long random string per environment:

```bash
npx wrangler secret put REVALIDATE_SECRET --env staging
```

### 8. Deploy

```bash
REVALIDATE_SECRET_STAGING=<same secret> npm run deploy:staging
```

Use `npm run deploy:dev` or `npm run deploy:production` for the others. The site URL is read from `wrangler.jsonc`. If the secret isn't set in your shell, the deploy still succeeds. Afterwards, open the admin and click **Refresh public site**.

### 9. Protect the admin with Cloudflare Access

1. Dashboard → **Zero Trust** (pick a team name and the Free plan).
2. **Access → Applications → Add an application → Self-hosted**, one application per environment.
3. Add destinations `<host>/admin` and `<host>/api/admin` (e.g. `staging.example.com/admin`). For dev on `workers.dev`, enable Access instead under Workers → `mcc-dev` → Settings → Domains & Routes → workers.dev → **Cloudflare Access**.
4. Add a policy: **Allow**, include **Emails**, and list the staff email addresses. Logins use a one-time code sent by email.
5. Copy the application's **Application Audience (AUD) tag**.
6. Set the following for that environment in `wrangler.jsonc`, then deploy it again:
   - `CF_ACCESS_TEAM_DOMAIN`: `<team-name>.cloudflareaccess.com`
   - `CF_ACCESS_AUD`: the AUD tag

The app verifies the Access token on every admin page, server action and API call. If these two values are missing, the admin stays locked: it is fail-closed.

To keep the **whole** staging site private (not just `/admin`), make the staging Access application cover `staging.example.com` itself.

### 10. Automatic deploys from GitHub

Pushing to `dev`, `staging` or `production` runs `.github/workflows/ci-deploy.yml`, which applies database migrations and deploys to the matching environment.

1. Cloudflare → **My Profile → API Tokens → Create Token** → template **Edit Cloudflare Workers**, then add the permission **Account → D1 → Edit**. Copy the token and your **Account ID** (shown on the Workers overview page).
2. GitHub → repository **Settings → Environments** → create `dev`, `staging` and `production`. In each, add these secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `REVALIDATE_SECRET`: the value you set with `wrangler secret put` for that environment
3. Optional: in the `production` environment, add **Required reviewers** so live deploys need approval.
4. Optional: **Settings → Branches → Add rule** for `staging` and `production` with **Require a pull request before merging**.

Until the secrets exist, the workflow still runs checks and skips the deploy with a warning.

### 11. Analytics and Search Console (optional, production)

- Dashboard → **Web Analytics** → add the site → put the token in `CF_ANALYTICS_TOKEN`. Alternatively, enable automatic setup, which injects the script without the token.
- Add the domain to Google Search Console and submit `https://example.com/sitemap.xml`.

## Media uploads

The admin's browser resizes photos before uploading them: a 1920 px WebP plus a 640 px WebP thumbnail. This keeps storage small and avoids paid image resizing.

Without extra setup, files go through the Worker (up to 25 MB each). That covers photos and short clips. For larger videos (up to 100 MB), let the browser upload straight to R2:

1. R2 → **Manage R2 API tokens → Create API token** → *Object Read & Write*, limited to that environment's media bucket (e.g. `mcc-media`).
2. Set `R2_ACCOUNT_ID` for that environment in `wrangler.jsonc` and store the keys:

   ```bash
   npx wrangler secret put R2_ACCESS_KEY_ID --env production
   npx wrangler secret put R2_SECRET_ACCESS_KEY --env production
   ```

3. R2 → the media bucket → **Settings → CORS policy** (use that environment's site address as the origin):

   ```json
   [
     {
       "AllowedOrigins": ["https://example.com"],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["content-type"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

Keep videos short and compressed (H.264 MP4, 720p/1080p). For long walkthroughs, upload to YouTube and link them instead.

## Project structure

```
app/
  (site)/              public pages: home, projects, projects/[slug], contact
  admin/               admin pages (dashboard, leads, projects, services, testimonials, clients, settings)
  api/                 wa-click tracking, revalidate, admin uploads
  media/[...key]/      serves R2 files when MEDIA_URL isn't set
  sitemap.ts robots.ts
components/site/       public UI (header, footer, lead form, gallery, WhatsApp, …)
components/admin/      admin UI (media uploader, image field, form helpers)
lib/
  db/                  Drizzle schema, client, public queries
  actions/             server actions (lead form, admin)
  auth.ts              Cloudflare Access JWT verification
  email.ts             Resend
  uploads.ts           R2 keys + presigned URLs
  client/upload.ts     browser-side resize + upload
drizzle/               SQL migrations (applied with wrangler)
scripts/               seed data, post-deploy cache refresh
.github/workflows/     CI checks + per-branch deploys
```
