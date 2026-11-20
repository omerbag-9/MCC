-- Demo content for local development: npm run db:seed:local
-- Safe to re-run: it clears the content tables first (leads, news and projects are kept).
-- The real projects and their photos come from migration drizzle/0015_real_projects.sql.
DELETE FROM services;
DELETE FROM clients;
DELETE FROM settings;

INSERT INTO settings (id, company_name, tagline, hero_title, hero_subtitle, about_title, about_body, strengths, stats, phone, email, whatsapp_number, whatsapp_message, address, working_hours, seo_title, seo_description, content)
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
  '',
  '{"projectsButton": "View our projects", "aboutButton": "Talk to our team", "whyTitle": "Why clients choose {company}", "whyIntro": "One accountable team from the first drawing to the keys, and a site you would be proud to visit.", "servicesTitle": "What we build", "servicesIntro": "One team runs design, permits and construction, from the first drawing to the handover.", "featuredTitle": "Featured projects", "factsTitle": "Project facts", "factsIntro": "The numbers behind our recent work: size, scope and what was delivered.", "homeNewsTitle": "Latest news", "contactTitle": "Contact us", "contactIntro": "Send us a message and we will get back to you within one business day.", "formTitle": "Send us a message", "aboutPageTitle": "Beyond contracting. Driven by engineering.", "aboutPageIntro": "MCC is an engineering-driven contracting company specializing in electromechanical solutions and integrated construction services.", "aboutStoryTitle": "About MCC", "aboutStory": "Established in 2015, MCC began its journey as a specialized electromechanical contracting company, building its reputation on engineering expertise, technical precision, and commitment to quality.\n\nOver the past three years, the company has strategically expanded its capabilities into comprehensive finishing works, broadening its scope of services and strengthening its position in the construction market.\n\nToday, MCC is entering a new phase of growth, with a strategic vision to evolve into an integrated group of specialized companies, each bringing focused expertise and delivering complementary solutions under one unified vision.", "aboutLegal": "Limited Liability Company (LTD)", "aboutOwners": "Eng. Karim Osama and Eng. Mohamed Abdelhakim", "aboutScope": "Electromechanical works and comprehensive finishing works", "aboutMissionTitle": "Our mission", "aboutMissionLead": "To bring engineering excellence into every aspect of construction.", "aboutMission": "At MCC, engineering is not simply part of what we do; it is the foundation of how we think, plan, and execute.\n\nWe approach every project with an engineering mindset, combining technical knowledge, accurate cost analysis, precise calculations, and disciplined execution to ensure that every solution achieves its intended purpose.\n\nOur commitment goes beyond project completion. We strive to deliver superior quality, meet project timelines, and provide reliable after-completion support and maintenance.\n\nOur mission is to deliver projects that reflect professional standards, engineering integrity, and lasting value.", "aboutVisionTitle": "Our vision", "aboutVisionLead": "To become a leading engineering and contracting group recognized for its expertise, people, and quality of delivery.", "aboutVision": "We believe that our greatest competitive advantage lies in our people.\n\nMCC is built around a dedicated team of engineers, most of whom are graduates of leading Egyptian public universities, bringing strong academic foundations and practical engineering experience.\n\nWith the majority of our engineering team having been part of MCC for more than a decade, we have developed a strong foundation of accumulated knowledge, professional consistency, and shared commitment.\n\nWe aim to continuously elevate our standards, expand our capabilities, and deliver projects that set a higher benchmark for quality and professionalism in the market.", "aboutValuesTitle": "Our core values", "value1Title": "Engineering-driven thinking", "value1Text": "We approach construction through engineering principles, technical understanding, and systematic problem-solving. Our decisions are guided by engineering logic rather than conventional contracting practices.", "value2Title": "Precision in every detail", "value2Text": "We believe that successful projects begin with accurate planning. From cost estimation and technical calculations to procurement and execution, precision is embedded in every stage of our work.", "value3Title": "Commitment beyond delivery", "value3Text": "Our responsibility does not end at project handover. We are committed to delivering quality on schedule and providing the necessary support and maintenance to ensure long-term performance.", "value4Title": "People are our strength", "value4Text": "Our team is the foundation of our success. We invest in long-term professional relationships, accumulated experience, and a collaborative engineering culture that drives continuous improvement and sustainable growth.", "aboutClosing": "Engineering excellence, technical precision, commitment to quality.", "aboutPageButton": "Talk to our team", "projectsTitle": "Our projects", "projectsIntro": "Homes, offices, warehouses and renovations we have designed and built.", "projectsEmpty": "Projects will be published here soon.", "projectAboutTitle": "About the project", "projectOverviewTitle": "Project overview", "projectHighlightsTitle": "What we delivered", "projectHighlightsIntro": "The features, systems and finishes handed over on this project.", "projectVideoTitle": "Video tour", "projectGalleryTitle": "Gallery", "newsTitle": "News", "newsIntro": "Contracts we have won, sites we have opened and projects we have handed over.", "newsEmpty": "News will be published here soon.", "newsTimelineTitle": "Project timeline", "contactPageTitle": "Contact us", "contactPageIntro": "Send us a message and we will get back to you within one business day.", "contactDetailsTitle": "Contact details", "formButton": "Send message", "formSuccessTitle": "Thank you! We received your message.", "formSuccessText": "Our team will get back to you shortly.", "aboutFact1Value": "2015", "aboutFact1Label": "Established", "aboutFact2Value": "10+ years", "aboutFact2Label": "Most of our engineers with us", "showWhy": "1", "showServices": "1", "showFeatured": "1", "showFacts": "1", "showClients": "1", "showNews": "1"}'
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
  ('Style Design', '/clients/style-design.webp', '', 4),
  ('Samir William', '/clients/samir-william.png', '', 5),
  ('VS', '/clients/vs.png', '', 6),
  ('Clinic One Day', '/clients/clinic-one-day.png', '', 7),
  ('Sheraton Cairo Hotel & Casino', '/clients/sheraton-cairo.png', '', 8),
  ('Redcon Properties', '/clients/redcon-properties.png', '', 9),
  ('New Giza', '/clients/new-giza.png', '', 10),
  ('Crimson Bar and Grill', '/clients/crimson.png', '', 11),
  ('Brown Nose', '/clients/specialty-coffee.png', '', 12),
  ('Shanawany Group', '/clients/shanawany-group.png', '', 13),
  ('Italian Hospital Umberto I Cairo', '/clients/italian-hospital-cairo.png', '', 14),
  ('SECON', '/clients/secon.png', '', 15),
  ('Four Seasons Hotel Cairo at Nile Plaza', '/clients/four-seasons-cairo.png', '', 16),
  ('Playa', '/clients/playa.png', '', 17),
  ('The Courtyard', '/clients/the-courtyard.png', '', 18),
  ('Fifty One West', '/clients/fifty-one-west.png', '', 19);
