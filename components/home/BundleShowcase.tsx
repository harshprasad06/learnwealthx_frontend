'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * The memberships on the home page.
 *
 * A BUNDLE is the only thing anyone can buy on this platform — courses are its
 * children and are not sold separately — so the home page sells bundles.
 *
 * Deliberately IMAGE-FREE. A membership is a set of courses and a price, and a
 * cover photo says nothing about either; the reference landing prices its tiers
 * with type alone, which also means a bundle with no image uploaded looks
 * finished rather than broken.
 *
 * Ordered CHEAPEST FIRST. The API returns newest-first, so the sort happens
 * here — a visitor reading left to right should be walking up a price ladder,
 * not through creation order.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface BundleCourse {
  id: string;
  title: string;
  price: number;
}

interface Bundle {
  id: string;
  title: string;
  description: string | null;
  price: number;
  courseCount: number;
  courses: BundleCourse[];
}

/** `₹3,797.00` — Indian grouping, two decimals, matching the rest of the app. */
function formatRupees(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `₹${safe.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** The saving against the summed list price, when there is one worth showing. */
function discountPercent(price: number, listPrice: number): number {
  if (!Number.isFinite(price) || !Number.isFinite(listPrice) || listPrice <= price) return 0;
  return Math.round(((listPrice - price) / listPrice) * 100);
}

export default function BundleShowcase() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBundles = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/bundles`, { credentials: 'include' });
      if (!res.ok) {
        setError('Could not load the memberships just now.');
        return;
      }
      const body = await res.json().catch(() => null);
      const list: Bundle[] = Array.isArray(body?.bundles) ? body.bundles : [];

      // Cheapest first. `?? 0` rather than `|| 0` so a genuinely free bundle
      // sorts as free instead of being treated as missing data.
      const ordered = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      setBundles(ordered);
      setError('');
    } catch {
      setError('Could not reach the server to load the memberships.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  return (
    <section className="relative py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-bg radial-fade opacity-70"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-mint-400">
            Memberships
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-ink-50 text-balance">
            Pick the level that <span className="gradient-text">fits you</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-ink-300">
            One payment, lifetime access to every course inside. Start where you are and move up
            when you are ready.
          </p>
        </div>

        {loading ? (
          <div className="state-loading mt-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-b-transparent border-blue-600 dark:border-mint-400" />
            <p className="mt-3 text-sm">Loading memberships…</p>
          </div>
        ) : error ? (
          <div className="mt-12 max-w-md mx-auto">
            <div className="state-error">{error}</div>
          </div>
        ) : bundles.length === 0 ? (
          <div className="mt-12 max-w-md mx-auto text-center">
            <div className="glass rounded-2xl px-6 py-10">
              <p className="text-sm font-medium text-gray-900 dark:text-ink-50">
                Memberships are on the way
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-ink-300">
                We are putting the first ones together. Browse the catalogue to see what is
                being built.
              </p>
              <Link href="/courses" className="btn-secondary mt-5 inline-flex">
                Browse the catalogue
              </Link>
            </div>
          </div>
        ) : (
          // Three across on desktop, two on tablet, one on mobile. `gap` rather
          // than per-card margins so the rows cannot collapse unevenly.
          <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0">
            {bundles.map((bundle) => {
              const listPrice = (bundle.courses ?? []).reduce(
                (sum, course) => sum + (course.price ?? 0),
                0
              );
              const saving = discountPercent(bundle.price, listPrice);
              const courses = bundle.courses ?? [];

              return (
                <li key={bundle.id} className="flex">
                  <div className="glass rounded-2xl p-6 flex flex-col w-full">
                    <h3 className="font-display text-lg font-bold text-gray-900 dark:text-ink-50">
                      {bundle.title}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-blue-600 dark:text-mint-400">
                      {bundle.courseCount} {bundle.courseCount === 1 ? 'course' : 'courses'} included
                    </p>

                    <div className="mt-4 flex items-baseline gap-2 flex-wrap">
                      <span className="font-display text-3xl font-bold text-gray-900 dark:text-ink-50 tabular-nums">
                        {formatRupees(bundle.price)}
                      </span>
                      {saving > 0 && (
                        <>
                          <span className="text-sm text-gray-500 dark:text-ink-300 line-through tabular-nums">
                            {formatRupees(listPrice)}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-950/50 px-2 py-0.5 text-xs font-semibold text-green-700 dark:text-green-300">
                            Save {saving}%
                          </span>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-ink-300">
                      One payment · lifetime access
                    </p>

                    {courses.length > 0 && (
                      <ul className="mt-5 space-y-2 flex-1 list-none p-0">
                        {courses.map((course) => (
                          <li key={course.id} className="flex items-start gap-2">
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-mint-400"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm text-gray-700 dark:text-ink-200">
                              {course.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <Link
                      href={`/bundles/${bundle.id}`}
                      className="btn-primary mt-6 w-full justify-center"
                    >
                      View membership
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
