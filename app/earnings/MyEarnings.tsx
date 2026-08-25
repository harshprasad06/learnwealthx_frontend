'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  formatDate,
  formatMonthLabel,
  formatRate,
  formatRupees,
  groupSales,
} from './types';
import type { MeResponse } from './types';

interface MyEarningsProps {
  data: MeResponse | null;
  loading: boolean;
  error: string;
  /** Switches the page to the Calculator tab, for the "no sales yet" nudge. */
  onOpenCalculator: () => void;
}

/**
 * What the signed-in affiliate has actually earned.
 *
 * Distinct from the calculator in one important way: nothing here is a
 * projection. A zeroed wallet is shown as zero, and a non-affiliate is told
 * plainly that they are not enrolled rather than being shown a grid of noughts
 * that looks like a record of failure.
 */
export default function MyEarnings({ data, loading, error, onOpenCalculator }: MyEarningsProps) {
  // Bundle sales arrive as one purchase row per member course. Left ungrouped,
  // a single three-course bundle sale would read as three sales.
  const sales = useMemo(() => groupSales(data?.recentSales ?? []), [data]);

  const monthlyMax = useMemo(
    () => Math.max(1, ...(data?.monthly ?? []).map((point) => point.commission)),
    [data]
  );

  if (loading) {
    return (
      <div className="state-loading">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-b-transparent border-blue-600 dark:border-mint-400" />
        <p className="mt-3 text-sm">Loading your earnings…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-error" role="alert">
        {error}
      </div>
    );
  }

  if (!data) return null;

  // ── not an affiliate ─────────────────────────────────────────────────────
  // A 200 with `isAffiliate: false` is a normal answer, not a failure, so it
  // gets an explanation and a way forward rather than an error banner.
  if (!data.isAffiliate) {
    return (
      <div className="app-card app-card-padding">
        <div className="state-empty">
          <p className="text-base mb-2 text-gray-700 dark:text-ink-200">
            You are not an affiliate yet.
          </p>
          <p className="text-sm max-w-prose mx-auto">
            Affiliates earn a commission on every package bought through their referral link.
            Join the programme to get a referral code, then track everything you earn here.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link href="/affiliate/dashboard" className="btn-primary">
              Become an affiliate
            </Link>
            <button type="button" onClick={onOpenCalculator} className="btn-secondary">
              See what you could earn
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── wallet ──────────────────────────────────────────────────────────
          Three related but different numbers, so all three are labelled rather
          than one being presented as "your earnings": what is payable now, what
          has ever been earned, and what has already been paid out. */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="app-card app-card-padding">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300">
            Available balance
          </p>
          <p className="mt-2 text-2xl font-bold text-blue-700 dark:text-mint-400 tabular-nums">
            {formatRupees(data.wallet.balance)}
          </p>
        </div>
        <div className="app-card app-card-padding">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300">
            Total earned
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-ink-50 tabular-nums">
            {formatRupees(data.wallet.totalEarned)}
          </p>
        </div>
        <div className="app-card app-card-padding">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300">
            Already paid out
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-ink-50 tabular-nums">
            {formatRupees(data.wallet.totalPaid)}
          </p>
        </div>
      </section>

      {/* ── lifetime totals + referral code ─────────────────────────────────── */}
      <section className="app-card app-card-padding">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300">
          Lifetime
        </h2>
        <dl className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-gray-600 dark:text-ink-200">Sales</dt>
            <dd className="mt-0.5 text-lg font-semibold text-gray-900 dark:text-ink-50 tabular-nums">
              {data.totals.salesCount}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600 dark:text-ink-200">Gross revenue referred</dt>
            <dd className="mt-0.5 text-lg font-semibold text-gray-900 dark:text-ink-50 tabular-nums">
              {formatRupees(data.totals.grossRevenue)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600 dark:text-ink-200">Commission earned</dt>
            <dd className="mt-0.5 text-lg font-semibold text-gray-900 dark:text-ink-50 tabular-nums">
              {formatRupees(data.totals.commissionEarned)}
            </dd>
          </div>
        </dl>
        {data.referralCode && (
          <p className="mt-4 text-sm text-gray-600 dark:text-ink-300">
            Your referral code:{' '}
            <span className="font-mono font-semibold text-gray-900 dark:text-ink-50">
              {data.referralCode}
            </span>
          </p>
        )}
      </section>

      {/* ── monthly ─────────────────────────────────────────────────────────
          Bars are aria-hidden; the month and the amount are both text. */}
      {data.monthly.length > 0 && (
        <section className="app-card app-card-padding">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300">
            Commission by month
          </h2>
          <ul className="mt-4 space-y-3">
            {data.monthly.map((point) => (
              <li key={point.month}>
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="text-gray-700 dark:text-ink-100">
                    {formatMonthLabel(point.month)}
                    <span className="ml-2 text-gray-500 dark:text-ink-300">
                      {point.salesCount} sale{point.salesCount === 1 ? '' : 's'}
                    </span>
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-ink-50 tabular-nums">
                    {formatRupees(point.commission)}
                  </span>
                </div>
                <div
                  className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-ink-800"
                  aria-hidden="true"
                >
                  <div
                    className="h-2 rounded-full bg-blue-600 dark:bg-mint-500 transition-[width] duration-500 motion-reduce:transition-none"
                    style={{ width: `${(point.commission / monthlyMax) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── recent sales ─────────────────────────────────────────────────── */}
      <section className="app-card app-card-padding">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300">
          Recent sales
        </h2>
        {sales.length === 0 ? (
          <div className="state-empty">
            <p className="text-base mb-2 text-gray-700 dark:text-ink-200">No sales yet.</p>
            <p className="text-sm">
              When somebody buys through your referral link, the sale and the commission you earned
              on it will show up here.
            </p>
            <button type="button" onClick={onOpenCalculator} className="btn-secondary mt-4">
              See what you could earn
            </button>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-gray-200 dark:divide-ink-800">
            {sales.map((sale) => (
              <li
                key={sale.key}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-ink-50 break-words">
                    {sale.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-ink-300">
                    {formatDate(sale.createdAt)}
                    {sale.isBundle && (
                      <>
                        {' · '}
                        Bundle
                        {sale.courseCount > 0 && ` of ${sale.courseCount} course${sale.courseCount === 1 ? '' : 's'}`}
                      </>
                    )}
                    {' · '}
                    {formatRupees(sale.amount)} at {formatRate(sale.commissionRate)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-blue-700 dark:text-mint-400 tabular-nums sm:text-right shrink-0">
                  + {formatRupees(sale.commissionAmount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
