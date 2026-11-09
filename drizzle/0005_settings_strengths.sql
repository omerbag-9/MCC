ALTER TABLE `settings` ADD `strengths` text DEFAULT '' NOT NULL;--> statement-breakpoint
-- Starting points for the "Why choose us" section; edit them in Site settings.
UPDATE `settings` SET `strengths` = 'Design and build under one contract
In-house engineers and site crews
Fixed, transparent pricing
Schedules we keep
Safety-first sites
Support after handover' WHERE `strengths` = '';
