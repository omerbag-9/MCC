-- Demo content for local development: npm run db:seed:local
-- Safe to re-run: it clears the content tables first (leads are kept).
DELETE FROM project_media;
DELETE FROM projects;
DELETE FROM services;
DELETE FROM testimonials;
DELETE FROM clients;
DELETE FROM settings;

INSERT INTO settings (id, company_name, tagline, hero_title, hero_subtitle, about_title, about_body, stats, phone, email, whatsapp_number, whatsapp_message, address, working_hours, seo_title, seo_description)
VALUES (1,
  'Atlas Build Co.',
  'Building with integrity since 1998',
  'We build homes, offices and landmarks that last',
  'Design-build, general contracting and renovation, delivered on time, on budget and to the highest safety standards.',
  'Over two decades of building trust',
  'We are a full-service construction company delivering residential, commercial and industrial projects from first sketch to final handover.

Our in-house engineers, project managers and site crews work as one team, so you get a single point of contact, transparent pricing and a schedule we stick to.',
  '[{"value":"25+","label":"Years of experience"},{"value":"350+","label":"Projects completed"},{"value":"120","label":"Skilled staff"},{"value":"0","label":"Lost-time incidents in 2025"}]',
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

INSERT INTO testimonials (name, role, quote, sort_order) VALUES
  ('Ahmed Hassan', 'Homeowner, Sheikh Zayed', 'They delivered our villa two weeks early and the finishing quality is outstanding. Communication was clear from day one.', 1),
  ('Sara Mahmoud', 'Operations Director, Delta Logistics', 'A professional team that understood our operational needs. The warehouse was handed over on budget.', 2),
  ('Omar Farouk', 'CEO, Nile Developments', 'Our third project together. Reliable, safety-focused and transparent on costs.', 3);

INSERT INTO clients (name, url, sort_order) VALUES
  ('Nile Developments', '', 1),
  ('Delta Logistics', '', 2),
  ('Cairo Holdings', '', 3),
  ('Red Sea Resorts', '', 4);
