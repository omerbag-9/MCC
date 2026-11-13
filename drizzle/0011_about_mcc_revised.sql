-- The short About text on the home page, rewritten from the client's revised profile (the full text is on /about).
-- Editable afterwards in Admin → Site settings.
UPDATE `settings` SET
  `about_title` = 'About MCC',
  `about_body` = 'MCC is an engineering-driven contracting company specializing in electromechanical solutions and integrated construction services. Established in 2015, we have expanded over the past three years into comprehensive finishing works, and we are now evolving into an integrated group of specialized companies.

Engineering is the foundation of how we think, plan and execute: accurate cost analysis, precise calculations and disciplined execution, with support and maintenance after handover. Most of our engineers have been with MCC for more than a decade.'
WHERE `id` = 1;
