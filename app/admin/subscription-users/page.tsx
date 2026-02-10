'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

// Component for avatar with error handling
const Avatar = ({ imageUrl, name, email }: { imageUrl: string | null; name: string | null; email: string }) => {
  const [imageError, setImageError] = useState(false);
  const displayName = name || email;
  const initial = displayName.charAt(0).toUpperCase();

  if (!imageUrl || imageError) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={displayName}
      className="w-10 h-10 rounded-full object-cover"
      onError={() => setImageError(true)}
    />
  );
};

interface SubscriptionUser {
  affiliateId: string;
  userId: string;
  email: string;
  name: string | null;
  picture: string | null;
  totalPaid: number;
  subscriptionCount: number;
  firstPaymentDate: string;
  lastPaymentDate: string;
  createdAt: string;
}

interface SubscriptionUsersData {
  subscribers: SubscriptionUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function SubscriptionUsersPage() {
  const [data, setData] = useState<SubscriptionUsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchSubscribers();
  }, [page, search]);

  const fetchSubscribers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(search && { search }),
      });

      const res = await fetch(`${API_URL}/api/admin/subscription-users?${params}`, {
        credentials: 'include',
      });
      const responseData = await res.json();

      if (!res.ok) {
        setError(responseData.error || 'Failed to load subscription users');
        return;
      }

      setData(responseData);
    } catch (err) {
      console.error('Subscription users fetch error:', err);
      setError('Failed to load subscription users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-page">
        <Navbar />
        <main className="app-main">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="state-loading">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-b-transparent border-blue-600 dark:border-blue-400" />
              <p className="mt-3 text-sm">Loading subscription users...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-page">
        <Navbar />
        <main className="app-main">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="state-error mb-4">{error}</div>
            <button onClick={fetchSubscribers} className="btn-primary">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app-page">
        <Navbar />
        <main className="app-main">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="state-empty">
              <p className="text-base mb-2">No data available.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-page">
      <Navbar />
      <main className="app-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                Subscription Users
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                All affiliates who are paying platform subscription (₹999/month)
              </p>
            </div>
            <Link
              href="/admin/earnings"
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Earnings
            </Link>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
                className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="app-card app-card-padding">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Subscribers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{data.total}</p>
            </div>
            <div className="app-card app-card-padding">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Subscriptions</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {data.subscribers.reduce((sum, sub) => sum + sub.subscriptionCount, 0)}
              </p>
            </div>
            <div className="app-card app-card-padding">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{data.subscribers.reduce((sum, sub) => sum + sub.totalPaid, 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Subscribers Table */}
          {data.subscribers.length === 0 ? (
            <div className="app-card app-card-padding">
              <div className="state-empty">
                <p className="text-base mb-2">No subscription users found.</p>
                <p className="text-sm">Users will appear here once they start paying platform subscription.</p>
              </div>
            </div>
          ) : (
            <div className="app-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total Paid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Subscriptions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        First Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Last Payment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.subscribers.map((subscriber) => {
                      const displayName = subscriber.name || subscriber.email;

                      return (
                        <tr key={subscriber.affiliateId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar imageUrl={subscriber.picture} name={subscriber.name} email={subscriber.email} />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                                  {subscriber.name || 'No name'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{subscriber.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                              ₹{subscriber.totalPaid.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-gray-50">
                              {subscriber.subscriptionCount} payment{subscriber.subscriptionCount !== 1 ? 's' : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-gray-50">
                              {new Date(subscriber.firstPaymentDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(subscriber.firstPaymentDate).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-gray-50">
                              {new Date(subscriber.lastPaymentDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(subscriber.lastPaymentDate).toLocaleTimeString()}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing page {page} of {data.totalPages} (Total: {data.total} subscribers)
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={page === data.totalPages}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
