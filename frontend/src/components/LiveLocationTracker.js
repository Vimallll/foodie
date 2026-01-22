import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './LiveLocationTracker.css';

const LiveLocationTracker = ({ order, onLocationUpdate }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [routePolyline, setRoutePolyline] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    if (!window.google || !mapRef.current || !order) return;

    // Initialize map centered on restaurant or delivery address
    const centerLat = order.restaurant?.address?.latitude || order.deliveryAddress?.latitude || 28.6139;
    const centerLng = order.restaurant?.address?.longitude || order.deliveryAddress?.longitude || 77.2090;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom: 13,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    setMap(mapInstance);

    // Add restaurant marker
    if (order.restaurant?.address?.latitude && order.restaurant?.address?.longitude) {
      new window.google.maps.Marker({
        position: {
          lat: order.restaurant.address.latitude,
          lng: order.restaurant.address.longitude,
        },
        map: mapInstance,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
        label: {
          text: '🍽️ Restaurant',
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold',
        },
      });
    }

    // Add delivery address marker
    if (order.deliveryAddress?.latitude && order.deliveryAddress?.longitude) {
      new window.google.maps.Marker({
        position: {
          lat: order.deliveryAddress.latitude,
          lng: order.deliveryAddress.longitude,
        },
        map: mapInstance,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
        label: {
          text: '📍 Delivery',
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold',
        },
      });
    }

    // Create delivery guy marker (will be updated as location changes)
    const deliveryMarker = new window.google.maps.Marker({
      position: { lat: centerLat, lng: centerLng },
      map: mapInstance,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#FC8019',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      label: {
        text: '🚚',
        fontSize: '20px',
      },
      zIndex: 1000,
    });

    setMarker(deliveryMarker);

    // Draw route if both locations are available
    if (
      order.restaurant?.address?.latitude &&
      order.restaurant?.address?.longitude &&
      order.deliveryAddress?.latitude &&
      order.deliveryAddress?.longitude
    ) {
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: true, // We're using custom markers
        polylineOptions: {
          strokeColor: '#FC8019',
          strokeWeight: 5,
          strokeOpacity: 0.7,
        },
      });

      directionsService.route(
        {
          origin: {
            lat: order.restaurant.address.latitude,
            lng: order.restaurant.address.longitude,
          },
          destination: {
            lat: order.deliveryAddress.latitude,
            lng: order.deliveryAddress.longitude,
          },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
            setRoutePolyline(directionsRenderer);
          } else {
            console.error('Directions request failed:', status);
          }
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [order]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsTracking(true);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setCurrentLocation(location);

        // Update marker on map
        if (marker && map) {
          const pos = new window.google.maps.LatLng(location.latitude, location.longitude);
          marker.setPosition(pos);
          map.panTo(pos);
        }

        // Send location to server
        updateLocationOnServer(location);

        // Callback to parent component
        if (onLocationUpdate) {
          onLocationUpdate(location);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsTracking(false);
        alert('Unable to track location. Please enable location permissions.');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  };

  const updateLocationOnServer = async (location) => {
    try {
      await api.post('/delivery/location', {
        latitude: location.latitude,
        longitude: location.longitude,
      });
    } catch (error) {
      console.error('Error updating location on server:', error);
    }
  };

  return (
    <div className="live-location-tracker">
      <div className="tracker-header">
        <h3>📍 Live Location Tracking</h3>
        <div className="tracker-controls">
          {!isTracking ? (
            <button
              onClick={startTracking}
              className="track-location-btn start-tracking"
            >
              ▶️ Start Tracking
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="track-location-btn stop-tracking"
            >
              ⏸️ Stop Tracking
            </button>
          )}
          {isTracking && currentLocation && (
            <span className="tracking-status">
              <span className="status-dot"></span>
              Live
            </span>
          )}
        </div>
      </div>

      <div ref={mapRef} className="live-location-map" />

      {currentLocation && (
        <div className="current-location-info">
          <div className="location-coords">
            <strong>Current Location:</strong>
            <span>{currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}</span>
          </div>
        </div>
      )}

      {!isTracking && (
        <div className="tracker-note">
          <p>📍 Click "Start Tracking" to begin sharing your live location. Your location will be updated automatically and visible to customers.</p>
        </div>
      )}
    </div>
  );
};

export default LiveLocationTracker;




