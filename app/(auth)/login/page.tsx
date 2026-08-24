'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GoogleSignIn from '@/components/GoogleSignIn';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/courses');
      router.refresh();
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 app-card app-card-padding">
        <div>
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-ink-50">
              Login
            </h2>
            <p className="mt-2 text-center text-gray-600 dark:text-ink-300">
              Sign in to your account
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && <div className="state-error">{error}</div>}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-ink-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-ink-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:border-mint-400 text-gray-900 dark:text-ink-50 bg-white dark:bg-ink-800 placeholder:text-gray-400 dark:placeholder:text-ink-400 transition-colors"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-ink-200">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-ink-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:border-mint-400 text-gray-900 dark:text-ink-50 bg-white dark:bg-ink-800 placeholder:text-gray-400 dark:placeholder:text-ink-400 transition-colors"
                placeholder="Enter your password"
              />
              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 dark:text-mint-400 hover:text-blue-500 dark:hover:text-mint-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-ink-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-ink-900 text-gray-500 dark:text-ink-300 transition-colors">Or continue with</span>
            </div>
          </div>

          <GoogleSignIn />

          <p className="text-center text-sm text-gray-600 dark:text-ink-300 mt-4">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-blue-600 dark:text-mint-400 hover:text-blue-500 dark:hover:text-mint-300 transition-colors"
            >
              Sign up
            </Link>
          </p>
          </form>
        </div>
      </div>
    </div>
  );
}
