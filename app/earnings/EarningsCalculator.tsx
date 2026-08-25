'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AVERAGE_FRESHER_SALARY,
  DEFAULT_SALES_PER_MONTH,
  MAX_SALES_PER_MONTH,
  MIN_SALES_PER_MONTH,
  commissionSourceHint,
  formatRate,
  formatRupees,
  formatRupeesIndian,
  normaliseCalculateResponse,
  readError,
} from './types';
import type { CalculateResponse, EarningsPackage, PackagesResponse } from './types';

/** Long enough to swallow a slider drag, short enough to feel live. */
const DEBOUNCE_MS = 250;

interface EarningsCalculatorProps {
  apiUrl: string;
  data: PackagesResponse | null;
  loading: boolean;
  error: string;
  selectedPackageId: string;
  onSelectPackage: (packageId: string) => void;
  salesPerMonth: number;
  onSalesPerMonthChange: (salesPerMonth: number) => void;
}

/**
 * The projection calculator.
 *
 * Every rupee on this screen is quoted by the server. The slider does not
 * multiply anything: it posts to `/api/earnings/calculate` and renders what
 * comes back, so this page and any future payout report cannot drift apart.
 * The one arithmetic here is presentational — the widths of the two comparison
 * bars, which are a ratio of two numbers the API already returned.
 */
