# Fix: Google Maps API Key Not Working

## The Problem

You added the API key to `backend/.env`, but **React environment variables must be in `frontend/.env`**.

## The Solution

### Step 1: Create `.env` file in frontend directory

**File location:** `frontend/.env` (NOT `backend/.env`)

### Step 2: Copy your API key

From your `backend/.env` file, copy this line:
```
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyAwDF1JaNVqKzDx7Ex2Pelh1UhxRWqMrNs
```

### Step 3: Create `frontend/.env` file

Create a new file `frontend/.env` and add:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Google Maps API Key
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyAwDF1JaNVqKzDx7Ex2Pelh1UhxRWqMrNs
```

### Step 4: Restart your frontend server

**IMPORTANT:** You must restart the frontend server for changes to take effect:

```bash
# Stop the frontend server (Ctrl+C)
# Then restart:
cd frontend
npm start
```

You should see in the console:
```
✅ Found Google Maps API key in frontend/.env
✅ Environment config updated - API Key: AIzaSyAwDF1Ja...
```

### Step 5: Hard refresh your browser

Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac) to clear cache and reload.

## Why This Happens

- **Backend `.env`** = For Node.js/Express environment variables (MongoDB, JWT, etc.)
- **Frontend `.env`** = For React environment variables (must start with `REACT_APP_`)

React apps can only access environment variables from their own `.env` file in the `frontend` directory.

## Quick Checklist

- [ ] Created `frontend/.env` file (not `backend/.env`)
- [ ] Added `REACT_APP_GOOGLE_MAPS_API_KEY=your_key` to `frontend/.env`
- [ ] Variable name starts with `REACT_APP_`
- [ ] No spaces around `=`
- [ ] No quotes around the API key value
- [ ] Restarted frontend server (`npm start`)
- [ ] Hard refreshed browser (Ctrl+Shift+R)

## Still Not Working?

1. **Check browser console (F12):**
   - Look for any error messages about Google Maps
   - Should NOT see: "API_KEY_MISSING" warning

2. **Check terminal output:**
   - When starting with `npm start`, you should see:
   - `✅ Found Google Maps API key in frontend/.env`
   - `✅ Environment config updated - API Key: AIza...`

3. **Verify file location:**
   - File should be at: `frontend/.env`
   - NOT at: `backend/.env`

4. **Check API key format:**
   - Should look like: `AIzaSy...` (starts with "AIza")
   - No extra spaces or quotes

5. **Check Google Cloud Console:**
   - Make sure these APIs are enabled:
     - Maps JavaScript API
     - Places API
     - Geocoding API




