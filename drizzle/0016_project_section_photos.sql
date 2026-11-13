-- Photos chosen in the admin for the "About the project" and "Project overview" sections of a
-- project page. Empty means automatic: the next photos in gallery order after the cover.
ALTER TABLE `projects` ADD `story_image_key` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `overview_image_key` text;
