-- The client's real clients, replacing the demo ones. Their logos are bundled in public/clients/;
-- each can be replaced or removed afterwards in Admin → Clients.
DELETE FROM `clients`;
--> statement-breakpoint
INSERT INTO `clients` (`name`, `logo_key`, `url`, `sort_order`) VALUES
  ('Al Ahly Mortgage Finance', '/clients/al-ahly-mortgage-finance.png', '', 1),
  ('Ayman Shahin Export Co.', '/clients/ayman-shahin-export.png', '', 2),
  ('Light Logistics', '/clients/light-logistics.png', '', 3),
  ('Style Design', '/clients/style-design.jpg', '', 4),
  ('Samir William', '/clients/samir-william.jpg', '', 5);
