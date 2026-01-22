# Google Maps Still Not Loading? Troubleshooting Guide

## Your API Key
Your API key is: `AIzaSyAwDF1JaNVqKzDx7Ex2Pelh1UhxRWqMrNs`

## Quick Checks

### 1. Check Browser Console (F12)

Open Developer Tools (F12) and look for:

✅ **Success messages:**
- `🗺️ Loading Google Maps API with key: AIzaSyAwDF1...`
- `✅ Google Maps API loaded successfully!`

❌ **Error messages to watch for:**
- `RefererNotAllowedMapError` = API key restrictions blocking your domain
- `ApiNotActivatedMapError` = Required APIs not enabled
- `InvalidKeyMapError` = API key is invalid

### 2. Verify Google Cloud Console Settings

Go to: https://console.cloud.google.com/apis/credentials

**Check your API key:**

1. **Click on your API key** (`AIzaSyAwDF1JaNVqKzDx7Ex2Pelh1UhxRWqMrNs`)

2. **Application restrictions:**
   - Should be set to "HTTP referrers (web sites)"
   - Add these referrers:
     - `http://localhost:3000/*`
     - `http://localhost:3000`
     - `http://127.0.0.1:3000/*`
     - `http://127.0.0.1:3000`
   
   **OR** for development, you can set to "None" (less secure but works for testing)

3. **API restrictions:**
   - Make sure these APIs are enabled:
     - ✅ Maps JavaScript API
     - ✅ Places API
     - ✅ Geocoding API
     - ✅ Directions API

4. **Billing:**
   - Make sure billing is enabled (Google gives $200 free credit/month)

### 3. Verify APIs Are Enabled

Go to: https://console.cloud.google.com/apis/library

Search for and enable:
- ✅ Maps JavaScript API
- ✅ Places API
- ✅ Geocoding API
- ✅ Directions API

### 4. Test the API Key Directly

Try this URL in your browser:
```
https://maps.googleapis.com/maps/api/js?key=AIzaSyAwDF1JaNVqKzDx7Ex2Pelh1UhxRWqMrNs&libraries=places,geometry
```

**If you see JavaScript code:** ✅ API key is valid
**If you see an error JSON:** ❌ Check the error message

### 5. Common Errors and Fixes

#### Error: "RefererNotAllowedMapError"
**Problem:** API key restrictions blocking localhost
**Fix:** 
- Go to Google Cloud Console > Credentials > Your API Key
- Under "Application restrictions", add:
  - `http://localhost:3000/*`
  - `http://127.0.0.1:3000/*`
- OR set to "None" for development

#### Error: "ApiNotActivatedMapError"
**Problem:** Required APIs not enabled
**Fix:**
- Go to APIs & Services > Library
- Enable: Maps JavaScript API, Places API, Geocoding API, Directions API

#### Error: "InvalidKeyMapError"
**Problem:** API key is wrong or doesn't exist
**Fix:**
- Verify the key in Google Cloud Console
- Make sure you copied the entire key
- No spaces or extra characters

#### Error: "BillingNotEnabledMapError"
**Problem:** Billing not enabled for your project
**Fix:**
- Go to Billing in Google Cloud Console
- Link a billing account (credit card required, but $200/month free)

### 6. Clear Browser Cache

Sometimes cached errors can persist:

1. Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
2. Clear "Cached images and files"
3. Clear "Cookies and site data"
4. Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

### 7. Check Network Tab

1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Reload the page
4. Look for a request to `maps.googleapis.com`
5. Check the status:
   - **200 OK:** ✅ Script loaded successfully
   - **403 Forbidden:** ❌ API key issue (check restrictions)
   - **404 Not Found:** ❌ API key invalid

### 8. Verify Frontend Server is Running

Make sure your frontend server is running:
```bash
cd frontend
npm start
```

Should start on: `http://localhost:3000`

### 9. Check env-config.js is Being Served

Open in browser: `http://localhost:3000/env-config.js`

You should see:
```javascript
window.ENV = {
  REACT_APP_GOOGLE_MAPS_API_KEY: 'AIzaSyAwDF1JaNVqKzDx7Ex2Pelh1UhxRWqMrNs'
};
```

If you see this: ✅ File is being served correctly
If you see 404: ❌ File not found, check if script injection ran

### 10. Restart Everything

1. Stop frontend server (Ctrl+C)
2. Clear build cache:
   ```bash
   cd frontend
   rm -rf node_modules/.cache
   ```
3. Restart server:
   ```bash
   npm start
   ```
4. Hard refresh browser (Ctrl+Shift+R)

## Still Not Working?

1. **Share browser console errors** (F12 > Console tab)
2. **Share Network tab screenshot** (F12 > Network tab > Filter: "maps.googleapis")
3. **Check Google Cloud Console** for any error messages
4. **Verify API key** by testing the direct URL above

## Expected Console Output

When working correctly, you should see in browser console:
```
🗺️ Loading Google Maps API with key: AIzaSyAwDF1...
✅ Google Maps API loaded successfully!
```

## Quick Test

1. Open: http://localhost:3000
2. Go to Profile or Checkout page
3. Open Console (F12)
4. Look for Google Maps loading messages
5. The map should appear where the location picker is




