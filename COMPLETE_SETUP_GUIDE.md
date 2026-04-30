# 🚀 Complete Professional Hotel Management Software Setup Guide

## 🎉 Congratulations!

Your Maison Royale app has been upgraded to **PROFESSIONAL HOTEL MANAGEMENT SOFTWARE** ready to sell to other hotels!

---

## ✨ NEW FEATURES ADDED

### 1. Role-Based Access Control
- **Admin**: Full control (you)
- **Manager**: Daily operations, bookings, reports
- **Staff**: Basic operations only

### 2. Smart Dashboard
- Today's Check-Ins/Check-Outs
- Occupied vs Available Rooms
- Real-time Occupancy Rate
- Today's Revenue

### 3. Dynamic Room Management
- Add rooms on-the-fly
- Edit prices anytime
- Deactivate rooms
- Auto-updates everywhere

### 4. User Management
- Create team accounts
- Assign roles
- Manage permissions
- Deactivate users

### 5. Advanced Reports
- **Daily Reports**: Day-by-day analysis
- **Weekly Reports**: Week overview
- **Monthly Reports**: Full month stats
- **Room-Wise Reports**: Per apartment revenue
- **Detailed Export**: All booking data

### 6. Excel Export
- Multi-sheet workbooks
- Complete booking details
- Summary statistics
- Room-wise breakdown

### 7. Guest Database
- Automatic guest tracking
- Repeat customer identification
- VIP auto-upgrade (5+ bookings or PKR 100k+ spent)
- Total spending per guest
- Visit history

### 8. Booking Enhancements
- Internal notes field
- Guest special requests
- Payment method tracking (Cash/Online)
- Booking history

### 9. Audit Logging
- Track who created bookings
- Track all changes
- Complete audit trail

### 10. Theme Customization
- Light mode (default)
- Dark mode
- Per-user preferences

---

## 📋 SETUP INSTRUCTIONS

### STEP 1: Install Dependencies

```bash
pnpm install
```

This will install the new `xlsx` library for Excel export.

---

### STEP 2: Database Migration

**This is CRITICAL - Don't skip!**

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Go to SQL Editor** (left sidebar)
3. **Copy ENTIRE content** from `DATABASE_UPGRADE.sql`
4. **Paste and Click "Run"**
5. **Wait for success ✅**

**What this creates:**
- `users` table (role-based access)
- `properties` table (multi-hotel support)
- `rooms` table (dynamic rooms)
- `guests` table (customer tracking)
- `audit_logs` table (change tracking)
- `user_permissions` table (granular permissions)
- Default property with 8 existing rooms
- Row Level Security policies

---

### STEP 3: Create Admin Account

**Method 1: If you already have an auth account**

Run this in Supabase SQL Editor (replace with your email):

```sql
DO $$
DECLARE
  auth_id UUID;
BEGIN
  SELECT id INTO auth_id 
  FROM auth.users 
  WHERE email = 'your-email@example.com';
  
  INSERT INTO users (auth_user_id, name, email, role)
  VALUES (auth_id, 'Your Full Name', 'your-email@example.com', 'admin');
END $$;
```

**Method 2: Create new admin from scratch**

Run this in Supabase SQL Editor:

```sql
-- First create auth user
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    aud,
    role
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'admin@maisonroyale.com',
    crypt('Admin@123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ) RETURNING id INTO new_user_id;

  -- Create user profile
  INSERT INTO users (auth_user_id, name, email, role)
  VALUES (new_user_id, 'Admin User', 'admin@maisonroyale.com', 'admin');
END $$;
```

**Login credentials:**
- Email: `admin@maisonroyale.com`
- Password: `Admin@123456`

**⚠️ CHANGE PASSWORD AFTER FIRST LOGIN!**

---

### STEP 4: Start the App

```bash
pnpm dev
```

App will run on: http://localhost:5173

---

### STEP 5: First Login & Setup

1. **Login** with your admin credentials
2. **Click Settings ⚙️** (top right corner)
3. **Try changing theme** to dark mode
4. **Click "Manage Rooms"**
   - Add a test room (e.g., "Maison Pearl 406")
   - Set price and details
   - Save
5. **Click "Manage Users"**
   - Create a manager account
   - Create a staff account
   - Test logging in as each role

---

## 🎯 TESTING CHECKLIST

### Test Dashboard Features
- [ ] Smart Dashboard shows correct stats
- [ ] Today's check-ins/outs display
- [ ] Occupancy rate calculates correctly
- [ ] Revenue shows actual prices (not default)

### Test Booking System
- [ ] Create new booking
- [ ] Add internal notes
- [ ] Add special requests
- [ ] Select Cash vs Online payment
- [ ] Receipt generates correctly
- [ ] Booking appears on dashboard

### Test Room Management (Admin only)
- [ ] Add new room
- [ ] Edit room price
- [ ] Room appears on dashboard
- [ ] Room available for booking
- [ ] Deactivate room

### Test User Management (Admin only)
- [ ] Create manager account
- [ ] Create staff account
- [ ] Login as manager (can edit bookings)
- [ ] Login as staff (cannot edit bookings)
- [ ] Change user role
- [ ] Deactivate user

