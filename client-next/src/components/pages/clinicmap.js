'use client';

import { GoogleMap, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { useEffect, useState } from 'react';

const mapStyle = {
  height: '1000px',
  width: '100%',
};

const DEFAULT_CENTER = {
  lat: 6.5244, // Lagos fallback
  lng: 3.3792,
};

export default function HealthFacilityMap({ centerLocation }) {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [map, setMap] = useState(null);
  const [locationError, setLocationError] = useState(null);

  /** 
   * STEP 1: Geolocation handling with permissions
   */
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      console.error('Geolocation not supported by this browser.');
      setLocationError('Geolocation not supported.');
      searchNearbyHospitals(DEFAULT_CENTER);
      return;
    }

    // Check geolocation permission state first
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        console.log('Permission state:', result.state);

        if (result.state === 'granted') {
          getUserLocation();
        } else if (result.state === 'prompt') {
          requestLocation();
        } else if (result.state === 'denied') {
          setLocationError('Please enable location access in your browser settings.');
          searchNearbyHospitals(DEFAULT_CENTER);
        }

        // Listen for permission changes
        result.onchange = () => {
          console.log('Permission changed to:', result.state);
          if (result.state === 'granted') getUserLocation();
        };
      });
    } else {
      // Fallback for older browsers
      requestLocation();
    }
  }, []);

  function getUserLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log('User position:', loc);
        setUserLocation(loc);
        setLocationError(null);
        searchNearbyHospitals(loc);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError(error.message || 'Unable to retrieve your location.');
        searchNearbyHospitals(DEFAULT_CENTER);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  function requestLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log('Location retrieved:', loc);
        setUserLocation(loc);
        setLocationError(null);
        searchNearbyHospitals(loc);
      },
      (error) => {
        console.error('Error getting location:', error);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location access denied. Enable it in browser settings.');
        }
        searchNearbyHospitals(DEFAULT_CENTER);
      },
      { enableHighAccuracy: true }
    );
  }

  /**
   * STEP 2: Run hospital search for centerLocation updates
   */
  useEffect(() => {
    if (centerLocation) {
      searchNearbyHospitals(centerLocation);
    }
  }, [centerLocation]);

  /**
   * STEP 3: Nearby hospital search
   */
  const searchNearbyHospitals = (location) => {
    if (!window.google || !window.google.maps) {
      console.warn('Google Maps API not loaded yet');
      return;
    }

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    const facilityTypes = [
      { keyword: 'hospital' },
      { keyword: 'clinic' },
      { keyword: 'pharmacy' },
      { keyword: 'health center' },
      { keyword: 'medical center' },
      { keyword: 'dentist' },
      { keyword: 'dental clinic' },
      { keyword: 'gynecologist' },
      { keyword: 'obstetrician' },
      { keyword: 'women\'s health clinic' },
    ];

    setFacilities([]);

    facilityTypes.forEach((facility) => {
      const request = {
        location: new window.google.maps.LatLng(location.lat, location.lng),
        radius: 3000, // 3 km range
        keyword: facility.keyword,
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          results.forEach((place) => getPlaceDetails(place.place_id));
        }
      });
    });
  };

  const getPlaceDetails = (placeId) => {
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    service.getDetails(
      {
        placeId,
        fields: [
          'name',
          'formatted_address',
          'photos',
          'opening_hours',
          'formatted_phone_number',
          'website',
          'reviews',
          'rating',
          'user_ratings_total',
          'geometry',
          'place_id',
        ],
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setFacilities((prev) =>
            prev.find((f) => f.place_id === place.place_id) ? prev : [...prev, place]
          );
        }
      }
    );
  };

  /**
   * STEP 4: Directions handling
   */
  const handleGetDirections = (facility) => {
    if (!window.google || !window.google.maps) {
      alert('Google Maps API not ready yet');
      return;
    }

    const originLocation = centerLocation || userLocation; // use typed address if available

    if (!userLocation) {
      alert('Please enable location access or enter an address first');
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: new window.google.maps.LatLng(originLocation.lat, originLocation.lng),
        destination: facility.geometry.location,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          alert('Could not calculate directions: ' + status);
        }
      }
    );
  };

  const handleClearDirections = () => setDirections(null);

  const centerCoords = centerLocation || userLocation || DEFAULT_CENTER;

  return (
    <div>
      {locationError && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 mb-4 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Location:</strong> {locationError}
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            <strong>To fix:</strong> Enable location access.
          </p>
        </div>
      )}

      {userLocation && !centerLocation && (
        <div className="bg-blue-50 border border-blue-200 p-3 mb-4 rounded-md">
          <p className="text-sm text-blue-900">
            <strong>Using your current location</strong> — {facilities.length} facilities found
            nearby.
          </p>
        </div>
      )}

      <GoogleMap mapContainerStyle={mapStyle} center={centerCoords} zoom={14} onLoad={setMap}>
        {userLocation && (
          <Marker
            position={userLocation}
            title="Your Location"
            icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          />
        )}

        {facilities.map((facility) => (
          <Marker
            key={facility.place_id}
            position={facility.geometry.location}
            title={facility.name}
            onClick={() => setSelectedFacility(facility)}
          />
        ))}

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: { strokeColor: '#4285F4', strokeWeight: 5, zIndex: 50 },
            }}
          />
        )}

        {selectedFacility && (
          <InfoWindow
            position={selectedFacility.geometry.location}
            onCloseClick={() => {
              setSelectedFacility(null);
              //setDirections(null);
            }}
          >
            <div className="w-80 bg-white rounded-lg p-4 font-sans">
              <h3 className="text-base font-bold text-gray-900 mb-3">{selectedFacility.name}</h3>
              <p className="text-sm text-gray-700 mb-2">
                📍 {selectedFacility.formatted_address || 'Address unavailable'}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                📞 {selectedFacility.formatted_phone_number || 'N/A'}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                ⭐ {selectedFacility.rating} ({selectedFacility.user_ratings_total} reviews)
              </p>
              {selectedFacility.website && (
                <a
                  href={selectedFacility.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  🌐 Visit Website
                </a>
              )}

              <button
                onClick={() => handleGetDirections(selectedFacility)}
                className="w-full mt-3 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-md"
              >
                🚗 Get Directions
              </button>

              {directions && (
                <div className="mt-3 p-3 bg-gray-100 rounded-md text-sm">
                  <p className="font-bold text-gray-900 mb-2">Route Details:</p>
                  <p className="text-gray-700 mb-1">
                    <strong>Distance:</strong> {directions.routes[0].legs[0].distance.text}
                  </p>
                  <p className="text-gray-700">
                    <strong>Duration:</strong> {directions.routes[0].legs[0].duration.text}
                  </p>
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
