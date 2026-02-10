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
  purchaseId: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  commission: number;
  platformShare: number;
  saleDate: string;
  buyerEmail: string;
  buyerName: string | null;
}

interface EarningAffiliate {
  affiliateId: string;
  userId: string;
  email: string;
  name: string | null;
  picture: string | null;
  referralCode: string;
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  totalPlatformShare: number;
  saleCount: number;
  firstSaleDate: string;
  lastSaleDate: string;
  walletBalance: number;
  walletTotalEarned: number;
  walletTotalPaid: number;
  createdAt: string;
  purchases: Purchase[];
}

interface EarningAffiliatesData {
  affiliates: EarningAffiliate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  commissionRate: number;
  platformShareRate: number;
}

export default function EarningAffiliatesPage() {
  const [data, setData] = useState<EarningAffiliatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [expandedAffiliate, setExpandedAffiliate] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchAffiliates();
  }, [page, search]);

  const fetchAffiliates = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(search && { search }),
      });

      const res = await fetch(`${API_URL}/api/admin/earning-affiliates?${params}`, {
        credentials: 'include',
      });
      const responseData = await res.json();

      if (!res.ok) {
        setError(responseData.error || 'Failed to load earning affiliates');
        return;
      }

      setData(responseData);
    } catch (err) {
      console.error('Earning affiliates fetch error:', err);
      setError('Failed to load earning affiliates');
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
              <p className="mt-3 text-sm">Loading earning affiliates...</p>
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
            <button onClick={fetchAffiliates} className="btn-primary">
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
                Earning Affiliates
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                All affiliates who have earned commissions from sales
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Commission Rate: {(data.commissionRate * 100).toFixed(0)}% | Platform Share: {(data.platformShareRate * 100).toFixed(0)}%
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
                placeholder="Search by name, email, or referral code..."
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="app-card app-card-padding">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Affiliates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{data.total}</p>
            </div>
            <div className="app-card app-card-padding">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Sales</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {data.affiliates.reduce((sum, aff) => sum + aff.saleCount, 0)}
              </p>
            </div>
            <div className="app-card app-card-padding">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Commission</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ₹{data.affiliates.reduce((sum, aff) => sum + aff.totalCommission, 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Affiliates Table */}
          {data.affiliates.length === 0 ? (
            <div className="app-card app-card-padding">
              <div className="state-empty">
                <p className="text-base mb-2">No earning affiliates found.</p>
                <p className="text-sm">Affiliates will appear here once they make sales and earn commissions.</p>
              </div>
            </div>
          ) : (
            <div className="app-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Affiliate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Commission Earned
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Sales
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Wallet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.affiliates.map((affiliate) => {
                      const isExpanded = expandedAffiliate === affiliate.affiliateId;

                      return (
                        <>
                          <tr key={affiliate.affiliateId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Avatar imageUrl={affiliate.picture} name={affiliate.name} email={affiliate.email} />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                                    {affiliate.name || 'No name'}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{affiliate.email}</div>
                                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Code: {affiliate.referralCode}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                                ₹{affiliate.totalRevenue.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                ₹{affiliate.totalCommission.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {(data.commissionRate * 100).toFixed(0)}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-50">
                                {affiliate.saleCount} sale{affiliate.saleCount !== 1 ? 's' : ''}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                                ₹{affiliate.walletBalance.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Earned: ₹{affiliate.walletTotalEarned.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => setExpandedAffiliate(isExpanded ? null : affiliate.affiliateId)}
                                className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
                              >
                                {isExpanded ? 'Hide Sales' : 'View Sales'}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-3">
                                    Sales History ({affiliate.purchases.length} sale{affiliate.purchases.length !== 1 ? 's' : ''})
                                  </h4>
                                  <div className="space-y-2">
                                    {affiliate.purchases.map((purchase, idx) => (
                                      <div
                                        key={`${purchase.purchaseId}-${idx}`}
                                        className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600"
                                      >
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                                              {purchase.courseTitle}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                              Sold to: {purchase.buyerName || purchase.buyerEmail} ({purchase.buyerEmail})
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                              Date: {new Date(purchase.saleDate).toLocaleString()}
                                            </p>
                                          </div>
                                          <div className="text-right ml-4">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                                              ₹{purchase.amount.toFixed(2)}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                          <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Commission</p>
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
                    Showing page {page} of {data.totalPages} (Total: {data.total} affiliates)
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
