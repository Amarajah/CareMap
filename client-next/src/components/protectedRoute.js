'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.replace('/about');
        return;
      }
      
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Only render children if authenticated
  return children;
};

export default ProtectedRoute;