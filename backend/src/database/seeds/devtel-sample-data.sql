-- DevTel Sample Data Seed Script
-- Run after migrations to populate dev environment with test data

BEGIN;

-- Insert sample workspace (linked to first tenant)
INSERT INTO devtel_workspaces (id, tenant_id, settings, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    id,
    '{"cycleLength": 14, "storyPointScale": "fibonacci"}'::jsonb,
    NOW(),
    NOW()
FROM tenants
LIMIT 1
ON CONFLICT DO NOTHING;

-- Get workspace ID for subsequent inserts
DO $$
DECLARE
    v_workspace_id UUID;
    v_project_id UUID;
    v_cycle_id UUID;
    v_user_id UUID;
BEGIN
    SELECT id INTO v_workspace_id FROM devtel_workspaces LIMIT 1;
    SELECT id INTO v_user_id FROM users LIMIT 1;
    
    IF v_workspace_id IS NULL THEN
        RAISE NOTICE 'No workspace found, skipping sample data';
        RETURN;
    END IF;

    -- Insert sample project
    INSERT INTO devtel_projects (id, workspace_id, name, key, description, settings, created_at, updated_at, created_by_id)
    VALUES (
        gen_random_uuid(),
        v_workspace_id,
        'Sample Project',
        'SAMPLE',
        'A sample project for testing DevTel features',
        '{"defaultAssignee": null}'::jsonb,
        NOW(),
        NOW(),
        v_user_id
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_project_id;

    IF v_project_id IS NULL THEN
        SELECT id INTO v_project_id FROM devtel_projects WHERE key = 'SAMPLE' LIMIT 1;
    END IF;

    -- Insert sample issues
    INSERT INTO devtel_issues (id, project_id, issue_key, title, description, type, status, priority, story_points, created_at, updated_at, created_by_id)
    VALUES
        (gen_random_uuid(), v_project_id, 'SAMPLE-1', 'Setup authentication flow', 'Implement OAuth2 login', 'story', 'done', 'high', 5, NOW() - INTERVAL '10 days', NOW(), v_user_id),
        (gen_random_uuid(), v_project_id, 'SAMPLE-2', 'Design dashboard UI', 'Create mockups for main dashboard', 'story', 'done', 'medium', 3, NOW() - INTERVAL '9 days', NOW(), v_user_id),
        (gen_random_uuid(), v_project_id, 'SAMPLE-3', 'Fix login page bug', 'Button not working on mobile', 'bug', 'done', 'urgent', 2, NOW() - INTERVAL '8 days', NOW(), v_user_id),
        (gen_random_uuid(), v_project_id, 'SAMPLE-4', 'Add user profile page', 'Show user details and settings', 'story', 'in_progress', 'high', 8, NOW() - INTERVAL '5 days', NOW(), v_user_id),
        (gen_random_uuid(), v_project_id, 'SAMPLE-5', 'Implement notifications', 'Real-time push notifications', 'story', 'in_progress', 'medium', 5, NOW() - INTERVAL '4 days', NOW(), v_user_id),
        (gen_random_uuid(), v_project_id, 'SAMPLE-6', 'Database optimization', 'Add indexes for slow queries', 'task', 'review', 'high', 3, NOW() - INTERVAL '3 days', NOW(), v_user_id),
        (gen_random_uuid(), v_project_id, 'SAMPLE-7', 'API rate limiting', 'Prevent abuse with rate limits', 'story', 'backlog', 'medium', 5, NOW() - INTERVAL '2 days', NOW(), v_user_id),
        (gen_random_uuid(), v_project_id, 'SAMPLE-8', 'Dark mode support', 'Add dark theme option', 'story', 'backlog', 'low', 8, NOW() - INTERVAL '1 day', NOW(), v_user_id),
        (gen_random_uuid(), v_project_id, 'SAMPLE-9', 'Mobile responsive fixes', 'Fix layout on small screens', 'bug', 'backlog', 'high', 3, NOW(), NOW(), v_user_id),
        (gen_random_uuid(), v_project_id, 'SAMPLE-10', 'Add export feature', 'Export data to CSV/PDF', 'story', 'backlog', 'medium', 5, NOW(), NOW(), v_user_id)
    ON CONFLICT DO NOTHING;

    -- Insert completed cycle
    INSERT INTO devtel_cycles (id, project_id, name, goal, status, start_date, end_date, actual_start_date, actual_end_date, story_points_total, story_points_completed, created_at, updated_at, created_by_id)
    VALUES (
        gen_random_uuid(),
        v_project_id,
        'Sprint 1',
        'Complete core authentication features',
        'completed',
        NOW() - INTERVAL '21 days',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '21 days',
        NOW() - INTERVAL '7 days',
        15,
        12,
        NOW() - INTERVAL '22 days',
        NOW() - INTERVAL '7 days',
        v_user_id
    )
    ON CONFLICT DO NOTHING;

    -- Insert active cycle
    INSERT INTO devtel_cycles (id, project_id, name, goal, status, start_date, end_date, actual_start_date, story_points_total, created_at, updated_at, created_by_id)
    VALUES (
        gen_random_uuid(),
        v_project_id,
        'Sprint 2',
        'Build user dashboard and notifications',
        'active',
        NOW() - INTERVAL '7 days',
        NOW() + INTERVAL '7 days',
        NOW() - INTERVAL '7 days',
        20,
        NOW() - INTERVAL '8 days',
        NOW(),
        v_user_id
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_cycle_id;

    IF v_cycle_id IS NULL THEN
        SELECT id INTO v_cycle_id FROM devtel_cycles WHERE name = 'Sprint 2' LIMIT 1;
    END IF;

    -- Insert cycle snapshots for burndown chart
    IF v_cycle_id IS NOT NULL THEN
        INSERT INTO devtel_cycle_snapshots (id, cycle_id, snapshot_date, total_points, completed_points, remaining_points, issues_total, issues_completed, created_at)
        VALUES
            (gen_random_uuid(), v_cycle_id, NOW() - INTERVAL '7 days', 20, 0, 20, 5, 0, NOW() - INTERVAL '7 days'),
            (gen_random_uuid(), v_cycle_id, NOW() - INTERVAL '6 days', 20, 3, 17, 5, 1, NOW() - INTERVAL '6 days'),
            (gen_random_uuid(), v_cycle_id, NOW() - INTERVAL '5 days', 20, 5, 15, 5, 1, NOW() - INTERVAL '5 days'),
            (gen_random_uuid(), v_cycle_id, NOW() - INTERVAL '4 days', 20, 8, 12, 5, 2, NOW() - INTERVAL '4 days'),
            (gen_random_uuid(), v_cycle_id, NOW() - INTERVAL '3 days', 20, 10, 10, 5, 2, NOW() - INTERVAL '3 days'),
            (gen_random_uuid(), v_cycle_id, NOW() - INTERVAL '2 days', 20, 12, 8, 5, 3, NOW() - INTERVAL '2 days'),
            (gen_random_uuid(), v_cycle_id, NOW() - INTERVAL '1 day', 20, 14, 6, 5, 3, NOW() - INTERVAL '1 day'),
            (gen_random_uuid(), v_cycle_id, NOW(), 20, 15, 5, 5, 3, NOW())
        ON CONFLICT DO NOTHING;
    END IF;

    -- Insert sample spec
    INSERT INTO devtel_specs (id, project_id, title, content, status, created_at, updated_at, author_id)
    VALUES (
        gen_random_uuid(),
        v_project_id,
        'User Dashboard PRD',
        '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "This document outlines the requirements for the user dashboard feature."}]}]}'::jsonb,
        'approved',
        NOW() - INTERVAL '14 days',
        NOW() - INTERVAL '7 days',
        v_user_id
    )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'DevTel sample data inserted successfully';
END $$;

COMMIT;
