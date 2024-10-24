"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { i18n } = useTranslation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-80 backdrop-blur-md font-oxanium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-gray-800">
              Web3 Project
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/features" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Features
              </Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                How it works?
              </Link>
              <Link href="/about-us" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                About Us
              </Link>
            </div>
            {/* Language selector for desktop */}
            <select 
              onChange={(e) => changeLanguage(e.target.value)} 
              className="bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="zh">中文</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          <div className="md:hidden flex items-center">
            {/* Language selector for mobile */}
            <select 
              onChange={(e) => changeLanguage(e.target.value)} 
              className="bg-gray-100 text-gray-800 font-semibold py-1 px-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-2"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="zh">Chinese</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/features" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
              Features
            </Link>
            <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
              How it works?
            </Link>
            <Link href="/about-us" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
              About Us
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
