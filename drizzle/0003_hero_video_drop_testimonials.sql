DROP TABLE `testimonials`;--> statement-breakpoint
ALTER TABLE `settings` ADD `hero_video_key` text;--> statement-breakpoint
-- The home page now shows three figures: revenue, projects, years. Sites still on the original
-- demo figures get the new three; figures edited in the admin are left alone.
UPDATE `settings` SET `stats` = '[{"value":"EGP 4.2B","label":"Total revenue"},{"value":"350+","label":"Projects completed"},{"value":"25+","label":"Years of experience"}]'
WHERE `stats` = '[{"value":"25+","label":"Years of experience"},{"value":"350+","label":"Projects completed"},{"value":"120","label":"Skilled staff"},{"value":"0","label":"Lost-time incidents in 2025"}]';
