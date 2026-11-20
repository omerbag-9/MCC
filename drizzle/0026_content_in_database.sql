-- Every text, button and switch of Admin -> Website content now lives only in the database. Until now
-- the site showed wording written in the code (lib/content.ts) for any text not saved yet, or saved
-- empty. Those words move here once; from now on the code holds only the fields' names, and a text
-- left empty in the admin is not shown.
--
-- Texts already written in the admin are kept. A text that is missing, empty, or still an earlier
-- default wording (a quote request) gets the wording the site showed until now. Switches that were
-- never saved are on, as before. The About page's header figures, fixed in the page until now,
-- become fields here. Photos are not touched: an empty photo still means "pick one automatically".
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.projectsButton', 'View our projects') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.projectsButton'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutButton', 'Talk to our team') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutButton'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.whyTitle', 'Why clients choose {company}') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.whyTitle'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.whyIntro', 'One accountable team from the first drawing to the keys, and a site you would be proud to visit.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.whyIntro'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.servicesTitle', 'What we build') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.servicesTitle'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.servicesIntro', 'One team runs design, permits and construction, from the first drawing to the handover.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.servicesIntro'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.featuredTitle', 'Featured projects') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.featuredTitle'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.factsTitle', 'Project facts') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.factsTitle'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.factsIntro', 'The numbers behind our recent work: size, scope and what was delivered.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.factsIntro'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.homeNewsTitle', 'Latest news') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.homeNewsTitle'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.contactTitle', 'Contact us') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.contactTitle'), '') = '' OR json_extract(`content`, '$.contactTitle') IN ('Have a project in mind?'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.contactIntro', 'Send us a message and we will get back to you within one business day.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.contactIntro'), '') = '' OR json_extract(`content`, '$.contactIntro') IN ('Tell us what you''re building. We reply within one business day with next steps and a free estimate.', 'Tell us what you''re building. We reply within one business day.'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.formTitle', 'Send us a message') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.formTitle'), '') = '' OR json_extract(`content`, '$.formTitle') IN ('Request a free quote'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutPageTitle', 'Beyond contracting. Driven by engineering.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutPageTitle'), '') = '' OR json_extract(`content`, '$.aboutPageTitle') IN ('Engineers, not ordinary contractors'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutPageIntro', 'MCC is an engineering-driven contracting company specializing in electromechanical solutions and integrated construction services.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutPageIntro'), '') = '' OR json_extract(`content`, '$.aboutPageIntro') IN ('MCC is a contracting company specialized in electromechanical works and full finishing, run by engineers since 2015.'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutStoryTitle', 'About MCC') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutStoryTitle'), '') = '' OR json_extract(`content`, '$.aboutStoryTitle') IN ('Who we are'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutStory', 'Established in 2015, MCC began its journey as a specialized electromechanical contracting company, building its reputation on engineering expertise, technical precision, and commitment to quality.

Over the past three years, the company has strategically expanded its capabilities into comprehensive finishing works, broadening its scope of services and strengthening its position in the construction market.

Today, MCC is entering a new phase of growth, with a strategic vision to evolve into an integrated group of specialized companies, each bringing focused expertise and delivering complementary solutions under one unified vision.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutStory'), '') = '' OR json_extract(`content`, '$.aboutStory') IN ('Founded in 2015, MCC started in electromechanical contracting. In the last 3 years, we expanded into full finishing works.

Today, we are moving to build MCC as a group, with specialized companies under it, to deliver a different product in the market.'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutLegal', 'Limited Liability Company (LTD)') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutLegal'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutOwners', 'Eng. Karim Osama and Eng. Mohamed Abdelhakim') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutOwners'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutScope', 'Electromechanical works and comprehensive finishing works') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutScope'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutMissionTitle', 'Our mission') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutMissionTitle'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutMissionLead', 'To bring engineering excellence into every aspect of construction.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutMissionLead'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutMission', 'At MCC, engineering is not simply part of what we do; it is the foundation of how we think, plan, and execute.

We approach every project with an engineering mindset, combining technical knowledge, accurate cost analysis, precise calculations, and disciplined execution to ensure that every solution achieves its intended purpose.

Our commitment goes beyond project completion. We strive to deliver superior quality, meet project timelines, and provide reliable after-completion support and maintenance.

Our mission is to deliver projects that reflect professional standards, engineering integrity, and lasting value.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutMission'), '') = '' OR json_extract(`content`, '$.aboutMission') IN ('We are engineers working with a pure engineering background. We are not ordinary contractors, we are people who work with engineering thinking.

