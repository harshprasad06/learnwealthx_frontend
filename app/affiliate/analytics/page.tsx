'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsData {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalRevenue: number;
    totalCommission: number;
    totalSales: number;
    totalSignups: number;
    conversionRate: number;
    averageOrderValue: number;
  };
  charts: {
    revenue: Array<{ date: string; revenue: number; commission: number; sales: number }>;
    signups: Array<{ date: string; count: number }>;
  };
  topCourses: Array<{
    courseId: string;
    courseTitle: string;
    sales: number;
    revenue: number;
    commission: number;
  }>;
  recentPurchases: Array<{
    id: string;
    amount: number;
    createdAt: string;
    courseTitle: string;
    buyerName: string | null;
    buyerEmail: string;
  }>;
  recentSignups: Array<{
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
  }>;
}

export default function AffiliateAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('30d');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/affiliate/analytics?period=${period}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        // Format dates for better display
        data.charts.revenue = data.charts.revenue.map((item: any) => ({
          ...item,
          date: formatDate(item.date),
        }));
        data.charts.signups = data.charts.signups.map((item: any) => ({
          ...item,
          date: formatDate(item.date),
        }));
        setAnalytics(data);
      } else {
        setError('Failed to load analytics');
      }
    } catch (err) {
      console.error('Analytics error:', err);
      setError('Failed to load analytics');
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
              <p className="mt-3 text-sm">Loading analytics...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="app-page">
        <Navbar />
        <main className="app-main">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="state-error mb-4">
              {error || 'Failed to load analytics'}
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Affiliate Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your performance and earnings</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="365d">Last year</option>
            </select>
            <Link href="/affiliate/dashboard" className="btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Commission</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              ₹{analytics.summary.totalCommission.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              From ₹{analytics.summary.totalRevenue.toFixed(2)} revenue
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Sales</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">{analytics.summary.totalSales}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Avg: ₹{analytics.summary.averageOrderValue.toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Signups</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{analytics.summary.totalSignups}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Conversion: {analytics.summary.conversionRate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {analytics.summary.conversionRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {analytics.summary.totalSales} sales / {analytics.summary.totalSignups} signups
            </p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 mb-8 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">Revenue & Commission Over Time</h2>
          {analytics.charts.revenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analytics.charts.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  className="dark:stroke-gray-400"
                  tick={{ fill: '#6b7280' }}
                  style={{ fill: '#6b7280' }}
                />
                <YAxis
                  stroke="#6b7280"
                  className="dark:stroke-gray-400"
                  tick={{ fill: '#6b7280' }}
                  style={{ fill: '#6b7280' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Total Revenue"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Commission Earned"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <p>No revenue data available for this period</p>
            </div>
          )}
        </div>

        {/* Signups Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 mb-8 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">Referral Signups Over Time</h2>
          {analytics.charts.signups.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.charts.signups}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  className="dark:stroke-gray-400"
                  tick={{ fill: '#6b7280' }}
                  style={{ fill: '#6b7280' }}
                />
                <YAxis
                  stroke="#6b7280"
                  className="dark:stroke-gray-400"
                  tick={{ fill: '#6b7280' }}
                  style={{ fill: '#6b7280' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827',
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" name="New Signups" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <p>No signup data available for this period</p>
            </div>
          )}
        </div>

        {/* Bottom two-column section: Top Courses + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Courses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">Top Performing Courses</h2>
            {analytics.topCourses.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No course sales yet for this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Course
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Sales
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Revenue
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Commission
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {analytics.topCourses.map((course) => (
                      <tr
                        key={course.courseId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-50">
                          {course.courseTitle}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {course.sales}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          ₹{course.revenue.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                          ₹{course.commission.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">Recent Referred Purchases</h2>
              {analytics.recentPurchases.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No purchases yet for this period.
                </p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {analytics.recentPurchases.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-2 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-50">
                          {p.courseTitle}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {p.buyerName || p.buyerEmail} •{' '}
                          {new Date(p.createdAt).toLocaleDateString()}{' '}
                          {new Date(p.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          ₹{p.amount.toFixed(2)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">Recent Referral Signups</h2>
              {analytics.recentSignups.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No new signups yet for this period.
                </p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {analytics.recentSignups.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-2 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-50">
                          {s.name || s.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {s.email}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(s.createdAt).toLocaleDateString()}{' '}
                        {new Date(s.createdAt).toLocaleTimeString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
