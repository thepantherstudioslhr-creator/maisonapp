# 🔐 User Login Setup Guide - Maison Royale Residency

## 📋 **Complete Process: Supabase Se Login Tak**

---

## ✅ **How It Works (Auto-Sync System)**

Maine **automatic system** banaya hai:

1. ✅ **Supabase Auth** mein user create karo
2. ✅ User login karta hai
3. ✅ **Automatically** `users` table mein entry create hoti hai
4. ✅ **Role automatically assign** hota hai (email se)
5. ✅ User dashboard access kar sakta hai!

---

## 🚀 **Step-by-Step: Naye User Kaise Add Karein**

### **Method 1: Auto-Sync (Recommended)** ⭐

#### **Step 1: Supabase Auth Mein User Create Karo**

1. **Supabase Dashboard** kholo: https://supabase.com/dashboard
2. Apna project select karo: `Maison Royale Residency`
3. Left sidebar → **Authentication**
4. **Users** tab click karo
5. **Add user** button (top-right)
6. Fill karo:
   ```
   Email: manager1@maisonroyale.com
   Password: YourSecurePassword123
   Auto Confirm User: ✅ (Check kar lo)
   ```
7. **Create User** click karo

✅ **Done!** Auth mein user ban gaya!

---

#### **Step 2: User Login Karega (First Time)**

1. User app kholta hai: https://maisonbooking.vercel.app
2. Email aur password enter karta hai
3. **Login** click karta hai

**Behind the scenes:**
```
→ Auth check ✅
→ users table check ❌ (nahi mila)
→ Auto-create user in table ✅
→ Role assign (email se) ✅
→ Login successful! ✅
```

**Console mein dikhega:**
```
User not found in users table, creating...
✅ User created in users table: { email: "...", role: "manager" }
```

---

#### **Step 3: Verify (Admin Panel)**

1. Admin login karo
2. **Users** tab kholo
3. Naya user dikhai dega with role!

---

## 🎯 **Role Assignment (Automatic)**

**Email mein "admin" hai?**
```
admin@maisonroyale.com → Role: Admin ✅
support.admin@company.com → Role: Admin ✅
```

**Email mein "admin" NAHI hai?**
```
manager@maisonroyale.com → Role: Manager ✅
john@company.com → Role: Manager ✅
```

---

### **Method 2: Manual Table Entry (Old Way)**

Agar auto-sync kaam na kare:

#### **Step 1: Auth User ID Copy Karo**

1. Supabase → **Authentication** → **Users**
2. User ka **UID** copy karo (e.g., `abc-123-def-456...`)

#### **Step 2: Users Table Mein Add Karo**

1. Supabase → **Table Editor** → **`users`** table
2. **Insert** → **Insert row**
3. Fill karo:

```sql
id: (leave empty - auto-generated)
auth_user_id: abc-123-def-456... (paste from Step 1)
email: manager@maisonroyale.com
full_name: Manager Name
role: manager (ya admin)
is_active: true
theme_preference: dark
created_at: (auto)
updated_at: (auto)
```

4. **Save** click karo

✅ Ab user login kar sakta hai!

---

## 👥 **User Management (Admin Only)**

Admin panel se users manage karo:

### **Access:**
1. Admin login karo
2. **Users** tab kholo (🔑 icon)

### **Features:**

**✅ View All Users**
- Email
- Name
- Role
- Status (Active/Inactive)

**✅ Change Role**
- Admin ↔ Manager dropdown se change karo

**✅ Activate/Deactivate**
- Green (Active) / Red (Inactive)
- Click karke toggle karo

**✅ Delete User**
- Trash icon click karo
- Confirm karo

**⚠️ Note:** Khud ko delete/deactivate nahi kar sakte!

---

## 📧 **Current Users (Example)**

### **Admin:**
```
Email: admin@maisonroyale.com
Password: Admin123456
Role: Admin
Access: Full (All features)
```

### **Manager:**
```
Email: manager@maisonroyale.com
Password: Manager123456
Role: Manager
Access: Booking, Reports, Guests
```

---

## 🔑 **Permissions System**

### **Admin Permissions:**
- ✅ Create/Edit/Delete bookings
- ✅ View reports
- ✅ Manage guests
- ✅ **Manage users** (exclusive)
- ✅ Change settings
- ✅ Full access

### **Manager Permissions:**
- ✅ Create/Edit/Delete bookings
- ✅ View reports
- ✅ Manage guests
- ❌ Manage users (blocked)
- ✅ Basic settings

---

## 🛠️ **How to Add Multiple Users (Bulk)**

### **Quick Process:**

**Supabase Auth:**
```
1. Add email + password
2. Auto-confirm ✅
3. Repeat for each user
```

**Users Login:**
```
Each user logs in → Auto-synced! ✅
```

---

## 🧪 **Testing New User**

### **Test Karo:**

