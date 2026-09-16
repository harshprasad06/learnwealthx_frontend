'use client';

import {
  commissionSourceHint,
  formatRate,
  formatRupees,
  formatRupeesIndian,
} from '@/app/earnings/types';
import { usePackages } from './usePackages';

/**
 * The commission table on `/join` — what one sale is actually worth.
 *
 * This is the section the hero's "#commissions" link points at, and the one a
 * prospective affiliate reads before deciding. So it quotes NUMBERS, not
 * adjectives: every rupee and every percentage on this screen comes from
 * `GET /api/earnings/packages` via `usePackages`. Nothing here is multiplied,
 * estimated or rounded into a nicer-looking headline — the backend owns the
 * commission arithmetic so that this page, `/earnings` and any future payout
 * report cannot drift apart.
 *
 * A REAL TABLE, not a grid of divs. Five columns of comparable values across a
 * handful of memberships is the textbook case for tabular semantics: `<th
 * scope>` is what lets a screen reader announce "Alpha Membership, You earn,
 * ₹3,207.54" instead of reading five unmoored numbers in a row.
 *
 * THE MIDDLE ROW IS EMPHASISED, matching `BundleShowcase`'s `featuredIndex = 1`
 * convention on the home page — the same three memberships, the same middle
 * tier argued for, so a visitor who arrives here from the pricing section sees
 * the same recommendation twice rather than two different ones. And as there,
 * the emphasis is claimed ONLY when there are exactly three rows: with two or
 * four there is no genuine middle to point at, and a badge on an arbitrary row
 * would be a recommendation made up by the layout.
 */

/** A ladder needs a genuine middle before anything can be called its middle. */
const FEATURED_TIER_COUNT = 3;

/**
 * Money for the table cells, in Indian digit grouping, with paise shown only
 * when the amount actually has them — `₹2,898`, `₹736.09`, `₹14,793`.
 *
 * Both branches are the shared helpers from `app/earnings/types`; this only
 * CHOOSES between them, it does not format anything itself. The choice matters
 * because commission lands on fractional rupees (`₹3,207.54` is the real
 * figure and must not be rounded away on the page an affiliate decides from),
 * while a whole-rupee price rendered as `₹2,898.00` reads as a quotation rather
 * than as the price it is — the same stance `BundleShowcase` takes.
 *
 * `formatRupeesIndian` is also the safe landing for a non-finite value, so a
 * half-populated response renders `₹0`, never `₹NaN`.
 */
function formatMoney(rupees: number): string {
  const hasPaise = Number.isFinite(rupees) && Math.round(rupees * 100) % 100 !== 0;
  return hasPaise ? formatRupees(rupees) : formatRupeesIndian(rupees);
}

