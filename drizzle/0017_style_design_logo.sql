-- The colour Style Design logo (media-import/clients/style-design.png) replaces the black and white
-- one. Only the logo supplied earlier is replaced, so a logo uploaded in Admin -> Clients stays.
-- scripts/move-to-r2.mjs then uploads it to clients/style-design/logo.png on deploy.
UPDATE `clients` SET `logo_key` = '/clients/style-design.png'
WHERE `logo_key` IN ('/clients/style-design.jpg', 'clients/style-design/logo.jpg');
