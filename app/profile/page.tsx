'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  dob: string | null;
  provider: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load profile');
        return;
      }
      setUser(data.user);
      setForm((prev) => ({
        ...prev,
        name: data.user.name || '',
      }));
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name || undefined,
          currentPassword: form.currentPassword || undefined,
          newPassword: form.newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update profile');
        return;
      }
      setSuccess(data.message || 'Profile updated successfully');
      if (data.user) {
        setUser(data.user);
      }
      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="app-page">
        <Navbar />
        <main className="app-main">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="state-loading">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-b-transparent border-blue-600 dark:border-blue-400" />
              <p className="mt-3 text-sm">Loading profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-page">
        <Navbar />
        <main className="app-main">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="state-empty">
              <p className="text-base mb-2">Profile not available.</p>
              <p className="text-sm">Please log in again to view your profile.</p>
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            My Profile
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            View and update your account details. For Google accounts, password changes are managed
            via Google.
          </p>

          <div className="app-card app-card-padding space-y-6">
            {error && <div className="state-error">{error}</div>}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/40 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Type
                </label>
                <input
                  type="text"
                  value={user.provider === 'google' ? 'Google Sign-in' : 'Email & Password'}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/40 cursor-not-allowed"
                />
              </div>

              {/* Password change (email/password accounts only) */}
              {user.provider !== 'google' && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2 space-y-4">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                    Change Password
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={form.currentPassword}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-800"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={form.newPassword}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, newPassword: e.target.value }))
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-800"
                        placeholder="At least 6 characters"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    If you forget your password, use the &quot;Forgot password?&quot; link on the
                    login page.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

