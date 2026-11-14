-- The project a client's logo opens (Admin → Clients → Linked project). Deleting the project
-- clears it, and the logo goes back to the client's website.
ALTER TABLE `clients` ADD `project_id` integer REFERENCES projects(id) ON DELETE set null;
