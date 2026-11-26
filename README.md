# MCC: construction company website

Marketing site and content admin for a construction company, built to run on Cloudflare's free tier.

- **Public site:** home page with services, featured projects, about, client logos and a contact form; `/about`; `/projects` with a category filter; one page per project with gallery and video; `/news` with one page per post (shareable on LinkedIn); `/contact` with a contact form and map; `/privacy`. Branded 404 and error pages.
- **Admin (`/admin`):** edit projects (photo/video upload, ordering, cover), services, client logos, website content (every heading, text, button, section photo and show/hide switch on the public pages; see `lib/content.ts`) and site settings; manage leads (status, notes, CSV export); dashboard with lead counts.
- **Leads:** saved in the database and emailed to the company; a visitor who gives an email gets a short confirmation (`lib/email-templates.ts`, which holds none of their text). Turnstile and a honeypot block spam.
- **SEO:** pre-rendered pages, per-page titles and descriptions, canonical URLs, Open Graph (project and news photos, else the logo `public/og.png`), `sitemap.xml`, `robots.txt`, schema.org `GeneralContractor` data, home-screen icons and a web manifest.

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

After a deploy the cache starts empty: `scripts/deploy.mjs` runs `wrangler deploy` directly and doesn't upload the build-time pages, which have no database access. So every page renders from D1 on its first visit and is cached from then on. To force every page to re-render, click **Refresh public site** on the admin dashboard.

## Local development

Requirements: Node.js 20+.

```bash
npm install
cp .dev.vars.example .dev.vars
npm run db:migrate:local   # create tables in the local D1
npm run db:seed:local      # optional demo content
npm run db:media:local     # put the real project photos and client logos into the local bucket
npm run dev                # http://localhost:3000, admin at /admin (no login locally)
```

Local D1 and R2 are simulated by Wrangler inside `.wrangler/`. To test the production build in the real Workers runtime:

```bash
npm run preview            # http://localhost:8787
```

Other scripts: `npm run lint`, `npm run typecheck`, `npm run db:generate` (creates a new SQL migration in `drizzle/` after editing `lib/db/schema.ts`), `npm run cf-typegen` (regenerates binding types after editing `wrangler.jsonc`).

## Environments and branches

| Branch | Cloudflare environment | Worker | Database / buckets | URL | Indexed by Google |
|---|---|---|---|---|---|
| `dev` (default) | top level of `wrangler.jsonc` | `mcc-dev` | `mcc-db`, `mcc-bucket` (media + page cache) | `https://dev.mccltd-eg.com` | no |
| `production` | `env.production` | `mcc` | `mcc-db-prod`, `mcc-media` (served at `https://media.mccltd-eg.com`), `mcc-cache` | `https://mccltd-eg.com` (`www.` redirects) | yes |
| `staging` | `env.staging` | `mcc-staging` | not created yet: `wrangler.jsonc` holds placeholders | — | no |

Database backups go to a separate private bucket per environment (`mcc-backups-dev`, `mcc-backups`); see "Backups and restore".

Each environment has its own data, so testing on dev or staging never touches the live site.

Dev uses a single R2 bucket for uploads and the page cache. If an environment has no R2 bucket bound at all, uploads are turned off there with a notice and the rest of the site still works. Dev also offers a password login for the admin until Cloudflare Access is set up (see below). Dev and staging send `noindex` and a `Disallow: /` robots.txt (driven by `APP_ENV`).

**Workflow:** branch off `dev` → pull request into `dev` → merge (deploys `https://dev.mccltd-eg.com`; check it there) → promote by fast-forwarding `production` to `dev` (deploys the live site):

```bash
git fetch origin dev production
git push origin origin/dev:refs/heads/production
```

`production` only ever moves forward to a commit that is already on `dev`, so the live site never runs code dev hasn't run. Deploys run from `.github/workflows/deploy.yml`, which calls `scripts/deploy.mjs`, on pushes to `dev` and `production`. Staging isn't used; to add it, follow "First deployment" below and step 9.

