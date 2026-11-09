-- Sites still showing the old demo company name get the real one. A name set in the admin is kept.
UPDATE `settings` SET `company_name` = 'MCC Construction' WHERE `company_name` IN ('Atlas Build Co.', 'Your Construction Co.');
