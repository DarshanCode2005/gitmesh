--
-- DevTel Projects - Add Missing Columns
-- Adds prefix, color, and leadUserId columns to devtelProjects table
--

ALTER TABLE "devtelProjects"
ADD COLUMN IF NOT EXISTS prefix VARCHAR(10),
ADD COLUMN IF NOT EXISTS color VARCHAR(7),
ADD COLUMN IF NOT EXISTS "leadUserId" UUID REFERENCES users(id) ON DELETE SET NULL;

-- Remove status column if it exists (not in model)
ALTER TABLE "devtelProjects"
DROP COLUMN IF EXISTS status;

CREATE INDEX IF NOT EXISTS idx_devtel_projects_lead ON "devtelProjects"("leadUserId");
