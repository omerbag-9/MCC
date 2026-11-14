-- The two Samir William projects say which branch they are. Only the titles supplied earlier are
-- changed (a title edited in Admin -> Projects stays); the slugs, and so the page addresses, stay.
UPDATE `projects` SET `title` = 'Samir William Stores – Merghany'
WHERE `slug` = 'samir-william-stores' AND `title` = 'Samir William Stores';
--> statement-breakpoint
UPDATE `projects` SET `title` = 'Samir William Head Office – RIXOS'
WHERE `slug` = 'samir-william-head-office' AND `title` = 'Samir William Head Office';
