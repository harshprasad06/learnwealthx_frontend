'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import PricingDisplay from '@/components/PricingDisplay';
import { resolveAssetUrl } from '@/components/ThumbnailUploader';
import type { PublicBundle } from '@/app/bundles/types';
import {
  bundleDiscountPercent,
  bundleMrp,
  courseCountLabel,
  normaliseBundleList,
  readError,
} from '@/app/bundles/types';

/**
 * The catalogue.
 *
 * This route lists BUNDLES, not courses. A bundle is the parent product and the
 * only sellable unit; the courses inside it are children, shown on the bundle's
 * own page at `/bundles/[id]`. The route KEEPS its `/courses` path so that every
 * existing link, the Navbar entry, the sitemap and any affiliate material
 * already in the wild continue to resolve — `/courses/[id]` still serves the
 * individual course.
 *
 * The page shell, the search box and the sort control are the ones that were
 * here before; only what they list has changed.
 *
 * Raw `fetch` with `credentials: 'include'` and a locally declared API_URL,
 * matching every other screen in this app. `lib/api.ts` is not used anywhere and
 * is not used here either.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type SortKey = 'newest' | 'price_low' | 'price_high';

/** How many child course titles to preview on a card before collapsing. */
const COURSE_PEEK_LIMIT = 3;

