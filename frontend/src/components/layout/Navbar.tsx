'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const activeClass = "bg-blue-800 shadow-inner border-b-2 border-white";

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-tight flex items-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 mr-2 text-white" viewBox="0 0 20 20" fill="white" stroke="white" strokeWidth="0.5">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            <span className="text-white">Buying Queue Solver</span>
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300 p-2 rounded-lg"
              aria-label="Toggle menu"
            >
              <svg
                className="h-7 w-7"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                stroke="white"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/" 
              className={`font-bold text-white hover:text-blue-100 transition-colors px-3 py-2 rounded-md hover:bg-blue-800 flex items-center ${isActive('/') ? activeClass : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 navbar-icon" viewBox="0 0 20 20" fill="currentColor" stroke="white" strokeWidth="0">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="text-white">Home</span>
            </Link>
            <Link 
              href="/products" 
              className={`font-bold text-white hover:text-blue-100 transition-colors px-3 py-2 rounded-md hover:bg-blue-800 flex items-center ${isActive('/products') ? activeClass : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 navbar-icon" viewBox="0 0 20 20" fill="currentColor" stroke="white" strokeWidth="0">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              <span className="text-white">Products</span>
            </Link>
            <Link 
              href="/scan" 
              className={`font-bold text-white hover:text-blue-100 transition-colors px-3 py-2 rounded-md hover:bg-blue-800 flex items-center ${isActive('/scan') ? activeClass : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 navbar-icon" viewBox="0 0 20 20" fill="currentColor" stroke="white" strokeWidth="0">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zM13 12a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 00-1-1h-3zm1 2v1h1v-1h-1z" clipRule="evenodd" />
              </svg>
              <span className="text-white">Scan Products</span>
            </Link>
            {isAuthenticated && user?.role === 'seller' && (
              <Link 
                href="/dashboard" 
                className={`font-bold text-white hover:text-blue-100 transition-colors px-3 py-2 rounded-md hover:bg-blue-800 flex items-center ${isActive('/dashboard') ? activeClass : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 navbar-icon" viewBox="0 0 20 20" fill="currentColor" stroke="white" strokeWidth="0">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                <span className="text-white">Dashboard</span>
              </Link>
            )}
            <Link 
              href="/cart" 
              className={`relative font-bold text-white hover:text-blue-100 transition-colors px-3 py-2 rounded-md hover:bg-blue-800 flex items-center ${isActive('/cart') ? activeClass : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 navbar-icon" viewBox="0 0 20 20" fill="currentColor" stroke="white" strokeWidth="0">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span className="text-white">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs px-2 py-1 font-bold border border-white">
                  {totalItems}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={toggleDropdown}
                  className="flex items-center font-bold text-white hover:text-blue-100 transition-colors px-3 py-2 rounded-md hover:bg-blue-800 focus:outline-none"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="white">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white">{user?.name}</span>
                  <svg
                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    stroke="white"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white transition-colors font-medium flex items-center"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 navbar-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white transition-colors font-medium flex items-center"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 navbar-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white transition-colors font-medium flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 navbar-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="font-bold text-white hover:text-blue-100 transition-colors px-3 py-2 rounded-md hover:bg-blue-800 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 navbar-icon" viewBox="0 0 20 20" fill="currentColor" stroke="white" strokeWidth="0">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white">Login</span>
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-blue-700 px-5 py-2 rounded-md hover:bg-blue-50 transition-colors font-bold shadow-md border border-blue-100 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 navbar-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  <span className="text-blue-700 font-bold">Register</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-blue-500 mt-2 pt-2">
            <Link href="/" className="block py-3 hover:bg-blue-800 px-3 rounded-md font-bold flex items-center text-white" onClick={() => setIsMenuOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 navbar-icon" viewBox="0 0 20 20" fill="currentColor" stroke="white" strokeWidth="0">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="text-white">Home</span>
            </Link>
            <Link href="/products" className="block py-3 hover:bg-blue-800 px-3 rounded-md font-bold flex items-center text-white" onClick={() => setIsMenuOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 navbar-icon" viewBox="0 0 20 20" fill="currentColor" stroke="white" strokeWidth="0">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              <span className="text-white">Products</span>
            </Link>
            <Link href="/scan" className="block py-3 hover:bg-blue-800 px-3 rounded-md font-bold flex items-center text-white" onClick={() => setIsMenuOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 navbar-icon" viewBox="0 0 20 20" fill="currentColor" stroke="white" strokeWidth="0">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zM13 12a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 00-1-1h-3zm1 2v1h1v-1h-1z" clipRule="evenodd" />
              </svg>
              <span className="text-white">Scan Products</span>
            </Link>
            {isAuthenticated && user?.role === 'seller' && (
              <Link href="/dashboard" className="block py-3 hover:bg-blue-800 px-3 rounded-md font-bold flex items-center text-white" onClick={() => setIsMenuOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 navbar-icon" viewBox="0 0 20 20" fill="currentColor" stroke="white" strokeWidth="0">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                <span className="text-white">Dashboard</span>
              </Link>
            )}
            <Link href="/cart" className="block py-3 hover:bg-blue-800 px-3 rounded-md flex justify-between items-center font-bold text-white" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 navbar-icon" viewBox="0 0 20 20" fill="currentColor" stroke="white" strokeWidth="0">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                <span className="text-white">Cart</span>
              </div>
              {totalItems > 0 && <span className="bg-red-600 text-white rounded-full text-xs px-2 py-1 font-bold border border-white">{totalItems}</span>}
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/profile" className="block py-3 hover:bg-blue-800 px-3 rounded-md font-bold flex items-center text-white" onClick={() => setIsMenuOpen(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 navbar-icon" viewBox="0 0 20 20" fill="currentColor" stroke="white" strokeWidth="0">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white">Profile</span>
                </Link>
                <Link href="/orders" className="block py-3 hover:bg-blue-800 px-3 rounded-md font-bold flex items-center text-white" onClick={() => setIsMenuOpen(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 navbar-icon" viewBox="0 0 20 20" fill="currentColor" stroke="white" strokeWidth="0">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white">My Orders</span>
                </Link>
                <button onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }} className="block w-full text-left py-3 hover:bg-blue-800 px-3 rounded-md font-bold flex items-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 navbar-icon" viewBox="0 0 20 20" fill="currentColor" stroke="white" strokeWidth="0">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-3 hover:bg-blue-800 px-3 rounded-md font-bold flex items-center text-white" onClick={() => setIsMenuOpen(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 navbar-icon" viewBox="0 0 20 20" fill="currentColor" stroke="white" strokeWidth="0">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white">Login</span>
                </Link>
                <Link href="/register" className="block py-3 mt-2 bg-white text-blue-700 rounded-md font-bold text-center px-3 flex items-center justify-center" onClick={() => setIsMenuOpen(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 navbar-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  <span className="text-blue-700 font-bold">Register</span>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
} 