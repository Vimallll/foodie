# Google Maps API Setup Guide

This application uses Google Maps API for location selection and live tracking features.

## Required Steps:

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
   - **Directions API**

4. Create credentials (API Key):
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

### 2. Configure API Key

**Option 1: Direct Configuration (For Development)**

Open `frontend/public/index.html` and replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places,geometry"></script>
```

**Option 2: Environment Variable (Recommended for Production)**

1. Create a `.env` file in the `frontend` directory:
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

2. Update `frontend/public/index.html`:
```html
<script src={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`}></script>
```

**Note:** For this to work, you'll need to inject the environment variable during build. Alternatively, create a configuration file that loads the API key.

### 3. Restrict API Key (Important for Security)

In Google Cloud Console:
- Go to "APIs & Services" > "Credentials"
- Click on your API key
- Under "Application restrictions":
  - Select "HTTP referrers (web sites)"
  - Add your domain (e.g., `localhost:3000`, `yourdomain.com/*`)
- Under "API restrictions":
  - Select "Restrict key"
  - Choose the APIs you enabled above
- Click "Save"

### 4. Features Using Google Maps

#### User Features:
- **Profile Page**: Users can select their delivery address on a map
- **Checkout Page**: Users can select delivery location on a map

#### Delivery Partner Features:
- **Live Location Tracking**: Delivery guys can share their real-time location
- **Route Display**: Shows route from restaurant to delivery address
- **Location Updates**: Automatic location updates sent to server

## Troubleshooting

### Maps Not Loading
- Check browser console for errors
- Verify API key is correct
- Ensure required APIs are enabled in Google Cloud Console
- Check API key restrictions match your domain

### Location Permission Denied
- Users must allow browser location access
- Ensure HTTPS (or localhost) for geolocation API

### Search Box Not Working
- Ensure Places API is enabled
- Check API key has Places API access

## Notes

- The free tier of Google Maps API includes $200 credit per month
- Monitor usage in Google Cloud Console
- Consider implementing caching for geocoding requests to reduce API calls
- For production, always restrict your API keys