Everything stays on the free tier. D1 allows 10 databases and R2's 10 GB is shared by all buckets, so keep dev and staging media small.

## Setting up the dev environment (browser only)

Dev is already set up: it deploys automatically from the `dev` branch to `https://dev.mccltd-eg.com` (a custom domain in `routes`; `workers_dev` is off). These steps are how it was created, for rebuilding it in another account.

1. **Cloudflare account:** the company account that holds the `mccltd-eg.com` zone.
2. **D1 database:** **Storage & Databases → D1 → Create** → `mcc_db`. Put its id in both D1 entries at the top level of `wrangler.jsonc`.
3. **R2 bucket:** **R2 → Create bucket** → `mcc-bucket` (R2 asks for a payment card even on the free tier; nothing is charged within the free limits).
4. **API token:** **My Profile → API Tokens → Create Token** → template **Edit Cloudflare Workers**, then add **Account → D1 → Edit** and **Account → Workers R2 Storage → Edit**. Also copy the **Account ID** shown on the Workers & Pages overview.
5. **GitHub:** **Settings → Environments → New environment** → `dev`, and add these secrets:

   | Secret | Value |
   |---|---|
   | `CLOUDFLARE_API_TOKEN` | the token from step 4 |
   | `CLOUDFLARE_ACCOUNT_ID` | the account id from step 4 |
   | `ADMIN_PASSWORD` | the dev admin password, at least 8 characters |
   | `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY` | optional, when you have them |
   | `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | optional: faster direct browser uploads for large videos (see "Media uploads") |

6. **Push to `dev`** (or Actions → Deploy → Run workflow). The workflow creates the tables, loads the demo content (only while the database is empty), deploys, and copies the secrets to the Worker.

**Demo photos:** each dev deploy fills empty demo picture slots (the hero and service photos while there's no hero yet, and news posts without a cover) with free construction photographs: CC0 / public domain only, found through the Openverse API by `scripts/demo-photos.mjs`. The deploy log and the GitHub job summary list every photo with its creator, licence and source page. It never replaces a photo that is already there. Replace them with the company's own photos in the admin.

**Photos and logos live only in Cloudflare R2, never in this repository.** (The only images in the repository are the site's own branding in `public/`: the logo, icons and link-preview image; `.gitignore` lists them as exceptions.) Every picture on the site (project photos, client logos, the hero, service and page photos, news photos) is uploaded in the admin and served from the environment's media bucket. The company's projects and clients were first added by migrations (`drizzle/0013`–`0019`) with images bundled in the repository; each live environment uploaded those to its bucket, and the files were then removed from the repository. A fresh local or staging database still gets those rows from the migrations, with pictures that show empty until replaced in the admin. Edit, reorder or remove projects and clients in Admin → Projects and Admin → Clients.

**Website content and Site settings:** Admin → Website content has one tab per page of the site (`CONTENT_PAGES` in `lib/content.ts`) and one card per section, in the order visitors see them: the section's switch, its texts and photos (including the home page's hero, figures, about text and "Why choose us" points, which are stored as Site settings columns), and links to what the section shows from other admin pages. Admin → Site settings keeps the company details, contact, social links and SEO. Both save only the fields on their form (`saveSiteFields` in `lib/actions/admin.ts`), so neither overwrites the other.

**Everything the admin controls lives in the database, never in the code.** `lib/content.ts` only names the fields; their wording is in `settings.content` (migration `0026` moved the wording the site used to fall back on into the database, and `scripts/seed.sql` gives a fresh database the same). A text left empty in the admin is not shown; a switch never saved counts as on. The map takes Google Maps' whole "Embed a map" code (`lib/maps.ts`).

**Project facts (home page):** Admin → Project facts holds the section's switch, heading and text, and its tabs (`fact_tabs`), in order. Each tab picks a project or none, and can set its own name, facts table (one `Label: value` per line), photo and button (the tab's project page, another project, a page of the site, any link, or no button). Anything left empty follows the project and stays up to date (`lib/facts.ts`). Deleting a project removes its tabs.

Open `/admin` on the dev address and sign in with `ADMIN_PASSWORD`. The password login exists **only on dev** and only while Cloudflare Access isn't configured there; staging and production always require Access.

## First deployment (staging / production)

Production is live; these steps are how it was set up, and what setting up staging would take. They need the company Cloudflare account (the domain's DNS lives there). The dashboard steps can be done in the browser; commands run from the project folder after `npx wrangler login`. Pass `--env staging` or `--env production` to wrangler commands.

### 1. Move the domain's DNS to Cloudflare

Cloudflare dashboard → **Add a domain** → choose the Free plan → change the nameservers at your registrar to the two Cloudflare gives you. Wait until the domain shows as **Active**.

`www.mccltd-eg.com` is a second custom domain on the production Worker, and the app redirects it to `mccltd-eg.com` permanently (`redirects` in `next.config.ts`), so no Redirect Rule is needed.

### 2. Create the database and buckets

```bash
npx wrangler d1 create mcc-db-staging
npx wrangler r2 bucket create mcc-media-staging
npx wrangler r2 bucket create mcc-cache-staging
```

(Production uses `mcc-db-prod`, `mcc-media`, `mcc-cache`.) You can also create these in the dashboard.

Copy the printed `database_id` into **both** D1 entries of that environment in `wrangler.jsonc` (`DB` and `NEXT_TAG_CACHE_D1` point at the same database). Then create the tables:

```bash
npm run db:migrate:staging
```

### 3. Configure the environment in `wrangler.jsonc`

- Set the environment's host in `routes` and `SITE_URL` (staging still has `staging.example.com` placeholders).
- Set `EMAIL_FROM` and `LEADS_NOTIFY_TO` (comma-separated addresses that receive new leads).

### 4. Serve media from your own subdomain (recommended for production)

R2 → `mcc-media` → **Settings → Custom Domains → Connect domain** → `media.mccltd-eg.com` (set the minimum TLS version to 1.2). Then set `MEDIA_URL` to `https://media.mccltd-eg.com` for that environment (production already does). Files are then served straight from R2 and never touch the Worker. If `MEDIA_URL` is empty, files are served through the app's `/media/*` route instead, which also works but counts against Worker requests. Dev and staging can stay on the `/media/*` route.