export default function EarningsCalculator({
  apiUrl,
  data,
  loading,
  error,
  selectedPackageId,
  onSelectPackage,
  salesPerMonth,
  onSalesPerMonthChange,
}: EarningsCalculatorProps) {
  const [calc, setCalc] = useState<{
    forPackageId: string;
    forSalesPerMonth: number;
    data: CalculateResponse;
  } | null>(null);
  const [calcError, setCalcError] = useState('');
  const [calcBusy, setCalcBusy] = useState(false);

  const packages = useMemo(() => data?.packages ?? [], [data]);
  const selectedPackage: EarningsPackage | null =
    packages.find((pkg) => pkg.id === selectedPackageId) ?? null;

  // ── the projection request ───────────────────────────────────────────────

  useEffect(() => {
    if (!selectedPackageId) return;

    // Marked stale immediately, not when the request finally goes out: the
    // numbers on screen stopped describing the inputs the moment they changed.
    setCalcBusy(true);

    const controller = new AbortController();
    const timer = setTimeout(() => {
      (async () => {
        try {
          const res = await fetch(`${apiUrl}/api/earnings/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ packageId: selectedPackageId, salesPerMonth }),
            signal: controller.signal,
          });

          if (!res.ok) {
            setCalcError(await readError(res, 'Could not work out your projection'));
            setCalcBusy(false);
            return;
          }

          const body = await res.json().catch(() => null);
          if (body === null) {
            setCalcError('The server returned a projection this page could not read.');
            setCalcBusy(false);
            return;
          }

          setCalc({
            forPackageId: selectedPackageId,
            forSalesPerMonth: salesPerMonth,
            data: normaliseCalculateResponse(body),
          });
          setCalcError('');
          setCalcBusy(false);
        } catch (err) {
          // The cleanup below aborts the previous request whenever the inputs
          // change, so an AbortError means "superseded", not "failed" — and
          // crucially it means a slow early response can never land on top of a
          // fast later one. The run that replaced it owns the busy flag.
          if (err instanceof DOMException && err.name === 'AbortError') return;
          setCalcError('Could not reach the server to work out your projection.');
          setCalcBusy(false);
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [apiUrl, selectedPackageId, salesPerMonth]);

  // A result belongs to the SELECTED package or it is not shown at all. Holding
  // the previous package's rupees under a newly-chosen package's name — even
  // dimmed for 250ms — would be a straightforwardly false statement.
  const projection = calc && calc.forPackageId === selectedPackageId ? calc.data : null;
  const projectionStale = projection !== null && (calcBusy || calc?.forSalesPerMonth !== salesPerMonth);

  /**
   * Per-sale figures do not depend on volume, so the package payload already
   * carries a correct breakdown. Showing it while the first `/calculate` is in
   * flight means the itemisation never flashes empty, and it keeps the money
   * explanation on screen even when `/calculate` is failing.
   */
  const breakdown = projection?.breakdown ?? selectedPackage?.breakdown ?? null;

  // ── loading / empty / error ──────────────────────────────────────────────

  if (loading) {
    return (
      <div className="state-loading">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-b-transparent border-blue-600 dark:border-mint-400" />
        <p className="mt-3 text-sm">Loading packages…</p>
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

  if (packages.length === 0) {
    return (
      <div className="app-card app-card-padding">
        <div className="state-empty">
          <p className="text-base mb-2 text-gray-700 dark:text-ink-200">No packages available yet.</p>
          <p className="text-sm">
            Membership options are built from the course bundles on sale. As soon as a bundle is
            published it will appear here, with its own commission worked out.
          </p>
        </div>
      </div>
    );
  }

  const gstRate = data?.rates.gstRate ?? 0;
  const gatewayFeeRate = data?.rates.gatewayFeeRate ?? 0;
  const rateHint = selectedPackage ? commissionSourceHint(selectedPackage.commissionSource) : null;

  // Bars scale to whichever value is larger, so the taller bar always fills the
  // track and the shorter one is read against it. Guarded against 0/0.
  const yearly = projection?.yearly ?? 0;
  const barMax = Math.max(yearly, AVERAGE_FRESHER_SALARY, 1);
  const averageWidth = (AVERAGE_FRESHER_SALARY / barMax) * 100;
  const yourWidth = (yearly / barMax) * 100;

  const projectionValue = (value: number | undefined) =>
    projection ? formatRupeesIndian(value ?? 0) : '—';

  return (
    <div className="space-y-6">
      {calcError && (
        <div className="state-error" role="alert">
          {calcError}
        </div>
      )}

      {/* ── 1. membership switcher ──────────────────────────────────────────
          Real radios in a fieldset: arrow keys, screen-reader group semantics
          and form roving focus all come from the browser, with no key handling
          of our own. The inputs are `sr-only` rather than `hidden` — a hidden
          input is not focusable, which would throw all of that away. */}
      <section className="app-card app-card-padding">
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300">
            Your membership
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <label key={pkg.id} className="relative flex">
                <input
                  type="radio"
                  name="earnings-package"
                  value={pkg.id}
                  checked={pkg.id === selectedPackageId}
                  onChange={() => onSelectPackage(pkg.id)}
                  className="peer sr-only"
                />
                <span className="flex w-full cursor-pointer flex-col rounded-lg border border-gray-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-ink-800 peer-checked:border-blue-600 dark:peer-checked:border-mint-500 peer-checked:bg-blue-50 dark:peer-checked:bg-mint-900/20 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 dark:peer-focus-visible:ring-mint-500 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-ink-900">
                  <span className="text-sm font-medium text-gray-900 dark:text-ink-50">
                    {pkg.title}
                  </span>
                  <span className="mt-0.5 text-sm text-gray-600 dark:text-ink-200 tabular-nums">
                    {formatRupeesIndian(pkg.price)}
                    {pkg.courseCount > 0 && (
                      <span className="text-gray-500 dark:text-ink-300">
                        {' · '}
                        {pkg.courseCount} course{pkg.courseCount === 1 ? '' : 's'}
                      </span>
                    )}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-ink-300">
            Pick the package you promote. Your commission rate and what you earn per sale are set
            by the package, so the projection below changes with it.
          </p>
        </fieldset>
      </section>

      {/* ── 2. the slider ──────────────────────────────────────────────────── */}
      <section className="app-card app-card-padding">
        <label
          htmlFor="sales-per-month"
          className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300"
        >
          Sales per month
        </label>
        <p className="mt-2 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-ink-50 tabular-nums">
          {salesPerMonth}
        </p>
        <input
          id="sales-per-month"
          type="range"
          min={MIN_SALES_PER_MONTH}
          max={MAX_SALES_PER_MONTH}
          step={1}
          value={salesPerMonth}
          onChange={(event) => onSalesPerMonthChange(Number(event.target.value))}
          // The bare number a slider announces is meaningless out of context;
          // this makes every drag step read as "27 sales per month".
          aria-valuetext={`${salesPerMonth} sales per month`}
          className="mt-4 w-full cursor-pointer accent-blue-600 dark:accent-mint-500"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-ink-300 tabular-nums">
          <span>{MIN_SALES_PER_MONTH}</span>
          <span>{MAX_SALES_PER_MONTH}</span>
        </div>
        {salesPerMonth !== DEFAULT_SALES_PER_MONTH && (
          <button
            type="button"
            onClick={() => onSalesPerMonthChange(DEFAULT_SALES_PER_MONTH)}
            className="btn-ghost mt-3 -ml-3"
          >
            Reset to {DEFAULT_SALES_PER_MONTH}
          </button>
        )}
      </section>

      {/* ── 3. summary strip ───────────────────────────────────────────────── */}
      <section
        className="app-card app-card-padding grid gap-4 sm:grid-cols-2"
        aria-busy={projectionStale}
      >
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300">
            {selectedPackage?.title ?? 'Selected package'}
          </h2>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-ink-50 tabular-nums">
            {breakdown ? formatRupees(breakdown.earnPerSale) : '—'}
            <span className="ml-2 text-sm font-medium text-gray-600 dark:text-ink-200">per sale</span>
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-ink-300">
            {selectedPackage ? `${formatRate(selectedPackage.commissionRate)} commission` : ''}
            {rateHint ? ` (${rateHint})` : ''}
          </p>
        </div>
        <div className="sm:text-right">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300">
            Total gross / month
          </h2>
          <p
            className={`mt-1 text-2xl font-bold text-blue-700 dark:text-mint-400 tabular-nums transition-opacity motion-reduce:transition-none ${
              projectionStale ? 'opacity-50' : 'opacity-100'
            }`}
          >
            {projectionValue(projection?.monthly)}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-ink-300">
            At {salesPerMonth} sale{salesPerMonth === 1 ? '' : 's'} a month
          </p>
        </div>
      </section>

      {/* ── 4. the itemised breakdown ───────────────────────────────────────
          Note the direction: fees are ADDED to the package price to reach what
          the customer pays, and commission is paid on the base. Every figure is
          the server's. */}
      <section className="app-card app-card-padding">
        <h2 className="text-base font-semibold text-gray-900 dark:text-ink-50">
          How your commission is calculated
        </h2>
        {breakdown ? (
          <dl className="mt-4 text-sm">
            <div className="flex items-baseline justify-between gap-4 py-2">
              <dt className="text-gray-600 dark:text-ink-200">Package price (base)</dt>
              <dd className="font-medium text-gray-900 dark:text-ink-50 tabular-nums">
                {formatRupees(breakdown.base)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2">
              <dt className="text-gray-600 dark:text-ink-200">GST ({formatRate(gstRate)} today)</dt>
              <dd className="font-medium text-gray-900 dark:text-ink-50 tabular-nums">
                + {formatRupees(breakdown.gstAmount)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2">
              <dt className="text-gray-600 dark:text-ink-200">
                Platform + gateway fee ({formatRate(gatewayFeeRate)})
              </dt>
              <dd className="font-medium text-gray-900 dark:text-ink-50 tabular-nums">
                + {formatRupees(breakdown.gatewayFeeAmount)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-gray-200 dark:border-ink-700 py-2 mt-1">
              <dt className="text-gray-700 dark:text-ink-100">Customer pays</dt>
              <dd className="font-semibold text-gray-900 dark:text-ink-50 tabular-nums">
                {formatRupees(breakdown.customerPays)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t-2 border-gray-200 dark:border-ink-700 py-2 mt-2">
              <dt className="text-gray-600 dark:text-ink-200">Commission base</dt>
              <dd className="font-medium text-gray-900 dark:text-ink-50 tabular-nums">
                {formatRupees(breakdown.commissionBase)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2">
              <dt className="text-gray-600 dark:text-ink-200">Your rate</dt>
              <dd className="font-medium text-gray-900 dark:text-ink-50 tabular-nums">
                {selectedPackage ? formatRate(selectedPackage.commissionRate) : '—'}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-gray-200 dark:border-ink-700 py-3 mt-1">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-ink-100">
                You earn per sale
              </dt>
              <dd className="text-xl font-bold text-blue-700 dark:text-mint-400 tabular-nums">
                {formatRupees(breakdown.earnPerSale)}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-gray-500 dark:text-ink-400">
            Choose a package to see how its commission is worked out.
          </p>
        )}
        <p className="mt-3 text-sm text-gray-600 dark:text-ink-300">
          Fees are added on top of the package price. Your commission is paid on the package price
          itself, not on the fees.
        </p>
      </section>

      {/* ── 5. monthly / quarterly / yearly ─────────────────────────────────── */}
      <section aria-busy={projectionStale}>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300">
          If you maintain {salesPerMonth} sale{salesPerMonth === 1 ? '' : 's'}/mo
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Monthly', value: projection?.monthly },
            { label: 'Quarterly', value: projection?.quarterly },
            { label: 'Yearly', value: projection?.yearly },
          ].map((card) => (
            <div key={card.label} className="app-card app-card-padding">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300">
                {card.label}
              </p>
              <p
                className={`mt-2 text-2xl font-bold text-gray-900 dark:text-ink-50 tabular-nums transition-opacity motion-reduce:transition-none ${
                  projectionStale ? 'opacity-50' : 'opacity-100'
                }`}
              >
                {projectionValue(card.value)}
              </p>
            </div>
          ))}
        </div>
        {!projection && !calcError && (
          <p className="mt-3 text-sm text-gray-500 dark:text-ink-400" role="status">
            Working out your projection…
          </p>
        )}
      </section>

      {/* ── 6. income vs average ─────────────────────────────────────────────
          The bars are decorative: both labels and both amounts are real text
          above them, so nothing here is carried by colour or length alone. */}
      <section className="app-card app-card-padding">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300">
          Your income vs. average
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="text-gray-700 dark:text-ink-100">Average fresher salary</span>
              <span className="font-semibold text-gray-900 dark:text-ink-50 tabular-nums">
                {formatRupeesIndian(AVERAGE_FRESHER_SALARY)}
              </span>
            </div>
            <div
              className="mt-1.5 h-3 w-full rounded-full bg-gray-100 dark:bg-ink-800"
              aria-hidden="true"
            >
              <div
                className="h-3 rounded-full bg-gray-400 dark:bg-ink-400 transition-[width] duration-500 motion-reduce:transition-none"
                style={{ width: `${averageWidth}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="text-gray-700 dark:text-ink-100">
                Your projection{' '}
                <span className="text-gray-500 dark:text-ink-300">
                  ({salesPerMonth} sale{salesPerMonth === 1 ? '' : 's'}/mo, a year)
                </span>
              </span>
              <span
                className={`font-semibold text-blue-700 dark:text-mint-400 tabular-nums transition-opacity motion-reduce:transition-none ${
                  projectionStale ? 'opacity-50' : 'opacity-100'
                }`}
              >
                {projectionValue(projection?.yearly)}
              </span>
            </div>
            <div
              className="mt-1.5 h-3 w-full rounded-full bg-gray-100 dark:bg-ink-800"
              aria-hidden="true"
            >
              <div
                className="h-3 rounded-full bg-blue-600 dark:bg-mint-500 transition-[width] duration-500 motion-reduce:transition-none"
                style={{ width: `${yourWidth}%` }}
              />
            </div>
          </div>
        </div>
        {projection && yearly > 0 && (
          <p className="mt-4 text-sm text-gray-600 dark:text-ink-300">
            That is {(yearly / AVERAGE_FRESHER_SALARY).toFixed(1)}× the average fresher salary.
          </p>
        )}
      </section>
    </div>
  );
}
