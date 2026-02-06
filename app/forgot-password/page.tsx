'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to request password reset');
        return;
      }
      setSuccess(
        data.message ||
          'If an account exists for this email, a password reset link has been sent.'
      );
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page">
      <Navbar />
      <main className="app-main">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="app-card app-card-padding space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
                Forgot Password
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Enter the email associated with your account. We’ll send you instructions to reset
                your password.
              </p>
            </div>

            {error && <div className="state-error">{error}</div>}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