A custom domain makes **every** file in the bucket public. Add a WAF custom rule on the zone that blocks requests to that host whose path starts with `/trash/` or `/backups/` (Security → WAF → Custom rules → Block).

### 5. Turnstile (spam protection)

Dashboard → **Turnstile → Add widget** → add all hostnames (`mccltd-eg.com`, `www.mccltd-eg.com`, `dev.mccltd-eg.com`, and staging's host if you add it) → choose **Managed**. Put the site key in each environment's `TURNSTILE_SITE_KEY` and add the secret key as the GitHub environment secret `TURNSTILE_SECRET_KEY` (the deploy copies it to the Worker), or set it directly:

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY --env staging
```

### 6. Email (Resend)

Create a free Resend account, add and verify your domain (Resend shows the DNS records; add them in Cloudflare DNS), create an API key, and add it as the GitHub environment secret `RESEND_API_KEY`, or set it directly:

```bash
npx wrangler secret put RESEND_API_KEY --env staging
```

`EMAIL_FROM` must use the verified domain, e.g. `MCC Website <noreply@mccltd-eg.com>`. To receive mail at `info@mccltd-eg.com` for free, use **Cloudflare Email Routing** (domain → Email → Email Routing) to forward it to an existing inbox.

### 7. Deploy

```bash
npm run deploy:staging
```

(or `npm run deploy:production`). This runs `scripts/deploy.mjs`: it applies migrations, builds, deploys, and copies any secrets set as environment variables (`TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, …) to the Worker.

### 8. Protect the admin with Cloudflare Access

