-- ============================================
-- FIX: Sync Auth User with Database
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Check if admin exists in auth.users
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'admin@maisonroyale.com';

-- If no result above, run this to create admin:
-- ============================================

-- Delete old admin if exists
DELETE FROM auth.users WHERE email = 'admin@maisonroyale.com';
DELETE FROM users WHERE email = 'admin@maisonroyale.com';

-- Create fresh admin user
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@maisonroyale.com',
    crypt('Admin123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin User"}',
    false,
    ''
  ) RETURNING id INTO new_user_id;

  -- Create in users table
  INSERT INTO users (auth_user_id, name, email, role, theme_preference, is_active)
  VALUES (new_user_id, 'Admin User', 'admin@maisonroyale.com', 'admin', 'dark', true);

  -- Add identity record (required for email/password auth)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    format('{"sub":"%s","email":"%s"}', new_user_id, 'admin@maisonroyale.com')::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  RAISE NOTICE '✅ Admin created! UUID: %', new_user_id;
END $$;

-- Step 2: Verify setup
SELECT
  au.id,
  au.email,
  au.email_confirmed_at,
  u.name,
  u.role,
  u.is_active
FROM auth.users au
LEFT JOIN users u ON u.auth_user_id = au.id
WHERE au.email = 'admin@maisonroyale.com';

-- You should see:
-- ✅ id: some-uuid
-- ✅ email: admin@maisonroyale.com
-- ✅ email_confirmed_at: timestamp (not null)
-- ✅ name: Admin User
-- ✅ role: admin
-- ✅ is_active: true
