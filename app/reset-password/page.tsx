'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || 'Failed to reset password');
        return;
      }

      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="app-page">
        <Navbar />
        <main className="app-main">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="app-card app-card-padding space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
                  Invalid Reset Link
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  This password reset link is invalid or missing.
                </p>
              </div>
              <div className="state-error">
                Invalid reset link. Please request a new password reset.
              </div>
              <Link href="/forgot-password" className="btn-primary inline-block text-center">
                Request New Reset Link
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="app-page">
        <Navbar />
        <main className="app-main">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="app-card app-card-padding space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                  Password Reset Successful
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Your password has been reset successfully. You can now login with your new
                  password.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Redirecting to login page...
                </p>
              </div>
              <Link href="/login" className="btn-primary w-full text-center block">
                Go to Login
              </Link>
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
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="app-card app-card-padding space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
                Reset Password
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Enter your new password below.
              </p>
            </div>

            {error && <div className="state-error">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password <span className="text-gray-500">(min 6 characters)</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Confirm new password"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full btn-primary justify-center"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
