// client/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('token') !== null;
  
  // If not logged in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/about" replace />;
  }

  // If logged in, show the protected content
  return children;
};

export default ProtectedRoute;