# Quick Fix: Google Maps Error

## The Problem
You're seeing the error: "Sorry! Something went wrong. This page didn't load Google Maps correctly."

## The Solution (2 Steps)

### Step 1: Get Your Google Maps API Key

1. Go to: https://console.cloud.google.com/
2. Create a project (or select existing)
3. Enable these APIs:
   - Maps JavaScript API
   - Places API  
   - Geocoding API
4. Create API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - **Copy your API key** (it looks like: `AIzaSy...`)

### Step 2: Add API Key to Your Project

**Open this file:** `frontend/public/index.html`

**Find this line (around line 10-11):**
```javascript
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
```

**Replace it with your actual API key:**
```javascript
const GOOGLE_MAPS_API_KEY = 'AIzaSy...your_actual_key_here...';
```

**Save the file and restart your development server:**
```bash
# Stop the server (Ctrl+C)
# Then restart:
cd frontend
npm start
```

## After Adding API Key

1. **Refresh your browser** (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. The map should now load properly
3. You can select location on map or use the search box

## Still Not Working?

### Check Browser Console (F12)
- Look for any red error messages
- Common errors:
  - `InvalidKeyMapError` = API key is wrong
  - `RefererNotAllowedMapError` = API key restrictions need to be updated
  - `ApiNotActivatedMapError` = Required APIs not enabled

### Common Issues:

**1. API Key Not Activated:**
- Go back to Google Cloud Console
- Make sure all 4 APIs are enabled (listed above)

**2. API Key Restrictions:**
- In Google Cloud Console, click on your API key
- Under "Application restrictions", add:
  - `localhost:3000/*`
  - `http://localhost:3000/*`
  - `https://localhost:3000/*` (if using HTTPS)
- Click "Save"

**3. Billing Not Enabled:**
- Google Maps requires billing to be enabled (but gives $200 free credit per month)
- Go to "Billing" in Google Cloud Console
- Enable billing for your project

## For Now (Workaround)

You can still use the app without Google Maps:
- Enter your address manually in the text fields
- The address will be saved correctly
- Only the map visual selection won't work

## Need Help?

1. Check the browser console (F12) for specific errors
2. Check backend console for any validation errors
3. Verify your API key is correct
4. Make sure the development server was restarted after adding the key




