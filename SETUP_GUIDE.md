# Maison Royale Residency - Setup Guide

## Overview
This is a luxury Airbnb booking and management application built for Maison Royale Residency to manage 8 apartments, bookings, clients, receipts, and sales reports.

## Features
- 🔐 Secure login system with admin/staff roles
- 🏠 Real-time apartment dashboard with status indicators
- 📝 Complete booking management system
- 🧾 PDF receipt generation with WhatsApp sharing
- 📊 Comprehensive reports and analytics
- 📅 Calendar view for booking visualization
- ☁️ Cloud database with multi-device sync

## Supabase Setup Instructions

### Step 1: Set Up Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Save your project URL and anon key

### Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Create Database Tables

In your Supabase project dashboard, go to the SQL Editor and run the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  cnic TEXT NOT NULL,
  guests INTEGER NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  extra_charges DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  advance_payment DECIMAL(10, 2) NOT NULL,
  balance DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'upcoming', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all bookings
CREATE POLICY "Authenticated users can read bookings" ON public.bookings
  FOR SELECT TO authenticated USING (true);

-- Policy: Authenticated users can insert bookings
CREATE POLICY "Authenticated users can insert bookings" ON public.bookings
  FOR INSERT TO authenticated WITH CHECK (true);

-- Policy: Authenticated users can update bookings
CREATE POLICY "Authenticated users can update bookings" ON public.bookings
  FOR UPDATE TO authenticated USING (true);

-- Policy: Only admins can delete bookings
CREATE POLICY "Admins can delete bookings" ON public.bookings
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Step 4: Create Admin User

1. In Supabase Dashboard, go to Authentication > Users
2. Click "Add User" and create an admin account:
   - Email: your-admin-email@example.com
   - Password: your-secure-password
3. After creating the user, go to SQL Editor and run:

```sql
-- Replace 'user-uuid-here' with the actual UUID from the auth.users table
INSERT INTO public.users (id, email, role)
VALUES ('user-uuid-here', 'your-admin-email@example.com', 'admin');
```

### Step 5: Launch the Application

```bash
npm install
npm run dev
```

## Usage

### Login
- Use the admin credentials you created in Supabase
- Default view shows all 8 apartments with real-time status

### Creating a Booking
1. Click on any green (available) apartment
2. Fill in client details (name, phone, CNIC, guests)
3. Select check-in and check-out dates
4. Add discount or extra charges if needed
5. Enter advance payment amount
6. Submit to create booking and generate receipt

### Managing Bookings
- View all bookings in the "Bookings" tab
- Filter by status: Active, Upcoming, Completed, Cancelled
- Search by client name, phone, or apartment
- Mark bookings as completed or cancelled
- Delete bookings (admin only)

### Reports
- **Daily Report**: View revenue, bookings, and occupancy for a specific date
- **Monthly Report**: See monthly revenue, total bookings, and occupancy rate
- **Apartment Report**: Compare performance across all 8 apartments
- Export all reports to CSV/Excel

### Calendar View
- Visual calendar showing all bookings
- Filter by apartment
- See check-in (→) and check-out (←) dates
- Hover to see booking details

## Apartment Details

1. **Maison Eiffel Royale 10** - Rs 15,000/night
2. **Maison Eiffel View 11** - Rs 15,000/night
3. **Maison 8 Ball Pool 12** - Rs 18,000/night
4. **Maison Jade 401** - Rs 12,000/night
5. **Maison Forest 402** - Rs 12,000/night
6. **Maison Sunset 403** - Rs 12,000/night
7. **Maison Rosso 404** - Rs 12,000/night
8. **Maison Sage 405** - Rs 12,000/night

## Status Colors

- 🟢 **Green** = Available (can book)
- 🔴 **Red** = Booked
- 🟡 **Yellow** = Check-out Today
- ⚫ **Grey** = Maintenance (future feature)

## Troubleshooting

### Cannot login
- Verify Supabase credentials in `.env` file
- Check that user exists in both `auth.users` and `public.users` tables
- Ensure Row Level Security policies are correctly set

### Bookings not showing
- Check Supabase connection
- Verify bookings table has data
- Check browser console for errors

### PDF not downloading
- Ensure jsPDF is installed
- Check browser pop-up blocker settings

## Security Notes

- All database operations require authentication
- Only admin users can delete bookings
- Passwords are securely hashed by Supabase
- API keys should never be committed to git
- Row Level Security (RLS) is enabled on all tables

## Future Enhancements

- Staff user accounts with limited permissions
- Email notifications for bookings
- SMS integration for reminders
- Payment gateway integration
- Mobile app version
- Integration with Airbnb API
- Automated check-in/check-out reminders
- Photo gallery for apartments
- Review and rating system
- Multi-property support

---

**Developed for Maison Royale Residency**  
© 2026 All Rights Reserved
