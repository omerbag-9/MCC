-- Links the clients that have a project on the site to it (their logo then opens that project).
-- Samir William has two; the stores are the featured one. Only clients with no project chosen yet
-- are changed, so a link set in Admin → Clients stays; a missing project leaves the link empty.
UPDATE `clients` SET `project_id` = (SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance')
WHERE `name` = 'Al Ahly Mortgage Finance' AND `project_id` IS NULL;
--> statement-breakpoint
UPDATE `clients` SET `project_id` = (SELECT `id` FROM `projects` WHERE `slug` = 'light-logistics-head-office')
WHERE `name` = 'Light Logistics' AND `project_id` IS NULL;
--> statement-breakpoint
UPDATE `clients` SET `project_id` = (SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-stores')
WHERE `name` = 'Samir William' AND `project_id` IS NULL;
--> statement-breakpoint
UPDATE `clients` SET `project_id` = (SELECT `id` FROM `projects` WHERE `slug` = 'voss-exotics-showroom')
WHERE `name` = 'VS' AND `project_id` IS NULL;
