-- Thirteen more clients, after the existing ones. Their logos are in media-import/clients/;
-- scripts/move-to-r2.mjs uploads each to clients/<name>/logo.png on deploy. Names and logos can be
-- changed afterwards in Admin → Clients.
INSERT INTO `clients` (`name`, `logo_key`, `url`, `sort_order`) VALUES
  ('Clinic One Day', '/clients/clinic-one-day.png', '', 7),
  ('Sheraton Cairo Hotel & Casino', '/clients/sheraton-cairo.png', '', 8),
  ('Redcon Properties', '/clients/redcon-properties.png', '', 9),
  ('New Giza', '/clients/new-giza.png', '', 10),
  ('Crimson Bar and Grill', '/clients/crimson.png', '', 11),
  ('Specialty Coffee', '/clients/specialty-coffee.png', '', 12),
  ('Shanawany Group', '/clients/shanawany-group.png', '', 13),
  ('Italian Hospital Umberto I Cairo', '/clients/italian-hospital-cairo.png', '', 14),
  ('SECON', '/clients/secon.png', '', 15),
  ('Four Seasons Hotel Cairo at Nile Plaza', '/clients/four-seasons-cairo.png', '', 16),
  ('Playa', '/clients/playa.png', '', 17),
  ('The Courtyard', '/clients/the-courtyard.png', '', 18),
  ('Fifty One West', '/clients/fifty-one-west.png', '', 19);
--> statement-breakpoint
-- The sharper Style Design logo replaces the small one. It is a .webp, so it gets a new key
-- (clients/style-design/logo.webp) and the year-long cache of the old one doesn't hide it.
-- Only the logo supplied earlier is replaced, so a logo uploaded in Admin → Clients stays.
UPDATE `clients` SET `logo_key` = '/clients/style-design.webp'
WHERE `logo_key` IN ('/clients/style-design.png', 'clients/style-design/logo.png');
