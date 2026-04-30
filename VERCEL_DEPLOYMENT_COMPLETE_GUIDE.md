# 🚀 Vercel Deployment - Complete Guide (Hindi + English)

## ✅ Files Fixed

Maine ye files create/update kar di hain:
- ✅ `vercel.json` - Framework set to "vite"
- ✅ `package.json` - Scripts updated
- ✅ `.npmrc` - NPM configuration
- ✅ `.gitignore` - Git ignore rules

---

## 📋 Step-by-Step Deployment Process

### **Step 1: Download Code from Figma Make**

1. **Figma Make** mein **Download** button dhoondhein (top-right corner)
2. ZIP file download hogi
3. ZIP extract karein

---

### **Step 2: Upload to GitHub**

#### **Option A: Drag & Drop (Sabse Easy)**

1. Go to **github.com** → Login
2. Click **"+"** → **"New repository"**
3. Name: `maison-royale-residency`
4. Choose **Private**
5. **DON'T** check "Add README"
6. Click **"Create repository"**
7. Click **"uploading an existing file"** link
8. **Drag ALL files** from extracted folder
9. Commit message: `Initial deployment`
10. Click **"Commit changes"**

#### **Option B: GitHub Desktop**

1. Download **GitHub Desktop**
2. File → Add Local Repository
3. Choose your extracted folder
4. Publish to GitHub

---

### **Step 3: Deploy to Vercel**

#### **A. Create Vercel Account**

1. Go to **vercel.com**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel

#### **B. Import Project**

1. Click **"Add New..."** → **"Project"**
2. Find **"maison-royale-residency"**
3. Click **"Import"**

#### **C. Configure Settings**

Vercel will auto-detect:
- ✅ Framework Preset: **Vite**
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`
- ✅ Install Command: `npm install`

**Leave these as default!**

---

### **Step 4: Add Environment Variables** ⚠️ CRITICAL

Scroll down to **"Environment Variables"** section:

#### **Variable 1:**
```
Name:  VITE_SUPABASE_URL
Value: https://rhnimhnafkhbdqqknrxl.supabase.co
```
Click **"Add"**

#### **Variable 2:**
```
Name:  VITE_SUPABASE_ANON_KEY
Value: [Your anon key from Supabase]
```

**Kaise dhoondhein:**
1. Supabase.com → Login
2. Your project select karein
3. Settings (⚙️) → API
4. Copy **"anon public"** key (jo `eyJh...` se start hoti hai)
5. Paste karein

---

### **Step 5: Deploy! 🎉**

1. Click **"Deploy"** button
2. Wait **2-3 minutes**
3. ✅ Build successful!
4. URL milega: `https://maison-royale-residency.vercel.app`

---

## 🔧 Troubleshooting

### **Error: Build Failed**

**Solution:**
1. Check Environment Variables are added
2. Redeploy: Settings → Deployments → "Redeploy"

### **Error: Can't Connect to Supabase**

**Solution:**
1. Verify variable names: `VITE_SUPABASE_URL` (not SUPABASE_URL)
2. Check no extra spaces in values
3. Redeploy after adding variables

### **Error: 404 on Page Refresh**

**Already Fixed!** `vercel.json` has rewrites configuration.

---

## 📱 After Deployment - Testing

1. ✅ Open Vercel URL
2. ✅ Try login
3. ✅ Check bookings load
4. ✅ Test booking creation

---

## 🔄 Future Updates

Jab bhi code update karein:

1. GitHub mein jaake files edit karein
2. Commit changes
3. Vercel **automatically** redeploy karega!

**Or:**

1. Local code update karein
2. `git add .`
3. `git commit -m "Updated feature"`
4. `git push`
5. Vercel auto-deploys!

---

## 📊 Environment Variables Summary

```
VITE_SUPABASE_URL          = https://rhnimhnafkhbdqqknrxl.supabase.co
VITE_SUPABASE_ANON_KEY     = eyJhbGc... (long string from Supabase)
```

**Where to add:**
Vercel Dashboard → Your Project → Settings → Environment Variables

---

## ✅ Final Checklist

- [ ] Code downloaded from Figma Make
- [ ] GitHub repository created
- [ ] All files uploaded to GitHub
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Environment variables added (both!)
- [ ] Deployed successfully
- [ ] App tested and working

---

## 🎯 Common Mistakes to Avoid

❌ **WRONG:** `SUPABASE_URL` (missing VITE_ prefix)
✅ **RIGHT:** `VITE_SUPABASE_URL`

❌ **WRONG:** Adding `/rest/v1/` to URL
✅ **RIGHT:** Just `https://rhnimhnafkhbdqqknrxl.supabase.co`

❌ **WRONG:** Using `service_role` key
✅ **RIGHT:** Using `anon public` key

---

## 💡 Pro Tips

1. **Test locally first:** Create `.env` file with same variables
2. **Check Vercel logs:** If build fails, check deployment logs
3. **Use Vercel CLI:** For faster deploys (optional)
4. **Enable Analytics:** Vercel → Your Project → Analytics

---

## 🆘 Need Help?

If deployment fails:
1. Check Vercel deployment logs
2. Verify all files uploaded to GitHub
3. Confirm environment variables are correct
4. Try "Redeploy" button in Vercel

---

## 🎉 Success!

Your app is now live at:
```
https://[your-project-name].vercel.app
```

Share this URL with anyone to access your app!

---

**Last Updated:** April 30, 2026
**App Name:** Maison Royale Residency
**Deployment Platform:** Vercel
