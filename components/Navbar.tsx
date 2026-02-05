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
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Course Platform
            </Link>
            <div className="ml-10 flex space-x-4">
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
                  {/* Show Affiliate link only for non-admin users */}
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
          <div className="flex items-center space-x-4">
            <DarkModeToggle />
            {loading ? (
              <span className="text-gray-500 dark:text-gray-400">Loading...</span>
            ) : user ? (
              <div className="flex items-center space-x-4">
                {renderAvatar()}
                <span className="text-gray-700 dark:text-gray-300 hidden sm:block">{user.name || user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
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
          </div>
        </div>
      </div>
    </nav>
  );
}
