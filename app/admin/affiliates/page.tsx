'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Affiliate {
  id: string;
  referralCode: string;
  isActive: boolean;
  kycStatus: string;
  totalClicks: number;
  totalSignups: number;
  totalEarnings: number;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    picture: string | null;
    provider: string | null;
    createdAt: string;
  };
  wallet: {
    balance: number;
    totalEarned: number;
    totalPaid: number;
  } | null;
  kyc: {
    status: string;
    submittedAt: string;
    reviewedAt: string | null;
  } | null;
  _count: {
    referrals: number;
    purchases: number;
  };
}

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    kycStatus: 'all',
    isActive: 'all',
    search: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchAffiliates();
  }, [page, filters]);

  const fetchAffiliates = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(filters.kycStatus !== 'all' && { kycStatus: filters.kycStatus }),
        ...(filters.isActive !== 'all' && { isActive: filters.isActive }),
        ...(filters.search && { search: filters.search }),
      });

      const res = await fetch(`${API_URL}/api/admin/affiliates?${params}`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load affiliates');
        return;
      }

      setAffiliates(data.affiliates || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Affiliates fetch error:', err);
      setError('Failed to load affiliates');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (affiliateId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    if (!confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this affiliate?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/affiliates/toggle-active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ affiliateId, isActive: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to update status');
        return;
      }

      alert(`Affiliate ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchAffiliates();
    } catch (err) {
      console.error('Toggle active error:', err);
      alert('Failed to update status');
    }
  };

  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (imageId: string) => {
    setLoadedImages((prev) => new Set(prev).add(imageId));
  };

  const handleImageError = (imageId: string) => {
    setFailedImages((prev) => new Set(prev).add(imageId));
  };

  const renderAvatar = (picture: string | null, name: string | null, email: string, imageId: string) => {
    const displayName = name || email;
    const initial = displayName.charAt(0).toUpperCase();
    const hasPicture = !!picture;
    const imageLoaded = loadedImages.has(imageId);
    const imageFailed = failedImages.has(imageId);
    const showImage = hasPicture && imageLoaded && !imageFailed;

    return (
      <div className="relative w-10 h-10 rounded-full overflow-hidden">
        {/* Fallback - Always visible initially, hidden when image loads successfully */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm transition-opacity duration-200 ${
            showImage ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {initial}
        </div>
        {/* Image - Only shown if picture exists and loaded successfully */}
        {hasPicture && !imageFailed && (
          <img
            src={picture}
            alt={name || email}
            className={`absolute inset-0 w-full h-full object-cover rounded-full transition-opacity duration-200 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => handleImageLoad(imageId)}
            onError={() => handleImageError(imageId)}
            loading="lazy"
          />
        )}
      </div>
    );
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Affiliates Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all affiliate users and their status</p>
          </div>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View Users
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 mb-6 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                KYC Status
              </label>
              <select
                value={filters.kycStatus}
                onChange={(e) => {
                  setFilters({ ...filters, kycStatus: e.target.value });
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Active Status
              </label>
              <select
                value={filters.isActive}
                onChange={(e) => {
                  setFilters({ ...filters, isActive: e.target.value });
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 transition-colors"
              >
                <option value="all">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search (Email/Name/Code)
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setPage(1);
                }}
                placeholder="Search affiliates..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4 transition-colors">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading affiliates...</div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-hidden transition-colors">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Affiliate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Referral Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Wallet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        KYC Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {affiliates.map((affiliate) => (
                      <tr key={affiliate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {renderAvatar(
                              affiliate.user.picture,
                              affiliate.user.name,
                              affiliate.user.email,
                              `affiliate-${affiliate.id}`
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                                {affiliate.user.name || 'No name'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{affiliate.user.email}</p>
                              {affiliate.user.provider && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  via {affiliate.user.provider === 'google' ? 'Google' : affiliate.user.provider}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-gray-50">
                            {affiliate.referralCode}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div>
                            <p className="text-gray-900 dark:text-gray-50">
                              <span className="font-semibold">{affiliate.totalClicks}</span> clicks
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">{affiliate.totalSignups}</span> signups
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">{affiliate._count.referrals}</span> referrals
                            </p>
                            <p className="text-green-600 dark:text-green-400 font-semibold">
                              ₹
                              {(
                                affiliate.wallet?.totalEarned ??
                                affiliate.totalEarnings
                              ).toFixed(2)}{' '}
                              lifetime earnings
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {affiliate.wallet ? (
                            <div>
                              <p className="text-gray-900 dark:text-gray-50">
                                Balance: <span className="font-semibold">₹{affiliate.wallet.balance.toFixed(2)}</span>
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                Total: ₹{affiliate.wallet.totalEarned.toFixed(2)}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                Paid: ₹{affiliate.wallet.totalPaid.toFixed(2)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">No wallet</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getKycStatusColor(
                              affiliate.kycStatus
                            )}`}
                          >
                            {affiliate.kycStatus}
                          </span>
                          {affiliate.kyc && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {affiliate.kyc.reviewedAt
                                ? `Reviewed: ${new Date(affiliate.kyc.reviewedAt).toLocaleDateString()}`
                                : `Submitted: ${new Date(affiliate.kyc.submittedAt).toLocaleDateString()}`}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              affiliate.isActive
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {affiliate.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(affiliate.id, affiliate.isActive)}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${
                              affiliate.isActive
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                            }`}
                          >
                            {affiliate.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing page {page} of {totalPages} (Total: {total} affiliates)
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
