-- ============================================
-- PROFESSIONAL HOTEL MANAGEMENT UPGRADE
-- Database Schema Migrations
-- ============================================

-- 1. USERS TABLE (Role-Based Access Control)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
  property_id UUID,
  theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_property ON users(property_id);

-- 2. PROPERTIES TABLE (Multi-Hotel Support)
-- ============================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Pakistan',
  phone TEXT,
  email TEXT,
  total_rooms INTEGER DEFAULT 0,
  owner_id UUID REFERENCES users(id),
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);

-- 3. ROOMS/APARTMENTS TABLE (Dynamic Room Management)
-- ============================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  room_name TEXT NOT NULL,
  room_number TEXT,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  max_occupancy INTEGER DEFAULT 2,
  amenities TEXT[],
  is_active BOOLEAN DEFAULT true,
  cleaning_status TEXT DEFAULT 'clean' CHECK (cleaning_status IN ('clean', 'cleaning', 'dirty')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rooms_property ON rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(is_active);

-- 4. GUESTS TABLE (Customer Database)
-- ============================================
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  cnic TEXT UNIQUE,
  email TEXT,
  address TEXT,
  total_bookings INTEGER DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  last_visit_date DATE,
  notes TEXT,
  is_vip BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(phone);
CREATE INDEX IF NOT EXISTS idx_guests_cnic ON guests(cnic);

-- 5. UPDATE BOOKINGS TABLE (Add New Fields)
-- ============================================
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id),
  ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES rooms(id),
  ADD COLUMN IF NOT EXISTS guest_id UUID REFERENCES guests(id),
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS special_requests TEXT,
  ADD COLUMN IF NOT EXISTS cleaning_status TEXT DEFAULT 'pending' CHECK (cleaning_status IN ('pending', 'cleaning', 'cleaned')),
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS checked_out_by UUID REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest ON bookings(guest_id);

-- 6. AUDIT LOGS TABLE (Track All Changes)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  user_name TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- 7. USER PERMISSIONS TABLE (Granular Access Control)
-- ============================================
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
  permission TEXT NOT NULL,
  can_access BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default Permissions
INSERT INTO user_permissions (role, permission, can_access) VALUES
  -- Admin Permissions (Full Access)
  ('admin', 'view_dashboard', true),
  ('admin', 'create_booking', true),
  ('admin', 'edit_booking', true),
  ('admin', 'delete_booking', true),
  ('admin', 'checkout_booking', true),
  ('admin', 'add_room', true),
  ('admin', 'remove_room', true),
  ('admin', 'view_reports', true),
  ('admin', 'view_analytics', true),
  ('admin', 'manage_users', true),
  ('admin', 'access_settings', true),
  ('admin', 'change_theme', true),
  ('admin', 'view_financial_reports', true),
  ('admin', 'export_data', true),

  -- Manager Permissions (Limited Access)
  ('manager', 'view_dashboard', true),
  ('manager', 'create_booking', true),
  ('manager', 'edit_booking', true),
  ('manager', 'delete_booking', false),
  ('manager', 'checkout_booking', true),
  ('manager', 'add_room', false),
  ('manager', 'remove_room', false),
  ('manager', 'view_reports', true),
  ('manager', 'view_analytics', true),
  ('manager', 'manage_users', false),
  ('manager', 'access_settings', false),
  ('manager', 'change_theme', false),
  ('manager', 'view_financial_reports', false),
  ('manager', 'export_data', true),

  -- Staff Permissions (Minimal Access)
  ('staff', 'view_dashboard', true),
  ('staff', 'create_booking', true),
  ('staff', 'edit_booking', false),
  ('staff', 'delete_booking', false),
  ('staff', 'checkout_booking', true),
  ('staff', 'add_room', false),
  ('staff', 'remove_room', false),
  ('staff', 'view_reports', false),
  ('staff', 'view_analytics', false),
  ('staff', 'manage_users', false),
  ('staff', 'access_settings', false),
  ('staff', 'change_theme', true),
  ('staff', 'view_financial_reports', false),
  ('staff', 'export_data', false)
ON CONFLICT DO NOTHING;

-- 8. TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can see their own data and admins can see all
CREATE POLICY users_select_policy ON users
  FOR SELECT USING (
    auth.uid() = auth_user_id OR
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

-- Admins can insert/update/delete users
CREATE POLICY users_insert_policy ON users
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY users_update_policy ON users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY users_delete_policy ON users
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

-- 10. MIGRATION FOR EXISTING DATA
-- ============================================

-- Create default property for existing bookings
DO $$
DECLARE
  default_property_id UUID;
BEGIN
  -- Insert default property
  INSERT INTO properties (property_name, address, city, total_rooms)
  VALUES ('Maison Royale Residency', 'Bahria Town, Lahore', 'Lahore', 8)
  RETURNING id INTO default_property_id;

  -- Create default rooms from existing apartments
  INSERT INTO rooms (property_id, room_name, room_number, price)
  VALUES
    (default_property_id, 'Maison Emerald 201', '201', 15000),
    (default_property_id, 'Maison Ruby 202', '202', 13000),
    (default_property_id, 'Maison Sapphire 301', '301', 15000),
    (default_property_id, 'Maison Jade 401', '401', 13000),
    (default_property_id, 'Maison Opal 402', '402', 12000),
    (default_property_id, 'Maison Topaz 501', '501', 15000),
    (default_property_id, 'Maison Diamond 601', '601', 18000),
    (default_property_id, 'Maison Pearl 701', '701', 16000);

  -- Update existing bookings to link with default property
  UPDATE bookings
  SET property_id = default_property_id
  WHERE property_id IS NULL;

END $$;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Next Steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify all tables created
-- 3. Check default property and rooms
-- 4. Create your first admin user
