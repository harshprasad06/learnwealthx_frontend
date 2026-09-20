'use client';

import { usePackages } from './usePackages';
import { formatRupees, formatRupeesIndian } from '@/app/earnings/types';

/**
 * COMMISSION STRUCTURE — every membership and what one sale of it pays.
 *
 * Laid out as the reference design does it: Packages / Price / Your Commission
 * / Commission %, with the price carrying its GST line and the rate shown as a
 * filled pill at the end of the row.
 *
 * ── THE RATE AND GST ARE FIXED HERE, NOT READ FROM THE API ────────────────
 * `COMMISSION_RATE` and `GST_RATE` below are the published programme terms and
 * are deliberately constants in this file. The bundle list, the names and the
 * prices still come from `GET /api/earnings/packages`, so adding a membership
 * in the admin panel adds a row here with no code change.
 *
 * THIS MEANS THE PAGE AND THE BACKEND CAN DISAGREE. The backend pays whatever
 * per-bundle `commissionRate` is set in /admin/bundles, and charges whatever
 * `GST_RATE` the server is configured with. If those are changed, the figures
 * on this page do not follow — they have to be changed here too. Keep the two
 * in step, and treat this file as the published-terms side of that pair.
 */

/** Published commission rate, as a decimal fraction. */
const COMMISSION_RATE = 0.1;

/** Published GST rate, as a decimal fraction, shown on top of the price. */
const GST_RATE = 0.18;

/** `0.18` → `18`, for the "+ 18% GST" label. */
const GST_PERCENT = Math.round(GST_RATE * 100);

/** `0.1` → `10`, for the rate pill. */
const COMMISSION_PERCENT = Number((COMMISSION_RATE * 100).toFixed(2));

export default function CommissionTable() {
  const { packages, loading, error, reload } = usePackages();

  return (
    <section
      id="commissions"
      className="relative scroll-mt-20 py-20 sm:py-28 bg-gray-50 dark:bg-ink-900/40 border-y border-gray-200 dark:border-ink-800"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-blue-700 dark:bg-mint-500/15 dark:text-mint-300">
            Commission structure
          </span>
          <h2 className="mt-5 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-ink-50 text-balance">
            Transparent earnings. <span className="gradient-text">No surprises.</span>
          </h2>
          <p className="mt-5 text-base text-gray-600 dark:text-ink-300">
            Every membership, every commission — laid out clearly. What you see is what you earn.
          </p>
        </div>

        {loading ? (
          <div className="state-loading mt-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-b-transparent border-blue-600 dark:border-mint-400" />
            <p className="mt-3 text-sm">Loading memberships…</p>
          </div>
        ) : error ? (
          <div className="mt-12 max-w-md">
            <div className="state-error" role="alert">
              {error}
            </div>
            <button type="button" onClick={reload} className="btn-secondary mt-4">
              Try again
            </button>
          </div>
        ) : packages.length === 0 ? (
          <div className="mt-12 max-w-md glass rounded-2xl px-6 py-8">
            <p className="text-sm text-gray-600 dark:text-ink-300">
              Memberships are not published yet. Check back shortly.
            </p>
          </div>
        ) : (
          <>
            {/* Column headings sit OUTSIDE the rows, as pills, so each row reads
                as its own card — the reference's arrangement. Hidden below `md`,
                where the rows restack and each cell carries its own label. */}
            <div className="mt-12 hidden md:grid grid-cols-[1.6fr_1.3fr_1fr_0.9fr] gap-4 px-6">
              {['Packages', 'Price', 'Your Commission', 'Commission %'].map((heading) => (
                <span
                  key={heading}
                  className="justify-self-center rounded-full bg-gray-200/70 dark:bg-ink-800 px-4 py-1.5 text-xs font-semibold text-gray-700 dark:text-ink-200"
                >
                  {heading}
                </span>
              ))}
            </div>

            <ul className="mt-4 space-y-4 list-none p-0">
              {packages.map((pkg) => {
                const commission = pkg.price * COMMISSION_RATE;

                return (
                  <li
                    key={pkg.id}
                    className="relative overflow-hidden rounded-2xl bg-white dark:bg-ink-900 border border-gray-200 dark:border-ink-800 shadow-sm dark:shadow-none"
                  >
                    {/* The dark spine down the left edge of every row. */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-1.5 bg-gray-900 dark:bg-mint-500"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1.3fr_1fr_0.9fr] items-center gap-5 md:gap-4 px-6 py-6 md:divide-x md:divide-gray-200 md:dark:divide-ink-800">
                      <div className="md:text-center">
                        <p className="font-display text-xl font-bold tracking-tight text-gray-900 dark:text-ink-50">
                          {pkg.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-ink-300">
                          Digital · {pkg.courseCount}{' '}
                          {pkg.courseCount === 1 ? 'Course' : 'Courses'}
                        </p>
                      </div>

                      <div className="md:text-center md:px-4">
                        <span className="md:hidden text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300">
                          Price
                        </span>
                        <p className="font-display text-lg font-bold text-gray-900 dark:text-ink-50 tabular-nums">
                          {formatRupeesIndian(pkg.price)}{' '}
                          <span className="font-semibold text-gray-500 dark:text-ink-300">
                            + {GST_PERCENT}% GST
                          </span>
                        </p>
                      </div>

                      <div className="md:text-center md:px-4">
                        <span className="md:hidden text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300">
                          Your Commission
                        </span>
                        <p className="font-display text-xl font-bold text-emerald-700 dark:text-mint-400 tabular-nums">
                          {formatRupees(commission)}
                        </p>
                      </div>

                      <div className="md:text-center md:px-4">
                        <span className="inline-flex items-center rounded-full bg-gray-900 dark:bg-mint-500 px-5 py-2 text-sm font-bold text-white dark:text-ink-950 tabular-nums">
                          ~{COMMISSION_PERCENT}%
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* THE DISCLAIMER — deliberately OUTSIDE every branch above, so a
            reservation of rights cannot disappear on the renders where it is
            least convenient: while loading, after a failed fetch, or when the
            catalogue is empty. */}
        <p className="mt-8 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs leading-relaxed text-gray-600 dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-300">
          <span className="font-semibold text-gray-900 dark:text-ink-100">Please note:</span>{' '}
          LearnWealthX may change, suspend or withdraw commission rates, incentives and the
          affiliate programme itself at any time, at its sole discretion and without prior
          notice. Published rates apply to sales made while they are in effect and are not
          guaranteed for the future. Commission already credited to your wallet for a completed
          sale is not affected by a later change.
        </p>
      </div>
    </section>
  );
}
