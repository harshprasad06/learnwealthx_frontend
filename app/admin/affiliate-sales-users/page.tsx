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
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
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

interface Purchase {
  courseId: string;
  courseTitle: string;
  amount: number;
  purchaseDate: string;
  affiliateId: string;
  affiliateName: string;
  affiliateEmail: string;
  commission: number;
  platformShare: number;
}

interface AffiliateSalesUser {
  userId: string;
  email: string;
  name: string | null;
  picture: string | null;
  totalSpent: number;
  purchaseCount: number;
  platformEarnings: number;
  affiliateEarnings: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
  purchases: Purchase[];
  createdAt: string;
}

interface AffiliateSalesUsersData {
  buyers: AffiliateSalesUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  commissionRate: number;
  platformShareRate: number;
}

export default function AffiliateSalesUsersPage() {
  const [data, setData] = useState<AffiliateSalesUsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchBuyers();
  }, [page, search]);

  const fetchBuyers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(search && { search }),
      });

      const res = await fetch(`${API_URL}/api/admin/affiliate-sales-users?${params}`, {
        credentials: 'include',
      });
      const responseData = await res.json();

      if (!res.ok) {
        setError(responseData.error || 'Failed to load affiliate sales users');
        return;
      }

      setData(responseData);
    } catch (err) {
      console.error('Affiliate sales users fetch error:', err);
      setError('Failed to load affiliate sales users');
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
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-b-transparent border-green-600 dark:border-green-400" />
              <p className="mt-3 text-sm">Loading affiliate sales users...</p>
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
            <button onClick={fetchBuyers} className="btn-primary">
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
                Affiliate Sales Users
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                All users who made purchases through affiliate referrals
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Platform share: {(data.platformShareRate * 100).toFixed(0)}% | Commission: {(data.commissionRate * 100).toFixed(0)}%
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
                placeholder="Search by name, email, course title, or affiliate name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
                className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:border-green-400 transition-colors"
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="app-card app-card-padding">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Buyers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{data.total}</p>
            </div>
            <div className="app-card app-card-padding">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Purchases</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {data.buyers.reduce((sum, buyer) => sum + buyer.purchaseCount, 0)}
              </p>
            </div>
            <div className="app-card app-card-padding">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Platform Earnings</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{data.buyers.reduce((sum, buyer) => sum + buyer.platformEarnings, 0).toFixed(2)}
              </p>
            </div>
            <div className="app-card app-card-padding">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Affiliate Earnings</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ₹{data.buyers.reduce((sum, buyer) => sum + buyer.affiliateEarnings, 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Buyers Table */}
          {data.buyers.length === 0 ? (
            <div className="app-card app-card-padding">
              <div className="state-empty">
                <p className="text-base mb-2">No affiliate sales users found.</p>
                <p className="text-sm">Users will appear here once they make purchases through affiliate referrals.</p>
              </div>
            </div>
          ) : (
            <div className="app-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Buyer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Platform Share
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Affiliate Share
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Purchases
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.buyers.map((buyer) => {
                      const isExpanded = expandedUser === buyer.userId;

                      return (
                        <>
                          <tr key={buyer.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Avatar imageUrl={buyer.picture} name={buyer.name} email={buyer.email} />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                                    {buyer.name || 'No name'}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{buyer.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                                ₹{buyer.totalSpent.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                ₹{buyer.platformEarnings.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {(data.platformShareRate * 100).toFixed(0)}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                ₹{buyer.affiliateEarnings.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {(data.commissionRate * 100).toFixed(0)}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-50">
                                {buyer.purchaseCount} purchase{buyer.purchaseCount !== 1 ? 's' : ''}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => setExpandedUser(isExpanded ? null : buyer.userId)}
                                className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
                              >
                                {isExpanded ? 'Hide Details' : 'View Details'}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-3">
                                    Purchase History ({buyer.purchases.length} course{buyer.purchases.length !== 1 ? 's' : ''})
                                  </h4>
                                  <div className="space-y-2">
                                    {buyer.purchases.map((purchase, idx) => (
                                      <div
                                        key={`${purchase.courseId}-${idx}`}
                                        className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600"
                                      >
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                                              {purchase.courseTitle}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                              Purchased: {new Date(purchase.purchaseDate).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                              Referred by: <span className="font-medium">{purchase.affiliateName}</span> ({purchase.affiliateEmail})
                                            </p>
                                          </div>
                                          <div className="text-right ml-4">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                                              ₹{purchase.amount.toFixed(2)}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                          <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Platform Share</p>
                                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                              ₹{purchase.platformShare.toFixed(2)} ({(data.platformShareRate * 100).toFixed(0)}%)
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Affiliate Commission</p>
                                            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                              ₹{purchase.commission.toFixed(2)} ({(data.commissionRate * 100).toFixed(0)}%)
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing page {page} of {data.totalPages} (Total: {data.total} buyers)
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
