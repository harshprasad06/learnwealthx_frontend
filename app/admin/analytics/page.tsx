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
    directRevenue: number;
    affiliateRevenue: number;
    totalSales: number;
    totalUsers: number;
    averageOrderValue: number;
  };
  charts: {
    revenue: Array<{ date: string; total: number; direct: number; affiliate: number }>;
    userGrowth: Array<{ date: string; count: number }>;
  };
  topCourses: Array<{
    courseId: string;
    courseTitle: string;
    sales: number;
    revenue: number;
  }>;
  topAffiliates: Array<{
    affiliateId: string;
    affiliateName: string;
    sales: number;
    revenue: number;
    commission: number;
  }>;
}

export default function AdminAnalyticsPage() {
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
      const res = await fetch(`${API_URL}/api/admin/analytics?period=${period}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        // Format dates for better display
        data.charts.revenue = data.charts.revenue.map((item: any) => ({
          ...item,
          date: formatDate(item.date),
        }));
        data.charts.userGrowth = data.charts.userGrowth.map((item: any) => ({
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
            {error || 'Failed to load analytics'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Platform performance and revenue insights</p>
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
            <Link
              href="/admin/earnings"
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              View Earnings
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              ₹{analytics.summary.totalRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(analytics.period.start).toLocaleDateString()} - {new Date(analytics.period.end).toLocaleDateString()}
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
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Direct Revenue</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              ₹{analytics.summary.directRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {((analytics.summary.directRevenue / analytics.summary.totalRevenue) * 100).toFixed(1)}% of total
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Affiliate Revenue</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              ₹{analytics.summary.affiliateRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {((analytics.summary.affiliateRevenue / analytics.summary.totalRevenue) * 100).toFixed(1)}% of total
            </p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 mb-8 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">Revenue Over Time</h2>
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
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Total Revenue"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="direct"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Direct Revenue"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="affiliate"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Affiliate Revenue"
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

        {/* User Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 mb-8 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">User Growth</h2>
          {analytics.charts.userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.charts.userGrowth}>
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
                <Bar dataKey="count" fill="#3b82f6" name="New Users" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <p>No user growth data available for this period</p>
            </div>
          )}
        </div>

        {/* Top Courses and Top Affiliates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Courses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">Top Selling Courses</h2>
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
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {analytics.topCourses.map((course) => (
                    <tr key={course.courseId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-50">{course.courseTitle}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{course.sales}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
                        ₹{course.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Affiliates */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">Top Performing Affiliates</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Affiliate
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
                  {analytics.topAffiliates.map((affiliate) => (
                    <tr key={affiliate.affiliateId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-50">{affiliate.affiliateName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{affiliate.sales}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        ₹{affiliate.revenue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                        ₹{affiliate.commission.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
