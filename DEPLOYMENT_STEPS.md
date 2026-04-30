# 🚀 Complete Deployment Guide - Maison Royale Residency

## ✅ Step 1: Git Repository Setup (COMPLETED)
- ✅ Git initialized
- ✅ .gitignore created
- ✅ netlify.toml configured
- ✅ Initial commit created (122 files)

---

## 📦 Step 2: Create GitHub Repository

### 2.1 Go to GitHub
1. Open your browser and go to: **https://github.com/new**
2. Log in to your GitHub account if needed

### 2.2 Repository Settings
Fill in the following details:

- **Repository name:** `maison-royale-residency`
- **Description:** `Professional luxury Airbnb management system for 8 apartments with booking, guest tracking, and reporting`
- **Visibility:** Choose **Private** (recommended for production app) or **Public**
- **❌ DO NOT** initialize with README, .gitignore, or license (we already have these)

### 2.3 Create Repository
Click the **"Create repository"** button

### 2.4 Copy the Repository URL
After creation, GitHub will show you commands. You'll see a URL like:
```
https://github.com/YOUR-USERNAME/maison-royale-residency.git
```
**Copy this URL** - you'll need it in the next step!

---

## 🔗 Step 3: Connect and Push to GitHub

### 3.1 Add GitHub Remote
In your terminal (in this code directory), run:

```bash
git remote add origin https://github.com/YOUR-USERNAME/maison-royale-residency.git
```
**Replace `YOUR-USERNAME` with your actual GitHub username!**

### 3.2 Push Your Code
```bash
git push -u origin main
```

You might be asked for GitHub credentials:
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your GitHub password)

**Don't have a token?** Create one at: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Give it a name like "Maison Royale Deploy"
- Check the "repo" scope
- Copy the token and use it as your password

### 3.3 Verify Upload
After pushing, visit your GitHub repository URL. You should see all 122 files uploaded!

---

## 🌐 Step 4: Deploy to Netlify

### 4.1 Go to Netlify
1. Open: **https://app.netlify.com**
2. Log in or sign up (you can use your GitHub account)

### 4.2 Import from GitHub
1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **"GitHub"** as your Git provider
3. Authorize Netlify to access your GitHub account
4. Select your repository: **maison-royale-residency**

### 4.3 Build Settings
Netlify should auto-detect these settings from `netlify.toml`:

- **Branch to deploy:** `main`
- **Build command:** `pnpm install && pnpm run build`
- **Publish directory:** `dist`

Click **"Show advanced"** to add environment variables (next step).

### 4.4 Add Environment Variables
Click **"Add environment variable"** and add these **TWO variables**:

**Variable 1:**
- **Key:** `VITE_SUPABASE_URL`
- **Value:** Your Supabase project URL (from Supabase dashboard)

**Variable 2:**
- **Key:** `VITE_SUPABASE_ANON_KEY`
- **Value:** Your Supabase anon/public key (from Supabase dashboard)

**Where to find these values:**
1. Go to https://supabase.com/dashboard
2. Open your project
3. Go to **Settings** → **API**
4. Copy **Project URL** → paste as `VITE_SUPABASE_URL`
5. Copy **anon public key** → paste as `VITE_SUPABASE_ANON_KEY`

### 4.5 Deploy!
Click **"Deploy site"**

Netlify will:
1. Clone your code from GitHub
2. Install dependencies with pnpm
3. Build your app
4. Deploy to a live URL

This takes about 2-3 minutes.

### 4.6 Get Your Live URL
Once deployment completes, you'll see a URL like:
```
https://random-name-12345.netlify.app
```

**🎉 Your app is now LIVE!**

---

## 🔧 Step 5: Verify & Test

### 5.1 Open Your App
Click the Netlify URL to open your app

### 5.2 Check for Issues
If you see a white page:
1. Right-click → "Inspect" → "Console" tab
2. Look for any red error messages
3. Common issues:
   - Missing environment variables
   - Supabase connection errors
   - Build errors

### 5.3 Test Login
Try logging in with your Supabase user credentials

---

## 🎨 Step 6: Customize Your Netlify Site (Optional)

### 6.1 Change Site Name
1. In Netlify dashboard, go to **Site settings**
2. Click **"Change site name"**
3. Enter something like: `maison-royale-residency`
4. Your URL becomes: `https://maison-royale-residency.netlify.app`

### 6.2 Add Custom Domain (Optional)
1. In Netlify, go to **Domain settings**
2. Click **"Add custom domain"**
3. Follow instructions to connect your domain (if you have one)

---

## 📱 Step 7: Access Your App

### Your app is now accessible at:
- **Netlify URL:** `https://your-site-name.netlify.app`
- **Mobile friendly:** Works on phones, tablets, and desktops
- **Auto-updates:** Every time you push to GitHub, Netlify rebuilds automatically

---

## 🆘 Troubleshooting

### White Page Issue
**Open browser console (F12) and check for errors:**

1. **"Failed to fetch"** → Check environment variables in Netlify
2. **"Supabase client error"** → Verify your Supabase URL and keys
3. **"404 on refresh"** → Check that `netlify.toml` redirects are working

### Build Failed
**Check Netlify deploy logs:**
1. Go to **Deploys** tab in Netlify
2. Click the failed deploy
3. Read the error message
4. Common fixes:
   - Missing environment variables
   - Node version issues (we use Node 18)
   - Package installation errors

### Environment Variables Not Working
1. Go to Netlify **Site settings** → **Environment variables**
2. Verify both variables are listed:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Click **"Trigger deploy"** to rebuild with new variables

---

## 🔄 Making Updates

### To update your app after deployment:

1. **Make changes locally** to your code
2. **Commit changes:**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```
3. **Push to GitHub:**
   ```bash
   git push
   ```
4. **Netlify auto-deploys** your changes in 2-3 minutes

---

## ✅ Deployment Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Netlify site created
- [ ] Environment variables added (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] First deployment successful
- [ ] App loads without white page
- [ ] Login works
- [ ] Bookings can be created
- [ ] Reports generate correctly

---

## 📞 Support

If you encounter issues:

1. **Check Netlify deploy logs** for build errors
2. **Check browser console** for runtime errors
3. **Verify Supabase** database is set up correctly
4. **Check environment variables** are correct

---

## 🎉 Congratulations!

Your Maison Royale Residency app is now:
- ✅ Version controlled with Git
- ✅ Hosted on GitHub
- ✅ Deployed to Netlify
- ✅ Accessible from anywhere
- ✅ Auto-deploying on every push

**Next Steps:**
- Share the URL with your team
- Test all features in production
- Set up custom domain (optional)
- Configure Supabase security rules for production
