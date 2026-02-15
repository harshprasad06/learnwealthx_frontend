'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface EarningsData {
  total: number;
  breakdown: {
    subscriptionEarnings: number;
    directPurchaseEarnings: number;
    affiliateSalesEarnings: number;
  };
  summary: {
    fromSubscriptions: number;
    fromDirectPurchases: number;
    fromAffiliateSales: number;
    total: number;
  };
  stats: {
    totalSubscriptions: number;
    totalDirectPurchases: number;
    totalAffiliateSales: number;
    totalAffiliateRevenue?: number;
    commissionRate: number;
    platformShareRate: number;
    totalGstCollected?: number;
    totalGatewayFees?: number;
    totalChargedToUsers?: number;
  };
}

export default function AdminEarningsPage() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/earnings`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load earnings');
        return;
      }

      setEarnings(data.earnings);
    } catch (err) {
      console.error('Earnings fetch error:', err);
      setError('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="state-loading">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-b-transparent border-blue-600 dark:border-blue-400" />
            <p className="mt-3 text-sm">Loading earnings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb 4">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!earnings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="state-empty">
            <p className="text-base mb-2">No earnings data available.</p>
            <p className="text-sm">Once you have purchases and subscriptions, data will appear here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              Platform Earnings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Total revenue, subscription income, and affiliate commission breakdown.
            </p>
          </div>
          <Link
            href="/admin/payouts"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            View Payouts
          </Link>
        </div>

        {/* Total Earnings Card */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 sm:p-8 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90 mb-2">Total Platform Earnings</p>
              <p className="text-4xl font-bold">₹{earnings.total.toFixed(2)}</p>
              <p className="text-sm opacity-75 mt-2">All-time revenue</p>
            </div>
            <svg
              className="w-16 h-16 opacity-75"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Subscription Earnings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/40 p-6 border-l-4 border-purple-500 dark:border-purple-400 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                Subscription Earnings
              </h3>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-300 mb-2">
              ₹{earnings.summary.fromSubscriptions.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {earnings.stats.totalSubscriptions} subscription{earnings.stats.totalSubscriptions !== 1 ? 's' : ''} collected
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Platform subscription fees (₹999/month)
            </p>
            <Link
              href="/admin/subscription-users"
              className="mt-4 inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              View All Subscribers
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Direct Purchase Earnings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/40 p-6 border-l-4 border-blue-500 dark:border-blue-400 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                Direct Purchase Earnings
              </h3>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-300 mb-2">
              ₹{earnings.summary.fromDirectPurchases.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {earnings.stats.totalDirectPurchases} direct purchase{earnings.stats.totalDirectPurchases !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              100% revenue (no affiliate commission)
            </p>
            <Link
              href="/admin/direct-purchase-users"
              className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              View All Buyers
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Affiliate Sales Earnings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/40 p-6 border-l-4 border-green-500 dark:border-green-400 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                Affiliate Sales Earnings
              </h3>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-300 mb-2">
              ₹{earnings.stats.totalAffiliateRevenue !== undefined && earnings.stats.totalAffiliateRevenue > 0 
                ? earnings.stats.totalAffiliateRevenue.toFixed(2) 
                : earnings.summary.fromAffiliateSales.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {earnings.stats.totalAffiliateSales} affiliate sale{earnings.stats.totalAffiliateSales !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Commission: {(earnings.stats.commissionRate * 100).toFixed(0)}%
            </p>
            <Link
              href="/admin/earning-affiliates"
              className="mt-4 inline-flex items-center text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
            >
              View Earning Affiliates
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Price Breakdown Stats */}
        {earnings.stats.totalGstCollected !== undefined && earnings.stats.totalGstCollected > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/40 p-6 mb-6 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">
              Price Breakdown Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Platform Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                  ₹{earnings.total.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Base course prices only
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  GST Collected
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ₹{earnings.stats.totalGstCollected.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  18% on base price
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Gateway Fees
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ₹{earnings.stats.totalGatewayFees?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  3.1% on (base + GST)
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Charged to Users
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ₹{earnings.stats.totalChargedToUsers?.toFixed(2) || '0.00'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Platform Revenue + GST + Gateway Fees
              </p>
            </div>
          </div>
        )}

        {/* Detailed Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/40 p-6 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">
            Earnings Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Revenue Sources
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Subscriptions</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-50">
                    ₹{earnings.summary.fromSubscriptions.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Direct Purchases</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-50">
                    ₹{earnings.summary.fromDirectPurchases.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    Affiliate Sales (Platform Share)
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-50">
                    ₹{earnings.summary.fromAffiliateSales.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                      Total Earnings
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-300">
                      ₹{earnings.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Transaction Counts
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Total Subscriptions</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-50">
                    {earnings.stats.totalSubscriptions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Direct Purchases</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-50">
                    {earnings.stats.totalDirectPurchases}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Affiliate Sales</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-50">
                    {earnings.stats.totalAffiliateSales}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Commission Rate</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-50">
                      {(earnings.stats.commissionRate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-700 dark:text-gray-300">Platform Share Rate</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-50">
                      {(earnings.stats.platformShareRate * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