export default function CommissionTable() {
  const { data, packages, loading, error, reload } = usePackages();

  // Only claim a "most popular" row when there is a genuine middle to point at.
  const featuredIndex = packages.length === FEATURED_TIER_COUNT ? 1 : -1;

  return (
    <section id="commissions" className="relative py-20 sm:py-28 scroll-mt-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-bg radial-fade opacity-70"
      />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-blue-700 dark:bg-mint-500/15 dark:text-mint-300">
            Commission structure
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-ink-50 text-balance">
            What one sale is <span className="gradient-text">worth</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-ink-300">
            Every membership carries its own rate. Commission is calculated on the membership
            price, before the payment-gateway fee the buyer pays on top.
          </p>
        </div>

        {loading ? (
          <div className="state-loading mt-14">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-b-transparent border-blue-600 dark:border-mint-400" />
            <p className="mt-3 text-sm">Loading commission rates…</p>
          </div>
        ) : error ? (
          // The error carries the reason (a 404 while the endpoint is still
          // being deployed reads very differently from an unreachable server),
          // and `reload` is offered rather than asking for a page refresh —
          // this section owns the fetch, so it can own the retry.
          <div className="mt-14 max-w-md mx-auto">
            <div className="state-error" role="alert">
              {error}
            </div>
            <div className="mt-4 text-center">
              <button type="button" onClick={reload} className="btn-secondary">
                Try again
              </button>
            </div>
          </div>
        ) : packages.length === 0 ? (
          // No rows means no rates to quote. An empty table with headers would
          // imply the commission is zero; say instead that nothing is published
          // yet, which is what an empty `packages` array actually means.
          <div className="mt-14 max-w-md mx-auto text-center">
            <div className="glass rounded-2xl px-6 py-10">
              <p className="text-sm font-medium text-gray-900 dark:text-ink-50">
                Commission rates are not published yet
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-ink-300">
                Memberships are built from the course bundles on sale. As soon as the first one
                is live, its rate appears here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* The scroll lives HERE, on the table's own wrapper, so a narrow
                phone scrolls five columns sideways inside this card while the
                page body stays put. `min-w` on the table is what gives it
                something to scroll: without it the columns crush instead. */}
            <div className="mt-14 glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[42rem] border-collapse text-left">
                  <caption className="sr-only">
                    Commission earned per sale, by membership
                  </caption>
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-ink-800">
                      <th
                        scope="col"
                        className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300"
                      >
                        Membership
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300"
                      >
                        Buyer pays
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300"
                      >
                        Rate
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-300"
                      >
                        You earn
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map((pkg, index) => {
                      const featured = index === featuredIndex;
                      // Null for any `commissionSource` value we have not seen
                      // a real example of — an unknown enum token echoed into
                      // the UI would be worse than saying nothing.
                      const rateHint = commissionSourceHint(pkg.commissionSource);

                      return (
                        <tr
                          key={pkg.id}
                          className={`border-b border-gray-200 last:border-b-0 dark:border-ink-800 ${
                            featured ? 'bg-blue-50/70 dark:bg-mint-500/10' : ''
                          }`}
                        >
                          {/* A row header, not a plain cell: it is what a screen
                              reader pairs with each column heading. */}
                          <th
                            scope="row"
                            className="px-5 py-4 text-left align-top font-normal"
                          >
                            <span className="flex flex-wrap items-center gap-2">
                              <span
                                className={`font-display text-base text-gray-900 dark:text-ink-50 ${
                                  featured ? 'font-bold' : 'font-semibold'
                                }`}
                              >
                                {pkg.title}
                              </span>
                              {featured && (
                                <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white dark:bg-mint-500 dark:text-ink-950 whitespace-nowrap">
                                  Most popular
                                </span>
                              )}
                            </span>
                            <span className="mt-1 block text-xs text-gray-500 dark:text-ink-300 tabular-nums">
                              {pkg.courseCount} {pkg.courseCount === 1 ? 'course' : 'courses'}
                            </span>
                          </th>

                          <td className="px-5 py-4 text-right align-top text-sm text-gray-700 dark:text-ink-200 tabular-nums whitespace-nowrap">
                            {formatMoney(pkg.price)}
                          </td>

                          {/* Price plus GST plus the gateway fee — the figure
                              the buyer's card is actually charged, and NOT the
                              figure commission is calculated on. Both are shown
                              so the gap is visible rather than surprising. */}
                          <td className="px-5 py-4 text-right align-top text-sm text-gray-500 dark:text-ink-300 tabular-nums whitespace-nowrap">
                            {formatMoney(pkg.breakdown.customerPays)}
                          </td>

                          <td className="px-5 py-4 text-right align-top whitespace-nowrap">
                            <span
                              className={`text-sm tabular-nums ${
                                featured
                                  ? 'font-semibold text-gray-900 dark:text-ink-50'
                                  : 'font-medium text-gray-700 dark:text-ink-200'
                              }`}
                            >
                              {formatRate(pkg.commissionRate)}
                            </span>
                            {rateHint && (
                              <span className="mt-1 block text-[0.7rem] text-gray-500 dark:text-ink-300">
                                {rateHint}
                              </span>
                            )}
                          </td>

                          <td
                            className={`px-5 py-4 text-right align-top tabular-nums whitespace-nowrap ${
                              featured
                                ? 'text-lg font-bold text-blue-700 dark:text-mint-400'
                                : 'text-base font-semibold text-gray-900 dark:text-ink-50'
                            }`}
                          >
                            {formatMoney(pkg.breakdown.earnPerSale)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Where these numbers come from. `data` is non-null whenever there
                are rows to render, but it is checked rather than defaulted: a
                sentence quoting "the platform default of 0%" because the data
                was missing would be a claim, not a fallback. */}
            {data && (
              <div className="mt-6 space-y-1.5 text-xs text-gray-500 dark:text-ink-300">
                <p>
                  Rates are set per membership in the admin panel; a membership with no rate of
                  its own inherits the platform default of{' '}
                  <span className="font-medium text-gray-700 dark:text-ink-200 tabular-nums">
                    {formatRate(data.platformCommissionRate)}
                  </span>
                  .
                </p>
                {/* GST is zero today, and a "GST 0%" line is noise dressed up as
                    disclosure. The line appears the day the rate does. */}
                {data.rates.gstRate > 0 && (
                  <p>
                    GST of{' '}
                    <span className="font-medium text-gray-700 dark:text-ink-200 tabular-nums">
                      {formatRate(data.rates.gstRate)}
                    </span>{' '}
                    is added to the membership price at checkout.
                  </p>
                )}
                <p>
                  The payment-gateway fee of{' '}
                  <span className="font-medium text-gray-700 dark:text-ink-200 tabular-nums">
                    {formatRate(data.rates.gatewayFeeRate)}
                  </span>{' '}
                  is paid by the buyer on top of the price, which is why &ldquo;Buyer pays&rdquo;
                  is higher than &ldquo;Price&rdquo;. Your commission is calculated on the
                  price, not on the fee.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
