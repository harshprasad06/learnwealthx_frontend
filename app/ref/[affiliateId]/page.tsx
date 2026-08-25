'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CheckoutModal from '@/components/CheckoutModal';
import { resolveAssetUrl } from '@/components/ThumbnailUploader';
import type { PublicBundle } from '@/app/bundles/types';
import { courseCountLabel, formatRupees, normaliseBundleList } from '@/app/bundles/types';

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number;
  thumbnail: string | null;
  averageRating?: number;
  reviewCount?: number;
}

interface AffiliateUser {
  id: string;
  name: string | null;
  email: string;
  picture: string | null;
  createdAt: string;
}

interface AffiliatePublic {
  id: string;
  referralCode: string;
  totalClicks: number;
  totalSignups: number;
  createdAt: string;
  user: AffiliateUser;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function RefLandingPage() {
  const { affiliateId } = useParams<{ affiliateId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  /**
   * Bundles named by `?bundles=`, which is the shape affiliate links now use.
   *
   * Kept separate from `courses` rather than replacing it: links already in the
   * wild carry `?courses=` and must keep working, and a link may carry both.
   */
  const [bundles, setBundles] = useState<PublicBundle[]>([]);
  const [bundlesLoading, setBundlesLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<AffiliatePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState<{
    baseAmount: number;
    gstAmount: number;
    gatewayFeeAmount: number;
    totalAmount: number;
  } | null>(null);

  // Track click by affiliateId and set cookie with course IDs
  useEffect(() => {
    if (!affiliateId) return;
    // `bundles` is what affiliate links now carry, since a bundle is the only
    // sellable unit. `courses` is still forwarded alongside it so that links
    // already in the wild keep attributing, and both are sent when a link
    // carries both. URLSearchParams does the encoding.
    const query = new URLSearchParams();
    const bundlesParam = searchParams.get('bundles');
    const coursesParam = searchParams.get('courses');
    if (bundlesParam) query.set('bundles', bundlesParam);
    if (coursesParam) query.set('courses', coursesParam);
    const trackingQuery = query.toString();
    const url = trackingQuery
      ? `${API_URL}/api/affiliate/track-by-id/${affiliateId}?${trackingQuery}`
      : `${API_URL}/api/affiliate/track-by-id/${affiliateId}`;
    fetch(url, {
      credentials: 'include',
    }).catch((err) => {
      console.error('Error tracking affiliate click by id:', err);
    });
  }, [affiliateId, searchParams]);

  // Load affiliate public info
  useEffect(() => {
    const loadAffiliate = async () => {
      if (!affiliateId) return;
      try {
        const res = await fetch(`${API_URL}/api/affiliate/public/${affiliateId}`);
        if (!res.ok) return;
        const data = await res.json();
        setAffiliate(data);
      } catch (e) {
        console.error('Error loading affiliate info', e);
      }
    };
    loadAffiliate();
  }, [affiliateId]);

  // Load the bundles named by `?bundles=`.
  //
  // ONE request: `GET /api/bundles` already nests each bundle's member courses,
  // so the named bundles are a local filter over a single response rather than a
  // request per id. (The course loader below still loops, which is the shape it
  // has always had; legacy links carry one or two ids.)
  useEffect(() => {
    const bundlesParam = searchParams.get('bundles');
    if (!bundlesParam) {
      setBundlesLoading(false);
      return;
    }
    const ids = bundlesParam
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);
    if (ids.length === 0) {
      setBundlesLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/bundles`, { credentials: 'include' });
        if (!res.ok) return;
        const body = await res.json().catch(() => null);
        if (cancelled) return;
        const wanted = new Set(ids);
        // Order follows the link, so the affiliate controls what leads.
        const found = normaliseBundleList(body).filter((b) => wanted.has(b.id));
        setBundles(ids.map((id) => found.find((b) => b.id === id)).filter((b): b is PublicBundle => !!b));
      } catch (e) {
        console.error('Error loading referral bundles', e);
        if (!cancelled) setError('Failed to load the bundles for this referral link.');
      } finally {
        if (!cancelled) setBundlesLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  // Load selected courses
  useEffect(() => {
    const coursesParam = searchParams.get('courses');
    if (!coursesParam) {
      setLoading(false);
      return;
    }
    const ids = coursesParam
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const results: Course[] = [];
        for (const id of ids) {
          const res = await fetch(`${API_URL}/api/courses/${id}`, {
            credentials: 'include',
          });
          const data = await res.json();
          if (res.ok && data.course) {
            const avg = data.reviewSummary?.averageRating ?? 0;
            const count = data.reviewSummary?.reviewCount ?? 0;
            results.push({
              id: data.course.id,
              title: data.course.title,
              description: data.course.description,
              price: data.course.price,
              thumbnail: data.course.thumbnail,
              averageRating: avg,
              reviewCount: count,
            });
          }
        }
        setCourses(results);
      } catch (e) {
        console.error('Error loading referral courses', e);
        setError('Failed to load courses for this referral link.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [searchParams]);

  const renderStars = (rating: number) => {
    const rounded = Math.round(rating || 0);
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rounded ? 'text-yellow-400' : 'text-gray-300 dark:text-ink-700'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const totalPrice = courses.reduce((sum, c) => sum + c.price, 0);

  // Fetch price breakdown from backend (uses GATEWAY_FEE_RATE and GST_RATE from .env).
  useEffect(() => {
    if (totalPrice <= 0 || courses.length === 0) {
      setPriceBreakdown(null);
      return;
    }
    let cancelled = false;
    fetch(
      `${API_URL}/api/payments/price-breakdown?baseAmount=${encodeURIComponent(totalPrice)}`,
      { credentials: 'include' }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        if (
          typeof data.baseAmount === 'number' &&
          typeof data.gstAmount === 'number' &&
          typeof data.gatewayFeeAmount === 'number' &&
          typeof data.totalAmount === 'number'
        ) {
          setPriceBreakdown(data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [totalPrice, courses.length]);

  const totalAmount = priceBreakdown?.totalAmount ?? totalPrice;

  const displayName =
    affiliate?.user.name || (affiliate?.user.email ? affiliate.user.email.split('@')[0] : '');
  const avatarInitial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero / Affiliate intro */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 dark:from-mint-800 to-indigo-600 dark:to-mint-950 flex items-center justify-center text-white font-semibold text-lg shadow-md overflow-hidden">
              {affiliate?.user.picture && !avatarError ? (
                <img
                  src={affiliate.user.picture}
                  alt={displayName || 'Affiliate'}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                avatarInitial
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Learn with {displayName || 'your mentor'}
              </h1>
              <p className="text-sm text-foreground/70 mt-1">
                These courses were personally recommended for you. Buy through this page to
                support your mentor.
              </p>
              {affiliate && (
                <p className="text-xs text-foreground/60 mt-1">
                  {affiliate.totalSignups} learners joined
                </p>
              )}
            </div>
          </div>
          {courses.length > 0 && (
            <div className="px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-600 dark:from-mint-800 to-indigo-600 dark:to-mint-950 text-white shadow-lg">
              <p className="text-xs uppercase tracking-wide opacity-80 mb-1">
                Bundle total ({courses.length} courses)
              </p>
              <p className="text-2xl font-bold mb-1">
                ₹{totalAmount.toFixed(2)}
              </p>
              <p className="text-xs opacity-80">
                Secure checkout in one step. Lifetime access to all selected courses.
              </p>
              {priceBreakdown ? (
                <p className="text-[11px] mt-1 opacity-90">
                  Course price ₹{totalPrice.toFixed(2)}
                  {priceBreakdown.gstAmount > 0 && ` + GST ₹${priceBreakdown.gstAmount.toFixed(2)}`}
                  {' + payment gateway fee ₹' + priceBreakdown.gatewayFeeAmount.toFixed(2)}
                  {' = Total ₹' + totalAmount.toFixed(2)}
                </p>
              ) : (
                <p className="text-[11px] mt-1 opacity-90">
                  Total ₹{totalAmount.toFixed(2)} (incl. gateway fee)
                </p>
              )}
            </div>
          )}
        </div>

        {(loading || bundlesLoading) && (
          <div className="text-center py-12 text-foreground/70">Loading...</div>
        )}

        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!loading && !bundlesLoading && !error && courses.length === 0 && bundles.length === 0 && (
          <div className="text-center py-12 text-foreground/60">
            <p>This referral link does not point at anything on sale right now.</p>
            <Link
              href="/courses"
              className="mt-3 inline-block underline font-medium text-blue-600 dark:text-mint-400"
            >
              Browse all bundles
            </Link>
          </div>
        )}

        {/* Bundles. A bundle is the only sellable unit, so the CTA goes to the
            bundle page, where `create-bundle-order` is — not to the course-based
            CheckoutModal below, which is kept only for legacy `?courses=` links.
            These cards use explicit light + dark colours rather than the
            `bg-cardBackground` / `dark:border-border` tokens the course cards
            below use: those two class names are not in tailwind.config.ts and so
            resolve to nothing. */}
        {!bundlesLoading && bundles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {bundles.map((bundle) => {
              const cover = resolveAssetUrl(bundle.image, API_URL);
              return (
                <div
                  key={bundle.id}
                  className="bg-white dark:bg-ink-900 rounded-xl shadow-lg dark:shadow-black/40 dark:border dark:border-ink-800 overflow-hidden flex flex-col"
                >
                  <div className="relative h-44 bg-gradient-to-br from-blue-400 dark:from-mint-800 to-indigo-600 dark:to-mint-950">
                    {cover ? (
                      /* eslint-disable-next-line @next/next/no-img-element --
                         the API host is not in next.config.js
                         images.remotePatterns. Matches every other screen. */
                      <img src={cover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-14 h-14 text-white opacity-60"
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
                    <span className="absolute top-3 right-3 rounded-full bg-white/95 dark:bg-ink-950/90 px-3 py-1 text-xs font-medium text-gray-900 dark:text-ink-50">
                      {courseCountLabel(bundle.courseCount)}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="text-lg font-semibold mb-1 text-gray-900 dark:text-ink-50 line-clamp-2">
                      {bundle.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-ink-300 line-clamp-2">
                      {bundle.description || 'No description available.'}
                    </p>
                    {bundle.courses.length > 0 && (
                      <ul className="mt-3 space-y-0.5 flex-1">
                        {bundle.courses.slice(0, 3).map((course) => (
                          <li
                            key={course.id}
                            className="flex gap-1.5 text-xs text-gray-700 dark:text-ink-200"
                          >
                            <span
                              className="text-blue-600 dark:text-mint-400 shrink-0"
                              aria-hidden="true"
                            >
                              &bull;
                            </span>
                            <span className="line-clamp-1">{course.title}</span>
                          </li>
                        ))}
                        {bundle.courses.length > 3 && (
                          <li className="text-xs text-gray-500 dark:text-ink-300">
                            +{bundle.courses.length - 3} more
                          </li>
                        )}
                      </ul>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-bold text-blue-600 dark:text-mint-400 tabular-nums">
                        {formatRupees(bundle.price)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-ink-300">
                        Lifetime access
                      </span>
                    </div>
                    <Link href={`/bundles/${bundle.id}`} className="btn-primary mt-4 w-full">
                      View bundle
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && courses.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-cardBackground rounded-xl shadow-lg dark:shadow-none dark:border dark:border-border overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="h-44 bg-gray-200 dark:bg-ink-900 overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={
                          course.thumbnail.startsWith('http')
                            ? course.thumbnail
                            : `${API_URL}${course.thumbnail}`
                        }
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-ink-400 text-sm">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="text-lg font-semibold mb-1 text-foreground line-clamp-2">
                      {course.title}
                    </h2>
                    {typeof course.averageRating === 'number' && course.reviewCount !== undefined && (
                      <div className="flex items-center space-x-2 mb-2">
                        {renderStars(course.averageRating)}
                        <span className="text-xs text-foreground/60">
                          {course.averageRating.toFixed(1)} ({course.reviewCount}{' '}
                          review{course.reviewCount !== 1 ? 's' : ''})
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-foreground/80 flex-1 line-clamp-3">
                      {course.description || 'No description available.'}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-bold text-blue-600 dark:text-mint-400">
                        ₹{course.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setShowCheckout(true)}
                className="px-8 py-3 rounded-full bg-blue-600 dark:bg-mint-500 text-white dark:text-ink-950 text-sm font-semibold shadow-lg hover:bg-blue-700 dark:hover:bg-mint-400 transition-colors"
              >
                Checkout All Courses
              </button>
            </div>
          </>
        )}
      </div>
      {showCheckout && courses.length > 0 && (
        <CheckoutModal
          courseIds={courses.map((c) => c.id)}
          title={`All selected courses (${courses.length})`}
          totalPrice={totalPrice}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            router.push('/courses');
          }}
        />
      )}
    </div>
  );
}

