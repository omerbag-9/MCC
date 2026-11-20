-- Clearer logos for two clients in the logos strip, made from the artwork supplied earlier:
--   Crimson Bar and Grill: the wordmark alone in crimson on a transparent background, instead of the
--   square social-media picture with the painted background (media-import/clients/crimson.webp)
--   Light Logistics: the mark with the name beside it, so the name stays readable at strip height
--   (media-import/clients/light-logistics.webp)
-- Only the logos supplied earlier are replaced, so a logo uploaded in Admin -> Clients stays.
-- scripts/move-to-r2.mjs uploads each to clients/<name>/logo.webp on deploy (a new address, so no stale copy is served).
UPDATE `clients` SET `logo_key` = '/clients/crimson.webp'
WHERE `logo_key` IN ('/clients/crimson.png', 'clients/crimson/logo.png');
--> statement-breakpoint
UPDATE `clients` SET `logo_key` = '/clients/light-logistics.webp'
WHERE `logo_key` IN ('/clients/light-logistics.png', 'clients/light-logistics/logo.png');
