# 🧪 PWA Testing & Debugging Guide

## ⚠️ Install Popup Nahi Aa Raha? Ye Karo!

---

## 🔍 **Step 1: PWA Debug Info Check Karo**

### **Triple Click Bottom-Left Corner:**

1. App kholo: `https://maisonbooking.vercel.app`
2. **Bottom-left corner** pe **3 times click** karo (jaldi jaldi)
3. **Debug panel** khulega!

**Debug Panel Dikhayega:**
```
✅ Service Worker: Yes/No
✅ Manifest: Yes/No  
✅ HTTPS: Yes/No
✅ Installable: Yes/No
✅ Already Installed: Yes/No
```

**Agar sab ✅ Green hai** → Ready!
**Agar kuch ❌ Red hai** → Neeche dekho fix

---

## 🛠️ **Step 2: Browser Console Check Karo**

### **DevTools Kholo:**

**Desktop:**
- Windows: `F12` ya `Ctrl + Shift + I`
- Mac: `Cmd + Option + I`

**Mobile (Chrome):**
- Menu (⋮) → More tools → Developer tools

### **Console Tab Mein Dekho:**

**Expected Messages:**
```
👂 Listening for beforeinstallprompt event...
✅ Service Worker registered successfully
```

**Agar ye dikha:**
```
🎯 Install prompt event received!
```
→ **Perfect!** Popup aana chahiye

**Agar ye NAHI dikha:**
→ Problem hai - neeche dekho

---

## 🚨 **Common Problems & Solutions**

### **Problem 1: "beforeinstallprompt event NOT firing"**

**Reasons:**
❌ App pehle se installed hai
❌ Criteria meet nahi ho rahi
❌ Browser support nahi karta
❌ Already dismissed

**Solutions:**

**A) Check if Already Installed:**
```
Console mein type karo:
window.matchMedia('(display-mode: standalone)').matches

Agar true → Already installed hai!
```

**Fix:** Uninstall karo:
- Chrome: Settings → Apps → Maison Royale → Uninstall
- iPhone: Long press icon → Remove from Home Screen

**B) Clear Browser Data:**
```
Chrome:
Settings → Privacy → Clear browsing data
→ Check "Cached images and files"
→ Check "Site settings"  
→ Clear data
```

**C) Try Incognito/Private Mode:**
```
Chrome: Ctrl+Shift+N (Windows) / Cmd+Shift+N (Mac)
Safari: Cmd+Shift+N
```

**D) Check localStorage:**
```
Console mein:
localStorage.getItem('pwa-install-dismissed')

Agar "true" → User ne dismiss kar diya tha

Clear karo:
localStorage.removeItem('pwa-install-dismissed')
Reload page
```

---

### **Problem 2: "Service Worker Not Registered"**

**Console Error:**
```
❌ Service Worker registration failed
```

**Check:**
```
DevTools → Application tab → Service Workers
→ Status dekho
```

**Fix:**
```
Application → Service Workers → Unregister
Reload page (Ctrl+Shift+R)
```

---

### **Problem 3: "Manifest Not Found"**

**Console Error:**
```
Failed to fetch manifest
404 manifest.json
```

**Check:**
```
Browser mein directly kholo:
https://maisonbooking.vercel.app/manifest.json

Agar 404 → File missing!
```

**Fix:**
- GitHub pe check karo `/public/manifest.json` exists
- Redeploy app

---

### **Problem 4: "Icon Loading Error"**

**Console Error:**
```
Failed to load icon
```

**Check:**
```
https://maisonbooking.vercel.app/icon.svg

Agar 404 → Icon missing!
```

**Fix:**
- Upload `/public/icon.svg`
- Redeploy

---

### **Problem 5: "Not HTTPS"**

**Error:**
```
Service workers only work on HTTPS
```

**Vercel automatically HTTPS hai!**

**But check:**
```
Console mein:
window.location.protocol

Should be: "https:"
```

**Agar "http:"** → Force HTTPS:
```
Vercel Settings → Domains → Enable HTTPS
```

---

## 📱 **Browser-Specific Issues**

### **Chrome (Desktop/Android):**

✅ **Best Support** - Use this!

**Manual Install:**
```
Address bar → Install icon (⊕)
OR
Menu (⋮) → Install Maison Royale
```

---

### **Safari (iPhone/Mac):**

⚠️ **Doesn't support "beforeinstallprompt"!**

**iPhone Install:**
```
Safari ONLY (not Chrome!)
→ Share button (□↑)
→ Add to Home Screen
→ Add
```

