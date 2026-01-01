-- Undo migration: devtel-workspace-settings-fix
-- Remove added columns
ALTER TABLE "devtelWorkspaceSettings"
DROP COLUMN IF EXISTS "workingHoursPerDay",
DROP COLUMN IF EXISTS "issueTypes",
DROP COLUMN IF EXISTS "priorities",
DROP COLUMN IF EXISTS "statuses",
DROP COLUMN IF EXISTS "customFields";

-- Restore old columns
ALTER TABLE "devtelWorkspaceSettings"
ADD COLUMN IF NOT EXISTS "storyPointScale" VARCHAR(50) DEFAULT 'fibonacci',
ADD COLUMN IF NOT EXISTS "velocityMethod" VARCHAR(50) DEFAULT 'average',
ADD COLUMN IF NOT EXISTS "settings" JSONB DEFAULT '{}'::jsonb;
