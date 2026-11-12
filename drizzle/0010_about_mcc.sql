-- The client's About text, in short, for the About section on the home page (the full text is on /about).
-- Editable afterwards in Admin → Site settings.
UPDATE `settings` SET
  `about_title` = 'About MCC',
  `about_body` = 'MCC is a contracting company specialized in electromechanical works. Founded in 2015, we have expanded in the last 3 years into full finishing works, and we are now building MCC as a group of specialized companies.

We are engineers, not ordinary contractors. Accurate costing, precise calculations and precise execution on every project, delivered on time and maintained after we finish. Most of our engineers come from excellent government universities and have been with us for more than 10 years.'
WHERE `id` = 1;