**Mac Install:**
```
File → Share → Add to Dock
```

**Note:** Automatic popup **won't work** on iPhone!

---

### **Edge (Desktop):**

✅ **Good Support**

**Manual Install:**
```
Address bar → Install icon
OR
Settings (⋯) → Apps → Install Maison Royale
```

---

### **Firefox (Desktop/Mobile):**

⚠️ **Limited PWA Support**

**Manual Install (Android):**
```
Menu → Install
```

**Desktop:** No PWA support

---

## 🎯 **Manual Testing Steps**

### **Test 1: Check PWA Installability**

1. Open: `https://maisonbooking.vercel.app`
2. DevTools → **Lighthouse** tab
3. Click **"Analyze page load"**
4. Check **PWA** section

**Expected:**
```
✅ Installable
✅ Provides a valid manifest
✅ Has a registered service worker
✅ Redirects HTTP to HTTPS
```

**Score:** Should be **90+**

---

### **Test 2: Verify Manifest**

DevTools → **Application** tab → **Manifest**

**Check:**
```
✅ Name: "Maison Royale Residency"
✅ Short name: "Maison Royale"
✅ Start URL: "/"
✅ Display: "standalone"
✅ Icons: Present
✅ Theme color: #f59e0b
```

**Agar errors hain** → Manifest invalid!

---

### **Test 3: Check Service Worker**

DevTools → **Application** → **Service Workers**

**Status:**
```
✅ Activated and running
✅ Source: /service-worker.js
✅ Status: activated
```

**Update on reload:** Check karo

**Test Offline:**
```
Check "Offline" checkbox
Reload page
App should still work!
```

---

### **Test 4: Cache Storage**

DevTools → **Application** → **Cache Storage**

**Should see:**
```
maison-royale-v1
maison-royale-runtime-v1
```

**Contains:**
- index.html
- JS bundles
- CSS files
- offline.html

---

## 🔧 **Force Install Prompt (Debug)**

Agar event fire nahi ho raha, manually trigger karo:

### **Method 1: Clear All & Retry**

```javascript
// Console mein paste karo:

// Clear all PWA data
localStorage.clear();
sessionStorage.clear();
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});

// Reload
location.reload();
```

### **Method 2: Simulate Fresh Install**

```
1. Incognito mode kholo
2. App URL paste karo
3. Wait for event
4. Install!
```

---

## 📊 **PWA Criteria Checklist**

Install prompt ke liye **ALL** required:

- [ ] ✅ **HTTPS** (or localhost)
- [ ] ✅ **Valid manifest.json**
- [ ] ✅ **At least one icon** (192px+)
- [ ] ✅ **Service worker registered**
- [ ] ✅ **Service worker activated**
- [ ] ✅ **start_url exists**
- [ ] ✅ **display: standalone** (in manifest)
- [ ] ❌ **NOT already installed**
- [ ] ❌ **NOT recently dismissed**

---

## 🚀 **Quick Fix Workflow**

Agar kuch nahi kaam kar raha:

### **Nuclear Option:**

```
1. Logout from app
2. Close all tabs
3. Clear browser cache:
   - Chrome: Settings → Privacy → Clear data
   - Safari: Settings → Clear History
4. Uninstall app (if installed):
   - Settings → Apps → Maison Royale → Uninstall
5. Restart browser
6. Open in INCOGNITO mode:
   - https://maisonbooking.vercel.app
7. Check console for messages
8. Wait 5 seconds
9. Install prompt should appear!
```

---

## 🎯 **Expected Behavior (Desktop Chrome)**

### **Timeline:**

```
0s - Page loads
0s - Console: "👂 Listening for beforeinstallprompt..."
1s - Console: "✅ Service Worker registered"
2s - Console: "🎯 Install prompt event received!"
2s - Orange popup appears bottom-right
```

### **Visual:**

```
╔════════════════════════════════════╗
║ 📥 Install Maison Royale           ║
║ Install app for quick access!      ║
║ [Install Now] [Later]              ║
╚════════════════════════════════════╝
```

---

## 📱 **Expected Behavior (Android Chrome)**

### **Timeline:**

```
0s - Page loads
0s - Service Worker registers
1s - Browser shows mini-infobar (bottom)
   "Add Maison Royale to Home screen"
2s - Our orange popup (optional)
```

**Two Options:**
1. Browser's native mini-bar
2. Our custom orange prompt

**Both work!**

---

## 🍎 **iPhone Special Instructions**

⚠️ **Safari ONLY** - Chrome doesn't work!

**No automatic popup!** Manual process:

