'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * EARNINGS FOR A CHOSEN PERIOD.
 *
 * The dashboard's other figures are lifetime totals, which answer "how has this
 * gone overall" and not "how am I doing right now". This panel answers the
 * second question: today, this week, this month, or all time.
 *
 * ── THE WINDOWS ARE CALENDAR, NOT ROLLING ─────────────────────────────────
 * "This week" is Monday to now in Indian Standard Time, not the last seven
 * days. Two reasons: an affiliate thinks in weeks that start somewhere, and the
 * payout cron runs Monday morning — so "this week" is exactly the sales the
 * next payout will settle. The boundaries are computed server-side
 * (`periodStartedAt` in earningsService) so this component cannot disagree with
 * the numbers it is showing.
 *
 * ── WHY THE WALLET BALANCE IS NOT HERE ────────────────────────────────────
 * A balance is a running figure at a point in time; "your balance this week" is
 * not a quantity. The API deliberately keeps `wallet` lifetime whatever the
 * period, and this panel only ever renders the period-scoped `totals`.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const PERIODS = [
  { id: 'day', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'all', label: 'All time' },
] as const;

type PeriodId = (typeof PERIODS)[number]['id'];

interface EarningsTotals {
  salesCount: number;
  grossRevenue: number;
  commissionEarned: number;
}

function formatRupees(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `₹${safe.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function EarningsPeriodPanel() {
  const [period, setPeriod] = useState<PeriodId>('month');
  const [totals, setTotals] = useState<EarningsTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (selected: PeriodId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/earnings/me?period=${selected}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        setError('Could not load your earnings for this period.');
        return;
      }
      const body = await res.json().catch(() => null);
      const raw = body?.totals ?? {};
      // Coerced rather than trusted: a missing field must render ₹0.00, not
      // crash the dashboard on `undefined.toLocaleString`.
      setTotals({
        salesCount: Number(raw.salesCount) || 0,
        grossRevenue: Number(raw.grossRevenue) || 0,
        commissionEarned: Number(raw.commissionEarned) || 0,
      });
      setError('');
    } catch {
      setError('Could not reach the server to load your earnings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(period);
  }, [load, period]);

  return (
    <div className="bg-white dark:bg-ink-900 rounded-lg shadow dark:shadow-black/40 p-5 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-ink-50">Your earnings</h2>

        {/* A radiogroup, not a row of buttons: these are four views of one
            thing and exactly one is active, which is what `aria-checked`
            communicates and a plain button cannot. */}
        <div
          role="radiogroup"
          aria-label="Earnings period"
          className="inline-flex flex-wrap gap-1 rounded-lg bg-gray-100 dark:bg-ink-800 p-1"
        >
          {PERIODS.map((option) => {
            const active = option.id === period;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPeriod(option.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-mint-500 ${
                  active
                    ? 'bg-white dark:bg-ink-950 text-gray-900 dark:text-ink-50 shadow-sm'
                    : 'text-gray-600 dark:text-ink-300 hover:text-gray-900 dark:hover:text-ink-50'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="mt-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            type="button"
            onClick={() => load(period)}
            className="mt-2 text-xs font-semibold text-blue-600 dark:text-mint-400 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : (
        // `aria-busy` rather than swapping in a spinner: the figures stay on
        // screen while the next period loads, so the panel does not flash empty
        // every time somebody changes the filter.
        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4" aria-busy={loading}>
          <div>
            <dt className="text-sm text-gray-500 dark:text-ink-300">Commission earned</dt>
            <dd className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400 tabular-nums">
              {formatRupees(totals?.commissionEarned ?? 0)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-ink-300">Sales</dt>
            <dd className="mt-1 text-2xl font-bold text-gray-900 dark:text-ink-50 tabular-nums">
              {totals?.salesCount ?? 0}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-ink-300">Sales value</dt>
            <dd className="mt-1 text-2xl font-bold text-gray-900 dark:text-ink-50 tabular-nums">
              {formatRupees(totals?.grossRevenue ?? 0)}
            </dd>
          </div>
        </dl>
      )}

      <p className="mt-3 text-xs text-gray-400 dark:text-ink-400">
        Periods are calendar windows in IST. A week runs Monday to now, matching the weekly
        payout.
      </p>
    </div>
  );
}
