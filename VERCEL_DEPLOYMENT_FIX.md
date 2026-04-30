# Vercel Deployment Fix Guide

## Issue Fixed
The `pnpm install` error was caused by missing React and React-DOM dependencies in the package.json file.

## Changes Made

### 1. Updated package.json
- Added `react` and `react-dom` to the dependencies section
- Fixed `jspdf` version from outdated `^4.2.1` to `^2.5.2`
- Removed the `peerDependencies` and `peerDependenciesMeta` sections as they're no longer needed

### 2. Created .npmrc
Added configuration to help pnpm work smoothly on Vercel:
```
auto-install-peers=true
strict-peer-dependencies=false
shamefully-hoist=true
```

### 3. Created index.html
Added the entry HTML file required for Vite builds

### 4. Created /src/index.tsx
Added the React entry point file that mounts the app

## Deployment Steps

### Step 1: Push Changes to GitHub
```bash
git add .
git commit -m "Fix Vercel deployment issues - add React dependencies and entry files"
git push origin main
```

### Step 2: Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository: `thepantherstudioslhr-creator/maison-royale-hotel`
4. Configure your project:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

### Step 3: Add Environment Variables

Add your Supabase credentials as environment variables in Vercel:

1. Go to Project Settings → Environment Variables
2. Add the following variables:
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anonymous key

**Important**: Make sure these are prefixed with `VITE_` so they're available in your frontend code.

### Step 4: Deploy

Click "Deploy" and Vercel will build and deploy your app automatically.

## Post-Deployment

### Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow the DNS configuration instructions

### Enable HTTPS
Vercel automatically enables HTTPS for all deployments.

### Set Production Environment Variables
Make sure to set the environment variables for production:
- Go to Settings → Environment Variables
- Ensure the Production checkbox is selected for your Supabase variables

## Troubleshooting

### If Build Still Fails

1. **Check Build Logs**: Look at the detailed error in Vercel's deployment logs
2. **Clear Build Cache**: In Project Settings → General, scroll to "Build & Development Settings" and redeploy
3. **Verify Environment Variables**: Make sure all required env vars are set

### Common Issues

**Issue**: Module not found errors
- **Solution**: Make sure all imports use correct relative paths and all dependencies are properly installed

**Issue**: "Cannot find module"
- **Solution**: Clear node_modules and reinstall dependencies locally first to verify

**Issue**: Supabase connection fails
- **Solution**: Verify environment variables are correctly set with `VITE_` prefix

## Testing Your Deployment

1. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Test the login functionality
3. Verify Supabase connection is working
4. Test booking creation and management
5. Check that all features work on mobile devices

## Monitoring

- **Analytics**: Enable Vercel Analytics in Project Settings
- **Logs**: View real-time logs in the Deployments tab
- **Performance**: Monitor Core Web Vitals in the Analytics section

## Continuous Deployment

Every push to your main branch will automatically trigger a new deployment on Vercel.

---

**Need Help?**
- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs