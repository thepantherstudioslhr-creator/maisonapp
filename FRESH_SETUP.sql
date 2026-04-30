-- ============================================
-- FRESH SETUP - RUN AFTER RESET
-- ============================================

-- STEP 1: First run DATABASE_UPGRADE.sql (creates all tables)

-- STEP 2: Then run this to create a fresh admin account

-- ============================================
-- CREATE ADMIN USER
-- ============================================

-- Delete any existing admin user first (just in case)
DELETE FROM auth.users WHERE email = 'admin@maisonroyale.com';

-- Create new admin user
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@maisonroyale.com',
    crypt('Admin123456', gen_salt('bf')),
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    FALSE
  ) RETURNING id INTO new_user_id;

  -- Create user profile in users table
  INSERT INTO users (auth_user_id, name, email, role, theme_preference, is_active)
  VALUES (new_user_id, 'Admin User', 'admin@maisonroyale.com', 'admin', 'light', true);

  RAISE NOTICE 'Admin user created successfully!';
  RAISE NOTICE 'Email: admin@maisonroyale.com';
  RAISE NOTICE 'Password: Admin123456';
END $$;

-- ============================================
-- VERIFY SETUP
-- ============================================

-- Check if admin user exists
SELECT
  u.email,
  u.role,
  u.name,
  u.is_active,
  u.created_at
FROM users u
WHERE u.email = 'admin@maisonroyale.com';

-- ============================================
-- SETUP COMPLETE!
-- ============================================

/*

LOGIN CREDENTIALS:
==================
Email:    admin@maisonroyale.com
Password: Admin123456

⚠️ IMPORTANT: Change this password after first login!

*/
