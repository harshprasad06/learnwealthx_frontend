'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DarkModeToggle from './DarkModeToggle';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  picture?: string | null;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setImageError(false); // Reset error state when user changes
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      setImageError(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderAvatar = () => {
    if (!user) return null;

    const shouldShowFallback = !user.picture || imageError;
    const displayName = user.name || user.email;
    const initial = displayName.charAt(0).toUpperCase();

    if (shouldShowFallback) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
          {initial}
        </div>
      );
    }

    return (
      <img
        src={user.picture}
        alt={user.name || user.email}
        className="w-8 h-8 rounded-full object-cover"
        onError={() => setImageError(true)}
      />
    );
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent"
            >
              Course Platform
            </Link>
            <div className="hidden md:flex ml-10 space-x-4">
              {(!user || user.role !== 'ADMIN') && (
                <Link
                  href="/courses"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Courses
                </Link>
              )}
              {user && (
                <>
                  {user.role === 'ADMIN' && (
                    <>
                      <Link
                        href="/admin/courses"
                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Courses
                      </Link>
                      <Link
                        href="/admin/users"
                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Users
                      </Link>
                      <Link
                        href="/admin/affiliates"
                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Affiliates
                      </Link>
                      <Link
                        href="/admin/kyc"
                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        KYC
                      </Link>
                      <Link
                        href="/admin/payouts"
                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Payouts
                      </Link>
                      <Link
                        href="/admin/earnings"
                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Earnings
                      </Link>
                      <Link
                        href="/admin/analytics"
                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Analytics
                      </Link>
                    </>
                  )}
                  {user.role !== 'ADMIN' && (
                    <Link
                      href="/affiliate/dashboard"
                      className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Affiliate
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <DarkModeToggle />
            {loading ? (
              <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">Loading...</span>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/profile"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  title="View Profile"
                >
                  {renderAvatar()}
                </Link>
                <span className="text-gray-700 dark:text-gray-300 hidden sm:block">
                  {user.name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="hidden sm:inline-flex text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
            {/* Mobile menu toggle */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
              aria-label="Toggle navigation menu"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {menuOpen ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-3 border-t border-gray-200 dark:border-gray-800 mt-2">
            <div className="pt-3 space-y-1">
              {(!user || user.role !== 'ADMIN') && (
                <Link
                  href="/courses"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  Courses
                </Link>
              )}
              {user && user.role === 'ADMIN' && (
                <>
                  <Link
                    href="/admin/courses"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    Courses
                  </Link>
                  <Link
                    href="/admin/users"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    Users
                  </Link>
                  <Link
                    href="/admin/affiliates"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    Affiliates
                  </Link>
                  <Link
                    href="/admin/kyc"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    KYC
                  </Link>
                  <Link
                    href="/admin/payouts"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    Payouts
                  </Link>
                  <Link
                    href="/admin/earnings"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    Earnings
                  </Link>
                  <Link
                    href="/admin/analytics"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    Analytics
                  </Link>
                </>
              )}
              {user && user.role !== 'ADMIN' && (
                <Link
                  href="/affiliate/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  Affiliate
                </Link>
              )}
              {!loading && user && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="mt-1 block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  Logout
                </button>
              )}
              {!loading && !user && (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="mt-1 block px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md text-center"
                  >
                    Sign Up
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
