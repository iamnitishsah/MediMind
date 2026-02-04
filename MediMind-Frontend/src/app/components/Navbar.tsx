'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(Boolean(token));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  return (
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image src="/logo.svg" alt="MediMind" width={32} height={32} />
              <span className="ml-3 text-lg font-semibold text-gray-900">
              MediMind
            </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              {isLoggedIn ? (
                  <>
                    <Link
                        href="/patients"
                        className={`px-3 py-2 rounded-md transition-colors ${
                            isActive('/patients')
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-gray-600 hover:text-indigo-600'
                        }`}
                    >
                      Patients
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="px-3 py-2 rounded-md text-gray-600 hover:text-red-600 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
              ) : (
                  <>
                    <Link
                        href="/login"
                        className="text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      Sign In
                    </Link>

                    <Link
                        href="/register"
                        className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                      Get Started
                    </Link>
                  </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Toggle navigation menu"
            >
              {!isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
              ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
              <div className="md:hidden mt-2 rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="px-2 py-3 space-y-1 text-sm">
                  {isLoggedIn ? (
                      <>
                        <Link
                            href="/patients"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block rounded-md px-3 py-2 ${
                                isActive('/patients')
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                          Patients
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="block w-full text-left rounded-md px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-red-600"
                        >
                          Sign Out
                        </button>
                      </>
                  ) : (
                      <>
                        <Link
                            href="/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block rounded-md px-3 py-2 text-gray-600 hover:bg-gray-50"
                        >
                          Sign In
                        </Link>

                        <Link
                            href="/register"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block rounded-md px-3 py-2 text-center bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                          Get Started
                        </Link>
                      </>
                  )}
                </div>
              </div>
          )}
        </div>
      </nav>
  );
}