1. Dashboard → **Zero Trust** (pick a team name and the Free plan).
2. **Access → Applications → Add an application → Self-hosted**, one application per environment.
3. Add destinations `<host>/admin` and `<host>/api/admin` (e.g. `mccltd-eg.com/admin`; for dev, `dev.mccltd-eg.com/admin`).
4. Add a policy: **Allow**, include **Emails**, and list the staff email addresses. Logins use a one-time code sent by email.
5. Copy the application's **Application Audience (AUD) tag**.
6. Set the following for that environment in `wrangler.jsonc`, then deploy it again:
   - `CF_ACCESS_TEAM_DOMAIN`: `<team-name>.cloudflareaccess.com`
   - `CF_ACCESS_AUD`: the AUD tag

The app verifies the Access token on every admin page, server action and API call. If these two values are missing, the admin stays locked: it is fail-closed.

To keep the **whole** staging site private (not just `/admin`), make the staging Access application cover staging's whole host.

### 9. Automatic deploys from GitHub

`.github/workflows/deploy.yml` installs dependencies, runs the checks and `node scripts/deploy.mjs <branch>` on pushes to `dev` and `production`. Both are set up; to add staging:

1. Cloudflare (company account) → **My Profile → API Tokens → Create Token** → template **Edit Cloudflare Workers**, then add **Account → D1 → Edit** and **Account → Workers R2 Storage → Edit**. Copy the token and the **Account ID**.
2. GitHub → **Settings → Environments** → create `staging` (like `production`). Add the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, plus optional `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`.
3. Add `staging` to `branches` in `.github/workflows/deploy.yml` and to the `matrix` in `.github/workflows/backup.yml`.
4. Optional: add **Required reviewers** to the `production` environment so live deploys need approval.

### 10. Analytics and Search Console (optional, production)

