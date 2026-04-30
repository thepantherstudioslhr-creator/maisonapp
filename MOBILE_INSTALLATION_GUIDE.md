# 📱 Maison Royale - Mobile Installation Guide

## Complete Offline & Sync Setup for iOS & Android

---

## ✨ Features You Get

✅ **Works on iPhone & Android** - Install like a native app  
✅ **Offline Mode** - Create bookings without internet  
✅ **Auto-Sync** - Data syncs automatically when back online  
✅ **Real-Time Updates** - All team members see changes instantly  
✅ **No App Store** - Install directly from browser  
✅ **Free Updates** - Auto-updates when you deploy changes  

---

## 🚀 Step 1: Deploy Your App

### Deploy to Vercel (Required First)

1. **Push code to GitHub** (see DEPLOYMENT_GUIDE.md)
2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
3. **Add Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://rhnimhnafkhbdqqknrxl.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_mZ-Q4Itsh9ZQSVFVxmDMOA_5PUJvBmu
   ```
4. **Deploy** and copy your URL: `https://your-app.vercel.app`

---

## 📱 Step 2: Install on iPhone (iOS)

### Installation Steps:

1. **Open Safari** (must use Safari, not Chrome)
2. **Go to your Vercel URL**: `https://your-app.vercel.app`
3. **Tap the Share button** (square with arrow pointing up)
4. **Scroll down** and tap **"Add to Home Screen"**
5. **Name it**: "Maison Royale"
6. **Tap "Add"**

### ✅ Done! The app icon appears on your home screen

**Features on iOS:**
- 🎯 Opens like a native app
- 📱 Full screen (no Safari toolbar)
- 🔴 Works offline
- 🔄 Auto-syncs when online
- 📲 Can use all features offline

---

## 🤖 Step 3: Install on Android

### Installation Steps:

1. **Open Chrome** (or any browser)
2. **Go to your Vercel URL**: `https://your-app.vercel.app`
3. **Tap the menu** (⋮ three dots)
4. **Tap "Install App"** or **"Add to Home screen"**
5. **Tap "Install"**

**Alternative Method:**
- Chrome will show a banner at the bottom: **"Add Maison Royale to Home screen"**
- Tap "Add"

### ✅ Done! App icon added to your phone

**Features on Android:**
- 🎯 Opens like a native app
- 📱 Standalone window
- 🔴 Full offline support
- 🔄 Background sync
- 📲 Notifications (when enabled)

---

## 🔴 How Offline Mode Works

### When You're Offline:

1. **Red banner appears**: "🔴 OFFLINE MODE - Bookings will sync when online"
2. **Create bookings normally** - they save locally
3. **All features work** except:
   - Can't see other users' new bookings
   - Can't export reports
   - Can't view receipts

### When You're Back Online:

1. **Blue banner appears**: "⚠️ X booking(s) waiting to sync"
2. **Click "Sync Now"** button or wait for auto-sync
3. **All offline bookings upload** to database
4. **Success message shows**: "✅ Synced X offline booking(s)!"
5. **Other team members see** your bookings instantly

### Auto-Sync:
- Syncs **automatically** when internet comes back
- Syncs in **background** when app is open
- **No data loss** - everything saved securely

---

## 👥 Step 4: Share with Your Team

### Send this message to your team:

```
📱 MAISON ROYALE MANAGEMENT APP

🌐 Access Link: https://your-app.vercel.app

📲 INSTALLATION:

For iPhone:
1. Open link in Safari
2. Tap Share → Add to Home Screen
3. Tap "Add"

For Android:
1. Open link in Chrome
2. Tap "Install App"
3. Tap "Install"

🔐 Login:
Email: [your-email]
Password: [your-password]

✨ FEATURES:
✅ Works offline
✅ Auto-syncs when online
✅ Real-time updates
✅ Like a native app

Questions? Let me know!
```

---

## 🔄 Real-Time Sync Between Users

### How Multi-User Sync Works:

**User A (Online):**
- Creates booking at 2:00 PM
- Saves to database ✅
- User B sees it instantly 🔴

**User B (Offline):**
- Creates booking at 2:05 PM
- Saves locally 💾
- Waits for internet 📡

**User B (Back Online at 2:30 PM):**
- App auto-syncs 🔄
- Booking uploads to database ✅
- User A sees it instantly 🔴
- User C sees it instantly 🔴

**All Users:**
- Dashboard updates in real-time
- No refresh needed
- No duplicate bookings
- No conflicts

---

## 🎯 Testing Offline Mode

### Test it yourself:

1. **Install app** on your phone
2. **Turn on Airplane Mode** ✈️
3. **Create a test booking**:
   - Red banner shows "OFFLINE MODE"
   - Booking saves locally
   - No error messages
4. **Turn off Airplane Mode** 📡
5. **Blue banner shows**: "X booking(s) waiting to sync"
6. **Tap "Sync Now"**
7. **Success!** ✅ Booking appears in database
8. **Check on another device** - booking is there!

---

## 💾 How Much Data is Stored Offline?

**Storage Capacity:**
- **iOS Safari**: ~50 MB offline storage
- **Android Chrome**: ~100 MB offline storage
- **Average booking**: ~1 KB

**This means:**
- You can store **50,000+ bookings** offline
- Plenty of space for months of data
- No storage issues

---

## 🔧 Troubleshooting

### "Add to Home Screen" option not showing (iPhone):

❌ Using Chrome/Firefox  
✅ **Must use Safari browser**

### App not working offline:

1. **Reinstall the app**:
   - Delete from home screen
   - Reinstall from browser
2. **Clear browser cache**
3. **Make sure** you deployed with manifest.json

### Bookings not syncing:

1. **Check blue banner** - does it show pending count?
2. **Tap "Sync Now"** manually
3. **Check internet connection**
4. **Check Supabase** - is it online?

### Not updating in real-time:

1. **Refresh the app** (pull down on mobile)
2. **Check internet connection**
3. **Verify all users** are on same Vercel URL

---

## 🌟 Best Practices

### For Team Leaders:

✅ **Test offline mode** before rolling out  
✅ **Train team** on offline indicator  
✅ **Monitor Supabase** database regularly  
✅ **Keep backup** of booking data  

### For Team Members:

✅ **Sync regularly** - don't wait too long  
✅ **Check sync status** before important bookings  
✅ **Report issues** immediately  
✅ **Keep app updated** (reinstall monthly)  

---

## 📊 What Syncs vs What Doesn't

### ✅ Works Offline:

- Create new bookings
- View existing bookings (cached)
- View dashboard (cached)
- View today's summary (cached)
- Fill booking forms
- Calculate prices

### ❌ Requires Internet:

- Export CSV reports
- Generate PDF receipts
- WhatsApp sharing
- See other users' new bookings
- Real-time updates
- Check-out guests
- View calendar

---

## 🎉 Success!

Your team can now:
- 📱 Use the app on any phone
- 🔴 Work completely offline
- 🔄 Auto-sync when online
- 👥 See each other's updates instantly
- 💾 Never lose data

**No App Store. No monthly fees. Complete control.**

---

## 🆘 Need Help?

If you have issues:

1. **Check this guide** first
2. **Test on different device**
3. **Check Vercel deployment** logs
4. **Check Supabase** status
5. **Reinstall the app**

---

## 🚀 Future Enhancements (Optional)

Want more features?

- **Push notifications** when new bookings arrive
- **Biometric login** (fingerprint/Face ID)
- **Dark mode** toggle
- **Multiple languages**
- **Voice commands**

Let me know what you need!

---

**Congratulations!** 🎉  
Your hotel management system is now **mobile-ready with offline support**!
