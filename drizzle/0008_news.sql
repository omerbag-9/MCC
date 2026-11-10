CREATE TABLE `news_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`kind` text DEFAULT 'general' NOT NULL,
	`title` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`cover_key` text,
	`project_id` integer,
	`posted_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`linkedin_post_url` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `news_posts_slug_unique` ON `news_posts` (`slug`);--> statement-breakpoint
CREATE INDEX `news_posts_published_idx` ON `news_posts` (`published`,`posted_at`);--> statement-breakpoint
CREATE INDEX `news_posts_project_idx` ON `news_posts` (`project_id`);--> statement-breakpoint
ALTER TABLE `projects` ADD `status` text DEFAULT 'completed' NOT NULL;