-- The company's real projects (from its projects list), replacing the demo ones. Their photos are
-- bundled in public/project-photos/<slug>/; each project, photo and cover can be changed or removed
-- afterwards in Admin -> Projects.
--
-- The demo projects and the demo news posts written about them are removed (only those exact slugs,
-- so anything added in the admin stays).
DELETE FROM `news_posts` WHERE `slug` IN ('new-cairo-medical-centre-awarded', 'october-gardens-progress-roof', 'october-gardens-progress-basement', 'october-gardens-started', 'october-gardens-awarded', 'nile-business-tower-complete', 'nile-business-tower-progress', 'nile-business-tower-started', 'nile-business-tower-awarded', 'delta-logistics-hub-complete', 'safety-certification-iso-45001', 'hiring-site-engineers', 'draft-palm-hills-handover');
--> statement-breakpoint
DELETE FROM `project_media` WHERE `project_id` IN (SELECT `id` FROM `projects` WHERE `slug` IN ('palm-hills-villa', 'nile-business-tower', 'delta-logistics-hub', 'zamalek-apartment-renovation', 'october-gardens-residences', 'new-cairo-medical-centre'));
--> statement-breakpoint
DELETE FROM `projects` WHERE `slug` IN ('palm-hills-villa', 'nile-business-tower', 'delta-logistics-hub', 'zamalek-apartment-renovation', 'october-gardens-residences', 'new-cairo-medical-centre');
--> statement-breakpoint
INSERT INTO `projects` (`slug`, `title`, `summary`, `body`, `category`, `location`, `client`, `specs`, `highlights`, `cover_key`, `status`, `featured`, `published`, `sort_order`) VALUES
  ('samir-william-stores', 'Samir William Stores', 'Supply and installation of HVAC, low-current (LC), plumbing and electrical systems for the Samir William stores.', 'MCC supplied and installed the HVAC, low-current (LC), plumbing and electrical systems for the Samir William stores, owned by Mr. Sameh William.

The consultant on the project was MCC Consulting Office.', 'Commercial', '', '', 'Owner: Mr. Sameh William
Consultant: MCC Consulting Office
Scope: Supply and installation', 'HVAC systems
Low-current (LC) systems
Plumbing systems
Electrical systems', '/project-photos/samir-william-stores/001.webp', 'completed', 1, 1, 1),
  ('samir-william-head-office', 'Samir William Head Office', 'Supply and installation of HVAC, low-current (LC), plumbing and electrical systems for the Samir William head office.', 'MCC supplied and installed the HVAC, low-current (LC), plumbing and electrical systems for the Samir William head office, owned by Mr. Sameh William.

The consultant on the project was MCC Consulting Office.', 'Commercial', '', '', 'Owner: Mr. Sameh William
Consultant: MCC Consulting Office
Scope: Supply and installation', 'HVAC systems
Low-current (LC) systems
Plumbing systems
Electrical systems', '/project-photos/samir-william-head-office/001.webp', 'completed', 0, 1, 2),
  ('light-logistics-head-office', 'Light Logistics Head Office', 'Supply and installation of HVAC, low-current (LC), plumbing and electrical systems for the Light Logistics head office.', 'MCC supplied and installed the HVAC, low-current (LC), plumbing and electrical systems for the Light Logistics head office, owned by Mr. Beshoy Maher.

The consultant on the project was MCC Consulting Office.', 'Commercial', '', '', 'Owner: Mr. Beshoy Maher
Consultant: MCC Consulting Office
Scope: Supply and installation', 'HVAC systems
Low-current (LC) systems
Plumbing systems
Electrical systems', '/project-photos/light-logistics-head-office/001.webp', 'completed', 0, 1, 3),
  ('tarek-abu-el-enen-4s', 'Mr. Tarek Abu El enen (4S)', 'Supply and installation of HVAC, fire fighting and plumbing systems for Mr. Tarek Abu El enen''s 4S project.', 'MCC supplied and installed the HVAC, fire fighting and plumbing systems for Mr. Tarek Abu El enen''s 4S project, owned by Mr. Tarek Abu El enen. The main contractor was STYLE DESIGN.

The consultant on the project was DARNOAMA.', 'Residential', '', '', 'Owner: Mr. Tarek Abu El enen
Main contractor: STYLE DESIGN
Consultant: DARNOAMA
Scope: Supply and installation', 'HVAC systems
Fire fighting systems
Plumbing systems', '/project-photos/tarek-abu-el-enen-4s/001.webp', 'completed', 1, 1, 4),
  ('astra-factory-egypt', 'ASTRA Factory Egypt', 'Supply and installation of ventilation systems for the ASTRA factory in Egypt.', 'MCC supplied and installed the ventilation systems for the ASTRA factory in Egypt, owned by Mr. Ayman Shaheen.

The consultant on the project was MCC Consulting Office.', 'Industrial', '', '', 'Owner: Mr. Ayman Shaheen
Consultant: MCC Consulting Office
Scope: Supply and installation', 'Ventilation systems', '/project-photos/astra-factory-egypt/001.webp', 'completed', 0, 1, 5),
  ('al-ahly-mortgage-finance', 'Al Ahly Mortgage Finance', 'Supply and installation of HVAC systems for the Al Ahly Mortgage Finance offices.', 'MCC supplied and installed the HVAC systems for the Al Ahly Mortgage Finance offices, owned by National Bank of Egypt. The main contractor was AMIR GAD AG.

The consultant on the project was HG Design Office.', 'Commercial', '', '', 'Owner: National Bank of Egypt
Main contractor: AMIR GAD AG
Consultant: HG Design Office
Scope: Supply and installation', 'HVAC systems', '/project-photos/al-ahly-mortgage-finance/001.webp', 'completed', 1, 1, 6),
  ('qatamya-dunes-villa-368', 'Qatamya Dunes Villa 368', 'Supply and installation of HVAC, low-current (LC), plumbing and electrical systems for villa 368 in Qatamya Dunes.', 'MCC supplied and installed the HVAC, low-current (LC), plumbing and electrical systems for villa 368 in Qatamya Dunes, owned by Mr. Sameh William.

The consultant on the project was MCC Consulting Office.', 'Residential', 'Qatamya Dunes, New Cairo', '', 'Owner: Mr. Sameh William
Consultant: MCC Consulting Office
Scope: Supply and installation', 'HVAC systems
Low-current (LC) systems
Plumbing systems
Electrical systems', '/project-photos/qatamya-dunes-villa-368/001.webp', 'completed', 0, 1, 7),
  ('qatamya-dunes-villa-158', 'Qatamya Dunes Villa 158', 'Supply and installation of HVAC, low-current (LC), plumbing and electrical systems for villa 158 in Qatamya Dunes.', 'MCC supplied and installed the HVAC, low-current (LC), plumbing and electrical systems for villa 158 in Qatamya Dunes, owned by Mrs. Abeer Sherif.

The consultant on the project was MCC Consulting Office.', 'Residential', 'Qatamya Dunes, New Cairo', '', 'Owner: Mrs. Abeer Sherif
Consultant: MCC Consulting Office
Scope: Supply and installation', 'HVAC systems
Low-current (LC) systems
Plumbing systems
Electrical systems', '/project-photos/qatamya-dunes-villa-158/001.webp', 'completed', 0, 1, 8),
  ('qatamya-dunes-villa-192', 'Qatamya Dunes Villa 192', 'Supply and installation of HVAC, low-current (LC), plumbing and electrical systems for villa 192 in Qatamya Dunes.', 'MCC supplied and installed the HVAC, low-current (LC), plumbing and electrical systems for villa 192 in Qatamya Dunes, owned by Mr. Sherif Ziada.

The consultant on the project was MCC Consulting Office.', 'Residential', 'Qatamya Dunes, New Cairo', '', 'Owner: Mr. Sherif Ziada
Consultant: MCC Consulting Office
Scope: Supply and installation', 'HVAC systems
Low-current (LC) systems
Plumbing systems
Electrical systems', '/project-photos/qatamya-dunes-villa-192/001.webp', 'completed', 0, 1, 9),
  ('voss-exotics-showroom', 'VOSS Exotics Showroom', 'Supply and installation of HVAC systems for the VOSS Exotics showroom.', 'MCC supplied and installed the HVAC systems for the VOSS Exotics showroom, owned by Mr. Ahmed El Hadad.

The consultant on the project was MAD Studio.', 'Commercial', '', '', 'Owner: Mr. Ahmed El Hadad
Consultant: MAD Studio
Scope: Supply and installation', 'HVAC systems', '/project-photos/voss-exotics-showroom/001.webp', 'completed', 1, 1, 10);
--> statement-breakpoint
INSERT INTO `project_media` (`project_id`, `type`, `key`, `thumb_key`, `width`, `height`, `alt`, `sort_order`) VALUES
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-stores'), 'image', '/project-photos/samir-william-stores/001.webp', '/project-photos/samir-william-stores/001-thumb.webp', 1280, 960, 'Samir William Stores', 1),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-stores'), 'image', '/project-photos/samir-william-stores/002.webp', '/project-photos/samir-william-stores/002-thumb.webp', 1280, 960, 'Samir William Stores', 2),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-stores'), 'image', '/project-photos/samir-william-stores/003.webp', '/project-photos/samir-william-stores/003-thumb.webp', 1280, 960, 'Samir William Stores', 3),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-stores'), 'image', '/project-photos/samir-william-stores/004.webp', '/project-photos/samir-william-stores/004-thumb.webp', 1280, 960, 'Samir William Stores', 4),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-stores'), 'image', '/project-photos/samir-william-stores/005.webp', '/project-photos/samir-william-stores/005-thumb.webp', 1280, 960, 'Samir William Stores', 5),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-stores'), 'image', '/project-photos/samir-william-stores/006.webp', '/project-photos/samir-william-stores/006-thumb.webp', 1280, 960, 'Samir William Stores', 6),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-stores'), 'image', '/project-photos/samir-william-stores/007.webp', '/project-photos/samir-william-stores/007-thumb.webp', 1600, 1200, 'Samir William Stores', 7),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-stores'), 'image', '/project-photos/samir-william-stores/008.webp', '/project-photos/samir-william-stores/008-thumb.webp', 1600, 1200, 'Samir William Stores', 8),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-stores'), 'image', '/project-photos/samir-william-stores/009.webp', '/project-photos/samir-william-stores/009-thumb.webp', 1600, 1200, 'Samir William Stores', 9),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-stores'), 'image', '/project-photos/samir-william-stores/010.webp', '/project-photos/samir-william-stores/010-thumb.webp', 1200, 1600, 'Samir William Stores', 10),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-stores'), 'image', '/project-photos/samir-william-stores/011.webp', '/project-photos/samir-william-stores/011-thumb.webp', 1200, 1600, 'Samir William Stores', 11),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-stores'), 'image', '/project-photos/samir-william-stores/012.webp', '/project-photos/samir-william-stores/012-thumb.webp', 1600, 1200, 'Samir William Stores', 12),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-stores'), 'image', '/project-photos/samir-william-stores/013.webp', '/project-photos/samir-william-stores/013-thumb.webp', 1200, 1600, 'Samir William Stores', 13),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-stores'), 'image', '/project-photos/samir-william-stores/014.webp', '/project-photos/samir-william-stores/014-thumb.webp', 1600, 1200, 'Samir William Stores', 14),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-stores'), 'image', '/project-photos/samir-william-stores/015.webp', '/project-photos/samir-william-stores/015-thumb.webp', 1200, 1600, 'Samir William Stores', 15);
--> statement-breakpoint
INSERT INTO `project_media` (`project_id`, `type`, `key`, `thumb_key`, `width`, `height`, `alt`, `sort_order`) VALUES
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-head-office'), 'image', '/project-photos/samir-william-head-office/001.webp', '/project-photos/samir-william-head-office/001-thumb.webp', 1496, 1496, 'Samir William Head Office', 1),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-head-office'), 'image', '/project-photos/samir-william-head-office/002.webp', '/project-photos/samir-william-head-office/002-thumb.webp', 1496, 1496, 'Samir William Head Office', 2),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-head-office'), 'image', '/project-photos/samir-william-head-office/003.webp', '/project-photos/samir-william-head-office/003-thumb.webp', 900, 1600, 'Samir William Head Office', 3),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-head-office'), 'image', '/project-photos/samir-william-head-office/004.webp', '/project-photos/samir-william-head-office/004-thumb.webp', 900, 1600, 'Samir William Head Office', 4),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-head-office'), 'image', '/project-photos/samir-william-head-office/005.webp', '/project-photos/samir-william-head-office/005-thumb.webp', 900, 1600, 'Samir William Head Office', 5),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-head-office'), 'image', '/project-photos/samir-william-head-office/006.webp', '/project-photos/samir-william-head-office/006-thumb.webp', 900, 1600, 'Samir William Head Office', 6),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-head-office'), 'image', '/project-photos/samir-william-head-office/007.webp', '/project-photos/samir-william-head-office/007-thumb.webp', 900, 1600, 'Samir William Head Office', 7),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'samir-william-head-office'), 'image', '/project-photos/samir-william-head-office/008.webp', '/project-photos/samir-william-head-office/008-thumb.webp', 900, 1600, 'Samir William Head Office', 8);
--> statement-breakpoint
INSERT INTO `project_media` (`project_id`, `type`, `key`, `thumb_key`, `width`, `height`, `alt`, `sort_order`) VALUES
  ((SELECT `id` FROM `projects` WHERE `slug` = 'light-logistics-head-office'), 'image', '/project-photos/light-logistics-head-office/001.webp', '/project-photos/light-logistics-head-office/001-thumb.webp', 1244, 655, 'Light Logistics Head Office', 1);
