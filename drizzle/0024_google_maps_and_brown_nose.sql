-- The contact page's map shows MCC CONSTRUCTION as Google Maps finds it, and the address links to the
-- same place (lib/maps.ts). Editable afterwards in Admin -> Site settings (an exact pin can be pasted
-- there from Google Maps -> Share -> Embed a map).
UPDATE `settings` SET `map_embed_url` = 'https://www.google.com/maps?q=MCC%20CONSTRUCTION&output=embed' WHERE `id` = 1;
--> statement-breakpoint
-- The client with the man-with-a-mustache-and-coffee logo is Brown Nose; it was added as
-- "Specialty Coffee". Its logo now opens the Brown Nose Golden Gate project, like the other clients
-- that have a project on the site. A name or link changed in Admin -> Clients is kept.
UPDATE `clients` SET `name` = 'Brown Nose' WHERE `name` = 'Specialty Coffee';
--> statement-breakpoint
UPDATE `clients` SET `project_id` = (SELECT `id` FROM `projects` WHERE `slug` = 'brown-nose-golden-gate')
WHERE `name` = 'Brown Nose' AND `project_id` IS NULL;
