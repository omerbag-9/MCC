-- Demo content for local development: npm run db:seed:local
-- Safe to re-run: it clears the content tables first (leads, news and projects are kept).
-- The real projects and their photos come from migration drizzle/0015_real_projects.sql.
DELETE FROM services;
DELETE FROM clients;
DELETE FROM settings;

INSERT INTO settings (id, company_name, tagline, hero_title, hero_subtitle, about_title, about_body, strengths, stats, phone, email, whatsapp_number, whatsapp_message, address, working_hours, seo_title, seo_description)
VALUES (1,
  'MCC Construction',
  'Building with integrity since 1998',
  'Building what lasts since 1998',
  'Design-build, general contracting and renovation, delivered on time, on budget and to the highest safety standards.',
  'About MCC',
  'MCC is an engineering-driven contracting company specializing in electromechanical solutions and integrated construction services. Established in 2015, we have expanded over the past three years into comprehensive finishing works, and we are now evolving into an integrated group of specialized companies.

Engineering is the foundation of how we think, plan and execute: accurate cost analysis, precise calculations and disciplined execution, with support and maintenance after handover. Most of our engineers have been with MCC for more than a decade.',
  'Design and build under one contract
In-house engineers and site crews
Fixed, transparent pricing
Schedules we keep
Safety-first sites
Support after handover',
  '[{"value":"EGP 80M","label":"Total revenue"},{"value":"30+","label":"Projects completed"},{"value":"10+","label":"Years of experience"}]',
  '+20 107 075 6325',
  'info@mccltd-eg.com',
  '201070756325',
  'Hello, I''d like to get in touch.',
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

INSERT INTO clients (name, logo_key, url, sort_order) VALUES
  ('Al Ahly Mortgage Finance', '/clients/al-ahly-mortgage-finance.png', '', 1),
  ('Ayman Shahin Export Co.', '/clients/ayman-shahin-export.png', '', 2),
  ('Light Logistics', '/clients/light-logistics.png', '', 3),
  ('Style Design', '/clients/style-design.jpg', '', 4),
  ('Samir William', '/clients/samir-william.jpg', '', 5),
  ('VS', '/clients/vs.png', '', 6);
