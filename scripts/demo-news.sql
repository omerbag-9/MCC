-- Demo news for the dev environment, covering every case the News pages handle, so the design can
-- be judged before real posts exist. Loaded by scripts/demo-photos.mjs only while there are no news
-- posts at all, so it never mixes with real ones; delete them in Admin -> News when done.
--
--   * every kind: won, started, progress, completed, general
--   * one project followed from win to handover (Nile Business Tower), one under construction with
--     several updates (October Gardens), one won and not started (New Cairo Medical Centre)
--   * with and without a photo, with and without a project, with and without a LinkedIn link
--   * a long title, a post without a summary, a long story in several paragraphs, a one-line post
--   * dates from this week back three years, and one unpublished draft (admin only)
--
-- Photos are added afterwards by demo-photos.mjs from each post's project.

-- Two unfinished demo projects. They are not listed on /projects (only completed ones are); their
-- news links to them.
INSERT OR IGNORE INTO projects (slug, title, summary, body, category, location, year, area_m2, client, status, featured, published, sort_order, specs, highlights) VALUES
  ('october-gardens-residences', 'October Gardens Residences', 'Six residential buildings around a landscaped courtyard, with 240 apartments.',
   'Design-build of six eight-storey residential buildings with a shared basement car park, landscaped courtyard and clubhouse.',
   'Residential', '6th of October City', NULL, 42000, 'October Gardens Developments', 'in_progress', 0, 1, 5,
   'Buildings: 6
Floors: G + 7
Apartments: 240
Parking: 1 basement level, 300 spaces
Status: Under construction',
   'Shared landscaped courtyard
Clubhouse and gym
Solar water heating on every roof'),
  ('new-cairo-medical-centre', 'New Cairo Medical Centre', 'A 60-clinic outpatient centre with imaging and day surgery.',
   'General contracting for a four-storey outpatient centre with an imaging department, two day-surgery theatres and a pharmacy.',
   'Commercial', 'New Cairo', NULL, 9800, 'Cairo Holdings', 'awarded', 0, 1, 6,
   'Floors: G + 3
Clinics: 60
Theatres: 2 day-surgery
Status: Contract awarded',
   '');

INSERT INTO news_posts (slug, kind, title, summary, body, project_id, posted_at, published, linkedin_post_url) VALUES
  -- New Cairo Medical Centre: just won, no photo yet
  ('new-cairo-medical-centre-awarded', 'won',
   'We have been awarded New Cairo Medical Centre',
   'Cairo Holdings has chosen us to build its 60-clinic outpatient centre in New Cairo.',
   'Cairo Holdings has awarded us the general contract for New Cairo Medical Centre, a four-storey outpatient building with 60 clinics, an imaging department and two day-surgery theatres.

Site mobilisation starts next month, and the centre is planned to open in early 2028.',
   (SELECT id FROM projects WHERE slug = 'new-cairo-medical-centre'), (unixepoch() - 4 * 86400) * 1000, 1, 'https://www.linkedin.com/'),

  -- October Gardens: won, started, two progress updates
  ('october-gardens-progress-roof', 'progress',
   'October Gardens: the last two buildings reach their roofs',
   'Buildings E and F topped out this week, eleven weeks ahead of plan.',
   'Buildings E and F of October Gardens topped out this week. All six structures are now at full height, eleven weeks ahead of the programme agreed with the client.

Facade works have started on buildings A and B, and the courtyard landscaping begins in the spring.',
   (SELECT id FROM projects WHERE slug = 'october-gardens-residences'), (unixepoch() - 12 * 86400) * 1000, 1, 'https://www.linkedin.com/'),
  ('october-gardens-progress-basement', 'progress',
   'Progress on October Gardens Residences',
   'The shared basement is complete and the first four buildings are rising.',
   '',
   (SELECT id FROM projects WHERE slug = 'october-gardens-residences'), (unixepoch() - 75 * 86400) * 1000, 1, ''),
  ('october-gardens-started', 'started',
   'Work has started on October Gardens Residences',
   'Excavation for the shared basement has begun on our 240-apartment project in 6th of October City.',
   'With permits in hand, our crews broke ground on October Gardens Residences. The first phase is the excavation and waterproofing of the shared basement car park under all six buildings.',
   (SELECT id FROM projects WHERE slug = 'october-gardens-residences'), (unixepoch() - 160 * 86400) * 1000, 1, 'https://www.linkedin.com/'),
  ('october-gardens-awarded', 'won',
   'We have been awarded October Gardens Residences',
   'Six residential buildings and 240 apartments, designed and built by our team.',
   '',
   (SELECT id FROM projects WHERE slug = 'october-gardens-residences'), (unixepoch() - 220 * 86400) * 1000, 1, ''),

  -- Nile Business Tower: the whole story, from the contract to the handover
  ('nile-business-tower-complete', 'completed',
   'Nile Business Tower is complete',
   'We have handed over the twelve-storey Grade-A office tower to Nile Developments, on schedule and on budget.',
   'After 22 months on site, Nile Business Tower has been handed over to Nile Developments. The twelve-storey tower adds 18,500 m² of Grade-A offices to the New Capital, with two basement parking levels and a full glass curtain-wall facade.

The project was delivered on the date agreed at contract, with no lost-time incidents across more than 600,000 working hours.

Thank you to the Nile Developments team, our design partners and every worker on site. The first tenants move in next month.',
   (SELECT id FROM projects WHERE slug = 'nile-business-tower'), (unixepoch() - 300 * 86400) * 1000, 1, 'https://www.linkedin.com/'),
  ('nile-business-tower-progress', 'progress',
   'Nile Business Tower: curtain wall complete',
   'The last glass panel went in on the twelfth floor.',
   '',
   (SELECT id FROM projects WHERE slug = 'nile-business-tower'), (unixepoch() - 420 * 86400) * 1000, 1, ''),
  ('nile-business-tower-started', 'started',
   'Work has started on Nile Business Tower',
   'Piling is under way for the twelve-storey tower in the New Capital.',
   '',
   (SELECT id FROM projects WHERE slug = 'nile-business-tower'), (unixepoch() - 900 * 86400) * 1000, 1, ''),
  ('nile-business-tower-awarded', 'won',
   'We have been awarded Nile Business Tower',
   'Our third project with Nile Developments: a twelve-storey Grade-A office tower.',
   '',
   (SELECT id FROM projects WHERE slug = 'nile-business-tower'), (unixepoch() - 960 * 86400) * 1000, 1, ''),

  -- A completed project with only its handover post, no LinkedIn link
  ('delta-logistics-hub-complete', 'completed',
   'Delta Logistics Hub is complete',
   'The 24,000 m² distribution centre with 40 loading docks is now operating.',
   'Delta Logistics has taken over its new distribution centre in 10th of Ramadan. The steel-frame building has a high-bay racking area, 40 dock levellers and offices for 120 staff.',
   (SELECT id FROM projects WHERE slug = 'delta-logistics-hub'), (unixepoch() - 500 * 86400) * 1000, 1, ''),

  -- Company news, not about a project: one with a long title and no summary, one short
  ('safety-certification-iso-45001', 'general',
   'MCC Construction is now certified to ISO 45001 for occupational health and safety management across all of its sites',
   '',
   'Following a six-month audit of our head office and four active sites, we have been certified to ISO 45001, the international standard for occupational health and safety management.

The certification covers our planning, site inductions, daily safety briefings and incident reporting.',
   NULL, (unixepoch() - 30 * 86400) * 1000, 1, 'https://www.linkedin.com/'),
  ('hiring-site-engineers', 'general',
   'We are hiring site engineers',
   'Join our growing team in New Cairo.',
   '',
   NULL, (unixepoch() - 45 * 86400) * 1000, 1, ''),

  -- A draft: shown in the admin only, never on the site
  ('draft-palm-hills-handover', 'completed',
   'Draft: Palm Hills Private Villa handed over',
   'Not published yet, to check that drafts stay off the site.',
   '',
   (SELECT id FROM projects WHERE slug = 'palm-hills-villa'), (unixepoch() - 2 * 86400) * 1000, 0, '');
