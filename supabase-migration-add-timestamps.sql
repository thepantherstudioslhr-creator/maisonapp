-- Add check_in_time and check_out_time columns to bookings table

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS check_out_time TIMESTAMPTZ;

-- Add helpful comment
COMMENT ON COLUMN bookings.check_in_time IS 'Actual timestamp when guest checked in';
COMMENT ON COLUMN bookings.check_out_time IS 'Actual timestamp when guest checked out';

-- Update existing active bookings to have check_in_time based on check_in date
-- For active bookings created today, use created_at time
-- For active bookings created on previous dates, assume 1 PM check-in
UPDATE bookings
SET check_in_time =
  CASE
    WHEN DATE(created_at) = DATE(check_in) THEN created_at
    ELSE (check_in::date + TIME '13:00:00')::timestamptz
  END
WHERE status = 'active' AND check_in_time IS NULL;

-- Update completed bookings to have check_in_time and check_out_time
UPDATE bookings
SET check_in_time =
  CASE
    WHEN DATE(created_at) = DATE(check_in) THEN created_at
    ELSE (check_in::date + TIME '13:00:00')::timestamptz
  END,
  check_out_time =
  CASE
    WHEN updated_at IS NOT NULL THEN updated_at
    ELSE (check_out::date + TIME '11:00:00')::timestamptz
  END
WHERE status = 'completed' AND check_in_time IS NULL;
