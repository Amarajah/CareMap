import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/protectedRoute';
import Navbar from './components/navbar';
import Footer from './components/footer';
import ClinicMap from './pages/clinicMap';
import InfoHub from './pages/infoHub';
import HomePage from './pages/home';
import AboutCareMap from './pages/about';
import Login from './pages/login';
import './index.css';


//const { initializeService } = require('./services/articleAggregatorService');

// Start the service
//initializeService();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status and listen for changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    // Check initially
    checkAuth();

    // Listen for storage changes (login/logout events)
    window.addEventListener('storage', checkAuth);
    window.addEventListener('loginSuccess', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('loginSuccess', checkAuth);
    };
  }, []);

  return (
    <Router>
      <div className="App min-h-screen flex flex-col">
        {/* Only show Navigation if logged in */}
        {isLoggedIn && <Navbar />}
        
        <main className="flex-grow">
          <Routes>
            {/* Public routes (no navbar/footer) */}
            <Route path="/" element={<AboutCareMap />} />
            <Route path="/about" element={<AboutCareMap />} />
            <Route path="/login" element={<Login />} />

            {/* Protected routes (with navbar/footer) */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/infoHub" 
              element={
                <ProtectedRoute>
                  <InfoHub />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clinicMap" 
              element={
                <ProtectedRoute>
                  <ClinicMap />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        
        {/* Only show Footer if logged in */}
        {isLoggedIn && <Footer />}
      </div>
    </Router>
  );
}

export default App;