### Test Reports
- [ ] Daily report shows correct data
- [ ] Weekly report calculates properly
- [ ] Monthly report accurate
- [ ] Room-wise revenue correct
- [ ] CSV export downloads
- [ ] Excel export creates multi-sheet workbook

### Test Guest Database
- [ ] Guests tab shows all customers
- [ ] Repeat customers identified
- [ ] VIP auto-upgrade works (5+ bookings)
- [ ] Total spending calculated
- [ ] Search by name/phone works
- [ ] Sort options work

### Test Settings
- [ ] Theme switches (Light/Dark)
- [ ] Theme saves per user
- [ ] User info displays correctly
- [ ] Room Management accessible (Admin)
- [ ] User Management accessible (Admin)

### Test Offline Features
- [ ] Turn on Airplane Mode
- [ ] Create booking offline
- [ ] Booking saves locally
- [ ] Turn off Airplane Mode
- [ ] Booking syncs automatically
- [ ] Sync indicator shows status

---

## 👥 USER ROLES & PERMISSIONS

### Admin (Owner)
✅ Full Access to Everything

| Feature | Access |
|---------|--------|
| View Dashboard | ✅ |
| Create Booking | ✅ |
| Edit Booking | ✅ |
| Delete Booking | ✅ |
| Checkout Guest | ✅ |
| Add/Remove Rooms | ✅ |
| View Reports | ✅ |
| View Financial Reports | ✅ |
| Export Data (CSV/Excel) | ✅ |
| Manage Users | ✅ |
| Access Settings | ✅ |
| Change Theme | ✅ |
| View Guest Database | ✅ |
| View Audit Logs | ✅ |

### Manager
✅ Daily Operations

| Feature | Access |
|---------|--------|
| View Dashboard | ✅ |
| Create Booking | ✅ |
| Edit Booking | ✅ |
| Delete Booking | ❌ |
| Checkout Guest | ✅ |
| Add/Remove Rooms | ❌ |
| View Reports | ✅ |
| View Financial Reports | ❌ |
| Export Data (CSV/Excel) | ✅ |
| Manage Users | ❌ |
| Access Settings | ❌ |
| Change Theme | ❌ |
| View Guest Database | ✅ |
| View Audit Logs | ❌ |

### Staff
✅ Basic Operations

| Feature | Access |
|---------|--------|
| View Dashboard | ✅ |
| Create Booking | ✅ |
| Edit Booking | ❌ |
| Delete Booking | ❌ |
| Checkout Guest | ✅ |
| Add/Remove Rooms | ❌ |
| View Reports | ❌ |
| View Financial Reports | ❌ |
| Export Data | ❌ |
| Manage Users | ❌ |
| Access Settings | ❌ |
| Change Theme | ✅ |
| View Guest Database | ❌ |
| View Audit Logs | ❌ |

---

## 📊 HOW TO USE NEW FEATURES

### Dynamic Room Management

**Adding a Room:**
1. Login as Admin
2. Click Settings ⚙️
3. Click "Manage Rooms"
4. Click "Add New Room"
5. Fill in:
   - Room Name: "Maison Pearl 406"
   - Room Number: "406"
   - Price: "16000"
   - Max Occupancy: "2"
   - Description: "Luxury suite with city view"
6. Click "Save Room"

**✨ What Happens:**
- Room appears on dashboard instantly
- Available for booking immediately
- Included in all reports
- Apartment count updates automatically

---

### Creating Team Accounts

**Adding a Manager:**
1. Login as Admin
2. Click Settings ⚙️
3. Click "Manage Users"
4. Click "Add New User"
5. Fill in:
   - Full Name: "John Manager"
   - Email: "john@hotel.com"
   - Password: "Manager@123"
   - Role: "Hotel Manager"
6. Click "Create User"

**They can now login with:**
- Email: john@hotel.com
- Password: Manager@123

---

### Using Guest Database

**Automatic Tracking:**
- Every booking automatically creates/updates guest record
- Tracks:
  - Total bookings
  - Total spending
  - Last visit date
  - VIP status (auto-upgrade at 5 bookings or PKR 100k spent)

**Viewing Guests:**
1. Click "Guests" tab (👥 icon)
2. See all customer history
3. Search by name, phone, or CNIC
4. Sort by bookings, spending, or last visit

**VIP Customers:**
- Automatically marked as VIP when:
  - 5+ total bookings, OR
  - PKR 100,000+ total spending
- Shows ⭐ VIP badge
- Highlighted with gold border

---

### Advanced Reports

**Daily Report:**
1. Click "Reports" tab
2. Click "Daily"
3. Select date
4. See revenue, bookings, occupancy for that day

**Weekly Report:**
1. Click "Reports" tab
2. Click "Weekly"
3. Select any date in the week
4. See full week stats (Monday-Sunday)

**Monthly Report:**
1. Click "Reports" tab
2. Click "Monthly"
3. Select month
4. See revenue, bookings, nights, occupancy rate

**Room-Wise Report:**
1. Click "Reports" tab
2. Click "Apartment"
3. See revenue breakdown per room