Our goal is to deliver high-quality work, on time, and to maintain the work after we finish it, to deliver in the end a respectable product. For every project we take on, we ensure accurate costing, precise calculations, and precise execution, to deliver the intended outcome.'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutVisionTitle', 'Our vision') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutVisionTitle'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutVisionLead', 'To become a leading engineering and contracting group recognized for its expertise, people, and quality of delivery.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutVisionLead'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutVision', 'We believe that our greatest competitive advantage lies in our people.

MCC is built around a dedicated team of engineers, most of whom are graduates of leading Egyptian public universities, bringing strong academic foundations and practical engineering experience.

With the majority of our engineering team having been part of MCC for more than a decade, we have developed a strong foundation of accumulated knowledge, professional consistency, and shared commitment.

We aim to continuously elevate our standards, expand our capabilities, and deliver projects that set a higher benchmark for quality and professionalism in the market.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutVision'), '') = '' OR json_extract(`content`, '$.aboutVision') IN ('What distinguishes MCC is our team. Most of our engineers graduated from excellent government universities, and most of them have been with the company for more than 10 years.

We work with disciplined engineering, and we aim to present work that stands out from what is available in the market.'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutValuesTitle', 'Our core values') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutValuesTitle'), '') = '' OR json_extract(`content`, '$.aboutValuesTitle') IN ('Our values'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.value1Title', 'Engineering-driven thinking') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.value1Title'), '') = '' OR json_extract(`content`, '$.value1Title') IN ('We think like engineers'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.value1Text', 'We approach construction through engineering principles, technical understanding, and systematic problem-solving. Our decisions are guided by engineering logic rather than conventional contracting practices.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.value1Text'), '') = '' OR json_extract(`content`, '$.value1Text') IN ('We are not ordinary contractors. We work with pure engineering thinking, not traditional contracting.'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.value2Title', 'Precision in every detail') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.value2Title'), '') = '' OR json_extract(`content`, '$.value2Title') IN ('We do things right'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.value2Text', 'We believe that successful projects begin with accurate planning. From cost estimation and technical calculations to procurement and execution, precision is embedded in every stage of our work.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.value2Text'), '') = '' OR json_extract(`content`, '$.value2Text') IN ('Accurate costing, precise calculations and precise execution, in every project we take on.'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.value3Title', 'Commitment beyond delivery') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.value3Title'), '') = '' OR json_extract(`content`, '$.value3Title') IN ('We deliver and we maintain'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.value3Text', 'Our responsibility does not end at project handover. We are committed to delivering quality on schedule and providing the necessary support and maintenance to ensure long-term performance.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.value3Text'), '') = '' OR json_extract(`content`, '$.value3Text') IN ('High-quality work, on time, and we maintain the work after we finish it, to deliver a respectable product.'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.value4Title', 'People are our strength') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.value4Title'), '') = '' OR json_extract(`content`, '$.value4Title') IN ('We grow with our people'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.value4Text', 'Our team is the foundation of our success. We invest in long-term professional relationships, accumulated experience, and a collaborative engineering culture that drives continuous improvement and sustainable growth.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.value4Text'), '') = '' OR json_extract(`content`, '$.value4Text') IN ('Our team is our distinction. Most of our engineers are from excellent government universities, and most of them have been with us for more than 10 years.'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutClosing', 'Engineering excellence, technical precision, commitment to quality.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutClosing'), '') = '' OR json_extract(`content`, '$.aboutClosing') IN ('Not ordinary contractors. Engineers with an engineering background.'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutPageButton', 'Talk to our team') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutPageButton'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.projectsTitle', 'Our projects') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.projectsTitle'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.projectsIntro', 'Homes, offices, warehouses and renovations we have designed and built.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.projectsIntro'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.projectsEmpty', 'Projects will be published here soon.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.projectsEmpty'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.projectAboutTitle', 'About the project') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.projectAboutTitle'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.projectOverviewTitle', 'Project overview') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.projectOverviewTitle'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.projectHighlightsTitle', 'What we delivered') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.projectHighlightsTitle'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.projectHighlightsIntro', 'The features, systems and finishes handed over on this project.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.projectHighlightsIntro'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.projectVideoTitle', 'Video tour') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.projectVideoTitle'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.projectGalleryTitle', 'Gallery') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.projectGalleryTitle'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.newsTitle', 'News') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.newsTitle'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.newsIntro', 'Contracts we have won, sites we have opened and projects we have handed over.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.newsIntro'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.newsEmpty', 'News will be published here soon.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.newsEmpty'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.newsTimelineTitle', 'Project timeline') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.newsTimelineTitle'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.contactPageTitle', 'Contact us') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.contactPageTitle'), '') = '' OR json_extract(`content`, '$.contactPageTitle') IN ('Request a quote'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.contactPageIntro', 'Send us a message and we will get back to you within one business day.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.contactPageIntro'), '') = '' OR json_extract(`content`, '$.contactPageIntro') IN ('Tell us about your project. We reply within one business day with next steps and a free estimate.', 'Tell us about your project. We reply within one business day.'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.contactDetailsTitle', 'Contact details') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.contactDetailsTitle'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.formButton', 'Send message') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.formButton'), '') = '' OR json_extract(`content`, '$.formButton') IN ('Request a free quote'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.formSuccessTitle', 'Thank you! We received your message.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.formSuccessTitle'), '') = '' OR json_extract(`content`, '$.formSuccessTitle') IN ('Thank you! We received your request.'));
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.formSuccessText', 'Our team will get back to you shortly.') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.formSuccessText'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutFact1Value', '2015') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutFact1Value'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutFact1Label', 'Established') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutFact1Label'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutFact2Value', '10+ years') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutFact2Value'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutFact2Label', 'Most of our engineers with us') WHERE `id` = 1 AND (coalesce(json_extract(`content`, '$.aboutFact2Label'), '') = '');
--> statement-breakpoint
UPDATE `settings` SET `content` = json_insert(`content`, '$.showWhy', '1', '$.showServices', '1', '$.showFeatured', '1', '$.showFacts', '1', '$.showClients', '1', '$.showNews', '1') WHERE `id` = 1;
--> statement-breakpoint
-- Saving Website content used to cut long texts at 600 characters; a text that is exactly the first
-- 600 characters of its full wording was cut that way, and gets the full wording back.
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutStory', 'Established in 2015, MCC began its journey as a specialized electromechanical contracting company, building its reputation on engineering expertise, technical precision, and commitment to quality.

Over the past three years, the company has strategically expanded its capabilities into comprehensive finishing works, broadening its scope of services and strengthening its position in the construction market.

Today, MCC is entering a new phase of growth, with a strategic vision to evolve into an integrated group of specialized companies, each bringing focused expertise and delivering complementary solutions under one unified vision.') WHERE `id` = 1 AND json_extract(`content`, '$.aboutStory') = 'Established in 2015, MCC began its journey as a specialized electromechanical contracting company, building its reputation on engineering expertise, technical precision, and commitment to quality.

Over the past three years, the company has strategically expanded its capabilities into comprehensive finishing works, broadening its scope of services and strengthening its position in the construction market.

Today, MCC is entering a new phase of growth, with a strategic vision to evolve into an integrated group of specialized companies, each bringing focused expertise and delivering complementar';
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutMission', 'At MCC, engineering is not simply part of what we do; it is the foundation of how we think, plan, and execute.

We approach every project with an engineering mindset, combining technical knowledge, accurate cost analysis, precise calculations, and disciplined execution to ensure that every solution achieves its intended purpose.

Our commitment goes beyond project completion. We strive to deliver superior quality, meet project timelines, and provide reliable after-completion support and maintenance.

Our mission is to deliver projects that reflect professional standards, engineering integrity, and lasting value.') WHERE `id` = 1 AND json_extract(`content`, '$.aboutMission') = 'At MCC, engineering is not simply part of what we do; it is the foundation of how we think, plan, and execute.

We approach every project with an engineering mindset, combining technical knowledge, accurate cost analysis, precise calculations, and disciplined execution to ensure that every solution achieves its intended purpose.

Our commitment goes beyond project completion. We strive to deliver superior quality, meet project timelines, and provide reliable after-completion support and maintenance.

Our mission is to deliver projects that reflect professional standards, engineering integrity,';
--> statement-breakpoint
UPDATE `settings` SET `content` = json_set(`content`, '$.aboutVision', 'We believe that our greatest competitive advantage lies in our people.

MCC is built around a dedicated team of engineers, most of whom are graduates of leading Egyptian public universities, bringing strong academic foundations and practical engineering experience.

With the majority of our engineering team having been part of MCC for more than a decade, we have developed a strong foundation of accumulated knowledge, professional consistency, and shared commitment.

We aim to continuously elevate our standards, expand our capabilities, and deliver projects that set a higher benchmark for quality and professionalism in the market.') WHERE `id` = 1 AND json_extract(`content`, '$.aboutVision') = 'We believe that our greatest competitive advantage lies in our people.

MCC is built around a dedicated team of engineers, most of whom are graduates of leading Egyptian public universities, bringing strong academic foundations and practical engineering experience.

With the majority of our engineering team having been part of MCC for more than a decade, we have developed a strong foundation of accumulated knowledge, professional consistency, and shared commitment.

We aim to continuously elevate our standards, expand our capabilities, and deliver projects that set a higher benchmark for quali';
