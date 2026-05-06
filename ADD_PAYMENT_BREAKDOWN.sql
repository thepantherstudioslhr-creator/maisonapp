-- ============================================
-- ADD PAYMENT BREAKDOWN FIELDS
-- Add cash_amount and online_amount to bookings table
-- ============================================

-- Run this in Supabase SQL Editor

-- Add new columns to bookings table
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS cash_amount DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS online_amount DECIMAL(10, 2) DEFAULT 0;

-- Update existing bookings to populate cash_amount and online_amount
-- based on payment_method and advance_payment
UPDATE bookings
SET
  cash_amount = CASE
    WHEN payment_method = 'cash' THEN advance_payment
    ELSE 0
  END,
  online_amount = CASE
    WHEN payment_method = 'online' THEN advance_payment
    ELSE 0
  END
WHERE cash_amount IS NULL OR online_amount IS NULL;

-- Verify the changes
SELECT
  client_name,
  total_amount,
  advance_payment,
  cash_amount,
  online_amount,
  balance,
  payment_method
FROM bookings
WHERE status IN ('active', 'upcoming')
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================

/*
NEW FEATURES:
=============

1. Separate Cash & Online Tracking:
   - cash_amount: Amount paid in cash
   - online_amount: Amount paid online/transfer
   - Total Advance = cash_amount + online_amount

2. Mixed Payments Supported:
   - Guest can pay Rs 10,000 cash + Rs 5,000 online
   - System tracks both separately
   - Perfect for accounting and cash flow

3. Benefits:
   - Exact hisab of cash vs online
   - No confusion in accounting
   - Clear payment breakdown in reports

USAGE:
======

When creating/editing booking:
- Enter cash amount: Rs 10,000
- Enter online amount: Rs 5,000
- System auto-calculates: Advance = Rs 15,000

*/
