'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { resolveAssetUrl } from '@/components/ThumbnailUploader';
import type { BundleCourse, BundleDetail, BundleOrderResponse } from '../types';
import {
  bundleDiscountPercent,
  bundleMrp,
  courseCountLabel,
  formatRupees,
  normaliseBundleDetail,
  readError,
} from '../types';

/**
 * Bundle detail — the parent product page.
 *
 * A BUNDLE is the only sellable unit on this platform; the courses listed here
 * are its CHILDREN and are not purchasable on their own. The page is laid out to
 * make that relationship legible: one parent card, then the member courses on an
 * indented rail descending from it, rather than a second flat grid that would
 * read as a sibling list.
 *
 * Raw `fetch` with `credentials: 'include'` and a locally declared API_URL,
 * matching every other screen in this app. `lib/api.ts` is not used anywhere and
 * is not used here either: its wrapper resolves to a body and discards the HTTP
 * status, which is the only thing separating "not signed in" (401, recoverable)
 * from "no such bundle" (404) from a real failure.
 *
 * There is no client-side role gate, because this app has none: no middleware.ts
 * and no auth context. A 401 from the buy action is rendered as a sentence with
 * a link to sign in, not as a redirect.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Load Razorpay on demand.
 *
 * Mirrors `components/CheckoutModal.tsx` rather than using `next/script`: the
 * script is only needed if the server comes back with a real order, and the
 * old `<Script strategy="lazyOnload">` approach on the course page produced a
 * "gateway is loading, try again" dead end when the click beat the load.
 */
