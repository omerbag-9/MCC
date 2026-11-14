-- The featured projects are now exactly these four: Samir William Stores (Merghany), Samir William
-- Head Office (RIXOS), VOSS Exotics Showroom, and Brown Nose Golden Gate, a new project with no
-- photos yet (it shows the drawn placeholder until a photo is added in Admin -> Projects). It comes
-- last, so the home page's three-project showcase keeps the ones with photos.
INSERT INTO `projects` (`slug`, `title`, `category`, `status`, `featured`, `published`, `sort_order`)
SELECT 'brown-nose-golden-gate', 'Brown Nose Golden Gate', 'Commercial', 'completed', 1, 1,
  (SELECT COALESCE(MAX(`sort_order`), 0) + 1 FROM `projects`)
WHERE NOT EXISTS (SELECT 1 FROM `projects` WHERE `slug` = 'brown-nose-golden-gate');
--> statement-breakpoint
UPDATE `projects` SET `featured` = CASE WHEN `slug` IN
  ('samir-william-stores', 'samir-william-head-office', 'voss-exotics-showroom', 'brown-nose-golden-gate')
  THEN 1 ELSE 0 END;
