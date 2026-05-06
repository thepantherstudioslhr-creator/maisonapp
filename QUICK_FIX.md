# 🔧 Quick Fix - Login Error

## Problem
`Invalid login credentials` error means user doesn't exist in Supabase Auth

## Solution (Choose One)

### ✅ Option 1: Create Admin via SQL (RECOMMENDED)

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Go to**: Your Project → SQL Editor
3. **Copy & Paste** the entire content from `SYNC_AUTH_USER.sql`
4. **Click "Run"**
5. **Verify** you see: `✅ Admin created! UUID: ...`
6. **Refresh browser** and login with:
   - Email: `admin@maisonroyale.com`
   - Password: `Admin123456`

---

### Option 2: Create User via Supabase UI

1. **Supabase Dashboard** → Authentication → Users
2. **Click "Add User"**
3. **Enter**:
   - Email: `admin@maisonroyale.com`
   - Password: `Admin123456`
   - ✅ Auto Confirm User
4. **Copy the User UUID** (looks like: `a1b2c3d4-...`)
5. **Go to SQL Editor** and run:
   ```sql
   INSERT INTO users (auth_user_id, name, email, role, theme_preference, is_active)
   VALUES (
     'PASTE-UUID-HERE',
     'Admin User',
     'admin@maisonroyale.com',
     'admin',
     'dark',
     true
   );
   ```

---

## After SQL Run

1. Hard refresh browser: **Ctrl + Shift + R**
2. Login: `admin@maisonroyale.com` / `Admin123456`
3. Check console (F12) for: `✅ Auth successful, user ID: ...`
