'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useTheme } from '@/contexts/ThemeContext';
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

// Chart colours. Recharts takes these as inline SVG props, which a `dark:`
// class can never override, so the palette is selected from the theme mode.
// The `light` values are byte-identical to what shipped before this existed.
// The `dark` series ramp is validated for the ink-900 chart surface: OKLCH
// lightness in-band, chroma >= 0.1, adjacent-pair CVD separation ΔE 23.7
// (deuteranopia) / 10.7 (tritanopia), and >= 3:1 contrast against the surface.
const CHART_COLORS = {
  light: {
    grid: '#e5e7eb',
    axis: '#6b7280',
    tick: '#6b7280',
    tooltipBg: '#ffffff',
    tooltipBorder: '#e5e7eb',
    tooltipText: '#111827',
    series: ['#3b82f6', '#10b981', '#8b5cf6'],
  },
  dark: {
    grid: '#26332D',        // ink-700 -- recessive
    axis: '#26332D',        // ink-700
    tick: '#8B9C95',        // ink-300 -- 6.2:1 on ink-900
    tooltipBg: '#1A2621',   // ink-800 -- lifted above the ink-900 card
    tooltipBorder: '#35443E', // ink-600
    tooltipText: '#E8EDEB', // ink-50
    series: ['#009463', '#8B5CF6', '#D97706'], // mint-700 / violet / amber
  },
} as const;

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { mode } = useTheme();
  const chart = CHART_COLORS[mode];
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
      <div className="min-h-screen bg-gray-50 dark:bg-ink-950 transition-colors">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-ink-950 transition-colors">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
            {error || 'Failed to load analytics'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-ink-950 transition-colors">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-ink-50">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-ink-300 mt-1">Platform performance and revenue insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-ink-700 rounded-md text-gray-900 dark:text-ink-50 bg-white dark:bg-ink-900 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="365d">Last year</option>
            </select>
            <Link
              href="/admin/earnings"
              className="px-4 py-2 bg-blue-600 dark:bg-mint-500 text-white dark:text-ink-950 rounded-md hover:bg-blue-700 dark:hover:bg-mint-400 transition-colors"
            >
              View Earnings
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-ink-900 rounded-lg shadow dark:shadow-black/40 p-6 transition-colors">
            <p className="text-sm text-gray-500 dark:text-ink-300 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-ink-50">
              ₹{analytics.summary.totalRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-ink-300 mt-1">
              {new Date(analytics.period.start).toLocaleDateString()} - {new Date(analytics.period.end).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-white dark:bg-ink-900 rounded-lg shadow dark:shadow-black/40 p-6 transition-colors">
            <p className="text-sm text-gray-500 dark:text-ink-300 mb-1">Total Sales</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-ink-50">{analytics.summary.totalSales}</p>
            <p className="text-xs text-gray-500 dark:text-ink-300 mt-1">
              Avg: ₹{analytics.summary.averageOrderValue.toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-ink-900 rounded-lg shadow dark:shadow-black/40 p-6 transition-colors">
            <p className="text-sm text-gray-500 dark:text-ink-300 mb-1">Direct Revenue</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              ₹{analytics.summary.directRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-ink-300 mt-1">
              {((analytics.summary.directRevenue / analytics.summary.totalRevenue) * 100).toFixed(1)}% of total
            </p>
          </div>
          <div className="bg-white dark:bg-ink-900 rounded-lg shadow dark:shadow-black/40 p-6 transition-colors">
            <p className="text-sm text-gray-500 dark:text-ink-300 mb-1">Affiliate Revenue</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-mint-400">
              ₹{analytics.summary.affiliateRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-ink-300 mt-1">
              {((analytics.summary.affiliateRevenue / analytics.summary.totalRevenue) * 100).toFixed(1)}% of total
            </p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-ink-900 rounded-lg shadow dark:shadow-black/40 p-6 mb-8 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-ink-50">Revenue Over Time</h2>
          {analytics.charts.revenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analytics.charts.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} className="dark:stroke-ink-800" />
                <XAxis
                  dataKey="date"
                  stroke={chart.axis}
                  className="dark:stroke-ink-300"
                  tick={{ fill: chart.tick }}
                  style={{ fill: chart.tick }}
                />
                <YAxis
                  stroke={chart.axis}
                  className="dark:stroke-ink-300"
                  tick={{ fill: chart.tick }}
                  style={{ fill: chart.tick }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chart.tooltipBg,
                    border: `1px solid ${chart.tooltipBorder}`,
                    borderRadius: '8px',
                    color: chart.tooltipText,
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={chart.series[0]}
                  strokeWidth={2}
                  name="Total Revenue"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="direct"
                  stroke={chart.series[1]}
                  strokeWidth={2}
                  name="Direct Revenue"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="affiliate"
                  stroke={chart.series[2]}
                  strokeWidth={2}
                  name="Affiliate Revenue"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-ink-300">
              <p>No revenue data available for this period</p>
            </div>
          )}
        </div>

        {/* User Growth Chart */}
        <div className="bg-white dark:bg-ink-900 rounded-lg shadow dark:shadow-black/40 p-6 mb-8 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-ink-50">User Growth</h2>
          {analytics.charts.userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.charts.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} className="dark:stroke-ink-800" />
                <XAxis
                  dataKey="date"
                  stroke={chart.axis}
                  className="dark:stroke-ink-300"
                  tick={{ fill: chart.tick }}
                  style={{ fill: chart.tick }}
                />
                <YAxis
                  stroke={chart.axis}
                  className="dark:stroke-ink-300"
                  tick={{ fill: chart.tick }}
                  style={{ fill: chart.tick }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chart.tooltipBg,
                    border: `1px solid ${chart.tooltipBorder}`,
                    borderRadius: '8px',
                    color: chart.tooltipText,
                  }}
                />
                <Bar dataKey="count" fill={chart.series[0]} name="New Users" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-ink-300">
              <p>No user growth data available for this period</p>
            </div>
          )}
        </div>

        {/* Top Courses and Top Affiliates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Courses */}
          <div className="bg-white dark:bg-ink-900 rounded-lg shadow dark:shadow-black/40 p-6 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-ink-50">Top Selling Courses</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-ink-800">
                <thead className="bg-gray-50 dark:bg-ink-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-ink-200 uppercase">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-ink-200 uppercase">
                      Sales
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-ink-200 uppercase">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-ink-900 divide-y divide-gray-200 dark:divide-ink-800">
                  {analytics.topCourses.map((course) => (
                    <tr key={course.courseId} className="hover:bg-gray-50 dark:hover:bg-ink-800 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-ink-50">{course.courseTitle}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-ink-300">{course.sales}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-ink-50">
                        ₹{course.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Affiliates */}
          <div className="bg-white dark:bg-ink-900 rounded-lg shadow dark:shadow-black/40 p-6 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-ink-50">Top Performing Affiliates</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-ink-800">
                <thead className="bg-gray-50 dark:bg-ink-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-ink-200 uppercase">
                      Affiliate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-ink-200 uppercase">
                      Sales
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-ink-200 uppercase">
                      Revenue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-ink-200 uppercase">
                      Commission
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-ink-900 divide-y divide-gray-200 dark:divide-ink-800">
                  {analytics.topAffiliates.map((affiliate) => (
                    <tr key={affiliate.affiliateId} className="hover:bg-gray-50 dark:hover:bg-ink-800 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-ink-50">{affiliate.affiliateName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-ink-300">{affiliate.sales}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-ink-300">
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
