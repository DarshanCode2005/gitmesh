-- Add missing columns to devtelWorkspaceSettings table
ALTER TABLE "devtelWorkspaceSettings" 
ADD COLUMN IF NOT EXISTS "workingHoursPerDay" DECIMAL(4, 2) DEFAULT 8.0,
ADD COLUMN IF NOT EXISTS "issueTypes" JSONB DEFAULT '["story", "bug", "task", "epic"]'::jsonb,
ADD COLUMN IF NOT EXISTS "priorities" JSONB DEFAULT '["urgent", "high", "medium", "low"]'::jsonb,
ADD COLUMN IF NOT EXISTS "statuses" JSONB DEFAULT '["backlog", "todo", "in_progress", "review", "done"]'::jsonb,
ADD COLUMN IF NOT EXISTS "customFields" JSONB DEFAULT '[]'::jsonb;

-- Remove old columns that are no longer in the model
ALTER TABLE "devtelWorkspaceSettings"
DROP COLUMN IF EXISTS "storyPointScale",
DROP COLUMN IF EXISTS "velocityMethod",
DROP COLUMN IF EXISTS "settings";
