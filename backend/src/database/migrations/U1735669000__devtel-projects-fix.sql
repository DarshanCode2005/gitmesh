--
-- Undo DevTel Projects - Add Missing Columns
--

ALTER TABLE "devtelProjects"
DROP COLUMN IF EXISTS prefix,
DROP COLUMN IF EXISTS color,
DROP COLUMN IF EXISTS "leadUserId";

-- Restore status column
ALTER TABLE "devtelProjects"
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

DROP INDEX IF EXISTS idx_devtel_projects_lead;
