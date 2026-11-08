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

The build has no access to the production database, so pages built during `next build` hold placeholder content. `npm run deploy` therefore calls `POST /api/revalidate` right after deploying (`scripts/post-deploy.mjs`). You can also click **Refresh public site** on the admin dashboard.

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

## First deployment

All commands run from the project folder. Log in once with `npx wrangler login`.

### 1. Move the domain's DNS to Cloudflare

Cloudflare dashboard → **Add a domain** → choose the Free plan → change the nameservers at your registrar to the two Cloudflare gives you. Wait until the domain shows as **Active**.

### 2. Create the database and buckets

```bash
npx wrangler d1 create mcc-db
```

Copy the printed `database_id` into **both** D1 entries in `wrangler.jsonc` (`DB` and `NEXT_TAG_CACHE_D1` point at the same database).

```bash
npx wrangler r2 bucket create mcc-media
npx wrangler r2 bucket create mcc-cache
npm run db:migrate:remote
```

### 3. Configure `wrangler.jsonc`

- Uncomment `routes` and replace `example.com` with your domain.
- In `vars`, set `SITE_URL` (e.g. `https://example.com`), `EMAIL_FROM` and `LEADS_NOTIFY_TO` (comma-separated list of addresses that receive new leads).

### 4. Serve media from your own subdomain (recommended)

R2 → `mcc-media` → **Settings → Custom Domains → Connect domain** → `media.example.com`. Then set `MEDIA_URL` to `https://media.example.com` in `wrangler.jsonc`. Files are then served straight from R2 and never touch the Worker. If `MEDIA_URL` is empty, files are served through the app's `/media/*` route instead, which also works but counts against Worker requests.

### 5. Turnstile (spam protection)

Dashboard → **Turnstile → Add widget** → add your domain → choose **Managed**. Put the site key in `TURNSTILE_SITE_KEY` in `wrangler.jsonc` and store the secret:

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY
```

### 6. Email (Resend)

Create a free Resend account, add and verify your domain (Resend shows the DNS records; add them in Cloudflare DNS), create an API key, then:

```bash
npx wrangler secret put RESEND_API_KEY
```

`EMAIL_FROM` must use the verified domain, e.g. `Website <noreply@example.com>`.

To receive mail at `info@example.com` for free, use **Cloudflare Email Routing** (domain → Email → Email Routing) to forward it to an existing inbox.

### 7. Revalidation secret

```bash
npx wrangler secret put REVALIDATE_SECRET   # any long random string
```

### 8. Deploy

```bash
SITE_URL=https://example.com REVALIDATE_SECRET=<same secret> npm run deploy
```

If `SITE_URL` or `REVALIDATE_SECRET` isn't set in your shell, the deploy still succeeds. Afterwards, open the admin and click **Refresh public site**.

### 9. Protect the admin with Cloudflare Access

1. Dashboard → **Zero Trust** (pick a team name and the Free plan).
2. **Access → Applications → Add an application → Self-hosted.**
3. Add two destinations: `example.com/admin` and `example.com/api/admin`.
4. Add a policy: **Allow**, include **Emails**, and list the staff email addresses. Logins use a one-time code sent by email.
5. Open the application's settings and copy the **Application Audience (AUD) tag**.
6. Set the following in `wrangler.jsonc` `vars`, then deploy again:
   - `CF_ACCESS_TEAM_DOMAIN`: `<team-name>.cloudflareaccess.com`
   - `CF_ACCESS_AUD`: the AUD tag

The app verifies the Access token on every admin page, server action and API call. If these two values are missing, the admin stays locked: it is fail-closed.

### 10. Analytics and Search Console (optional)

- Dashboard → **Web Analytics** → add the site → put the token in `CF_ANALYTICS_TOKEN`. Alternatively, enable automatic setup, which injects the script without the token.
- Add the domain to Google Search Console and submit `https://example.com/sitemap.xml`.

## Media uploads

The admin's browser resizes photos before uploading them: a 1920 px WebP plus a 640 px WebP thumbnail. This keeps storage small and avoids paid image resizing.

Without extra setup, files go through the Worker (up to 25 MB each). That covers photos and short clips. For larger videos (up to 100 MB), let the browser upload straight to R2:

1. R2 → **Manage R2 API tokens → Create API token** → *Object Read & Write*, limited to `mcc-media`.
2. Set `R2_ACCOUNT_ID` in `wrangler.jsonc` and store the keys:

   ```bash
   npx wrangler secret put R2_ACCESS_KEY_ID
   npx wrangler secret put R2_SECRET_ACCESS_KEY
   ```

3. R2 → `mcc-media` → **Settings → CORS policy**:

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
```