1. **Create test user in Auth:**
   ```
   Email: test@maisonroyale.com
   Password: Test123456
   ```

2. **Login karo app mein**
3. **Console check karo (F12):**
   ```
   Expected:
   "User not found in users table, creating..."
   "✅ User created in users table"
   ```

4. **Admin panel check karo:**
   - Users tab
   - Test user dikhai dega
   - Role: Manager (default)

5. **Change role to Admin** (if needed)

---

## 🚨 **Common Issues & Fixes**

### **Issue 1: Login Error - "User not found"**

**Reason:** Auth mein user hai, table mein nahi

**Fix:** 
- Login karo → Auto-create hoga
- Ya manually table mein add karo

---

### **Issue 2: Login Error - "Invalid credentials"**

**Reason:** Auth mein user hi nahi hai

**Fix:**
- Supabase Auth mein user create karo
- Email/password verify karo

---

### **Issue 3: User Logged In But No Access**

**Reason:** `is_active = false` ya role missing

**Fix:**
1. Admin panel → Users tab
2. User find karo
3. Status toggle karo (Green = Active)
4. Role check karo

---

### **Issue 4: "Failed to create user profile"**

**Reason:** Table permissions issue

**Fix:**
1. Supabase → **Table Editor** → **users** table
2. Click **RLS** (Row Level Security)
3. **Policies** check karo

**Required Policy:**
```sql
-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can create own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = auth_user_id);
```

---

### **Issue 5: Auto-Confirm Not Working**

**Reason:** User ko email verification link milta hai

**Fix:**
1. Supabase → **Authentication** → **Settings**
2. **Email Auth** section
3. **Enable email confirmations:** OFF karo
4. Ya user creation time **Auto Confirm** check karo

---

## 🎯 **Role Change Process**

### **Change Manager → Admin:**

**Method 1: Admin Panel**
1. Login as admin
2. Users tab
3. User find karo
4. Role dropdown → Admin select karo
5. ✅ Done!

**Method 2: Direct Database**
1. Supabase → Table Editor → users
2. User row find karo
3. `role` column → `admin` type karo
4. Save

---

## 📱 **Mobile App Login**

Same process - koi fark nahi!

**Users install karke:**
1. App kholo (installed PWA)
2. Email/Password enter karo
3. Login
4. Auto-sync! ✅

---

## 🔒 **Password Reset (Future Feature)**

Abhi manually:

1. Supabase → Authentication → Users
2. User find karo
3. **⋯** menu (3 dots)
4. **Send password reset email**
5. User email check karega
6. Link click → New password set karega

---

## 📊 **Summary Table**

| Step | Action | Where | Result |
|------|--------|-------|--------|
| 1 | Create user | Supabase Auth | User auth ID created |
| 2 | User logs in | App login page | Auto-sync to table |
| 3 | Role assigned | Auto (based on email) | Manager/Admin |
| 4 | Manage user | Admin panel | Change role/status |

---

## ✅ **Quick Checklist**

**To Add New User:**
- [ ] Supabase Auth mein user create kiya
- [ ] Email/password set kiya
- [ ] Auto-confirm checked
- [ ] User ko credentials diye
- [ ] User ne login kiya
- [ ] Console mein success message dekha
- [ ] Admin panel mein verify kiya

**To Manage User:**
- [ ] Admin login kiya
- [ ] Users tab khola
- [ ] User dikhai de raha hai
- [ ] Role correct hai
- [ ] Status Active hai
- [ ] Test login successful

---

## 💡 **Pro Tips**

### **Tip 1: Email Convention**
```
Admins: admin@maisonroyale.com, admin2@...
Managers: manager1@..., manager2@...
```

### **Tip 2: Password Policy**
```
Minimum 8 characters
Mix of letters + numbers
Example: Manager123456
```

### **Tip 3: Testing**
```
Always test new user login before giving credentials!
Check console for errors
```

### **Tip 4: Role Changes**
```
User logout → Role change → User login = New permissions
```

---

## 🎓 **Training New Users**

**Send them:**
```
Email: your.email@maisonroyale.com
Password: YourPassword123
App URL: https://maisonbooking.vercel.app

Instructions:
1. Open link
2. Enter email/password
3. Click Login
4. Dashboard will appear
5. Explore tabs!
```

---

## 📞 **Support**

**Issues?**
1. Check console (F12) for errors
2. Verify Auth user exists
3. Check `users` table entry
4. Test login in incognito mode
5. Contact admin

---

## 🚀 **Next Steps**

**Recommended:**
1. ✅ Create 2-3 test users
2. ✅ Test login with each
3. ✅ Verify auto-sync works
4. ✅ Test role changes
5. ✅ Test permissions
6. ✅ Deploy & share with team!

---

**System Status:**
```
✅ Auto-sync: Working
✅ Role assignment: Automatic
✅ Admin panel: Available
✅ User management: Enabled
✅ Ready for production!
```

**Enjoy your user management system!** 🎉
