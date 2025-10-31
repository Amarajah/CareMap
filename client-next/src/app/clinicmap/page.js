'use client';

import { LoadScript } from '@react-google-maps/api';
import { useState } from 'react';
import AddressSearch from '@/components/addresssearch';
import HealthFacilityMap from '@/components/pages/clinicmap';

export default function ClinicMapPage() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleAddressSelect = (location) => {
    setSelectedLocation(location);
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      libraries={['places']}
    >
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Header */}
        <div className="bg-white shadow-md p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Find Health Facilities Near You
            </h1>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-gray-900 mb-2">Search Address</h3>
                <p className="text-sm text-gray-600">
                  Type in an address or location to search for nearby health facilities.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-gray-900 mb-2">View on Map</h3>
                <p className="text-sm text-gray-600">
                  See all hospitals, clinics, and pharmacies within 1km on the map.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-gray-900 mb-2">Get Details</h3>
                <p className="text-sm text-gray-600">
                  Click any marker to see reviews, hours, phone, and get directions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="max-w-6xl mx-auto">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search by Address
            </label>
            <AddressSearch onPlaceSelected={handleAddressSelect} />

            {selectedLocation && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Showing facilities within 3km of:</strong> {selectedLocation.address}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Map Section */}
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <HealthFacilityMap centerLocation={selectedLocation} />
            </div>
          </div>
        </div>
      </div>
    </LoadScript>
  );
}