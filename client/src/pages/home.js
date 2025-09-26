import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-8">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left side - Text content */}
        <div className="space-y-8">
          {/* Logo and brand */}
          <div className="flex items-center space-x-4">
          
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <span className="text-white text-3xl font-bold">C</span>
            </div>
            
            {/* CareMap text with animated effect */}
            <h1 className="text-6xl font-bold">
              <span 
                className="bg-gradient-to-r from-blue-600 via-green-600 to-blue-800 bg-clip-text text-transparent animate-pulse"
                style={{
                  backgroundSize: '200% 200%',
                  animation: 'gradient 3s ease-in-out infinite'
                }}
              >
                CareMap
              </span>
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-xl text-gray-700 leading-relaxed max-w-lg">
            Connecting You to Quality Healthcare, Everywhere. Find verified clinics, 
            labs, and medical facilities near you with real-time availability and reviews.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigate('/clinicmap')} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
              Find Healthcare Near Me
            </button>
            <button onClick={() => navigate('/infohub')} className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-600 hover:text-white transition-all duration-300">
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">200,000+</div>
              <div className="text-sm text-gray-600">Verified Clinics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">5,000+</div>
              <div className="text-sm text-gray-600">Cities Covered</div>
            </div>
            
          </div>
        </div>

        {/* Right side - Image placeholder (replacing card stack) */}
        <div className="relative">
          <div className="bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-500">
            {/* Image placeholder - replace with your xyz.png */}
            <div className="aspect-square bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl flex items-center justify-center">
              <div className="text-center space-y-4">
                <p className="text-gray-600"><img src="/caremap.png" alt="CareMap" /></p>
              </div>
            </div>
          </div>
          
          {/* Floating elements for visual appeal */}
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-200 rounded-full opacity-60 animate-bounce"></div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-200 rounded-full opacity-60 animate-pulse"></div>
        </div>
      </div>

      {/* Custom CSS for gradient animation */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;