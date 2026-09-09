'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * The memberships on the home page — a three-tier pricing ladder.
 *
 * A BUNDLE is the only thing anyone can buy here; courses are its children and
 * are not sold separately. So the home page sells bundles.
 *
 * THREE CARDS, ALWAYS. A pricing table is read by comparison, and comparison
 * falls apart the moment the row wraps — four bundles wrapped to a second row
 * with one lonely card under three. The cheapest three are shown and the rest
 * live on /courses, which the footer link points at.
 *
 * The MIDDLE card is the emphasised one: larger, lifted, ringed, and badged. In
 * a three-tier ladder the middle tier is the one most people should land on, so
 * it is the one the layout argues for.
 *
 * Image-free by design. A membership is a set of courses and a price; a cover
 * photo says nothing about either, and it means a bundle with no image uploaded
 * still looks finished.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/** A pricing table stops being comparable once it wraps. */
const MAX_TIERS = 3;

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

/**
 * `₹2,999` — whole rupees, the way a price is quoted. Paise are shown only when
 * a bundle actually has them, so a ₹798.50 tier is never silently rounded to
 * ₹798 on the page a customer decides from.
 */
function formatPrice(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  const hasPaise = Math.round(safe * 100) % 100 !== 0;
  return `₹${safe.toLocaleString('en-IN', {
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: hasPaise ? 2 : 0,
  })}`;
}

function CheckIcon({ highlighted }: { highlighted: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
        highlighted
          ? 'bg-blue-600 text-white dark:bg-mint-500 dark:text-ink-950'
          : 'bg-blue-50 text-blue-600 dark:bg-mint-500/15 dark:text-mint-400'
      }`}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path
          fillRule="evenodd"
          d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

export default function BundleShowcase() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [totalCount, setTotalCount] = useState(0);
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

      // Cheapest first. `?? 0` not `|| 0`, so a genuinely free bundle sorts as
      // free rather than being treated as missing data.
      const ordered = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      setTotalCount(ordered.length);
      setBundles(ordered.slice(0, MAX_TIERS));
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

  // Only claim a "most popular" tier when there is a genuine middle to point at.
  const featuredIndex = bundles.length === MAX_TIERS ? 1 : -1;

  return (
    <section className="relative py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-bg radial-fade opacity-70"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-blue-700 dark:bg-mint-500/15 dark:text-mint-300">
            Memberships
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-ink-50 text-balance">
            Choose your <span className="gradient-text">learning path</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-ink-300">
            One payment. Lifetime access to every course inside. Start at the level that fits you.
          </p>
        </div>

        {loading ? (
          <div className="state-loading mt-14">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-b-transparent border-blue-600 dark:border-mint-400" />
            <p className="mt-3 text-sm">Loading memberships…</p>
          </div>
        ) : error ? (
          <div className="mt-14 max-w-md mx-auto">
            <div className="state-error">{error}</div>
          </div>
        ) : bundles.length === 0 ? (
          <div className="mt-14 max-w-md mx-auto text-center">
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
          <>
            {/* `items-center` is what lets the middle card stand taller than its
                neighbours instead of stretching them to match it. */}
            <ul className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-5 items-center list-none p-0">
              {bundles.map((bundle, index) => {
                const featured = index === featuredIndex;
                const courses = bundle.courses ?? [];

                return (
                  <li key={bundle.id} className="flex">
                    <div
                      className={`relative flex w-full flex-col rounded-3xl transition-shadow ${
                        featured
                          ? // Larger, lifted and ringed. The scale is applied only
                            // from `md` up, where the three sit side by side — on a
                            // stacked mobile layout a scaled card just overflows.
                            'glass-strong p-7 sm:p-8 md:scale-105 md:z-10 ring-1 ring-blue-500/40 dark:ring-mint-400/40 shadow-xl shadow-blue-500/10 dark:shadow-mint-500/20'
                          : 'glass p-6 sm:p-7'
                      }`}
                    >
                      {featured && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-blue-600 dark:bg-mint-500 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white dark:text-ink-950 whitespace-nowrap">
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-3 w-3"
                          >
                            <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                          </svg>
                          Most popular
                        </span>
                      )}

                      <h3
                        className={`font-display font-bold text-gray-900 dark:text-ink-50 ${
                          featured ? 'text-2xl mt-2' : 'text-xl'
                        }`}
                      >
                        {bundle.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-ink-300">
                        {bundle.courseCount}{' '}
                        {bundle.courseCount === 1 ? 'course' : 'courses'} included
                      </p>

                      <div className="mt-5 flex items-baseline gap-1.5 flex-wrap">
                        <span
                          className={`font-display font-bold tracking-tight text-gray-900 dark:text-ink-50 tabular-nums ${
                            featured ? 'text-5xl' : 'text-4xl'
                          }`}
                        >
                          {formatPrice(bundle.price)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-ink-300">/one-time</span>
                      </div>

                      {courses.length > 0 && (
                        <ul className="mt-6 space-y-3 flex-1 list-none p-0">
                          {courses.map((course) => (
                            <li key={course.id} className="flex items-start gap-3">
                              <CheckIcon highlighted={featured} />
                              <span className="text-sm text-gray-700 dark:text-ink-200">
                                {course.title}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <Link
                        href={`/bundles/${bundle.id}`}
                        className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-mint-500 dark:focus-visible:ring-offset-ink-950 ${
                          featured
                            ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-mint-500 dark:text-ink-950 dark:hover:bg-mint-400'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-ink-800 dark:text-ink-50 dark:hover:bg-ink-700'
                        }`}
                      >
                        View membership
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Deliberately NOT the reference's "7-day money-back guarantee":
                /refund states that all sales are final, so that line would be a
                promise this business does not make. */}
            <p className="mt-10 text-center text-xs text-gray-500 dark:text-ink-300">
              Secure checkout · Instant access · Lifetime access to every course inside
            </p>

            {totalCount > MAX_TIERS && (
              <p className="mt-3 text-center text-sm">
                <Link
                  href="/courses"
                  className="font-medium text-blue-600 hover:text-blue-700 dark:text-mint-400 dark:hover:text-mint-300"
                >
                  See all {totalCount} memberships →
                </Link>
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
