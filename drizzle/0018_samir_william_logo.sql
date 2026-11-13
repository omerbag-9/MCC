-- The new Samir William logo (media-import/clients/samir-william.png, transparent background)
-- replaces the boxed one. Only the logo supplied earlier is replaced, so a logo uploaded in
-- Admin -> Clients stays. scripts/move-to-r2.mjs uploads it to clients/samir-william/logo.png.
UPDATE `clients` SET `logo_key` = '/clients/samir-william.png'
WHERE `logo_key` IN ('/clients/samir-william.jpg', 'clients/samir-william/logo.jpg');
