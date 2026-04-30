# 🚀 Vercel Deployment Checklist

Use this checklist to ensure a successful deployment of Maison Royale Residency to Vercel.

## Pre-Deployment Checklist

### ✅ Code & Dependencies
- [x] React and React-DOM added to dependencies
- [x] jsPDF version updated to 2.5.2
- [x] All `figma:asset` imports replaced with proper file imports
- [x] .npmrc file created for pnpm configuration
- [x] index.html created in root directory
- [x] /src/index.tsx entry point created
- [x] vite.config.ts properly configured

### ✅ Supabase Setup
- [ ] Supabase project created
- [ ] Database tables created using FRESH_SETUP.sql
- [ ] Admin user created in database
- [ ] Row Level Security (RLS) policies enabled
- [ ] Supabase URL noted
- [ ] Supabase Anon Key noted

### ✅ GitHub Repository
- [ ] All changes committed
- [ ] Code pushed to GitHub main branch
- [ ] Repository is accessible (public or Vercel has access)

## Deployment Steps

### Step 1: Vercel Project Setup
- [ ] Logged into Vercel dashboard
- [ ] Clicked "Add New" → "Project"
- [ ] GitHub repository connected
- [ ] Repository imported successfully

### Step 2: Build Configuration
- [ ] Framework Preset: **Vite**
- [ ] Build Command: **pnpm build**
- [ ] Output Directory: **dist**
- [ ] Install Command: **pnpm install**
- [ ] Root Directory: **/** (leave as root)

### Step 3: Environment Variables
Add these in Vercel Project Settings → Environment Variables:

- [ ] `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = `your-anon-key-here`

**Important Notes:**
- ✅ Must have `VITE_` prefix
- ✅ Select "Production" environment
- ✅ No quotes around values
- ✅ No trailing spaces

### Step 4: Initial Deployment
- [ ] Clicked "Deploy" button
- [ ] Build started successfully
- [ ] Build completed without errors
- [ ] Deployment preview available

## Post-Deployment Verification

### Functional Testing
- [ ] App loads successfully at Vercel URL
- [ ] Logo and images display correctly
- [ ] Login page appears
- [ ] Can log in with admin credentials
- [ ] Dashboard loads after login
- [ ] Can view apartments list
- [ ] Can create a new booking
- [ ] Can view existing bookings
- [ ] Can generate receipts
- [ ] Can access reports section
- [ ] Theme toggle works (light/dark mode)
- [ ] All navigation works

### Mobile Testing
- [ ] App is responsive on mobile
- [ ] Touch interactions work
- [ ] Forms are usable on mobile
- [ ] Navigation menu works on mobile

### Database Connection
- [ ] Supabase connection working
- [ ] Data loads from database
- [ ] Can create new records
- [ ] Can update existing records
- [ ] Authentication works

### Performance Check
- [ ] Page loads in under 3 seconds
- [ ] No console errors
- [ ] Images load properly
- [ ] Smooth navigation

## Common Issues & Solutions

### ❌ Build Failed - "Cannot find module 'react'"
**Solution:** React and React-DOM are now in dependencies. If this still happens:
```bash
# Locally verify package.json has react and react-dom in dependencies
# Commit and push changes
git add package.json
git commit -m "Fix dependencies"
git push origin main
```

### ❌ Build Failed - "Cannot resolve 'figma:asset'"
**Solution:** All figma:asset imports have been replaced. If you see this:
- Check the file mentioned in the error
- Replace `figma:asset/filename` with proper import from `/src/imports/`

### ❌ App loads but shows "Connection Error"
**Solution:** Environment variables issue
1. Go to Vercel Project Settings → Environment Variables
2. Verify both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Ensure they have the `VITE_` prefix
4. Redeploy the project

### ❌ Login doesn't work
**Solution:** Check Supabase setup
1. Verify Supabase project is active
2. Check if users table exists
3. Verify admin user is created
4. Check Supabase RLS policies

### ❌ Images don't load
**Solution:** 
- Check browser console for 404 errors
- Verify images are in `/src/imports/` folder
- Check import paths are correct
- Ensure images are committed to GitHub

## Optimization (Optional)

### Custom Domain
- [ ] Domain purchased and available
- [ ] Added domain in Vercel Project Settings
- [ ] DNS records configured
- [ ] SSL certificate issued (automatic)

### Performance Optimization
- [ ] Enable Vercel Analytics
- [ ] Enable Speed Insights
- [ ] Check Core Web Vitals score
- [ ] Optimize images if needed

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Error tracking reviewed
- [ ] Deployment logs checked
- [ ] Set up deployment notifications

## Security Checklist

- [ ] Default admin password changed
- [ ] Supabase RLS policies enabled
- [ ] API keys are environment variables (not hardcoded)
- [ ] No sensitive data in Git repository
- [ ] HTTPS enabled (automatic with Vercel)

## Continuous Deployment

Once set up, automatic deployments occur when:
- ✅ Pushing to main branch
- ✅ Merging pull requests
- ✅ Manual redeploy from Vercel dashboard

### To trigger manual deployment:
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments" tab
4. Click "Redeploy" on any deployment

## Success Criteria

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ App is accessible at Vercel URL
- ✅ Login works with admin credentials
- ✅ All features functional
- ✅ Database connection working
- ✅ Mobile responsive
- ✅ No console errors
- ✅ Performance is good

## Next Steps After Deployment

1. **Share the URL** with your team
2. **Change default passwords** immediately
3. **Add real booking data** for testing
4. **Set up custom domain** (if needed)
5. **Enable analytics** for monitoring
6. **Create manager accounts** for staff
7. **Test thoroughly** with real use cases

## Need Help?

If you encounter issues not covered here:

1. **Check Vercel Deployment Logs**
   - Go to Deployments → Click failed deployment → View logs
   
2. **Review Documentation**
   - [VERCEL_DEPLOYMENT_FIX.md](./VERCEL_DEPLOYMENT_FIX.md)
   - [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)
   
3. **Verify Environment**
   - Node.js version compatibility
   - pnpm version (should be latest)
   - Supabase project status

---

**Deployment Date:** _________________

**Deployed By:** _________________

**Production URL:** _________________

**Status:** ⬜ Success | ⬜ Needs Fixes

**Notes:**
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