--> statement-breakpoint
INSERT INTO `project_media` (`project_id`, `type`, `key`, `thumb_key`, `width`, `height`, `alt`, `sort_order`) VALUES
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/001.webp', '/project-photos/tarek-abu-el-enen-4s/001-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 1),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/002.webp', '/project-photos/tarek-abu-el-enen-4s/002-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 2),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/003.webp', '/project-photos/tarek-abu-el-enen-4s/003-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 3),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/004.webp', '/project-photos/tarek-abu-el-enen-4s/004-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 4),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/005.webp', '/project-photos/tarek-abu-el-enen-4s/005-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 5),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/006.webp', '/project-photos/tarek-abu-el-enen-4s/006-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 6),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/007.webp', '/project-photos/tarek-abu-el-enen-4s/007-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 7),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/008.webp', '/project-photos/tarek-abu-el-enen-4s/008-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 8),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/009.webp', '/project-photos/tarek-abu-el-enen-4s/009-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 9),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/010.webp', '/project-photos/tarek-abu-el-enen-4s/010-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 10),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/011.webp', '/project-photos/tarek-abu-el-enen-4s/011-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 11),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/012.webp', '/project-photos/tarek-abu-el-enen-4s/012-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 12),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/013.webp', '/project-photos/tarek-abu-el-enen-4s/013-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 13),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/014.webp', '/project-photos/tarek-abu-el-enen-4s/014-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 14),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/015.webp', '/project-photos/tarek-abu-el-enen-4s/015-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 15),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/016.webp', '/project-photos/tarek-abu-el-enen-4s/016-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 16),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/017.webp', '/project-photos/tarek-abu-el-enen-4s/017-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 17),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/018.webp', '/project-photos/tarek-abu-el-enen-4s/018-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 18),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/019.webp', '/project-photos/tarek-abu-el-enen-4s/019-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 19),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/020.webp', '/project-photos/tarek-abu-el-enen-4s/020-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 20),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/021.webp', '/project-photos/tarek-abu-el-enen-4s/021-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 21),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/022.webp', '/project-photos/tarek-abu-el-enen-4s/022-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 22),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/023.webp', '/project-photos/tarek-abu-el-enen-4s/023-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 23),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/024.webp', '/project-photos/tarek-abu-el-enen-4s/024-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 24),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/025.webp', '/project-photos/tarek-abu-el-enen-4s/025-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 25),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/026.webp', '/project-photos/tarek-abu-el-enen-4s/026-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 26),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/027.webp', '/project-photos/tarek-abu-el-enen-4s/027-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 27),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/028.webp', '/project-photos/tarek-abu-el-enen-4s/028-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 28),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/029.webp', '/project-photos/tarek-abu-el-enen-4s/029-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 29),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/030.webp', '/project-photos/tarek-abu-el-enen-4s/030-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 30),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/031.webp', '/project-photos/tarek-abu-el-enen-4s/031-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 31),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/032.webp', '/project-photos/tarek-abu-el-enen-4s/032-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 32),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/033.webp', '/project-photos/tarek-abu-el-enen-4s/033-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 33),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/034.webp', '/project-photos/tarek-abu-el-enen-4s/034-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 34),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/035.webp', '/project-photos/tarek-abu-el-enen-4s/035-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 35),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/036.webp', '/project-photos/tarek-abu-el-enen-4s/036-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 36),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/037.webp', '/project-photos/tarek-abu-el-enen-4s/037-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 37),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/038.webp', '/project-photos/tarek-abu-el-enen-4s/038-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 38),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/039.webp', '/project-photos/tarek-abu-el-enen-4s/039-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 39),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/040.webp', '/project-photos/tarek-abu-el-enen-4s/040-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 40),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/041.webp', '/project-photos/tarek-abu-el-enen-4s/041-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 41),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/042.webp', '/project-photos/tarek-abu-el-enen-4s/042-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 42),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/043.webp', '/project-photos/tarek-abu-el-enen-4s/043-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 43),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/044.webp', '/project-photos/tarek-abu-el-enen-4s/044-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 44),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/045.webp', '/project-photos/tarek-abu-el-enen-4s/045-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 45),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/046.webp', '/project-photos/tarek-abu-el-enen-4s/046-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 46),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/047.webp', '/project-photos/tarek-abu-el-enen-4s/047-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 47),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/048.webp', '/project-photos/tarek-abu-el-enen-4s/048-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 48),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/049.webp', '/project-photos/tarek-abu-el-enen-4s/049-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 49),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/050.webp', '/project-photos/tarek-abu-el-enen-4s/050-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 50),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/051.webp', '/project-photos/tarek-abu-el-enen-4s/051-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 51),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/052.webp', '/project-photos/tarek-abu-el-enen-4s/052-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 52),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/053.webp', '/project-photos/tarek-abu-el-enen-4s/053-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 53),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/054.webp', '/project-photos/tarek-abu-el-enen-4s/054-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 54),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/055.webp', '/project-photos/tarek-abu-el-enen-4s/055-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 55),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/056.webp', '/project-photos/tarek-abu-el-enen-4s/056-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 56),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/057.webp', '/project-photos/tarek-abu-el-enen-4s/057-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 57),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/058.webp', '/project-photos/tarek-abu-el-enen-4s/058-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 58),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/059.webp', '/project-photos/tarek-abu-el-enen-4s/059-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 59),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/060.webp', '/project-photos/tarek-abu-el-enen-4s/060-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 60),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/061.webp', '/project-photos/tarek-abu-el-enen-4s/061-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 61),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/062.webp', '/project-photos/tarek-abu-el-enen-4s/062-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 62),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/063.webp', '/project-photos/tarek-abu-el-enen-4s/063-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 63),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/064.webp', '/project-photos/tarek-abu-el-enen-4s/064-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 64),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/065.webp', '/project-photos/tarek-abu-el-enen-4s/065-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 65),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/066.webp', '/project-photos/tarek-abu-el-enen-4s/066-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 66),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/067.webp', '/project-photos/tarek-abu-el-enen-4s/067-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 67),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/068.webp', '/project-photos/tarek-abu-el-enen-4s/068-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 68),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/069.webp', '/project-photos/tarek-abu-el-enen-4s/069-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 69),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/070.webp', '/project-photos/tarek-abu-el-enen-4s/070-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 70),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/071.webp', '/project-photos/tarek-abu-el-enen-4s/071-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 71),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/072.webp', '/project-photos/tarek-abu-el-enen-4s/072-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 72),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/073.webp', '/project-photos/tarek-abu-el-enen-4s/073-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 73),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/074.webp', '/project-photos/tarek-abu-el-enen-4s/074-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 74),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/075.webp', '/project-photos/tarek-abu-el-enen-4s/075-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 75),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/076.webp', '/project-photos/tarek-abu-el-enen-4s/076-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 76),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/077.webp', '/project-photos/tarek-abu-el-enen-4s/077-thumb.webp', 719, 1280, 'Mr. Tarek Abu El enen (4S)', 77),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/078.webp', '/project-photos/tarek-abu-el-enen-4s/078-thumb.webp', 719, 1280, 'Mr. Tarek Abu El enen (4S)', 78),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/079.webp', '/project-photos/tarek-abu-el-enen-4s/079-thumb.webp', 719, 1280, 'Mr. Tarek Abu El enen (4S)', 79),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/080.webp', '/project-photos/tarek-abu-el-enen-4s/080-thumb.webp', 719, 1280, 'Mr. Tarek Abu El enen (4S)', 80),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/081.webp', '/project-photos/tarek-abu-el-enen-4s/081-thumb.webp', 719, 1280, 'Mr. Tarek Abu El enen (4S)', 81),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/082.webp', '/project-photos/tarek-abu-el-enen-4s/082-thumb.webp', 1280, 1261, 'Mr. Tarek Abu El enen (4S)', 82),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/083.webp', '/project-photos/tarek-abu-el-enen-4s/083-thumb.webp', 1280, 719, 'Mr. Tarek Abu El enen (4S)', 83),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/084.webp', '/project-photos/tarek-abu-el-enen-4s/084-thumb.webp', 1280, 719, 'Mr. Tarek Abu El enen (4S)', 84),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/085.webp', '/project-photos/tarek-abu-el-enen-4s/085-thumb.webp', 1280, 719, 'Mr. Tarek Abu El enen (4S)', 85),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/086.webp', '/project-photos/tarek-abu-el-enen-4s/086-thumb.webp', 720, 1280, 'Mr. Tarek Abu El enen (4S)', 86),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/087.webp', '/project-photos/tarek-abu-el-enen-4s/087-thumb.webp', 720, 1280, 'Mr. Tarek Abu El enen (4S)', 87),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/088.webp', '/project-photos/tarek-abu-el-enen-4s/088-thumb.webp', 719, 1280, 'Mr. Tarek Abu El enen (4S)', 88),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/089.webp', '/project-photos/tarek-abu-el-enen-4s/089-thumb.webp', 720, 1280, 'Mr. Tarek Abu El enen (4S)', 89),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/090.webp', '/project-photos/tarek-abu-el-enen-4s/090-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 90),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/091.webp', '/project-photos/tarek-abu-el-enen-4s/091-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 91),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/092.webp', '/project-photos/tarek-abu-el-enen-4s/092-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 92),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/093.webp', '/project-photos/tarek-abu-el-enen-4s/093-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 93),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/094.webp', '/project-photos/tarek-abu-el-enen-4s/094-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 94),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/095.webp', '/project-photos/tarek-abu-el-enen-4s/095-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 95),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/096.webp', '/project-photos/tarek-abu-el-enen-4s/096-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 96),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/097.webp', '/project-photos/tarek-abu-el-enen-4s/097-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 97),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/098.webp', '/project-photos/tarek-abu-el-enen-4s/098-thumb.webp', 1280, 960, 'Mr. Tarek Abu El enen (4S)', 98),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/099.webp', '/project-photos/tarek-abu-el-enen-4s/099-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 99),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'tarek-abu-el-enen-4s'), 'image', '/project-photos/tarek-abu-el-enen-4s/100.webp', '/project-photos/tarek-abu-el-enen-4s/100-thumb.webp', 960, 1280, 'Mr. Tarek Abu El enen (4S)', 100);
--> statement-breakpoint
INSERT INTO `project_media` (`project_id`, `type`, `key`, `thumb_key`, `width`, `height`, `alt`, `sort_order`) VALUES
  ((SELECT `id` FROM `projects` WHERE `slug` = 'astra-factory-egypt'), 'image', '/project-photos/astra-factory-egypt/001.webp', '/project-photos/astra-factory-egypt/001-thumb.webp', 1600, 1200, 'ASTRA Factory Egypt', 1);
--> statement-breakpoint
INSERT INTO `project_media` (`project_id`, `type`, `key`, `thumb_key`, `width`, `height`, `alt`, `sort_order`) VALUES
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/001.webp', '/project-photos/al-ahly-mortgage-finance/001-thumb.webp', 1288, 966, 'Al Ahly Mortgage Finance', 1),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/002.webp', '/project-photos/al-ahly-mortgage-finance/002-thumb.webp', 1600, 1200, 'Al Ahly Mortgage Finance', 2),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/003.webp', '/project-photos/al-ahly-mortgage-finance/003-thumb.webp', 1600, 1200, 'Al Ahly Mortgage Finance', 3),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/004.webp', '/project-photos/al-ahly-mortgage-finance/004-thumb.webp', 1600, 1200, 'Al Ahly Mortgage Finance', 4),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/005.webp', '/project-photos/al-ahly-mortgage-finance/005-thumb.webp', 1200, 1600, 'Al Ahly Mortgage Finance', 5),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/006.webp', '/project-photos/al-ahly-mortgage-finance/006-thumb.webp', 1288, 966, 'Al Ahly Mortgage Finance', 6),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/007.webp', '/project-photos/al-ahly-mortgage-finance/007-thumb.webp', 1288, 966, 'Al Ahly Mortgage Finance', 7),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/008.webp', '/project-photos/al-ahly-mortgage-finance/008-thumb.webp', 1288, 966, 'Al Ahly Mortgage Finance', 8),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/009.webp', '/project-photos/al-ahly-mortgage-finance/009-thumb.webp', 1280, 960, 'Al Ahly Mortgage Finance', 9),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/010.webp', '/project-photos/al-ahly-mortgage-finance/010-thumb.webp', 1600, 1200, 'Al Ahly Mortgage Finance', 10),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/011.webp', '/project-photos/al-ahly-mortgage-finance/011-thumb.webp', 1288, 966, 'Al Ahly Mortgage Finance', 11),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/012.webp', '/project-photos/al-ahly-mortgage-finance/012-thumb.webp', 1288, 966, 'Al Ahly Mortgage Finance', 12),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/013.webp', '/project-photos/al-ahly-mortgage-finance/013-thumb.webp', 1288, 966, 'Al Ahly Mortgage Finance', 13),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/014.webp', '/project-photos/al-ahly-mortgage-finance/014-thumb.webp', 1288, 966, 'Al Ahly Mortgage Finance', 14),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/015.webp', '/project-photos/al-ahly-mortgage-finance/015-thumb.webp', 966, 1288, 'Al Ahly Mortgage Finance', 15),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/016.webp', '/project-photos/al-ahly-mortgage-finance/016-thumb.webp', 1600, 1200, 'Al Ahly Mortgage Finance', 16),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/017.webp', '/project-photos/al-ahly-mortgage-finance/017-thumb.webp', 1600, 1200, 'Al Ahly Mortgage Finance', 17),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/018.webp', '/project-photos/al-ahly-mortgage-finance/018-thumb.webp', 1280, 960, 'Al Ahly Mortgage Finance', 18),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/019.webp', '/project-photos/al-ahly-mortgage-finance/019-thumb.webp', 1288, 966, 'Al Ahly Mortgage Finance', 19),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/020.webp', '/project-photos/al-ahly-mortgage-finance/020-thumb.webp', 960, 1280, 'Al Ahly Mortgage Finance', 20),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/021.webp', '/project-photos/al-ahly-mortgage-finance/021-thumb.webp', 1288, 966, 'Al Ahly Mortgage Finance', 21),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/022.webp', '/project-photos/al-ahly-mortgage-finance/022-thumb.webp', 1600, 1200, 'Al Ahly Mortgage Finance', 22),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/023.webp', '/project-photos/al-ahly-mortgage-finance/023-thumb.webp', 1200, 1600, 'Al Ahly Mortgage Finance', 23),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/024.webp', '/project-photos/al-ahly-mortgage-finance/024-thumb.webp', 1600, 1200, 'Al Ahly Mortgage Finance', 24),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/025.webp', '/project-photos/al-ahly-mortgage-finance/025-thumb.webp', 1288, 966, 'Al Ahly Mortgage Finance', 25),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/026.webp', '/project-photos/al-ahly-mortgage-finance/026-thumb.webp', 1600, 1200, 'Al Ahly Mortgage Finance', 26),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'al-ahly-mortgage-finance'), 'image', '/project-photos/al-ahly-mortgage-finance/027.webp', '/project-photos/al-ahly-mortgage-finance/027-thumb.webp', 1600, 1200, 'Al Ahly Mortgage Finance', 27);
--> statement-breakpoint
INSERT INTO `project_media` (`project_id`, `type`, `key`, `thumb_key`, `width`, `height`, `alt`, `sort_order`) VALUES
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-368'), 'image', '/project-photos/qatamya-dunes-villa-368/001.webp', '/project-photos/qatamya-dunes-villa-368/001-thumb.webp', 1496, 1496, 'Qatamya Dunes Villa 368', 1),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-368'), 'image', '/project-photos/qatamya-dunes-villa-368/002.webp', '/project-photos/qatamya-dunes-villa-368/002-thumb.webp', 1496, 1496, 'Qatamya Dunes Villa 368', 2),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-368'), 'image', '/project-photos/qatamya-dunes-villa-368/003.webp', '/project-photos/qatamya-dunes-villa-368/003-thumb.webp', 1496, 1496, 'Qatamya Dunes Villa 368', 3),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-368'), 'image', '/project-photos/qatamya-dunes-villa-368/004.webp', '/project-photos/qatamya-dunes-villa-368/004-thumb.webp', 1496, 1496, 'Qatamya Dunes Villa 368', 4),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-368'), 'image', '/project-photos/qatamya-dunes-villa-368/005.webp', '/project-photos/qatamya-dunes-villa-368/005-thumb.webp', 1496, 1496, 'Qatamya Dunes Villa 368', 5),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-368'), 'image', '/project-photos/qatamya-dunes-villa-368/006.webp', '/project-photos/qatamya-dunes-villa-368/006-thumb.webp', 1496, 1496, 'Qatamya Dunes Villa 368', 6),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-368'), 'image', '/project-photos/qatamya-dunes-villa-368/007.webp', '/project-photos/qatamya-dunes-villa-368/007-thumb.webp', 1496, 1496, 'Qatamya Dunes Villa 368', 7);
--> statement-breakpoint
INSERT INTO `project_media` (`project_id`, `type`, `key`, `thumb_key`, `width`, `height`, `alt`, `sort_order`) VALUES
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-158'), 'image', '/project-photos/qatamya-dunes-villa-158/001.webp', '/project-photos/qatamya-dunes-villa-158/001-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 158', 1),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-158'), 'image', '/project-photos/qatamya-dunes-villa-158/002.webp', '/project-photos/qatamya-dunes-villa-158/002-thumb.webp', 960, 1280, 'Qatamya Dunes Villa 158', 2),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-158'), 'image', '/project-photos/qatamya-dunes-villa-158/003.webp', '/project-photos/qatamya-dunes-villa-158/003-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 158', 3),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-158'), 'image', '/project-photos/qatamya-dunes-villa-158/004.webp', '/project-photos/qatamya-dunes-villa-158/004-thumb.webp', 737, 1600, 'Qatamya Dunes Villa 158', 4),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-158'), 'image', '/project-photos/qatamya-dunes-villa-158/005.webp', '/project-photos/qatamya-dunes-villa-158/005-thumb.webp', 1280, 1280, 'Qatamya Dunes Villa 158', 5),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-158'), 'image', '/project-photos/qatamya-dunes-villa-158/006.webp', '/project-photos/qatamya-dunes-villa-158/006-thumb.webp', 1280, 1280, 'Qatamya Dunes Villa 158', 6),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-158'), 'image', '/project-photos/qatamya-dunes-villa-158/007.webp', '/project-photos/qatamya-dunes-villa-158/007-thumb.webp', 1496, 1496, 'Qatamya Dunes Villa 158', 7),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-158'), 'image', '/project-photos/qatamya-dunes-villa-158/008.webp', '/project-photos/qatamya-dunes-villa-158/008-thumb.webp', 1496, 1496, 'Qatamya Dunes Villa 158', 8),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-158'), 'image', '/project-photos/qatamya-dunes-villa-158/009.webp', '/project-photos/qatamya-dunes-villa-158/009-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 158', 9),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-158'), 'image', '/project-photos/qatamya-dunes-villa-158/010.webp', '/project-photos/qatamya-dunes-villa-158/010-thumb.webp', 1200, 1600, 'Qatamya Dunes Villa 158', 10),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-158'), 'image', '/project-photos/qatamya-dunes-villa-158/011.webp', '/project-photos/qatamya-dunes-villa-158/011-thumb.webp', 1496, 1496, 'Qatamya Dunes Villa 158', 11),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-158'), 'image', '/project-photos/qatamya-dunes-villa-158/012.webp', '/project-photos/qatamya-dunes-villa-158/012-thumb.webp', 1200, 1600, 'Qatamya Dunes Villa 158', 12),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-158'), 'image', '/project-photos/qatamya-dunes-villa-158/013.webp', '/project-photos/qatamya-dunes-villa-158/013-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 158', 13),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-158'), 'image', '/project-photos/qatamya-dunes-villa-158/014.webp', '/project-photos/qatamya-dunes-villa-158/014-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 158', 14),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-158'), 'image', '/project-photos/qatamya-dunes-villa-158/015.webp', '/project-photos/qatamya-dunes-villa-158/015-thumb.webp', 1496, 1496, 'Qatamya Dunes Villa 158', 15),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-158'), 'image', '/project-photos/qatamya-dunes-villa-158/016.webp', '/project-photos/qatamya-dunes-villa-158/016-thumb.webp', 1496, 1496, 'Qatamya Dunes Villa 158', 16);
--> statement-breakpoint
INSERT INTO `project_media` (`project_id`, `type`, `key`, `thumb_key`, `width`, `height`, `alt`, `sort_order`) VALUES
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/001.webp', '/project-photos/qatamya-dunes-villa-192/001-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 1),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/002.webp', '/project-photos/qatamya-dunes-villa-192/002-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 2),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/003.webp', '/project-photos/qatamya-dunes-villa-192/003-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 3),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/004.webp', '/project-photos/qatamya-dunes-villa-192/004-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 4),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/005.webp', '/project-photos/qatamya-dunes-villa-192/005-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 5),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/006.webp', '/project-photos/qatamya-dunes-villa-192/006-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 6),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/007.webp', '/project-photos/qatamya-dunes-villa-192/007-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 7),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/008.webp', '/project-photos/qatamya-dunes-villa-192/008-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 8),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/009.webp', '/project-photos/qatamya-dunes-villa-192/009-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 9),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/010.webp', '/project-photos/qatamya-dunes-villa-192/010-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 10),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/011.webp', '/project-photos/qatamya-dunes-villa-192/011-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 11),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/012.webp', '/project-photos/qatamya-dunes-villa-192/012-thumb.webp', 1200, 1600, 'Qatamya Dunes Villa 192', 12),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/013.webp', '/project-photos/qatamya-dunes-villa-192/013-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 13),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/014.webp', '/project-photos/qatamya-dunes-villa-192/014-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 14),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/015.webp', '/project-photos/qatamya-dunes-villa-192/015-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 15),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/016.webp', '/project-photos/qatamya-dunes-villa-192/016-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 16),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/017.webp', '/project-photos/qatamya-dunes-villa-192/017-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 17),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/018.webp', '/project-photos/qatamya-dunes-villa-192/018-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 18),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/019.webp', '/project-photos/qatamya-dunes-villa-192/019-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 19),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/020.webp', '/project-photos/qatamya-dunes-villa-192/020-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 20),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/021.webp', '/project-photos/qatamya-dunes-villa-192/021-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 21),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/022.webp', '/project-photos/qatamya-dunes-villa-192/022-thumb.webp', 1200, 1600, 'Qatamya Dunes Villa 192', 22),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/023.webp', '/project-photos/qatamya-dunes-villa-192/023-thumb.webp', 1200, 1600, 'Qatamya Dunes Villa 192', 23),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/024.webp', '/project-photos/qatamya-dunes-villa-192/024-thumb.webp', 1200, 1600, 'Qatamya Dunes Villa 192', 24),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/025.webp', '/project-photos/qatamya-dunes-villa-192/025-thumb.webp', 1200, 1600, 'Qatamya Dunes Villa 192', 25),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/026.webp', '/project-photos/qatamya-dunes-villa-192/026-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 26),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/027.webp', '/project-photos/qatamya-dunes-villa-192/027-thumb.webp', 1200, 1600, 'Qatamya Dunes Villa 192', 27),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/028.webp', '/project-photos/qatamya-dunes-villa-192/028-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 28),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/029.webp', '/project-photos/qatamya-dunes-villa-192/029-thumb.webp', 1200, 1600, 'Qatamya Dunes Villa 192', 29),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/030.webp', '/project-photos/qatamya-dunes-villa-192/030-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 30),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/031.webp', '/project-photos/qatamya-dunes-villa-192/031-thumb.webp', 1200, 1600, 'Qatamya Dunes Villa 192', 31),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/032.webp', '/project-photos/qatamya-dunes-villa-192/032-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 32),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/033.webp', '/project-photos/qatamya-dunes-villa-192/033-thumb.webp', 1200, 1600, 'Qatamya Dunes Villa 192', 33),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/034.webp', '/project-photos/qatamya-dunes-villa-192/034-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 34),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/035.webp', '/project-photos/qatamya-dunes-villa-192/035-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 35),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/036.webp', '/project-photos/qatamya-dunes-villa-192/036-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 36),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/037.webp', '/project-photos/qatamya-dunes-villa-192/037-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 37),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/038.webp', '/project-photos/qatamya-dunes-villa-192/038-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 38),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/039.webp', '/project-photos/qatamya-dunes-villa-192/039-thumb.webp', 1200, 1600, 'Qatamya Dunes Villa 192', 39),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/040.webp', '/project-photos/qatamya-dunes-villa-192/040-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 40),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/041.webp', '/project-photos/qatamya-dunes-villa-192/041-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 41),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/042.webp', '/project-photos/qatamya-dunes-villa-192/042-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 42),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/043.webp', '/project-photos/qatamya-dunes-villa-192/043-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 43),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/044.webp', '/project-photos/qatamya-dunes-villa-192/044-thumb.webp', 1200, 1600, 'Qatamya Dunes Villa 192', 44),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/045.webp', '/project-photos/qatamya-dunes-villa-192/045-thumb.webp', 1200, 1600, 'Qatamya Dunes Villa 192', 45),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/046.webp', '/project-photos/qatamya-dunes-villa-192/046-thumb.webp', 1600, 1200, 'Qatamya Dunes Villa 192', 46),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'qatamya-dunes-villa-192'), 'image', '/project-photos/qatamya-dunes-villa-192/047.webp', '/project-photos/qatamya-dunes-villa-192/047-thumb.webp', 1496, 1496, 'Qatamya Dunes Villa 192', 47);
--> statement-breakpoint
INSERT INTO `project_media` (`project_id`, `type`, `key`, `thumb_key`, `width`, `height`, `alt`, `sort_order`) VALUES
  ((SELECT `id` FROM `projects` WHERE `slug` = 'voss-exotics-showroom'), 'image', '/project-photos/voss-exotics-showroom/001.webp', '/project-photos/voss-exotics-showroom/001-thumb.webp', 1600, 1200, 'VOSS Exotics Showroom', 1),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'voss-exotics-showroom'), 'image', '/project-photos/voss-exotics-showroom/002.webp', '/project-photos/voss-exotics-showroom/002-thumb.webp', 1600, 1200, 'VOSS Exotics Showroom', 2),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'voss-exotics-showroom'), 'image', '/project-photos/voss-exotics-showroom/003.webp', '/project-photos/voss-exotics-showroom/003-thumb.webp', 1600, 1200, 'VOSS Exotics Showroom', 3),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'voss-exotics-showroom'), 'image', '/project-photos/voss-exotics-showroom/004.webp', '/project-photos/voss-exotics-showroom/004-thumb.webp', 1600, 1200, 'VOSS Exotics Showroom', 4),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'voss-exotics-showroom'), 'image', '/project-photos/voss-exotics-showroom/005.webp', '/project-photos/voss-exotics-showroom/005-thumb.webp', 1600, 1200, 'VOSS Exotics Showroom', 5),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'voss-exotics-showroom'), 'image', '/project-photos/voss-exotics-showroom/006.webp', '/project-photos/voss-exotics-showroom/006-thumb.webp', 1600, 1200, 'VOSS Exotics Showroom', 6),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'voss-exotics-showroom'), 'image', '/project-photos/voss-exotics-showroom/007.webp', '/project-photos/voss-exotics-showroom/007-thumb.webp', 1600, 1200, 'VOSS Exotics Showroom', 7),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'voss-exotics-showroom'), 'image', '/project-photos/voss-exotics-showroom/008.webp', '/project-photos/voss-exotics-showroom/008-thumb.webp', 1600, 1200, 'VOSS Exotics Showroom', 8),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'voss-exotics-showroom'), 'image', '/project-photos/voss-exotics-showroom/009.webp', '/project-photos/voss-exotics-showroom/009-thumb.webp', 1600, 1200, 'VOSS Exotics Showroom', 9),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'voss-exotics-showroom'), 'image', '/project-photos/voss-exotics-showroom/010.webp', '/project-photos/voss-exotics-showroom/010-thumb.webp', 1600, 1200, 'VOSS Exotics Showroom', 10),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'voss-exotics-showroom'), 'image', '/project-photos/voss-exotics-showroom/011.webp', '/project-photos/voss-exotics-showroom/011-thumb.webp', 1600, 1200, 'VOSS Exotics Showroom', 11),
  ((SELECT `id` FROM `projects` WHERE `slug` = 'voss-exotics-showroom'), 'image', '/project-photos/voss-exotics-showroom/012.webp', '/project-photos/voss-exotics-showroom/012-thumb.webp', 1600, 1200, 'VOSS Exotics Showroom', 12);
