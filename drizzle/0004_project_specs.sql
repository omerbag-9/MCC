ALTER TABLE `projects` ADD `specs` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `highlights` text DEFAULT '' NOT NULL;
--> statement-breakpoint
-- Demo content for the seeded demo projects (only where still empty).
UPDATE `projects` SET `specs` = 'Type: Private villa
Floors: Basement + 2
Bedrooms: 6
Pool: Infinity pool, 18 m
Scope: Design-build, turnkey
Status: Completed', `highlights` = 'Double-height living spaces
Basement entertainment level
Infinity pool and landscaped garden
Smart-home lighting and security
Full MEP and finishing' WHERE `slug` = 'palm-hills-villa' AND `specs` = '' AND `highlights` = '';
--> statement-breakpoint
UPDATE `projects` SET `specs` = 'Type: Grade-A offices
Floors: G + 12
Basements: 2 parking levels
Building height: 52 m
Delivery: 22 months
Status: Completed', `highlights` = 'Glass curtain-wall facade
Two basement parking levels
Raised floors and open office plates
Four high-speed passenger lifts
Central chilled-water plant' WHERE `slug` = 'nile-business-tower' AND `specs` = '' AND `highlights` = '';
--> statement-breakpoint
UPDATE `projects` SET `specs` = 'Type: Distribution centre
Structure: Steel portal frame
Clear height: 12 m
Loading docks: 40
Offices: 1,200 m²
Status: Completed', `highlights` = 'High-bay racking area
Forty dock levellers with shelters
Truck yard and staff parking
Sprinkler and fire-alarm systems
Roof ready for solar panels' WHERE `slug` = 'delta-logistics-hub' AND `specs` = '' AND `highlights` = '';
--> statement-breakpoint
UPDATE `projects` SET `specs` = 'Type: Apartment renovation
Built: 1930s
Rooms: 5 + 2 bathrooms
Duration: 7 months
Scope: Structure, MEP, finishing
Status: Completed', `highlights` = 'Restored original parquet floors
Rebuilt plaster mouldings
Custom oak joinery
New electrical and plumbing
Structural repairs to the slab' WHERE `slug` = 'zamalek-apartment-renovation' AND `specs` = '' AND `highlights` = '';
