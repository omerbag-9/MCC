-- The contact page map shows the MCC CONSTRUCTION pin, from the code copied in Google Maps
-- (Share -> Embed a map). Saving that code in Admin -> Site settings was refused until now: the field
-- took only a web address. It now takes the whole code, and this puts in the one that was pasted.
UPDATE `settings` SET `map_embed_url` = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.229287812314!2d31.345569375436025!3d30.058961474916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6f44db1c5e0e477%3A0x956e36592825de6d!2sMCC%20CONSTRUCTION!5e0!3m2!1sen!2seg!4v1795209759202!5m2!1sen!2seg' WHERE `id` = 1;
