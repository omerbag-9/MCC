CREATE TABLE `fact_tabs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`title` text DEFAULT '' NOT NULL,
	`rows` text DEFAULT '' NOT NULL,
	`image_key` text,
	`link` text DEFAULT '' NOT NULL,
	`link_label` text DEFAULT '' NOT NULL,
	`visible` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
-- The section showed the first four featured projects; they become its first tabs, with every field
-- left empty so each tab keeps following its project. From here on Admin -> Project facts decides.
INSERT INTO `fact_tabs` (`project_id`, `sort_order`)
SELECT `id`, ROW_NUMBER() OVER (ORDER BY `sort_order`, `id` DESC)
FROM `projects`
WHERE `published` = 1 AND `status` = 'completed' AND `featured` = 1
ORDER BY `sort_order`, `id` DESC
LIMIT 4;
