-- Table used by OpenNext's D1 tag cache (lib/revalidate.ts -> revalidatePath) to record when
-- cached pages were invalidated. Same schema that `opennextjs-cloudflare deploy` would create;
-- we create it here because deploys run `wrangler deploy` directly (see scripts/deploy.mjs).
CREATE TABLE IF NOT EXISTS `revalidations` (
	`tag` text NOT NULL,
	`revalidatedAt` integer NOT NULL,
	`stale` integer,
	`expire` integer DEFAULT NULL,
	UNIQUE(`tag`) ON CONFLICT REPLACE
);
