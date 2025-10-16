'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './navbar';
import Footer from './footer';

export default function ConditionalLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    checkAuth();

    window.addEventListener('storage', checkAuth);
    window.addEventListener('storageUpdate', checkAuth);
    window.addEventListener('loginSuccess', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('storageUpdate', checkAuth);
      window.removeEventListener('loginSuccess', checkAuth);
    };
  }, []);

  // Only hide navbar/footer on login page
  // Show navbar/footer everywhere else if logged in
  const showNavAndFooter = isLoggedIn && pathname !== '/login';

  return (
    <div className="App min-h-screen flex flex-col">
      {showNavAndFooter && <Navbar />}
      
      <main className="flex-grow">
        {children}
      </main>
      
      {showNavAndFooter && <Footer />}
    </div>
  );
}