import React, { useState, useEffect, useRef } from 'react';
import './LocationPicker.css';

const LocationPicker = ({ 
  onLocationSelect, 
  initialLocation = null, 
  height = '400px',
  showSearchBox = true,
  label = 'Select Location on Map'
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    fullAddress: '',
  });

  // Check if Google Maps API is loaded
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoading(false);
        setError(null);
        return true;
      }
      return false;
    };

    // Check immediately if already loaded
    if (checkGoogleMaps()) {
      return;
    }

    // Check for load errors first
    if (window.googleMapsLoadError === 'API_KEY_MISSING') {
      setError('GOOGLE_MAPS_API_KEY_MISSING');
      setIsLoading(false);
      return;
    }

    if (window.googleMapsLoadError === true) {
      setError('GOOGLE_MAPS_LOAD_ERROR');
      setIsLoading(false);
      return;
    }

    // Function to check if API key exists
    const hasValidApiKey = () => {
      if (window.ENV && window.ENV.REACT_APP_GOOGLE_MAPS_API_KEY) {
        const key = window.ENV.REACT_APP_GOOGLE_MAPS_API_KEY.trim();
        return key && 
               key !== '%REACT_APP_GOOGLE_MAPS_API_KEY%' && 
               key !== '' &&
               key !== 'YOUR_GOOGLE_MAPS_API_KEY';
      }
      return false;
    };

    // Check if API key exists (wait for env-config.js to load)
    let envCheckAttempts = 0;
    const maxEnvCheckAttempts = 40; // 2 seconds max wait for env-config.js
    
    const checkApiKeyInterval = setInterval(() => {
      envCheckAttempts++;
      
      // Check for errors
      if (window.googleMapsLoadError === 'API_KEY_MISSING') {
        clearInterval(checkApiKeyInterval);
        setError('GOOGLE_MAPS_API_KEY_MISSING');
        setIsLoading(false);
        return;
      }
      
      if (window.googleMapsLoadError === true) {
        clearInterval(checkApiKeyInterval);
        setError('GOOGLE_MAPS_LOAD_ERROR');
        setIsLoading(false);
        return;
      }
      
      // If API key exists, wait for Google Maps to load
      if (hasValidApiKey()) {
        clearInterval(checkApiKeyInterval);
        
        // Check if Google Maps is already loaded
        if (checkGoogleMaps()) {
          return;
        }
        
        // Wait for Google Maps to load (max 10 seconds)
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds (100 * 100ms)
        const mapLoadInterval = setInterval(() => {
          attempts++;
          if (checkGoogleMaps()) {
            clearInterval(mapLoadInterval);
          } else if (attempts >= maxAttempts) {
            clearInterval(mapLoadInterval);
            // Don't show timeout error if API key exists - might still be loading
            // Just keep loading state
          }
        }, 100);
        
        return () => clearInterval(mapLoadInterval);
      } else if (envCheckAttempts >= maxEnvCheckAttempts) {
        // API key not found after waiting
        clearInterval(checkApiKeyInterval);
        setError('GOOGLE_MAPS_API_KEY_MISSING');
        setIsLoading(false);
      }
    }, 50);

    return () => clearInterval(checkApiKeyInterval);
  }, []);

  useEffect(() => {
    if (isLoading || error || !window.google || !window.google.maps || !mapRef.current) return;

    // Initialize map
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: initialLocation 
        ? { lat: initialLocation.latitude || initialLocation.lat, lng: initialLocation.longitude || initialLocation.lng }
        : { lat: 28.6139, lng: 77.2090 }, // Default: New Delhi
      zoom: 15,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    setMap(mapInstance);

    // Add marker
    const markerInstance = new window.google.maps.Marker({
      map: mapInstance,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
    });

    if (initialLocation) {
      const position = {
        lat: initialLocation.latitude || initialLocation.lat,
        lng: initialLocation.longitude || initialLocation.lng,
      };
      markerInstance.setPosition(position);
      mapInstance.setCenter(position);
      reverseGeocode(position);
    }

    setMarker(markerInstance);

    // Add click listener to map
    mapInstance.addListener('click', (e) => {
      const position = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      markerInstance.setPosition(position);
      mapInstance.panTo(position);
      reverseGeocode(position);
    });

    // Add drag listener to marker
    markerInstance.addListener('dragend', (e) => {
      const position = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      reverseGeocode(position);
    });

    // Initialize search box
    if (showSearchBox) {
      const input = document.getElementById('location-search-input');
      if (input) {
        const searchBoxInstance = new window.google.maps.places.SearchBox(input);
        setSearchBox(searchBoxInstance);

        // Bias search results to current map viewport
        mapInstance.addListener('bounds_changed', () => {
          searchBoxInstance.setBounds(mapInstance.getBounds());
        });

        // Listen for place selection
        searchBoxInstance.addListener('places_changed', () => {
          const places = searchBoxInstance.getPlaces();
          if (places.length === 0) return;

          const place = places[0];
          if (!place.geometry || !place.geometry.location) return;

          // Center map on selected place
          const location = place.geometry.location;
          const position = {
            lat: typeof location.lat === 'function' ? location.lat() : location.lat,
            lng: typeof location.lng === 'function' ? location.lng() : location.lng,
          };
          
          mapInstance.setCenter(position);
          mapInstance.setZoom(17);

          // Update marker position
          markerInstance.setPosition(position);

          // Get address components
          geocodePlace(place);
        });
      }
    }

    // Get current location function
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            markerInstance.setPosition(pos);
            mapInstance.setCenter(pos);
            mapInstance.setZoom(17);
            reverseGeocode(pos);
          },
          (error) => {
            console.error('Error getting current location:', error);
            alert('Unable to get your location. Please allow location access or select on map.');
          }
        );
      } else {
        alert('Geolocation is not supported by your browser.');
      }
    };

    // Add get current location button
    const locationButton = document.createElement('button');
    locationButton.textContent = '📍 Use My Location';
    locationButton.className = 'get-location-btn';
    locationButton.onclick = (e) => {
      e.preventDefault();
      getCurrentLocation();
    };
    mapInstance.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(locationButton);

    return () => {
      if (markerInstance) markerInstance.setMap(null);
    };
  }, [initialLocation, showSearchBox, isLoading, error]);

  const reverseGeocode = (position) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: position }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const place = results[0];
        const parsedAddress = parseAddressComponents(place.address_components || [], place.formatted_address || '');
        
        const locationData = {
          latitude: position.lat,
          longitude: position.lng,
          street: parsedAddress.street,
          city: parsedAddress.city,
          state: parsedAddress.state,
          zipCode: parsedAddress.zipCode,
          fullAddress: parsedAddress.fullAddress,
        };

        setSelectedLocation(locationData);
        if (onLocationSelect) {
          onLocationSelect(locationData);
        }
      } else {
        console.error('Geocoding failed:', status);
        // Still set location even if geocoding fails
        const locationData = {
          latitude: position.lat,
          longitude: position.lng,
          street: '',
          city: '',
          state: '',
          zipCode: '',
          fullAddress: `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`,
        };
        setSelectedLocation(locationData);
        if (onLocationSelect) {
          onLocationSelect(locationData);
        }
      }
    });
  };

  const geocodePlace = (place) => {
    const components = place.address_components || [];
    const formattedAddress = place.formatted_address || place.name || '';
    
    let position;
    if (place.geometry && place.geometry.location) {
      const location = place.geometry.location;
      position = {
        lat: typeof location.lat === 'function' ? location.lat() : location.lat,
        lng: typeof location.lng === 'function' ? location.lng() : location.lng,
      };
    } else {
      return; // Invalid place
    }

    // Parse address components first
    const parsedAddress = parseAddressComponents(components, formattedAddress);

    const locationData = {
      latitude: position.lat,
      longitude: position.lng,
      street: parsedAddress.street,
      city: parsedAddress.city,
      state: parsedAddress.state,
      zipCode: parsedAddress.zipCode,
      fullAddress: formattedAddress,
    };

    setSelectedLocation(locationData);
    setAddress(parsedAddress);
    if (onLocationSelect) {
      onLocationSelect(locationData);
    }
  };

  const parseAddressComponents = (components, formattedAddress) => {
    let street = '';
    let city = '';
    let state = '';
    let zipCode = '';

    components.forEach((component) => {
      const types = component.types || [];
      
      if (types.includes('street_number')) {
        street = component.long_name + ' ';
      } else if (types.includes('route')) {
        street += component.long_name;
      } else if (types.includes('locality') || types.includes('sublocality')) {
        if (!city) city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name || component.long_name;
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    });

    const parsedAddress = {
      street: street.trim(),
      city,
      state,
      zipCode,
      fullAddress: formattedAddress,
    };

    setAddress(parsedAddress);
    return parsedAddress;
  };

  if (error === 'GOOGLE_MAPS_API_KEY_MISSING') {
    return (
      <div className="location-picker-container">
        <label className="location-picker-label">{label}</label>
        <div className="map-error-container">
          <div className="map-error-icon">⚠️</div>
          <h3>Google Maps API Key Required</h3>
          <p>To use the map location picker, you need to configure your Google Maps API key.</p>
          <div className="map-error-instructions">
            <p><strong>Steps to fix:</strong></p>
            <ol>
              <li>Get your API key from <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
              <li>Enable these APIs: Maps JavaScript API, Places API, Geocoding API</li>
              <li>Open <code>frontend/public/index.html</code></li>
              <li>Replace <code>YOUR_GOOGLE_MAPS_API_KEY</code> with your actual API key</li>
              <li>Restart your development server</li>
            </ol>
            <p className="map-error-note">
              <strong>Note:</strong> You can still enter your address manually using the fields below.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error === 'GOOGLE_MAPS_LOAD_TIMEOUT' || error === 'GOOGLE_MAPS_LOAD_ERROR') {
    return (
      <div className="location-picker-container">
        <label className="location-picker-label">{label}</label>
        <div className="map-error-container">
          <div className="map-error-icon">❌</div>
          <h3>Google Maps Failed to Load</h3>
          <p>The Google Maps API failed to load. Please check:</p>
          <ul>
            <li>Your internet connection</li>
            <li>If the API key is valid and has the required APIs enabled:
              <ul>
                <li>Maps JavaScript API</li>
                <li>Places API</li>
                <li>Geocoding API</li>
              </ul>
            </li>
            <li>Browser console (F12) for specific error messages</li>
            <li>API key restrictions in Google Cloud Console</li>
          </ul>
          <p className="map-error-note">
            <strong>Note:</strong> You can still enter your address manually using the fields below.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="location-picker-container">
        <label className="location-picker-label">{label}</label>
        <div className="map-loading-container">
          <div className="map-loading-spinner"></div>
          <p>Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="location-picker-container">
      <label className="location-picker-label">{label}</label>
      
      {showSearchBox && (
        <div className="location-search-wrapper">
          <input
            id="location-search-input"
            type="text"
            placeholder="Search for an address or place..."
            className="location-search-input"
          />
        </div>
      )}

      <div
        ref={mapRef}
        className="location-map"
        style={{ height }}
      />

      {selectedLocation && (
        <div className="selected-location-info">
          <div className="location-info-item">
            <strong>📍 Selected Location:</strong>
          </div>
          <div className="location-info-item">
            {address.fullAddress || `${selectedLocation.latitude?.toFixed(6)}, ${selectedLocation.longitude?.toFixed(6)}`}
          </div>
          {address.street && (
            <div className="location-details">
              <div><strong>Street:</strong> {address.street}</div>
              <div><strong>City:</strong> {address.city}</div>
              <div><strong>State:</strong> {address.state}</div>
              <div><strong>Zip Code:</strong> {address.zipCode}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;