- Dashboard → **Web Analytics** → add the site. Production uses automatic setup, which injects the script without a token, so `CF_ANALYTICS_TOKEN` stays empty. (With automatic setup off, put the site's token there instead; never both, or visits count twice.)
- Add the domain to Google Search Console and submit `https://mccltd-eg.com/sitemap.xml`.

## Deploy checks

Every deploy (`scripts/deploy.mjs`, run by `.github/workflows/deploy.yml`) goes through these gates, in order. If any fails, the deploy stops.

1. **Lint, typecheck and unit tests** (`npm test`: `tests/*.test.ts`, run by Node's built-in test runner; in CI, before the script runs).
2. **Build**, then **run the built site locally** on a fresh database with the demo content, and run `scripts/smoke.mjs` against it. Nothing remote has been touched yet, so a failure here changes nothing.
3. Apply database migrations, then deploy.
4. **Check the live site** with the same smoke test. If it fails, the deploy **rolls back automatically** to the version that was live before (`wrangler rollback`) and the run is marked failed.

The smoke test checks that the home, about, news, news post, privacy, projects, project and contact pages, the sitemap, robots.txt and the web manifest respond correctly, that an unknown page returns 404, and that the security headers are present. Against the live site it also loads one photo from the home page (`--media`), so a broken media domain rolls the deploy back. Run it yourself with `node scripts/smoke.mjs <url> [--media]`.

A rollback restores the code, not the database. Migrations only add tables and columns, so the previous version keeps working with them.

## Security headers

Set for every page in `next.config.ts`: a Content Security Policy that allows only the third parties the site uses (Turnstile, Cloudflare Web Analytics, Google Maps, direct R2 uploads), `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and `Cross-Origin-Opener-Policy`. If you add a new third-party script, embed or API, add its host to the policy there.

## Backups and restore

**Database.** `.github/workflows/backup.yml` runs every day at 02:17 UTC (or on demand from the Actions tab) and stores a full export of the D1 database (schema first, then data) as `backups/d1/<env>/<date-time>.sql.gz` in that environment's own backup bucket (`mcc-backups`, `mcc-backups-staging`, `mcc-backups-dev`), which the script creates on first use. Never connect a domain to a backup bucket: that would make it public. (Backups used to go into the media bucket; the script moves any it finds there.) Backups are kept 90 days (an R2 lifecycle rule the backup script creates). They are deliberately **not** stored as GitHub artifacts: the repository is public and leads contain personal data. On top of this, D1 keeps its own point-in-time history (Time Travel: 7 days on the free plan, 30 on Workers Paid).

To restore, download a backup from the backup bucket (Cloudflare dashboard → R2 → `mcc-backups` → `backups/d1/...`), unzip it, then load it into an **empty** database. Never load it over existing data:

```bash
gunzip 2026-11-09-02-17.sql.gz
npx wrangler d1 create mcc-db-restore
npx wrangler d1 execute mcc-db-restore --remote --file 2026-11-09-02-17.sql
```

Check the restored data, then point the environment's two D1 entries in `wrangler.jsonc` at the new database id and deploy. To recover a recent mistake instead, D1 Time Travel can restore the existing database to a point in time: `npx wrangler d1 time-travel restore <database> --timestamp <ISO time>`.

**Photos and videos.** Deleting a photo or video in the admin moves the file to `trash/<date>/<original path>` in the same bucket instead of destroying it, and the database record is removed. Trash is kept 30 days, then removed automatically. The site never links to it; once the media bucket has a custom domain, block `/trash/` there with a WAF rule so it can't be fetched directly. To recover a file, copy it back to its original path (R2 dashboard, or `wrangler r2 object get` then `put`) and upload it again in the admin, or ask a developer to restore the record.

## Media uploads

The bucket is organised by what each file belongs to:

```
projects/<project>/photos/<file>.webp     each photo, plus <file>-thumb.webp
projects/<project>/videos/<file>.mp4
news/<post>/<file>.webp
clients/<client>/<file>.png
site/hero/<file>                          hero photo and video
site/hero/slides/<file>.webp              hero slideshow photos uploaded in Admin → Website content
site/services/<service>/<file>
site/pages/<section>/<file>               photos set in Admin → Website content and Admin → Project facts
```

Uploaded files are named `<date>-<id>`; the first real photos keep their order as `001`, `002`, … and the first logos are `logo.<ext>`. Files uploaded before this layout (`<area>/<year>/<uuid>`) are moved into their folder by the deploy, named `<year>-<id>`, and the old copy goes to `trash/` for 30 days (`scripts/move-to-r2.mjs`). The same step moves files that nothing on the site uses any more (older than a day, so unsaved uploads are safe) to `trash/` as well; it needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to list the bucket and is skipped without them.

The admin's browser resizes photos before uploading them: a 1920 px WebP plus a 640 px WebP thumbnail. This keeps storage small and avoids paid image resizing.

Without extra setup, files go through the Worker: in one request up to 25 MB, and larger videos (up to 100 MB) in 10 MB parts as an R2 multipart upload (`app/api/admin/uploads/multipart/route.ts`). Optionally, let the browser upload straight to R2 instead, which is faster for large videos:

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
       "AllowedOrigins": ["https://mccltd-eg.com"],
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
  admin/               admin pages (dashboard, leads, projects, services, clients, settings)
  api/                 admin uploads
  media/[...key]/      serves R2 files when MEDIA_URL isn't set
  sitemap.ts robots.ts
components/site/       public UI (header, footer, lead form, gallery, …)
components/admin/      admin UI (media uploader, image field, form helpers)
lib/
  db/                  Drizzle schema, client, public queries
  actions/             server actions (lead form, admin)
  auth.ts              Cloudflare Access JWT verification
  email.ts             Resend
  uploads.ts           R2 keys + presigned URLs
  client/upload.ts     browser-side resize + upload
drizzle/               SQL migrations (applied with wrangler)
scripts/               deploy.mjs (deploy one environment), smoke.mjs (deploy checks), backup.mjs (daily backups),
                       seed.sql (demo content), demo-photos.mjs (free demo photos on dev),
                       move-to-r2.mjs (puts older uploads into the bucket's folders, trashes unused files)
.github/workflows/     deploy.yml (push to dev → checks → deploy), backup.yml (daily backup)
```