const loadRazorpayScript = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  if (window.Razorpay) return true;

  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function BundleDetailPage() {
  const params = useParams<{ id: string }>();
  const bundleId = typeof params?.id === 'string' ? params.id : '';

  const [detail, setDetail] = useState<BundleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [buyNotice, setBuyNotice] = useState('');
  /** Set when the buy action failed with a 401, so we can offer a sign-in link. */
  const [needsSignIn, setNeedsSignIn] = useState(false);

  const fetchBundle = useCallback(async () => {
    if (!bundleId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/bundles/${bundleId}`, {
        credentials: 'include',
      });
      if (res.status === 404) {
        setNotFound(true);
        setError('');
        return;
      }
      if (!res.ok) {
        setError(await readError(res, 'Could not load this bundle'));
        return;
      }
      const body = await res.json().catch(() => null);
      const normalised = normaliseBundleDetail(body);
      if (!normalised) {
        setError('The server returned a bundle this page could not read.');
        return;
      }
      setDetail(normalised);
      setError('');
      setNotFound(false);
    } catch {
      setError(
        'Could not reach the server to load this bundle. Check your connection and retry.'
      );
    } finally {
      setLoading(false);
    }
  }, [bundleId]);

  useEffect(() => {
    fetchBundle();
  }, [fetchBundle]);

  /**
   * Buy the bundle.
   *
   * `create-bundle-order` is the ONLY checkout on this platform. Its two
   * branches are both verified against the running backend: the bypass branch
   * returns `{ bypass: true, ... }` and completes the purchase server-side, and
   * the live branch returns a Razorpay `key`/`orderId` to hand to the gateway.
   */
  const handleBuy = async () => {
    if (!detail) return;
    setBuying(true);
    setBuyError('');
    setBuyNotice('');
    setNeedsSignIn(false);

    try {
      const res = await fetch(`${API_URL}/api/payments/create-bundle-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bundleId: detail.bundle.id }),
      });

      if (!res.ok) {
        if (res.status === 401) setNeedsSignIn(true);
        setBuyError(await readError(res, 'Could not start checkout'));
        return;
      }

      const order: BundleOrderResponse = (await res.json().catch(() => null)) ?? {};

      // Payment bypass mode: the purchase is already recorded, so re-reading the
      // bundle is what flips this page into its "you own this" state.
      if (order.bypass) {
        setBuyNotice(order.message || 'Bundle purchased successfully.');
        await fetchBundle();
        return;
      }

      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded || typeof window.Razorpay === 'undefined') {
        setBuyError('The payment gateway could not be loaded. Check your connection and retry.');
        return;
      }

      const razorpay = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'LearnWealthX',
        description: `Bundle: ${detail.bundle.title}`,
        order_id: order.orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch(`${API_URL}/api/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });
            const verifyBody = await verifyRes.json().catch(() => null);
            if (verifyRes.ok && verifyBody?.success) {
              setBuyNotice('Payment successful. The bundle is unlocked.');
              await fetchBundle();
            } else {
              setBuyError('Payment verification failed. No access has been granted.');
            }
          } catch {
            setBuyError('Payment verification failed. No access has been granted.');
          }
        },
        theme: { color: '#3399cc' },
      });
      razorpay.open();
    } catch {
      setBuyError('Something went wrong while starting checkout. Please try again.');
    } finally {
      setBuying(false);
    }
  };

  // ── states ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="app-page">
        <Navbar />
        <main className="app-main">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="state-loading">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-b-transparent border-blue-600 dark:border-mint-400" />
              <p className="mt-3 text-sm">Loading bundle…</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (notFound || (!detail && !error)) {
    return (
      <div className="app-page">
        <Navbar />
        <main className="app-main">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="app-card app-card-padding">
              <div className="state-empty">
                <p className="text-base mb-2 text-gray-700 dark:text-ink-200">
                  This bundle is not available.
                </p>
                <p className="text-sm">
                  It may have been removed, or it is not on sale at the moment.
                </p>
                <Link href="/courses" className="btn-primary mt-4">
                  Browse all bundles
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="app-page">
        <Navbar />
        <main className="app-main">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="state-error" role="alert">
              {error}
            </div>
            <button onClick={() => void fetchBundle()} className="btn-secondary mt-4">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  const { bundle, hasAccess, ownedCourseIds, isPurchasable } = detail;
  const cover = resolveAssetUrl(bundle.image, API_URL);
  const listPrice = bundleMrp(bundle);
  const discount = bundleDiscountPercent(bundle);
  const ownedCount = bundle.courses.filter((course) =>
    ownedCourseIds.includes(course.id)
  ).length;
  const firstCourseId = bundle.courses[0]?.id;

  // ── child course row ─────────────────────────────────────────────────────

  const courseRow = (course: BundleCourse, index: number) => {
    const owned = ownedCourseIds.includes(course.id);
    const isLast = index === bundle.courses.length - 1;
    const thumbnail = resolveAssetUrl(course.thumbnail, API_URL);

    return (
      <li key={course.id} className="flex gap-3 sm:gap-4">
        {/* The rail. A line through a numbered node, drawn in two segments so
            the last child's line stops at its own node instead of dangling
            past the end of the list. */}
        <div className="relative flex w-8 shrink-0 justify-center" aria-hidden="true">
          <span className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-px bg-gray-200 dark:bg-ink-700" />
          {!isLast && (
            <span className="absolute top-12 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gray-200 dark:bg-ink-700" />
          )}
          <span
            className={`relative mt-4 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
              owned
                ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300'
                : 'bg-blue-50 dark:bg-mint-900/40 text-blue-700 dark:text-mint-300'
            }`}
          >
            {index + 1}
          </span>
        </div>

        <div className="app-card app-card-padding flex-1 min-w-0">
          <div className="flex gap-3 sm:gap-4">
            {thumbnail ? (
              /* eslint-disable-next-line @next/next/no-img-element -- the API
                 host is not in next.config.js images.remotePatterns, so
                 next/image cannot load a backend-proxied thumbnail. Matches
                 every other screen in this app. */
              <img
                src={thumbnail}
                alt=""
                className="hidden sm:block w-24 h-16 shrink-0 rounded-md object-cover bg-gray-100 dark:bg-ink-800"
              />
            ) : (
              <div className="hidden sm:flex w-24 h-16 shrink-0 rounded-md items-center justify-center bg-gradient-to-br from-blue-400 dark:from-mint-800 to-indigo-600 dark:to-mint-950">
                <svg
                  className="w-6 h-6 text-white opacity-70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-ink-50 break-words">
                  <Link
                    href={`/courses/${course.id}`}
                    className="hover:text-blue-600 dark:hover:text-mint-400 transition-colors"
                  >
                    {course.title}
                  </Link>
                </h3>
                {owned ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-950/50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
                    Already yours
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-ink-800 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-ink-200">
                    Included
                  </span>
                )}
              </div>
              {course.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-ink-300 line-clamp-2">
                  {course.description}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500 dark:text-ink-300">
                {/* The member price is context for what the bundle contains, not
                    an offer: a course cannot be bought on its own. */}
                Worth {formatRupees(course.price)} on its own
              </p>
            </div>
          </div>
        </div>
      </li>
    );
  };

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="app-page">
      <Navbar />
      <main className="app-main">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="mb-4 text-sm" aria-label="Breadcrumb">
            <Link
              href="/courses"
              className="text-gray-600 dark:text-ink-300 hover:text-blue-600 dark:hover:text-mint-400 transition-colors"
            >
              ← All bundles
            </Link>
          </nav>

          {error && (
            <div className="state-error mb-4" role="alert">
              {error}
            </div>
          )}

          {/* ── the parent ──────────────────────────────────────────────── */}
          <div className="app-card overflow-hidden">
            <div className="relative h-48 sm:h-60 bg-gradient-to-br from-blue-400 dark:from-mint-800 to-indigo-600 dark:to-mint-950">
              {cover ? (
                /* eslint-disable-next-line @next/next/no-img-element -- see the
                   note on the course thumbnail above. */
                <img src={cover} alt="" className="w-full h-full object-cover" />
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
              <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-white/95 dark:bg-ink-950/90 px-3 py-1 text-xs font-semibold text-gray-900 dark:text-ink-50">
                Bundle
              </span>
            </div>

            <div className="app-card-padding">
              <h1 className="section-title">{bundle.title}</h1>
              <p className="mt-1 text-sm font-medium text-blue-700 dark:text-mint-300">
                {courseCountLabel(bundle.courseCount)} in this bundle
              </p>
              {bundle.description && (
                <p className="mt-3 text-sm text-gray-600 dark:text-ink-300 max-w-2xl">
                  {bundle.description}
                </p>
              )}

              {buyNotice && (
                <div
                  className="mt-4 px-4 py-3 rounded border bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900/60 text-green-800 dark:text-green-200 text-sm"
                  role="status"
                >
                  {buyNotice}
                </div>
              )}

              {buyError && (
                <div className="state-error mt-4" role="alert">
                  {buyError}
                  {needsSignIn && (
                    <>
                      {' '}
                      <Link href="/login" className="underline font-medium">
                        Sign in
                      </Link>
                      .
                    </>
                  )}
                </div>
              )}

              {/* Price and buy action, or the access state that replaces them. */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pt-6 border-t border-gray-200 dark:border-ink-800">
                {hasAccess ? (
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-green-50 dark:bg-green-950/50 px-3 py-1 text-sm font-semibold text-green-700 dark:text-green-300">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      You own this bundle
                    </span>
                    <p className="mt-2 text-sm text-gray-600 dark:text-ink-300">
                      All {courseCountLabel(bundle.courseCount)} below are unlocked. Lifetime
                      access.
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-ink-300">
                      Bundle price
                    </span>
                    <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl font-bold text-gray-900 dark:text-ink-50 tabular-nums">
                        {formatRupees(bundle.price)}
                      </span>
                      {discount > 0 && (
                        <>
                          <span className="text-sm text-gray-500 dark:text-ink-300 line-through tabular-nums">
                            {formatRupees(listPrice)}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/50 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-300">
                            -{discount}%
                          </span>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-ink-300">
                      One payment for every course in the bundle. Price shown excludes payment
                      gateway fees.
                    </p>
                    {ownedCount > 0 && (
                      <p className="mt-2 text-xs text-green-700 dark:text-green-300">
                        You already own {ownedCount} of these {courseCountLabel(bundle.courseCount)}
                        {' '}— they are marked below.
                      </p>
                    )}
                  </div>
                )}

                <div className="shrink-0">
                  {hasAccess ? (
                    firstCourseId ? (
                      <Link href={`/courses/${firstCourseId}`} className="btn-primary">
                        Start learning
                      </Link>
                    ) : null
                  ) : isPurchasable ? (
                    <button
                      onClick={() => void handleBuy()}
                      disabled={buying}
                      className="btn-primary w-full sm:w-auto px-6 py-3"
                    >
                      {buying ? 'Starting checkout…' : 'Buy this bundle'}
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-ink-300 max-w-xs">
                      This bundle is not on sale right now.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── the children ────────────────────────────────────────────── */}
          <section className="mt-8" aria-labelledby="bundle-contents-heading">
            <h2
              id="bundle-contents-heading"
              className="text-xl font-semibold text-gray-900 dark:text-ink-50"
            >
              What&apos;s inside
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-ink-300">
              These {courseCountLabel(bundle.courseCount)} come with the bundle. Courses are not
              sold separately.
            </p>

            {bundle.courses.length === 0 ? (
              <div className="app-card app-card-padding mt-4">
                <div className="state-empty">
                  <p className="text-sm">
                    The courses in this bundle have not been published yet. Check back soon.
                  </p>
                </div>
              </div>
            ) : (
              <ol className="mt-4 space-y-3">
                {bundle.courses.map((course, index) => courseRow(course, index))}
              </ol>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
