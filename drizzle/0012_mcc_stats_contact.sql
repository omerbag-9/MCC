-- The client's real figures and contact details, replacing the demo ones.
-- Editable afterwards in Admin → Site settings.
UPDATE `settings` SET
  `stats` = '[{"value":"EGP 80M","label":"Total revenue"},{"value":"30+","label":"Projects completed"},{"value":"10+","label":"Years of experience"}]',
  `phone` = '+20 107 075 6325',
  `email` = 'info@mccltd-eg.com'
WHERE `id` = 1;
