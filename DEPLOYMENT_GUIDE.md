# Vercel Deployment Guide - Maison Royale Residency

## Step-by-Step Deployment Instructions

### Step 1: Download Your Project Files

Since you're in Figma Make, you need to download the project first:

1. In Figma Make, find the **download** or **export** button
2. Download all project files to your computer
3. Extract the files to a folder (e.g., `maison-royale-app`)

---

### Step 2: Prepare Project for GitHub

You need to upload your code to GitHub first (Vercel deploys from GitHub):

#### Option A: Using GitHub Desktop (Easiest)

1. **Install GitHub Desktop**: https://desktop.github.com
2. **Open GitHub Desktop** and sign in
3. Click **File** → **New Repository**
   - **Name**: `maison-royale-residency`
   - **Local Path**: Choose the folder with your project files
   - Click **Create Repository**
4. Click **Publish repository** to upload to GitHub
5. ✅ Your code is now on GitHub!

#### Option B: Using Command Line

```bash
# Navigate to your project folder
cd path/to/maison-royale-app

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Maison Royale Residency"

# Create GitHub repo at https://github.com/new
# Then connect and push:
git remote add origin https://github.com/YOUR-USERNAME/maison-royale-residency.git
git branch -M main
git push -u origin main
```

---

### Step 3: Deploy to Vercel

Now that your code is on GitHub:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Find your `maison-royale-residency` repository
5. Click **"Import"**

---

### Step 4: Configure Project Settings

On the deployment configuration screen:

#### Framework Preset
- Select: **Vite** (or leave as "Other")

#### Build & Output Settings
- **Build Command**: `pnpm build` (should auto-detect)
- **Output Directory**: `dist` (should auto-detect)
- **Install Command**: `pnpm install` (should auto-detect)

#### Root Directory
- Leave as: `.` (root)

---

### Step 5: Add Environment Variables ⚠️ CRITICAL

**BEFORE** clicking Deploy, add your Supabase credentials:

1. Click **"Environment Variables"** section
2. Add these variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://rhnimhnafkhbdqqknrxl.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_mZ-Q4Itsh9ZQSVFVxmDMOA_5PUJvBmu` |

**For each variable:**
- Enter **Name** (exactly as shown)
- Enter **Value**
- Select **Production, Preview, and Development**
- Click **Add**

---

### Step 6: Deploy! 🚀

1. Click **"Deploy"** button
2. Wait 2-3 minutes for build to complete
3. You'll see "Congratulations! Your project has been deployed"
4. Click **"Visit"** to see your live app

---

### Step 7: Get Your App URL

After deployment:

1. Your app will be live at: `https://your-project-name.vercel.app`
2. **Copy this URL** - this is your app's website
3. You can customize the domain in Vercel settings

---

### Step 8: Access on Mobile 📱

#### iOS (iPhone/iPad):
1. Open **Safari** browser
2. Go to your app URL: `https://your-project-name.vercel.app`
3. Tap the **Share** button (square with arrow)
4. Scroll and tap **"Add to Home Screen"**
5. Name it "Maison Royale" and tap **Add**
6. ✅ Now it appears like a real app on your home screen!

#### Android:
1. Open **Chrome** browser
2. Go to your app URL
3. Tap the **three dots** menu
4. Tap **"Add to Home screen"**
5. Name it "Maison Royale" and tap **Add**
6. ✅ App icon added to home screen!

---

## Updating Your App

When you make changes:

1. Download updated files from Figma Make
2. Replace files in your local folder
3. In GitHub Desktop: 
   - Write commit message
   - Click **Commit to main**
   - Click **Push origin**
4. Vercel will **automatically redeploy** within 2 minutes!

---

## Troubleshooting

### Build Failed
- Check that environment variables are added correctly
- Ensure `.env` file is NOT uploaded to GitHub (it's in `.gitignore`)

### White Screen After Deployment
- Verify Supabase credentials in Vercel environment variables
- Check browser console for errors (F12)

### Can't Login
- Make sure you created the database tables in Supabase (see SETUP_GUIDE.md)
- Verify admin user exists in Supabase Authentication
- Check that user is in the `users` table with `admin` role

---

## Custom Domain (Optional)

To use your own domain like `app.maisonroyale.com`:

1. Go to Vercel project settings
2. Click **Domains** tab
3. Add your domain
4. Update DNS records as instructed
5. ✅ Your app is now at your custom domain!

---

## Security Tips

✅ **Never commit `.env` file to GitHub** (already in `.gitignore`)
✅ **Keep Supabase keys private**
✅ **Enable Supabase Row Level Security** (already done)
✅ **Use strong passwords for admin accounts**

---

## Need Help?

- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **GitHub Help**: https://docs.github.com

---

**🎉 Congratulations! Your Maison Royale Residency app is now live!**
