-- ============================================
-- RESET SUPABASE - CLEAN SLATE
-- ============================================
-- Run this to delete all upgrade tables and start fresh

-- 1. DROP ALL NEW TABLES (in correct order due to foreign keys)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS guests CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- 2. CLEAN UP BOOKINGS TABLE (remove new columns)
ALTER TABLE bookings
  DROP COLUMN IF EXISTS property_id,
  DROP COLUMN IF EXISTS room_id,
  DROP COLUMN IF EXISTS guest_id,
  DROP COLUMN IF EXISTS notes,
  DROP COLUMN IF EXISTS special_requests,
  DROP COLUMN IF EXISTS cleaning_status,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS checked_out_by;

-- 3. DELETE ALL TEST USERS FROM AUTH
-- WARNING: This will delete ALL users except the one you specify
-- REPLACE 'your-main-email@example.com' with YOUR ACTUAL EMAIL to keep
DELETE FROM auth.users
WHERE email NOT IN ('your-main-email@example.com');

-- 4. RESET SEQUENCES
-- (Optional - resets auto-increment IDs)

-- ============================================
-- RESET COMPLETE!
-- ============================================

-- Now you can run DATABASE_UPGRADE.sql fresh