**Excel Export:**
1. Click "Reports" tab
2. Click "Excel" button
3. Downloads workbook with:
   - Sheet 1: All booking details
   - Sheet 2: Summary statistics
   - Sheet 3: Room-wise revenue

---

## 🚀 DEPLOYMENT TO PRODUCTION

### Option 1: Vercel (Recommended)

Follow the existing `MOBILE_INSTALLATION_GUIDE.md` steps:

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy
5. Share URL with team

**Your app URL:** `https://maison-royale.vercel.app`

### Option 2: Other Platforms

Works on:
- Netlify
- Railway
- Render
- AWS Amplify

Just make sure to set environment variables:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

---

## 📱 MOBILE APP INSTALLATION

Once deployed, users can install on phones:

**iPhone:**
1. Open Safari
2. Go to your-app.vercel.app
3. Tap Share → Add to Home Screen

**Android:**
1. Open Chrome
2. Go to your-app.vercel.app
3. Tap "Install App"

**Features:**
- Works offline ✅
- Auto-syncs when online ✅
- Installs like native app ✅
- No App Store needed ✅

---

## 💰 SELLING AS SaaS

Your app is now ready to sell to other hotels!

### Features That Make It Sellable:

1. **Multi-User Support** - Different hotels can have different teams
2. **Role-Based Access** - Proper permission system
3. **Dynamic Rooms** - Works for any number of rooms
4. **Professional Reports** - Excel exports, analytics
5. **Guest Database** - Customer relationship management
6. **Audit Logs** - Complete change tracking
7. **Mobile Support** - iOS & Android
8. **Offline Mode** - Works without internet
9. **Theme Customization** - Professional appearance

### Pricing Ideas:

- **Starter**: PKR 10,000/month - Up to 2 users, 20 rooms
- **Professional**: PKR 25,000/month - Up to 10 users, unlimited rooms
- **Enterprise**: PKR 50,000/month - Unlimited users, multi-property

### What to Customize Per Hotel:

1. Logo (replace in `src/imports/`)
2. Property name and details
3. Default rooms/apartments
4. Color scheme (in `src/styles/theme.css`)

---

## 🐛 TROUBLESHOOTING

### Database Issues

**"Column doesn't exist" errors:**
```sql
-- Check if migration ran successfully
SELECT * FROM users LIMIT 1;
SELECT * FROM guests LIMIT 1;
SELECT * FROM rooms LIMIT 1;
```

If any fail, re-run `DATABASE_UPGRADE.sql`

### Permission Issues

**"Access denied" on Settings:**
- Make sure you're logged in as Admin
- Check `users` table - your role should be 'admin'

**Can't see Room Management:**
- Only Admins can manage rooms
- Check user role in database

### Guest Database Empty

**No guests showing:**
- Guests are created when bookings are made
- Create a test booking to populate
- Check `guests` table in Supabase

### Reports Show Wrong Data

**Revenue doesn't match:**
- Make sure `price_per_night` saves effective price (after discount)
- Check BookingForm calculation
- Verify old bookings migrated correctly

### Excel Export Not Working

**Error when clicking Excel button:**
```bash
# Reinstall xlsx library
pnpm install xlsx
```

---

## 📞 SUPPORT & HELP

### Files to Reference:

- `DATABASE_UPGRADE.sql` - Database schema
- `PROFESSIONAL_UPGRADE_GUIDE.md` - Feature overview
- `MOBILE_INSTALLATION_GUIDE.md` - Mobile setup
- `PWA_SETUP_CHECKLIST.md` - Offline features
- `DEPLOYMENT_GUIDE.md` - Vercel deployment

### Common Commands:

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

---

## ✅ POST-SETUP CHECKLIST

- [ ] Database migration completed
- [ ] Admin account created and tested
- [ ] App runs on localhost
- [ ] Theme switching works
- [ ] Room added via Room Management
- [ ] User created via User Management
- [ ] Test booking created
- [ ] Guest appears in Guest Database
- [ ] Reports show correct data
- [ ] Excel export works
- [ ] CSV export works
- [ ] Offline mode tested
- [ ] Mobile installation tested (if deployed)

---

## 🎉 YOU'RE READY!

Your **Professional Hotel Management Software** is complete and ready to:

✅ Manage unlimited rooms  
✅ Handle multiple users with different roles  
✅ Track all customers automatically  
✅ Generate professional reports  
✅ Work offline and sync automatically  
✅ Export to Excel and CSV  
✅ Run on desktop and mobile  
✅ Sell to other hotels as SaaS  

---

## 🚀 NEXT STEPS

1. **Deploy to Vercel** (see MOBILE_INSTALLATION_GUIDE.md)
2. **Add your team** via User Management
3. **Add all your rooms** via Room Management
4. **Customize logo and colors** (optional)
5. **Train your team** on new features
6. **Start taking bookings!**

---

**🎊 Congratulations on your Professional Hotel Management Software!**

You now have enterprise-grade software that you can use for your own hotel or sell to others!

For questions or issues, check the troubleshooting section above or review the detailed guides in the documentation files.

**Happy booking! 🏨**
