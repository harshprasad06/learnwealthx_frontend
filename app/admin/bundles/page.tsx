'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import { resolveAssetUrl } from '@/components/ThumbnailUploader';
import BundleForm from './BundleForm';
import type { AdminCourse, Bundle } from './types';
import { formatRate, formatRupees, readError } from './types';

/**
 * Admin bundle management.
 *
 * Raw `fetch` with `credentials: 'include'` and a locally declared API_URL,
 * matching the 34 other files in this app. `lib/api.ts` is not used anywhere and
 * is not used here either: its wrapper resolves to a body and discards the HTTP
 * status, which would make the 409-on-delete and 400-on-activate cases — the two
 * failures this screen exists to explain — indistinguishable from success.
 *
 * There is no client-side role gate, because this app has none: no middleware.ts
 * and no auth context. The admin endpoints are ADMIN-gated server side, so a
 * non-admin gets a 401/403 and this page says so in plain words rather than
 * bouncing them somewhere with no explanation.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type SortKey = 'newest' | 'title' | 'price-desc' | 'courses-desc';

const SORT_LABELS: Record<SortKey, string> = {
  newest: 'Newest first',
  title: 'Name (A–Z)',
  'price-desc': 'Price (high to low)',
  'courses-desc': 'Most courses',
};

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState('');
  const [coursesError, setCoursesError] = useState('');
  const [notice, setNotice] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('newest');

  const fetchBundles = useCallback(async () => {
    try {
      // Fetched unfiltered on purpose. The API does support `?search=`, but the
      // admin list is small and searching a local array keeps typing instant and
      // avoids a request per keystroke.
      const res = await fetch(`${API_URL}/api/bundles`, { credentials: 'include' });
      if (!res.ok) {
        setError(await readError(res, 'Could not load bundles'));
        return;
      }
      const data = await res.json();
      setBundles(Array.isArray(data?.bundles) ? data.bundles : []);
      setError('');
    } catch {
      setError('Could not reach the server to load bundles. Check your connection and retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses`, { credentials: 'include' });
      if (!res.ok) {
        setCoursesError(await readError(res, 'Could not load courses'));
        return;
      }
      const data = await res.json();
      setCourses(Array.isArray(data?.courses) ? data.courses : []);
      setCoursesError('');
    } catch {
      setCoursesError('Could not reach the server to load courses.');
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBundles();
    fetchCourses();
  }, [fetchBundles, fetchCourses]);

  // ── client-side search + sort ────────────────────────────────────────────

  const visibleBundles = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const matched = needle
      ? bundles.filter(
          (bundle) =>
            bundle.title.toLowerCase().includes(needle) ||
            (bundle.description ?? '').toLowerCase().includes(needle)
        )
      : bundles;

    // Copied before sorting: Array.prototype.sort mutates, and mutating the
    // state array in a useMemo makes the list order depend on render count.
    return [...matched].sort((a, b) => {
      switch (sortKey) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'price-desc':
          return b.price - a.price;
        case 'courses-desc':
          return b.courseCount - a.courseCount;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [bundles, search, sortKey]);

  // ── row actions ──────────────────────────────────────────────────────────

  const handleSetStatus = async (bundle: Bundle, nextActive: boolean) => {
    setError('');
    setNotice('');
    setBusyId(bundle.id);
    try {
      // An EXPLICIT desired state, never a toggle. A double click or a retried
      // request then re-asserts the same state instead of flipping a live
      // product back off — the endpoint is idempotent for exactly this reason.
      const res = await fetch(`${API_URL}/api/bundles/${bundle.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: nextActive }),
      });

      if (!res.ok) {
        // The 400 here is the useful one: too few courses, or a member that is
        // still a draft. Wave 5 names the offending courses in `message`.
        setError(await readError(res, `Could not ${nextActive ? 'activate' : 'deactivate'} the bundle`));
        return;
      }

      const data = await res.json();
      if (data?.changed === false) {
        setNotice(`"${bundle.title}" was already ${nextActive ? 'active' : 'inactive'} — nothing changed.`);
      }
      await fetchBundles();
    } catch {
      setError('Could not reach the server. The bundle has not been changed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (bundle: Bundle) => {
    if (
      !window.confirm(
        `Delete "${bundle.title}"? This removes the bundle permanently. Buyers keep access to the courses they already own.`
      )
    ) {
      return;
    }

    setError('');
    setNotice('');
    setBusyId(bundle.id);
    try {
      const res = await fetch(`${API_URL}/api/bundles/${bundle.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        // 409 = purchases reference it. The backend's message already says to
        // deactivate instead and why, so it is shown as written.
        setError(await readError(res, 'Could not delete the bundle'));
        return;
      }

      if (editingBundle?.id === bundle.id) {
        setShowForm(false);
        setEditingBundle(null);
      }
      await fetchBundles();
    } catch {
      setError('Could not reach the server. The bundle has not been deleted.');
    } finally {
      setBusyId(null);
    }
  };

  const openCreateForm = () => {
    setEditingBundle(null);
    setShowForm(true);
    setError('');
    setNotice('');
  };

  const openEditForm = (bundle: Bundle) => {
    setEditingBundle(bundle);
    setShowForm(true);
    setError('');
    setNotice('');
  };

  const handleSaved = async (warning?: string) => {
    setShowForm(false);
    setEditingBundle(null);
    setNotice(warning ?? '');
    await fetchBundles();
  };

  // ── shared row pieces ────────────────────────────────────────────────────

  const statusPill = (bundle: Bundle) => (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        bundle.isActive
          ? // Success stays on the yellower `green` hue rather than the mint
            // brand accent, so "this is live" never reads as chrome.
            'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-900/60'
          : 'bg-gray-100 dark:bg-ink-800 text-gray-700 dark:text-ink-100 border border-gray-200 dark:border-ink-700'
      }`}
    >
      {bundle.isActive ? 'Active' : 'Inactive'}
    </span>
  );

  /**
   * Active but not buyable — a member course was unpublished after the bundle
   * went live. The backend deliberately does NOT auto-deactivate in that case
   * (editing a course must not silently retire a product) but it does drop the
   * bundle out of the public listing, so without this the admin would see a
   * healthy "Active" pill on something no customer can find.
   */
  const notPurchasableHint = (bundle: Bundle) =>
    bundle.isActive && !bundle.isPurchasable ? (
      <span className="mt-1 block text-xs text-amber-700 dark:text-amber-300">
        Not purchasable
        {bundle.unpublishedCourseIds && bundle.unpublishedCourseIds.length > 0
          ? `: ${bundle.unpublishedCourseIds.length} member course${
              bundle.unpublishedCourseIds.length === 1 ? ' is' : 's are'
            } unpublished`
          : ''}
      </span>
    ) : null;

  const commissionCell = (bundle: Bundle) =>
    bundle.commissionRate == null ? (
      // Muted italic: this bundle has no rate of its own and inherits whatever
      // the platform default is at purchase time. Rendering "0%" here would be
      // a different and much more expensive claim.
      <span className="italic text-gray-500 dark:text-ink-300">Default</span>
    ) : (
      <span className="text-gray-900 dark:text-ink-50 tabular-nums">
        {formatRate(bundle.commissionRate)}
      </span>
    );

  const cover = (bundle: Bundle, className: string) => {
    const src = resolveAssetUrl(bundle.image, API_URL);
    return src ? (
      /* eslint-disable-next-line @next/next/no-img-element -- the API host is
         not in next.config.js images.remotePatterns, so next/image cannot load
         a backend-proxied thumbnail. Matches every other admin screen. */
      <img
        src={src}
        alt=""
        className={`${className} object-cover rounded-md border border-gray-200 dark:border-ink-700 bg-gray-100 dark:bg-ink-800`}
        onError={(event) => {
          (event.target as HTMLImageElement).style.visibility = 'hidden';
        }}
      />
    ) : (
      /* ink-900 rather than ink-800 behind the ink-400 icon: ink-400 on ink-800
         measures 4.28:1, and while a decorative glyph only needs 3:1 there is no
         reason to sit on the one pair this theme is known to fail. */
      <div
        className={`${className} rounded-md border border-dashed border-gray-300 dark:border-ink-700 bg-gray-50 dark:bg-ink-900 flex items-center justify-center text-gray-400 dark:text-ink-400`}
        aria-hidden="true"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
    );
  };

  const rowActions = (bundle: Bundle) => (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleSetStatus(bundle, !bundle.isActive)}
        disabled={busyId === bundle.id}
        className={`inline-flex items-center px-3 py-1.5 rounded-md border text-xs font-medium transition-colors disabled:opacity-60 ${
          bundle.isActive
            ? 'border-gray-200 dark:border-ink-700 text-gray-700 dark:text-ink-100 bg-gray-50 dark:bg-ink-800 hover:bg-gray-100 dark:hover:bg-ink-700'
            : 'border-green-200 dark:border-green-900/60 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-950/60'
        }`}
      >
        {bundle.isActive ? 'Deactivate' : 'Activate'}
      </button>
      <button
        onClick={() => openEditForm(bundle)}
        disabled={busyId === bundle.id}
        className="inline-flex items-center px-3 py-1.5 rounded-md border border-blue-100 dark:border-mint-900/40 text-xs font-medium text-blue-700 dark:text-mint-300 bg-blue-50 dark:bg-mint-900/20 hover:bg-blue-100 dark:hover:bg-mint-900/40 transition-colors disabled:opacity-60"
      >
        Edit
      </button>
      <button
        onClick={() => handleDelete(bundle)}
        disabled={busyId === bundle.id}
        className="inline-flex items-center px-3 py-1.5 rounded-md border border-red-100 dark:border-red-900/50 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors disabled:opacity-60"
      >
        Delete
      </button>
    </div>
  );

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="app-page">
      <Navbar />
      <main className="app-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="section-title">Course Bundles</h1>
              <p className="section-subtitle">
                Sell several courses together. A bundle&apos;s price is always the sum of the
                courses in it.
              </p>
            </div>
            <button onClick={openCreateForm} className="btn-primary w-full sm:w-auto">
              New bundle
            </button>
          </div>

          {error && (
            <div className="state-error mb-4" role="alert">
              {error}
            </div>
          )}

          {notice && (
            <div
              className="mb-4 px-4 py-3 rounded border bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200"
              role="status"
            >
              {notice}
            </div>
          )}

          {showForm && (
            <BundleForm
              // Remounts on switching between create and a different bundle, so
              // the form's own state is rebuilt from the new props rather than
              // carrying the previous bundle's values across.
              key={editingBundle?.id ?? 'new'}
              apiUrl={API_URL}
              bundle={editingBundle}
              courses={courses}
              coursesLoading={coursesLoading}
              coursesError={coursesError}
              onCancel={() => {
                setShowForm(false);
                setEditingBundle(null);
              }}
              onSaved={handleSaved}
            />
          )}

          {/* Search + sort. Both operate on the array already in memory. */}
          {!loading && bundles.length > 0 && (
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search bundles by name or description…"
                  aria-label="Search bundles"
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-md border border-gray-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-gray-900 dark:text-ink-50 placeholder:text-gray-400 dark:placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-mint-500 focus:border-blue-500 dark:focus:border-mint-400 transition-colors"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-ink-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <label htmlFor="bundle-sort" className="sr-only">
                  Sort bundles
                </label>
                <select
                  id="bundle-sort"
                  value={sortKey}
                  onChange={(event) => setSortKey(event.target.value as SortKey)}
                  className="w-full sm:w-auto px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-gray-900 dark:text-ink-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-mint-500 transition-colors"
                >
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                    <option key={key} value={key}>
                      {SORT_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {loading ? (
            <div className="state-loading">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-b-transparent border-blue-600 dark:border-mint-400" />
              <p className="mt-3 text-sm">Loading bundles…</p>
            </div>
          ) : bundles.length === 0 ? (
            /* Empty state 1: nothing exists yet. Offers the way forward. */
            <div className="app-card app-card-padding">
              <div className="state-empty">
                <p className="text-base mb-2 text-gray-700 dark:text-ink-200">No bundles yet.</p>
                <p className="text-sm">
                  A bundle groups at least two courses and sells them for the sum of their prices.
                </p>
                <button onClick={openCreateForm} className="btn-primary mt-4">
                  Create the first bundle
                </button>
              </div>
            </div>
          ) : visibleBundles.length === 0 ? (
            /* Empty state 2: bundles exist, this SEARCH matches none. Offers the
               way back, not the way forward — a different problem needing a
               different button. */
            <div className="app-card app-card-padding">
              <div className="state-empty">
                <p className="text-base mb-2 text-gray-700 dark:text-ink-200">
                  No bundle matches “{search.trim()}”.
                </p>
                <p className="text-sm">
                  {bundles.length} bundle{bundles.length === 1 ? '' : 's'} exist — try a different
                  search.
                </p>
                <button onClick={() => setSearch('')} className="btn-secondary mt-4">
                  Clear search
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ── phones: a stacked card list ───────────────────────────
                  The house pattern is a horizontally scrolling table at every
                  width. That works on a desktop and is miserable on a phone,
                  where a six-column table means swiping sideways to learn the
                  price. Cards are an ADDITION: the table below is untouched and
                  still the desktop view. */}
              <ul className="sm:hidden space-y-3">
                {visibleBundles.map((bundle) => (
                  <li key={bundle.id} className="app-card app-card-padding">
                    <div className="flex gap-3">
                      {cover(bundle, 'w-16 h-16 shrink-0')}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-ink-50 break-words">
                          {bundle.title}
                        </p>
                        <div className="mt-1">{statusPill(bundle)}</div>
                        {notPurchasableHint(bundle)}
                      </div>
                    </div>
                    <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <dt className="text-xs text-gray-500 dark:text-ink-300">Courses</dt>
                        <dd className="text-gray-900 dark:text-ink-50 tabular-nums">
                          {bundle.courseCount}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500 dark:text-ink-300">Price</dt>
                        <dd className="text-gray-900 dark:text-ink-50 font-medium tabular-nums">
                          {formatRupees(bundle.price)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500 dark:text-ink-300">Commission</dt>
                        <dd className="text-sm">{commissionCell(bundle)}</dd>
                      </div>
                    </dl>
                    <div className="mt-3">{rowActions(bundle)}</div>
                  </li>
                ))}
              </ul>

              {/* ── desktop: the house table ──────────────────────────────── */}
              <div className="hidden sm:block app-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-ink-800">
                    <thead className="bg-gray-50 dark:bg-ink-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-ink-200 uppercase tracking-wider">
                          Bundle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-ink-200 uppercase tracking-wider">
                          Courses
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-ink-200 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-ink-200 uppercase tracking-wider">
                          Commission
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-ink-200 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-ink-200 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-ink-900 divide-y divide-gray-200 dark:divide-ink-800">
                      {visibleBundles.map((bundle) => (
                        <tr
                          key={bundle.id}
                          className="hover:bg-gray-50 dark:hover:bg-ink-800 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {cover(bundle, 'w-14 h-10 shrink-0')}
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-ink-50">
                                  {bundle.title}
                                </div>
                                {bundle.description && (
                                  <div className="text-xs text-gray-500 dark:text-ink-300 truncate max-w-xs">
                                    {bundle.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-ink-50 tabular-nums">
                            {bundle.courseCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-ink-50 tabular-nums">
                            {formatRupees(bundle.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {commissionCell(bundle)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {statusPill(bundle)}
                            {notPurchasableHint(bundle)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {rowActions(bundle)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
