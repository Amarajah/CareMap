'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check login status on mount and when storage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setLoggedIn(token !== null);
    };

    // Check on mount
    checkLoginStatus();

    // Listen for storage events (for logout in other tabs)
    window.addEventListener('storage', checkLoginStatus);

    // Custom event listener for same-tab logout
    const handleStorageEvent = () => checkLoginStatus();
    window.addEventListener('storageUpdate', handleStorageEvent);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('storageUpdate', handleStorageEvent);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update state
    setLoggedIn(false);
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('storageUpdate'));
    
    // Navigate to about page
    router.push('/about');
  };

  const navLinks = [
    { name: 'About', path: '/about' },
    { name: 'ClinicMap', path: '/clinicmap' },
    { name: 'Home', path: '/home' },
    { name: 'InfoHub', path: '/infohub' },
  ];

  return (
    <nav className="bg-transparent shadow-lg sticky top-0 z-50" style={{backgroundColor: 'transparent', background: 'none'}}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-3 transition-transform duration-300">
              <span className="text-white text-xl font-bold">C</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              CareMap
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`font-medium transition-colors duration-200 hover:scale-105 ${
                  pathname === link.path 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Logout/Login Button */}
            {loggedIn ? (
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                Logout
              </button>
            ) : (
              <Link 
                href="/login" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg inline-block"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 border border-gray-200 rounded-lg"
            aria-label="Toggle menu"
          >
            <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
            <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`block font-medium py-2 transition-colors ${
                    pathname === link.path 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Mobile Logout/Login Button */}
              {loggedIn ? (
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Logout
                </button>
              ) : (
                <Link 
                  href="/login" 
                  className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;