```
1. Open Safari
2. Navigate to app
3. Tap Share button (□↑) - bottom center
4. Scroll down
5. Tap "Add to Home Screen"
6. Edit name (optional)
7. Tap "Add" (top-right)
8. Done! Icon on home screen
```

---

## 🐛 **Advanced Debugging**

### **Check All PWA Files:**

```
https://maisonbooking.vercel.app/manifest.json ✅
https://maisonbooking.vercel.app/service-worker.js ✅
https://maisonbooking.vercel.app/offline.html ✅
https://maisonbooking.vercel.app/icon.svg ✅
```

**All should return 200 OK**

### **Service Worker Logs:**

```javascript
// Console:
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Registration:', reg);
  console.log('Active:', reg.active);
  console.log('Scope:', reg.scope);
});
```

### **Check Install Criteria:**

```javascript
// Console:
console.log('Protocol:', window.location.protocol);
console.log('Manifest:', document.querySelector('link[rel="manifest"]'));
console.log('SW Support:', 'serviceWorker' in navigator);
console.log('Standalone:', window.matchMedia('(display-mode: standalone)').matches);
```

---

## 🎓 **Pro Tips**

### **Tip 1: Use Chrome Canary**
Latest features, best PWA support

### **Tip 2: Enable PWA Flags**
```
chrome://flags/#enable-desktop-pwas
chrome://flags/#enable-app-install-ambient-badge
```

### **Tip 3: Lighthouse Audit**
Run before testing - catches all issues!

### **Tip 4: Network Tab**
Check if manifest loads:
```
DevTools → Network → Filter: manifest
Should show: manifest.json 200 OK
```

### **Tip 5: Console Never Lies**
All debug messages in console - check there first!

---

## ✅ **Success Checklist**

After deploy, verify:

**Desktop Chrome:**
- [ ] Open app URL
- [ ] Check console (no errors)
- [ ] See install icon in address bar
- [ ] OR see our orange popup
- [ ] Click install
- [ ] App opens in window
- [ ] Icon in Start Menu/Dock

**Android Chrome:**
- [ ] Open app URL
- [ ] See mini-infobar OR popup
- [ ] Tap install
- [ ] Icon on home screen
- [ ] Tap icon → Full screen
- [ ] No browser UI

**iPhone Safari:**
- [ ] Open in Safari
- [ ] Share → Add to Home Screen
- [ ] Icon appears
- [ ] Tap → Full screen
- [ ] Works like app

---

## 📞 **Still Not Working?**

### **Final Debug Steps:**

1. **Check Console First:**
   - Any red errors?
   - Service worker registered?
   - Manifest loaded?

2. **Run Lighthouse:**
   - PWA score?
   - Any warnings?

3. **Check Files Exist:**
   - manifest.json - 200?
   - service-worker.js - 200?
   - icon.svg - 200?

4. **Try Different Browser:**
   - Chrome Canary
   - Edge
   - Brave

5. **Check Vercel Deployment:**
   - Build successful?
   - All files uploaded?
   - Environment variables set?

---

## 🎯 **Most Common Issue:**

### **"App already installed!"**

```
Console: ✅ App already installed
```

**Check:**
```javascript
window.matchMedia('(display-mode: standalone)').matches
// Returns: true = Already installed!
```

**Fix:**
```
Uninstall → Clear cache → Reload
```

---

## 📚 **Helpful Links**

**Test PWA:**
- Chrome DevTools → Lighthouse
- https://web.dev/pwa-checklist/

**Validate Manifest:**
- Chrome DevTools → Application → Manifest
- Look for errors

**Check Service Worker:**
- chrome://serviceworker-internals/

---

## 🎉 **When Everything Works:**

**You'll see:**
```
✅ Service Worker: Activated
✅ Manifest: Valid
✅ Icons: Loaded
✅ HTTPS: Enabled
✅ Install prompt: Fired!
✅ Orange popup: Visible!
```

**Click "Install Now"** → **Done!** 🚀

---

## 📋 **Quick Reference**

| Issue | Fix |
|-------|-----|
| No popup | Check console, clear cache |
| Already installed | Uninstall first |
| Service worker error | Unregister & reload |
| Manifest 404 | Redeploy files |
| Icon error | Upload icon.svg |
| iPhone no popup | Use Safari Share button |
| Chrome no icon | Check address bar |

---

**Remember:**
- **Desktop Chrome:** Best support
- **Android Chrome:** Native + custom prompt
- **iPhone Safari:** Manual install only
- **Firefox:** Limited support

**Good luck debugging!** 🔧🚀