export default function CataloguePage() {
  const [bundles, setBundles] = useState<PublicBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  /**
   * The search term that produced the list currently in `bundles`.
   *
   * Tracked separately from `search` so an empty result can tell the two empty
   * states apart: a catalogue with nothing in it is not the same event as a
   * search that matched nothing, and they need different words.
   */
  const [appliedSearch, setAppliedSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchAuthState = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(!!data.user);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setIsLoggedIn(false);
    }
  }, []);

  const fetchBundles = useCallback(async (term: string) => {
    setLoading(true);
    const trimmed = term.trim();
    try {
      const params = new URLSearchParams();
      if (trimmed) params.set('search', trimmed);
      const query = params.toString();
      const url = query ? `${API_URL}/api/bundles?${query}` : `${API_URL}/api/bundles`;

      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        setError(await readError(res, 'Could not load the catalogue'));
        return;
      }
      const body = await res.json().catch(() => null);
      setBundles(normaliseBundleList(body));
      setAppliedSearch(trimmed);
      setError('');
    } catch (error) {
      console.error('Error fetching bundles:', error);
      setError(
        'Could not reach the server to load the catalogue. Check your connection and retry.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAuthState();
  }, [fetchAuthState]);

  useEffect(() => {
    void fetchBundles('');
  }, [fetchBundles]);

  /**
   * Sorting is local.
   *
   * The previous version of this page re-fetched on every sort change and then
   * sorted the response in the browser anyway, so the request bought nothing.
   * Copied before sorting: Array.prototype.sort mutates, and mutating the state
   * array in a useMemo makes the order depend on the render count.
   */
  const visibleBundles = useMemo(() => {
    return [...bundles].sort((a, b) => {
      switch (sort) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [bundles, sort]);

  const runSearch = () => {
    void fetchBundles(search);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-ink-950 transition-colors">
      <Navbar />
      <main className="flex-1">
        <section className="py-8 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-ink-50">
                  Course Bundles
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-ink-300 max-w-xl">
                  Every bundle groups several courses and sells them as one. Open a bundle to see
                  exactly which courses it contains.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-mint-900/40 px-3 py-1 text-blue-700 dark:text-mint-300">
                    Lifetime access
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-mint-900/40 px-3 py-1 text-emerald-700 dark:text-mint-300">
                    Beginner friendly
                  </span>
                  <span className="inline-flex items-center rounded-full bg-purple-50 dark:bg-mint-900/40 px-3 py-1 text-purple-700 dark:text-mint-300">
                    Hands-on projects
                  </span>
                </div>
              </div>
              <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') runSearch();
                    }}
                    placeholder="Search bundles..."
                    aria-label="Search bundles"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-ink-700 rounded-md text-sm text-gray-900 dark:text-ink-50 bg-white dark:bg-ink-900 placeholder:text-gray-400 dark:placeholder:text-ink-400"
                  />
                </div>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  aria-label="Sort bundles"
                  className="px-3 py-2 border border-gray-300 dark:border-ink-700 rounded-md text-sm text-gray-900 dark:text-ink-50 bg-white dark:bg-ink-900"
                >
                  <option value="newest">Newest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
                <button onClick={runSearch} className="btn-primary">
                  Search
                </button>
              </div>
            </div>

            {error && (
              <div className="state-error mb-6" role="alert">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-b-transparent border-blue-600 dark:border-mint-400" />
                <p className="mt-4 text-gray-600 dark:text-ink-300 text-sm">Loading bundles...</p>
              </div>
            ) : visibleBundles.length === 0 && appliedSearch ? (
              /* Empty state 1: bundles may well exist, this SEARCH matched none.
                 Offers the way back. */
              <div className="text-center py-16">
                <p className="text-gray-700 dark:text-ink-200 text-base mb-2">
                  No bundle matches &ldquo;{appliedSearch}&rdquo;.
                </p>
                <p className="text-gray-500 dark:text-ink-300 text-sm">
                  Try a different search, or clear it to see the whole catalogue.
                </p>
                <button
                  onClick={() => {
                    setSearch('');
                    void fetchBundles('');
                  }}
                  className="btn-secondary mt-4"
                >
                  Clear search
                </button>
              </div>
            ) : visibleBundles.length === 0 ? (
              /* Empty state 2: the catalogue itself is empty. Deliberately NOT
                 phrased as a failure — nothing has gone wrong, there is simply
                 nothing on sale yet. A real failure renders the banner above. */
              <div className="text-center py-16">
                <p className="text-gray-700 dark:text-ink-200 text-base mb-2">
                  No bundles are on sale yet.
                </p>
                <p className="text-gray-500 dark:text-ink-300 text-sm">
                  New bundles appear here as soon as they are published. Check back soon.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleBundles.map((bundle) => {
                  const imageSrc = resolveAssetUrl(bundle.image, API_URL);
                  const peek = bundle.courses.slice(0, COURSE_PEEK_LIMIT);
                  const remaining = bundle.courses.length - peek.length;

                  return (
                    <Link
                      key={bundle.id}
                      href={`/bundles/${bundle.id}`}
                      className="group flex flex-col bg-white dark:bg-ink-900 rounded-xl shadow-md dark:shadow-black/40 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-blue-400 dark:from-mint-800 to-indigo-600 dark:to-mint-950 overflow-hidden">
                        {imageSrc ? (
                          /* eslint-disable-next-line @next/next/no-img-element --
                             the API host is not in next.config.js
                             images.remotePatterns, so next/image cannot load a
                             backend-proxied image. Matches every other screen. */
                          <img
                            src={imageSrc}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-16 h-16 text-white opacity-60"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-white dark:bg-ink-950/90 px-3 py-1 rounded-full text-xs font-medium text-gray-900 dark:text-ink-50">
                          {courseCountLabel(bundle.courseCount)}
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-ink-50 mb-1 group-hover:text-blue-600 dark:group-hover:text-mint-400 transition-colors">
                          {bundle.title}
                        </h2>
                        <p className="text-gray-600 dark:text-ink-300 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                          {bundle.description || 'No description available'}
                        </p>

                        {/* A peek at the children, so the card says what the
                            bundle actually contains without a second request. */}
                        {peek.length > 0 && (
                          <div className="mb-4 rounded-lg bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-ink-800 px-3 py-2">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-ink-300 mb-1">
                              Includes
                            </p>
                            <ul className="space-y-0.5">
                              {peek.map((course) => (
                                <li
                                  key={course.id}
                                  className="flex gap-1.5 text-xs text-gray-700 dark:text-ink-200"
                                >
                                  <span
                                    className="text-blue-600 dark:text-mint-400 shrink-0"
                                    aria-hidden="true"
                                  >
                                    •
                                  </span>
                                  <span className="line-clamp-1">{course.title}</span>
                                </li>
                              ))}
                            </ul>
                            {remaining > 0 && (
                              <p className="mt-1 text-xs text-gray-500 dark:text-ink-300">
                                +{remaining} more
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-200 dark:border-ink-800">
                          {/* The bundle carries no MRP of its own on the wire —
                              only `price`, the cached sum of its members. The
                              list price is therefore summed from the members'
                              own `mrp`, which is genuinely what the contents
                              cost separately; when the server sends no `mrp`,
                              `bundleMrp` equals `price` and no discount is
                              advertised at all. */}
                          <PricingDisplay
                            mrp={bundleMrp(bundle)}
                            actualPrice={bundle.price}
                            discountPercentage={bundleDiscountPercent(bundle)}
                            isLoggedIn={isLoggedIn}
                            size="md"
                          />
                          <span className="text-xs font-medium text-gray-500 dark:text-ink-300">
                            Lifetime access
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
