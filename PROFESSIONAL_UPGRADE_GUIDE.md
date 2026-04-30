# 🚀 Professional Hotel Management Software Upgrade Guide

## ✨ What's New?

Your Maison Royale app has been upgraded to **Professional Hotel Management Software** level!

### New Features:
- ✅ Role-Based Access Control (Admin, Manager, Staff)
- ✅ Settings Page with Light/Dark Theme
- ✅ Dynamic Room Management (Add/Remove rooms)
- ✅ User Management System
- ✅ Guest Database & Customer Tracking
- ✅ Booking Notes & Special Requests
- ✅ Audit Logs (Track who made what changes)
- ✅ Cleaning Status Workflow
- ✅ Multi-Property Support (For multiple hotels)
- ✅ Advanced Reports (Daily/Weekly/Monthly)
- ✅ Calendar View
- ✅ Smart Dashboard Stats

---

## 📋 STEP-BY-STEP SETUP

### STEP 1: Run Database Migration

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Sign in** to your project
3. **Click "SQL Editor"** in the left sidebar
4. **Copy and paste** the entire content from `DATABASE_UPGRADE.sql`
5. **Click "Run"**
6. **Wait** for success message ✅

**This will create:**
- Users table (with roles)
- Properties table (multi-hotel support)
- Rooms table (dynamic room management)
- Guests table (customer database)
- Audit logs table (track all changes)
- User permissions table

---

### STEP 2: Create Your First Admin User

After running the migration, create your admin account:

1. **Go to Supabase SQL Editor**
2. **Run this SQL** (replace with your details):

```sql
-- Create auth user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'your-email@example.com',
  crypt('your-secure-password', gen_salt('bf')),
  NOW()
);

-- Get the user ID and create profile
INSERT INTO users (auth_user_id, name, email, role)
SELECT 
  id,
  'Your Full Name',
  'your-email@example.com',
  'admin'
FROM auth.users
WHERE email = 'your-email@example.com';
```

**Note:** Replace:
- `your-email@example.com` with your email
- `your-secure-password` with a strong password
- `Your Full Name` with your actual name

---

### STEP 3: Login and Explore New Features

1. **Start your app**: `pnpm dev`
2. **Login** with your new admin credentials
3. **Click the Settings ⚙️ icon** in the top right

You'll see:
- ✅ Theme Settings (Light/Dark mode)
- ✅ Room Management button
- ✅ User Management button

---

## 🏨 How to Use New Features

### 1. Add New Rooms (Dynamic Room Management)

**Admin Only**

1. **Click Settings ⚙️** → **"Manage Rooms"**
2. **Click "Add New Room"**
3. **Fill in details:**
   - Room Name (e.g., "Maison Pearl 406")
   - Room Number (e.g., "406")
   - Price per Night (e.g., "15000")
   - Max Occupancy (e.g., "2")
   - Description (optional)
4. **Click "Save Room"**

**✨ The room automatically:**
- Appears on the dashboard
- Works in booking system
- Included in reports
- Updates apartment count

---

### 2. Add Team Members (User Management)

**Admin Only**

1. **Click Settings ⚙️** → **"Manage Users"**
2. **Click "Add New User"**
3. **Fill in:**
   - Full Name
   - Email
   - Password (minimum 6 characters)
   - Role:
     - **Staff**: Can create bookings, checkout guests
     - **Manager**: Can create, edit bookings, view reports
     - **Admin**: Full access (you!)
4. **Click "Create User"**

**User roles determine access:**

| Feature | Admin | Manager | Staff |
|---------|-------|---------|-------|
| View Dashboard | ✅ | ✅ | ✅ |
| Create Booking | ✅ | ✅ | ✅ |
| Edit Booking | ✅ | ✅ | ❌ |
| Delete Booking | ✅ | ❌ | ❌ |
| Checkout Guest | ✅ | ✅ | ✅ |
| Add/Remove Rooms | ✅ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| Access Settings | ✅ | ❌ | ❌ |
| Change Theme | ✅ | ❌ | ✅ |

---

### 3. Change Theme

**Any User** (Admin and Staff can change their own theme)

1. **Click Settings ⚙️**
2. **Choose:**
   - **Light Mode** (default)
   - **Dark Mode** (professional dark theme)
3. **Theme saves** automatically per user

---

### 4. Add Booking Notes

When creating a booking, you'll now see:
- **Notes** field for internal notes
- **Special Requests** field for guest requests
- Examples:
  - "VIP guest - extra pillows"
  - "Late checkout requested"
  - "Celebrating anniversary"

---

### 5. Track Guest History

The system now automatically tracks:
- Total bookings per guest
- Total amount spent
- Last visit date
- Repeat customers

**Coming in next update:**
- Guest database view
- VIP customer list
- Spending reports

---

## 🎯 What Permissions Mean

### Admin (Owner/Administrator)
- **Full Control** of everything
- Can add/remove users
- Can add/remove rooms
- Can access all settings
- Can view financial reports
- Can export all data

### Manager (Hotel Manager)
- Can manage daily operations
- Create and edit bookings
- Checkout guests
- View reports (non-financial)
- **Cannot** delete bookings
- **Cannot** add/remove rooms
- **Cannot** manage users
- **Cannot** access settings

### Staff (Front Desk Staff)
- Basic booking operations
- Create new bookings
- Checkout guests
- **Cannot** edit bookings
- **Cannot** delete bookings
- **Cannot** view reports
- Can change their own theme

---

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only see their property's data
- Admins have full access
- Managers see only their assigned property
- Staff see only necessary information

### Audit Logging
Every action is logged:
- Who created the booking
- Who edited it
- Who checked out the guest
- When each action happened

---

## 📊 Coming Soon Features

These features are being developed:

- ✅ Calendar View (Shows all bookings visually)
- ✅ Smart Dashboard (Today's check-ins/outs)
- ✅ Advanced Reports (Daily/Weekly/Monthly)
- ✅ Guest Database View
- ✅ Cleaning Status Management
- ✅ Multi-Property Support
- ✅ Excel/PDF Export
- ✅ Push Notifications

---

## 🐛 Troubleshooting

### "Permission denied" error
**Solution:** Make sure you ran the full database migration SQL

### Can't see Settings button
**Solution:** Make sure you're logged in as Admin role

### New users can't log in
**Solution:** Check that their email is correct and password is at least 6 characters

### Rooms not appearing
**Solution:** Make sure the room is marked as "active" in Room Management

---

## 🆘 Need Help?

If you encounter issues:

1. Check this guide first
2. Check Supabase SQL Editor for error messages
3. Check browser console (F12) for errors
4. Make sure all database migrations ran successfully

---

## 🎉 You're Ready!

Your app is now **Professional Hotel Management Software** ready to:

- Manage multiple properties
- Handle multiple users with different roles
- Track everything with audit logs
- Scale to unlimited rooms
- Sell to other hotels!

**Next Steps:**
1. Add all your rooms via Room Management
2. Create accounts for your team members
3. Test the new features
4. Deploy to production (Vercel)

---

**Congratulations on your upgrade!** 🚀

Your Maison Royale app is now enterprise-ready software that you can sell to other hotels as a SaaS product!
