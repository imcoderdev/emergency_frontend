# 🚨 EmergencyHub Deployment Guide

## Current Error Fix

**Error:** `Permission denied` when running vite build on Vercel

**Solution:** Updated configuration files to fix all deployment issues

## Fixed Issues

### 1. Package.json
- ✅ Added `engines` field to specify Node 18+
- ✅ Added `postinstall` script to fix permissions
- ✅ Ensures correct Node version on Vercel

### 2. Vercel Configuration
- ✅ Created `.vercelignore` to exclude unnecessary files
- ✅ Created `.npmrc` for npm settings
- ✅ Enhanced `vercel.json` with explicit build commands

### 3. Common Deployment Errors & Solutions

#### Error 1: "Permission denied" for vite
**Cause:** File permissions issue with node_modules binaries
**Solution:** 
- Added postinstall script: `chmod +x node_modules/.bin/*`
- Vercel runs this automatically after npm install

#### Error 2: Node version mismatch
**Cause:** Vercel using older Node version
**Solution:**
- Specified `"node": ">=18.0.0"` in engines
- Vercel will use Node 18 or higher

#### Error 3: Build fails with module errors
**Cause:** Missing or incompatible dependencies
**Solution:**
- Enhanced build command in vercel.json
- Clean install before build

#### Error 4: Routes return 404
**Cause:** Client-side routing not configured
**Solution:**
- `vercel.json` rewrites all routes to index.html
- Already configured

#### Error 5: Static assets not loading
**Cause:** Incorrect publicPath or base URL
**Solution:**
- Vite automatically handles this
- Added cache headers for assets

#### Error 6: Environment variables not working
**Cause:** Frontend doesn't use .env file
**Solution:**
- All API URLs hardcoded in api.js and socket.js
- No environment variables needed

## Deployment Steps (Updated)

### Option 1: Via Git Push (Recommended)

1. **Commit and push changes:**
   ```bash
   cd frontend
   git add .
   git commit -m "fix: deployment configuration"
   git push origin main
   ```

2. **Vercel auto-deploys** from GitHub
   - Vercel detects push and rebuilds automatically

### Option 2: Via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd frontend
   vercel --prod
   ```

### Option 3: Via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import `emergency_frontend` repository
3. **Settings:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Node Version: **18.x**

4. Click **Deploy**

## Vercel Project Settings

### Environment Variables
**None needed** - API URLs are hardcoded:
- Backend: `https://emergency-backend-e33i.onrender.com`

### Build & Development Settings
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Node.js Version:** 18.x

### Root Directory
- Leave as `.` (root)

## Troubleshooting

### If build still fails:

1. **Clear Vercel cache:**
   - Go to Project Settings
   - Click "Clear Cache & Rebuild"

2. **Check Node version:**
   - Ensure it's Node 18+ in Vercel settings

3. **Check build logs:**
   - Look for specific error messages
   - Common issues:
     - Missing dependencies → Check package.json
     - Syntax errors → Check code
     - Import errors → Check import paths

4. **Local test:**
   ```bash
   npm install
   npm run build
   npm run preview
   ```

5. **Delete and recreate:**
   - Delete Vercel project
   - Re-import from GitHub
   - Let Vercel auto-detect settings

## Post-Deployment

### Verify Deployment
1. Visit your Vercel URL
2. Check browser console for errors
3. Test all routes:
   - `/dashboard`
   - `/report`
   - `/responder`

### Test API Connection
1. Open browser DevTools
2. Go to Network tab
3. Report an incident
4. Verify API calls to Render backend

### Enable HTTPS
- Vercel provides automatic HTTPS
- Custom domains also get free SSL

## Performance Optimization

### Already Configured:
- ✅ Asset caching headers (1 year)
- ✅ Code splitting (Vite default)
- ✅ Minification enabled
- ✅ Tree shaking enabled

### Optional Enhancements:
- Add `vite-plugin-compression` for gzip
- Add `vite-plugin-pwa` for service worker
- Enable Vercel Analytics

## Backend CORS Update

⚠️ **IMPORTANT:** Update backend CORS to allow Vercel domain:

```javascript
// backend/server.js
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-vercel-app.vercel.app'  // Add your Vercel URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

## Final Checklist

- ✅ package.json has engines field
- ✅ vercel.json configured correctly
- ✅ .vercelignore excludes node_modules
- ✅ .npmrc created
- ✅ Git committed and pushed
- ⏳ Vercel deployment successful
- ⏳ Backend CORS updated with Vercel URL
- ⏳ All routes working
- ⏳ API calls successful

## Support

If issues persist:
1. Check Vercel build logs
2. Test locally: `npm run build && npm run preview`
3. Verify Node version: `node -v` (should be 18+)
4. Clear npm cache: `npm cache clean --force`
5. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
