# 📤 GitHub Update Guide - Step by Step

## 🎯 Goal
Upload updated files to GitHub so Vercel can build successfully.

---

## 🔄 Method 1: Complete Re-upload (Easiest)

### **Step 1: Download from Figma Make**
1. Look for **Download** button in Figma Make
2. Click and save ZIP file
3. Extract ZIP to a folder

### **Step 2: Go to GitHub Repository**
```
github.com/thepantherstudioslhr-creator/maisonbooking
```

### **Step 3: Delete Old Files (Optional)**
1. Click on a file
2. Click trash icon (🗑️)
3. Commit deletion
4. Repeat for main files (or delete all)

### **Step 4: Upload New Files**
1. Click **"Add file"** → **"Upload files"**
2. **Drag ALL files** from extracted folder
3. Commit message: `Fix Vercel build - updated vite config`
4. Click **"Commit changes"**

### **Step 5: Wait for Vercel**
- Vercel will auto-detect changes
- Build will start automatically
- Check Vercel dashboard for status

---

## 🔧 Method 2: Edit Individual Files

Agar sirf specific files update karni hain:

### **Files to Update:**
1. ✅ `vite.config.ts`
2. ✅ `index.html`
3. ✅ `vercel.json`
4. ✅ `package.json`
5. ✅ `.npmrc` (new - create this)
6. ✅ `.gitignore` (new - create this)

### **How to Edit Each File:**

#### **For Existing Files (e.g., vite.config.ts):**
1. Go to repository
2. Click on `vite.config.ts`
3. Click **pencil icon** (✏️ Edit)
4. **Delete all content**
5. **Copy from Figma Make** → Paste
6. Scroll down → Commit: "Update vite config"
7. Repeat for other files

#### **For New Files (.npmrc, .gitignore):**
1. Go to repository main page
2. Click **"Add file"** → **"Create new file"**
3. File name: `.npmrc`
4. Paste content (see below)
5. Commit: "Add npmrc config"
6. Repeat for `.gitignore`

---

## 📝 File Contents (Copy-Paste Ready)

### **`.npmrc`**
```
auto-install-peers=true
strict-peer-dependencies=false
```

### **`.gitignore`**
```
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Production
dist
build

# Misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor
.vscode
.idea
*.swp
*.swo
*~

# Vercel
.vercel

# Local files
*.local
```

---

## 🎬 After Upload - What Happens?

```
GitHub Push
    ↓
Vercel Detects Change
    ↓
Auto Build Starts
    ↓
npm install (326 packages)
    ↓
npm run build (with fixed config)
    ↓
✅ Build Success!
    ↓
🌐 Live on Vercel URL
```

---

## ⏱️ Timeline

- Upload to GitHub: **2 minutes**
- Vercel auto-build: **2-3 minutes**
- Total: **~5 minutes**

---

## ✅ Verification Checklist

After uploading, check GitHub:

- [ ] `vite.config.ts` shows `root: './'` in code
- [ ] `index.html` shows `./src/index.tsx` (not `/src/index.tsx`)
- [ ] `.npmrc` file exists
- [ ] `.gitignore` file exists
- [ ] Latest commit shows "Fix Vercel build" or similar

---

## 🔍 How to Check If Upload Worked

### **On GitHub:**
1. Click on `vite.config.ts`
2. Look for line: `root: './',`
3. If present → ✅ Upload successful

### **On Vercel:**
1. Dashboard → Your project
2. Check "Deployments" tab
3. Should see "Building..." or "Ready"

---

## 🆘 Troubleshooting

### **Problem: Can't find Download button in Figma Make**

**Solution:** 
Let me know! I'll help you export files differently.

### **Problem: GitHub upload says "File too large"**

**Solution:**
- Don't upload `node_modules` folder
- Only upload source files
- `.gitignore` should prevent this

### **Problem: Vercel not auto-building**

**Solution:**
1. Go to Vercel dashboard
2. Deployments → Latest → "..." menu
3. Click **"Redeploy"**

---

## 💡 Pro Tips

1. **Use branches:** Create a new branch for testing
2. **Check commits:** Verify each commit on GitHub
3. **Watch Vercel logs:** Real-time build progress
4. **Test locally first:** Run `npm run build` on your PC

---

## 🎯 Final Step

After GitHub upload:

1. ✅ Go to Vercel dashboard
2. ✅ Check latest deployment
3. ✅ If building → Wait 2-3 mins
4. ✅ If not building → Click "Redeploy"
5. ✅ Check logs for success

---

## 📞 Need Help?

Agar kahi atke, batao:
- Screenshot of GitHub repository
- Vercel deployment logs
- Kaha problem aa raha hai

Main step-by-step guide karunga! 😊

---

**Repository:** `github.com/thepantherstudioslhr-creator/maisonbooking`
**Branch:** `main`
**Critical Files:** vite.config.ts, index.html, .npmrc
