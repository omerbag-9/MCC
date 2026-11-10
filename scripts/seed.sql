-- Demo content for local development: npm run db:seed:local
-- Safe to re-run: it clears the content tables first (leads are kept).
DELETE FROM news_posts;
DELETE FROM project_media;
DELETE FROM projects;
DELETE FROM services;
DELETE FROM clients;
DELETE FROM settings;

INSERT INTO settings (id, company_name, tagline, hero_title, hero_subtitle, about_title, about_body, strengths, stats, phone, email, whatsapp_number, whatsapp_message, address, working_hours, seo_title, seo_description)
VALUES (1,
  'MCC Construction',
  'Building with integrity since 1998',
  'Building what lasts since 1998',
  'Design-build, general contracting and renovation, delivered on time, on budget and to the highest safety standards.',
  'Over two decades of building trust',
  'We are a full-service construction company delivering residential, commercial and industrial projects from first sketch to final handover.

Our in-house engineers, project managers and site crews work as one team, so you get a single point of contact, transparent pricing and a schedule we stick to.',
  'Design and build under one contract
In-house engineers and site crews
Fixed, transparent pricing
Schedules we keep
Safety-first sites
Support after handover',
  '[{"value":"EGP 4.2B","label":"Total revenue"},{"value":"350+","label":"Projects completed"},{"value":"25+","label":"Years of experience"}]',
  '+20 100 123 4567',
  'info@example.com',
  '201001234567',
  'Hello, I''d like to ask about a project.',
  '90th Street, New Cairo, Egypt',
  'Sat–Thu, 9:00–17:00',
  '',
  ''
);

INSERT INTO services (title, description, icon, sort_order) VALUES
  ('Residential construction', 'Villas, townhouses and apartment buildings built to last, with quality finishes.', 'home', 1),
  ('Commercial buildings', 'Offices, retail and hospitality projects delivered on tight schedules.', 'building', 2),
  ('Industrial & warehouses', 'Steel structures, factories and logistics facilities.', 'factory', 3),
  ('Renovation & fit-out', 'Interior fit-out, refurbishment and extensions with minimal disruption.', 'paint', 4),
  ('Design & engineering', 'Architectural design, structural engineering and permits in-house.', 'ruler', 5),
  ('Project management', 'Planning, cost control and quality assurance from start to handover.', 'helmet', 6);

INSERT INTO projects (slug, title, summary, body, category, location, year, area_m2, client, featured, published, sort_order) VALUES
  ('palm-hills-villa', 'Palm Hills Private Villa', 'A 650 m² contemporary family villa with pool and landscaped garden.', 'A turnkey design-build project for a private client, including structure, MEP, finishing and landscaping.

The villa features double-height living spaces, a basement entertainment area and an infinity pool.', 'Residential', 'Sheikh Zayed', 2025, 650, 'Private client', 1, 1, 1),
  ('nile-business-tower', 'Nile Business Tower', 'Twelve-storey Grade-A office building delivered in 22 months.', 'Full general contracting for a 12-storey office tower with two basement parking levels and a glass curtain-wall facade.', 'Commercial', 'New Capital', 2024, 18500, 'Nile Developments', 1, 1, 2),
  ('delta-logistics-hub', 'Delta Logistics Hub', 'Steel-frame distribution centre with 40 loading docks.', 'Design and construction of a 24,000 m² warehouse with a high-bay racking area, offices and truck yard.', 'Industrial', '10th of Ramadan', 2024, 24000, 'Delta Logistics', 1, 1, 3),
  ('zamalek-apartment-renovation', 'Zamalek Apartment Renovation', 'Complete renovation of a 1930s apartment, preserving its original details.', 'Structural repairs, new MEP, custom joinery and restoration of the original parquet floors and mouldings.', 'Renovation', 'Zamalek, Cairo', 2023, 280, 'Private client', 0, 1, 4);

-- Specifications and highlights for the demo projects
UPDATE projects SET specs = 'Type: Private villa
Floors: Basement + 2
Bedrooms: 6
Pool: Infinity pool, 18 m
Scope: Design-build, turnkey
Status: Completed', highlights = 'Double-height living spaces
Basement entertainment level
Infinity pool and landscaped garden
Smart-home lighting and security
Full MEP and finishing' WHERE slug = 'palm-hills-villa' AND specs = '' AND highlights = '';
UPDATE projects SET specs = 'Type: Grade-A offices
Floors: G + 12
Basements: 2 parking levels
Building height: 52 m
Delivery: 22 months
Status: Completed', highlights = 'Glass curtain-wall facade
Two basement parking levels
Raised floors and open office plates
Four high-speed passenger lifts
Central chilled-water plant' WHERE slug = 'nile-business-tower' AND specs = '' AND highlights = '';
UPDATE projects SET specs = 'Type: Distribution centre
Structure: Steel portal frame
Clear height: 12 m
Loading docks: 40
Offices: 1,200 m²
Status: Completed', highlights = 'High-bay racking area
Forty dock levellers with shelters
Truck yard and staff parking
Sprinkler and fire-alarm systems
Roof ready for solar panels' WHERE slug = 'delta-logistics-hub' AND specs = '' AND highlights = '';
UPDATE projects SET specs = 'Type: Apartment renovation
Built: 1930s
Rooms: 5 + 2 bathrooms
Duration: 7 months
Scope: Structure, MEP, finishing
Status: Completed', highlights = 'Restored original parquet floors
Rebuilt plaster mouldings
Custom oak joinery
New electrical and plumbing
Structural repairs to the slab' WHERE slug = 'zamalek-apartment-renovation' AND specs = '' AND highlights = '';

INSERT INTO clients (name, url, sort_order) VALUES
  ('Nile Developments', '', 1),
  ('Delta Logistics', '', 2),
  ('Cairo Holdings', '', 3),
  ('Red Sea Resorts', '', 4);
