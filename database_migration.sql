-- Add check_in_time and check_out_time columns to bookings table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS check_out_time TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN bookings.check_in_time IS 'Timestamp when guest actually checked in';
COMMENT ON COLUMN bookings.check_out_time IS 'Timestamp when guest actually checked out';
