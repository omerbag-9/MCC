-- The home page hero can now show a slideshow of photos as well as one photo or the video, chosen in
-- Admin -> Website content. hero_mode stays empty until it is chosen there, and the site then keeps
-- doing what it did: the video when there is one, else the photo.
ALTER TABLE `settings` ADD `hero_mode` text;--> statement-breakpoint
ALTER TABLE `settings` ADD `hero_slides` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `settings` ADD `hero_slide_seconds` integer DEFAULT 6 NOT NULL;