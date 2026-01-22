# Environment Variable Setup for Google Maps API Key

## Environment Variable Name

The environment variable name is:
```
REACT_APP_GOOGLE_MAPS_API_KEY
```

## Setup Instructions

### Step 1: Create `.env` file

Create a file named `.env` in the `frontend` directory:

**File path:** `frontend/.env`

### Step 2: Add your API key

Add this line to your `.env` file:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Example:**
```env
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Restart Development Server

**Important:** After creating or modifying the `.env` file, you must restart your development server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
cd frontend
npm start
```

## Complete `.env` File Example

Your `frontend/.env` file should look like this:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Google Maps API Key
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Important Notes

1. **Variable Name Must Start with `REACT_APP_`**
   - React only exposes environment variables that start with `REACT_APP_`
   - Don't use `GOOGLE_MAPS_API_KEY` (missing `REACT_APP_` prefix)

2. **No Spaces Around `=`**
   - ✅ Correct: `REACT_APP_GOOGLE_MAPS_API_KEY=your_key`
   - ❌ Wrong: `REACT_APP_GOOGLE_MAPS_API_KEY = your_key`

3. **No Quotes Needed**
   - ✅ Correct: `REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSy...`
   - ❌ Wrong: `REACT_APP_GOOGLE_MAPS_API_KEY="AIzaSy..."`

4. **Restart Required**
   - Changes to `.env` file only take effect after restarting the server
   - Environment variables are read at build/start time

5. **Git Ignore**
   - The `.env` file is automatically ignored by git (in `.gitignore`)
   - Never commit your API keys to version control

## Getting Your Google Maps API Key

1. Go to: https://console.cloud.google.com/
2. Create or select a project
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
4. Go to "APIs & Services" > "Credentials"
5. Click "Create Credentials" > "API Key"
6. Copy your API key
7. Paste it in your `.env` file

## Troubleshooting

### Map still not loading?

1. **Check if `.env` file exists:**
   ```bash
   cd frontend
   ls -la .env
   ```

2. **Check if variable name is correct:**
   - Must be exactly: `REACT_APP_GOOGLE_MAPS_API_KEY`
   - Case-sensitive

3. **Verify restart:**
   - Stop server completely (Ctrl+C)
   - Start again: `npm start`

4. **Check browser console:**
   - Open browser DevTools (F12)
   - Look for errors or warnings about API key

5. **Check server console:**
   - Should see: `✅ Environment config updated` when starting

## Alternative: Direct in HTML (Not Recommended)

If you prefer not to use environment variables, you can still edit `frontend/public/index.html` directly, but this is less secure and not recommended for production.




