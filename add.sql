-- NSphere incremental seed (safe add-only)
-- Purpose: add realistic mock data without touching existing rows
-- Usage (local): supabase db execute --file ./add.sql
-- Usage (dashboard): paste into SQL editor and run

-- =============================================
-- 1) Create user profiles for auth users missing a profile (FK-safe)
-- =============================================
WITH candidates AS (
  SELECT
    u.id,
    COALESCE(
      NULLIF(u.raw_user_meta_data->>'user_name',''),
      split_part(u.email,'@',1),
      'user_'||left(u.id::text,8)
    ) AS username
  FROM auth.users u
  LEFT JOIN user_profiles p ON p.id = u.id
  WHERE p.id IS NULL
  LIMIT 10
)
INSERT INTO user_profiles (
  id, username, status, created_at, updated_at
)
SELECT id, username, 'active', NOW(), NOW()
FROM candidates
ON CONFLICT DO NOTHING;

-- =============================================
-- 2) Add one project for profiles that currently have none
--    (keeps it light; extend as needed)
-- =============================================
WITH owners AS (
  SELECT p.id, p.username
  FROM user_profiles p
  LEFT JOIN projects pr ON pr.user_id = p.id
  GROUP BY p.id, p.username
  HAVING COUNT(pr.id) = 0
  LIMIT 10
)
INSERT INTO projects (
  id, user_id, title, description,
  image_url, github_url, live_url, twitter_url,
  tags, status, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  o.id,
  'Sample Project - '||o.username,
  'Auto-generated sample project for '||o.username||' to showcase ecosystem entries.',
  'https://api.dicebear.com/7.x/shapes/svg?seed='||o.username,
  NULL, NULL, NULL,
  ARRAY['AI','Web3'],
  'showcase',
  NOW(), NOW()
FROM owners o
ON CONFLICT DO NOTHING;

-- =============================================
-- 3) Give 10 Continental Coins to users without a balance
-- =============================================
INSERT INTO user_coin_balances (user_id, balance, total_earned, updated_at)
SELECT p.id, 10, 10, NOW()
FROM user_profiles p
LEFT JOIN user_coin_balances b ON b.user_id = p.id
WHERE b.user_id IS NULL;

-- Optionally, also record a registration_bonus transaction for those users
INSERT INTO coin_transactions (
  id, from_user_id, to_user_id, amount, transaction_type, description, metadata, status, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  NULL,
  b.user_id,
  10,
  'registration_bonus',
  'Welcome bonus (added by add.sql)',
  '{"bonus_type":"add_sql"}',
  'completed',
  NOW(), NOW()
FROM user_coin_balances b
LEFT JOIN (
  SELECT to_user_id FROM coin_transactions WHERE transaction_type='registration_bonus'
) t ON t.to_user_id = b.user_id
WHERE t.to_user_id IS NULL;

-- =============================================
-- 4) Add up to 5 collaboration requests (only if table exists)
--    Safe guard with to_regclass check to avoid failures
-- =============================================
DO $$
BEGIN
  IF to_regclass('public.collaboration_requests') IS NOT NULL THEN
    WITH open_projects AS (
      SELECT id, user_id
      FROM projects
      WHERE COALESCE(collaboration_status,'open') = 'open'
      LIMIT 5
    ),
    requesters AS (
      SELECT p.id AS requester_id
      FROM user_profiles p
      LIMIT 20
    )
    INSERT INTO collaboration_requests (
      id, project_id, requester_id, collaboration_type, intro_message, status, created_at, updated_at
    )
    SELECT
      gen_random_uuid(),
      op.id,
      r.requester_id,
      'frontend-dev',
      'Hey! I would love to help on this project.',
      'pending',
      NOW(), NOW()
    FROM open_projects op
    JOIN requesters r ON r.requester_id <> op.user_id
    LEFT JOIN collaboration_requests cr
      ON cr.project_id = op.id AND cr.requester_id = r.requester_id
    WHERE cr.id IS NULL
    LIMIT 5;
  END IF;
END $$;

-- =============================================
-- Summary
-- - Adds up to 10 missing profiles from auth.users
-- - Adds up to 10 simple sample projects (only for owners with zero projects)
-- - Ensures each user has a coin balance (10 coins)
-- - Adds up to 5 collaboration requests if the table exists
-- Re-run safe; existing rows are not modified.

