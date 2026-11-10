-- The default WhatsApp message asked about a project; contact is now general. Only the untouched
-- default changes: a message the admin wrote in Site settings stays.
UPDATE `settings` SET `whatsapp_message` = 'Hello, I''d like to get in touch.' WHERE `whatsapp_message` = 'Hello, I''d like to ask about a project.';
