# 🚀 Deploy to Vercel - Quick Commands

## Prerequisites Checklist
- ✅ All code changes are complete
- ✅ Supabase project is set up
- ✅ You have your Supabase URL and Anon Key ready

## Step 1: Commit and Push to GitHub

Copy and paste these commands in your terminal (in the project root):

```bash
# Add all changes
git add .

# Commit with a descriptive message
git commit -m "Fix Vercel deployment - add React dependencies, entry files, and fix imports"

# Push to GitHub
git push origin main
```

**Expected Output:**
```
Enumerating objects: 25, done.
Counting objects: 100% (25/25), done.
Delta compression using up to 8 threads
Compressing objects: 100% (15/15), done.
Writing objects: 100% (15/15), 5.23 KiB | 1.74 MiB/s, done.
Total 15 (delta 10), reused 0 (delta 0), pack-reused 0
To https://github.com/thepantherstudioslhr-creator/maison-royale-hotel.git
   abc1234..def5678  main -> main
```

✅ **Checkpoint:** Your code is now on GitHub!

---

## Step 2: Deploy on Vercel (Web Interface)

### 2a. Open Vercel Dashboard
```
URL: https://vercel.com/dashboard
```

### 2b. Import Project
1. Click **"Add New"** button (top right)
2. Select **"Project"**
3. Click **"Import"** next to your GitHub repository: `maison-royale-hotel`

### 2c. Configure Project

**Framework Preset:**
```
Vite
```

**Root Directory:**
```
./
```
(Leave as default - use root)

**Build and Output Settings:**

| Setting | Value |
|---------|-------|
| Build Command | `pnpm build` |
| Output Directory | `dist` |
| Install Command | `pnpm install` |

### 2d. Add Environment Variables

Click **"Environment Variables"** and add:

**Variable 1:**
```
Name:  VITE_SUPABASE_URL
Value: [paste your Supabase URL here]
```
Example: `https://abcdefghijklmnop.supabase.co`

**Variable 2:**
```
Name:  VITE_SUPABASE_ANON_KEY
Value: [paste your Supabase Anon Key here]
```
Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjc5MzYwMCwiZXhwIjoxOTMyMzY5NjAwfQ.xyz123...`

**Important:**
- ✅ Ensure "Production" is checked
- ✅ Use exact names with `VITE_` prefix
- ✅ No quotes around values
- ✅ No trailing spaces

### 2e. Deploy!

Click the big **"Deploy"** button and wait...

---

## Step 3: Monitor Deployment

### What You'll See:

**Building (2-3 minutes):**
```
Running "pnpm install"...
✓ Dependencies installed

Running "pnpm build"...
✓ Building for production...
✓ 2547 modules transformed
✓ dist/index.html                    1.2 kB
✓ dist/assets/index-abc123.css      24.5 kB
✓ dist/assets/index-xyz789.js      187.3 kB
✓ Built in 23.45s

Deployment Ready
```

**Success Screen:**
```
🎉 Congratulations! Your deployment is ready.

Production: https://maison-royale-hotel.vercel.app
```

---

## Step 4: Test Your Deployment

### 4a. Open Your App
Click the deployment URL (e.g., `https://maison-royale-hotel.vercel.app`)

### 4b. Test Login
```
Email: admin@maisonroyale.com
Password: Admin@123
```

### 4c. Quick Feature Test Checklist
- [ ] Logo loads correctly
- [ ] Can log in successfully
- [ ] Dashboard appears
- [ ] Can see 8 apartments
- [ ] Can create a test booking
- [ ] Theme toggle works
- [ ] Mobile responsive (test on phone)

---

## Troubleshooting

### ❌ Build Failed - Check Logs

If deployment fails:

1. Click on the failed deployment
2. Scroll down to **"Build Logs"**
3. Look for the error message

**Common errors:**

**Error:** `Cannot find module 'react'`
```bash
# Solution: Verify package.json has react in dependencies
# The fix is already applied, so just retry:
# Go to Vercel → Deployments → Click "Redeploy"
```

**Error:** `ENOTFOUND` or DNS error
```bash
# Solution: Check your internet connection and retry
```

**Error:** `Environment variable not set`
```bash
# Solution: Go to Project Settings → Environment Variables
# Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
# Make sure they're selected for "Production"
```

### ❌ App Loads But Shows Error

**"Connection Error" or "Supabase Error":**

1. Go to Vercel Project Settings
2. Click **"Environment Variables"**
3. Verify both variables are set correctly
4. Click **"Redeploy"** to apply changes

**"Cannot read property" or JavaScript errors:**

1. Open browser console (F12)
2. Check the error message
3. Likely a Supabase connection issue - verify env vars

---

## Step 5: Post-Deployment Tasks

### Immediate Tasks (Required)

1. **Change Admin Password**
   ```
   - Login as admin
   - Go to Settings
   - Change password from Admin@123 to something secure
   ```

2. **Test All Features**
   - Create a real booking
   - Generate a receipt
   - Check reports
   - Test guest management

### Optional Tasks

3. **Add Custom Domain** (if you have one)
   ```
   - Go to Project Settings → Domains
   - Add your domain (e.g., bookings.maisonroyale.com)
   - Follow DNS configuration instructions
   ```

4. **Enable Analytics**
   ```
   - Go to Project Settings → Analytics
   - Enable Vercel Analytics
   - Enable Speed Insights
   ```

5. **Create Manager Accounts**
   ```
   - Login as admin
   - Go to User Management
   - Create accounts for your managers
   ```

---

## Continuous Deployment

### Auto-Deploy on Push

Now, every time you push to GitHub, Vercel automatically deploys!

```bash
# Make changes to your code
# Then:
git add .
git commit -m "Update feature X"
git push origin main

# Vercel automatically builds and deploys!
```

### Manual Redeploy

If you need to redeploy without code changes:

1. Go to Vercel Dashboard
2. Click your project
3. Go to **"Deployments"** tab
4. Click **"Redeploy"** on any previous deployment

---

## Quick Reference

### Your Deployment URL
```
https://maison-royale-hotel.vercel.app
```
(Vercel will provide your actual URL)

### Default Login Credentials
```
Admin:
Email: admin@maisonroyale.com
Password: Admin@123

Manager:
Email: manager@maisonroyale.com
Password: Manager@123
```

### Important Links
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://app.supabase.com
- GitHub Repository: https://github.com/thepantherstudioslhr-creator/maison-royale-hotel

---

## Need Help?

### Documentation
- 📖 [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) - What was fixed
- ✅ [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Detailed checklist
- 🔧 [VERCEL_DEPLOYMENT_FIX.md](./VERCEL_DEPLOYMENT_FIX.md) - Full guide

### Check Deployment Status
```bash
# View recent commits
git log --oneline -5

# Check current branch
git branch

# Verify remote repository
git remote -v
```

---

## Success Criteria

Your deployment is successful when:

✅ Build completes without errors  
✅ App accessible at Vercel URL  
✅ Login works  
✅ All features functional  
✅ Mobile responsive  
✅ No console errors  

---

## Celebrate! 🎉

Once deployed, your luxury apartment management system is:
- 🌍 **Live on the internet**
- ⚡ **Fast and scalable**
- 🔒 **Secure with HTTPS**
- 📱 **Mobile-optimized**
- 🚀 **Production-ready**

**Now start managing those bookings!**

---

*Deployment Guide - Maison Royale Residency*  
*Last Updated: April 21, 2026*
