# Frontend Troubleshooting Guide

## npm Warnings

The deprecation warnings you see during `npm install` are **normal** and **not errors**. They are just notifications about packages that will be updated in future versions. Your app will work fine.

### Common Warnings:
- `@babel/plugin-proposal-*` - These are being merged into standard JavaScript
- `eslint@8.57.1` - Older version, but still functional
- `workbox-*` - Service worker related, not critical for development

**These warnings do NOT prevent the app from running.**

## Security Vulnerabilities

### Current Status
After optimization, there are **3 moderate vulnerabilities** remaining in `webpack-dev-server` (a development tool).

**These are SAFE to ignore because:**
1. ✅ They only affect the development server, NOT production builds
2. ✅ They don't affect your application code or runtime
3. ✅ They're related to development-time source code exposure (not a production concern)
4. ✅ Your production build (`npm run build`) is completely safe

### What We Fixed
- ✅ Reduced vulnerabilities from **9 to 3**
- ✅ Fixed all high-severity vulnerabilities
- ✅ Fixed `nth-check` and `postcss` vulnerabilities

### Remaining Vulnerabilities
The 3 moderate vulnerabilities in `webpack-dev-server` cannot be fixed without breaking `react-scripts`. This is a known limitation and is **acceptable for development**.

### If You Want to Check
```bash
npm audit
```

### For Production
When you build for production (`npm run build`), these vulnerabilities don't affect the output. Your production app is secure.

## Common Issues and Solutions

### 1. Port Already in Use
**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Windows PowerShell
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port
set PORT=3001
npm start
```

### 2. Module Not Found
**Error:** `Cannot find module '...'`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 3. React Scripts Issues
**Error:** `react-scripts: command not found`

**Solution:**
```bash
npm install react-scripts --save-dev
```

### 4. CORS Errors
**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- Make sure backend is running on port 5000
- Check `proxy` setting in `package.json` (should be `"proxy": "http://localhost:5000"`)
- Or set `REACT_APP_API_URL` in `.env` file

### 5. Cannot Start Development Server
**Error:** Various startup errors

**Solution:**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm start
```

## Starting the App

1. Make sure backend is running first:
```bash
cd backend
npm start
```

2. Then start frontend (in a new terminal):
```bash
cd frontend
npm start
```

The app should open automatically at `http://localhost:3000`

## Environment Variables

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

