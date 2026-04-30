# 🔄 RESET SUPABASE & START FRESH

## ⚠️ You tried some changes and login is broken - Let's fix it!

---

## 🚀 SIMPLE 4-STEP RESET PROCESS

### STEP 1: Reset Everything in Supabase

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Go to SQL Editor** (left sidebar)
3. **Open the file: `RESET_SUPABASE.sql`**
4. **IMPORTANT**: Edit line 24 - Replace with YOUR email to keep:
   ```sql
   WHERE email NOT IN ('your-actual-email@example.com');
   ```
   Change `your-actual-email@example.com` to your real email

5. **Copy the ENTIRE file**
6. **Paste into Supabase SQL Editor**
7. **Click "RUN"**
8. **Wait for success** ✅

**This will:**
- Delete all new tables
- Remove new columns from bookings
- Delete test users
- Give you a clean slate

---

### STEP 2: Run Fresh Database Migration

1. **Stay in Supabase SQL Editor**
2. **Open the file: `DATABASE_UPGRADE.sql`**
3. **Copy the ENTIRE file**
4. **Paste into Supabase SQL Editor**
5. **Click "RUN"**
6. **Wait for success** ✅

**This recreates:**
- users table
- properties table
- rooms table
- guests table
- audit_logs table
- All permissions

---

### STEP 3: Create Fresh Admin Account

1. **Stay in Supabase SQL Editor**
2. **Open the file: `FRESH_SETUP.sql`**
3. **Copy the ENTIRE file**
4. **Paste into Supabase SQL Editor**
5. **Click "RUN"**
6. **Wait for success** ✅

**This creates a brand new admin user:**
- **Email**: `admin@maisonroyale.com`
- **Password**: `Admin123456`

---

### STEP 4: Login & Test

1. **Open your app**:
   ```bash
   pnpm dev
   ```

2. **Login with:**
   - Email: `admin@maisonroyale.com`
   - Password: `Admin123456`

3. **You should see:**
   - Dashboard loads ✅
   - Settings icon (⚙️) in top right ✅
   - All tabs visible ✅

4. **Test Settings:**
   - Click Settings ⚙️
   - Try theme toggle
   - Click "Manage Rooms"
   - Click "Manage Users"

---

## 📝 ALTERNATIVE: Manual Reset (If SQL fails)

### Option A: Reset in Supabase Dashboard

1. **Go to Supabase Dashboard**
2. **Database → Tables**
3. **Delete these tables (in this order):**
   - audit_logs
   - user_permissions
   - rooms
   - guests
   - users
   - properties

4. **Go to Authentication → Users**
5. **Delete all test users**
6. **Keep only your main account**

### Option B: Start Fresh Project

If everything is too broken:

1. **Create NEW Supabase project**
2. **Copy the NEW credentials**
3. **Update `.env` file**:
   ```
   VITE_SUPABASE_URL=your-new-url
   VITE_SUPABASE_ANON_KEY=your-new-key
   ```
4. **Run `DATABASE_UPGRADE.sql`**
5. **Run `FRESH_SETUP.sql`**

---

## 🐛 TROUBLESHOOTING

### Error: "relation does not exist"
**Solution**: Some tables already deleted. Continue with next step.

### Error: "duplicate key value"
**Solution**: User already exists. Delete from auth.users first:
```sql
DELETE FROM auth.users WHERE email = 'admin@maisonroyale.com';
```
Then run FRESH_SETUP.sql again.

### Error: "column does not exist"
**Solution**: Reset didn't complete. Run RESET_SUPABASE.sql again.

### Login still not working
**Solution**: 
1. Clear browser cache (Ctrl+Shift+Delete)
2. Close all browser tabs
3. Restart browser
4. Try login again

### "Invalid login credentials"
**Solution**: Make sure you ran FRESH_SETUP.sql completely. Check:
```sql
SELECT * FROM users WHERE email = 'admin@maisonroyale.com';
```
Should show the admin user.

---

## ✅ VERIFICATION CHECKLIST

After reset, verify:

- [ ] Can login with `admin@maisonroyale.com` / `Admin123456`
- [ ] Dashboard loads
- [ ] Settings icon visible (top right)
- [ ] Can open Settings page
- [ ] Can open Room Management (admin only)
- [ ] Can open User Management (admin only)
- [ ] Guests tab visible
- [ ] Reports tab works

---

## 📞 STILL STUCK?

### Check These:

1. **Supabase Project Status**
   - Is your project active?
   - Are you in the correct project?

2. **Environment Variables**
   - Check `.env` file
   - Are VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY correct?

3. **Database Tables**
   - Go to Supabase → Database → Tables
   - Do you see: users, properties, rooms, guests, audit_logs?

4. **Auth Users**
   - Go to Supabase → Authentication → Users
   - Do you see: admin@maisonroyale.com?

---

## 🎯 QUICK REFERENCE

### Files to Run (In Order):
1. `RESET_SUPABASE.sql` - Cleans everything
2. `DATABASE_UPGRADE.sql` - Creates tables
3. `FRESH_SETUP.sql` - Creates admin user

### Default Login:
- Email: `admin@maisonroyale.com`
- Password: `Admin123456`

### After Login:
- Change password in Settings
- Create your real admin account
- Delete the default admin

---

## 🔒 SECURITY NOTE

**After successful login:**

1. **Create your real admin account:**
   - Click Settings ⚙️
   - Click "Manage Users"
   - Add new user with YOUR email
   - Set role to "Admin"

2. **Delete the default admin:**
   - Logout
   - Login with your new account
   - Go to User Management
   - Delete `admin@maisonroyale.com`

3. **Change default password** if you keep using admin@maisonroyale.com

---

## 🎊 SUCCESS!

Once login works, you're ready to:
- ✅ Add your rooms
- ✅ Create team accounts
- ✅ Start taking bookings
- ✅ Use all professional features!

---

**Follow these steps carefully and your login will work! 🚀**
