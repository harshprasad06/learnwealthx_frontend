'use client';

import {
  formatRate,
  formatRupeesIndian,
  type EarningsPackage,
} from '@/app/earnings/types';
import { usePackages } from './usePackages';

/**
 * The affiliate stat strip on `/join`.
 *
 * A CLIENT component because three of its four figures are LIVE: they are
 * derived from `GET /api/earnings/packages` through the page's shared
 * `usePackages` hook. Nothing here is typed in by hand.
 *
 * WHY NOT HARDCODE THEM. "Up to 50%" and "₹3,207 a sale" are commission
 * promises made to someone deciding whether to sell for us. A number baked into
 * markup keeps being displayed long after an admin has changed the rate behind
 * it, and the first anyone hears about the mismatch is an affiliate whose payout
 * is smaller than the page that recruited them said it would be. So this strip
 * reads the catalogue and shows whatever it actually says today; when the
 * catalogue cannot be read, it shows nothing at all.
 *
 * WHY THE SHARED HOOK. Every live number on this page — this strip and the
 * commission table below it — comes from one fetch. Two components each calling
 * the endpoint can disagree mid-render, and a visitor would see two different
 * rates for the same membership on the same screen.
 *
 * The one static item is the payout cadence, which is an operational fact about
 * the programme rather than a figure from the catalogue.
 */

interface Stat {
  /** Pre-formatted for display — the markup never does arithmetic or i18n. */
  value: string;
  label: string;
}

/**
 * Shared so the loading skeleton occupies the exact frame the real strip will,
 * and the page does not jump when the fetch lands. Written as one complete
 * class string, not assembled from fragments, so Tailwind's scanner sees it.
 */
const FRAME_CLASSES =
  'glass grid grid-cols-2 gap-y-8 rounded-2xl px-6 py-8 sm:px-8 lg:grid-cols-4';

/** Four placeholders, keyed by name rather than by index. */
const SKELETON_KEYS = ['count', 'rate', 'commission', 'cadence'] as const;

/**
 * Turn the live catalogue into the four figures, or `null` when it cannot
 * honestly fill them.
 *
 * The two guards are the point of this function:
 *
 *  1. EMPTY ARRAY. `Math.max()` with no arguments is `-Infinity`, and
 *     `formatRate(-Infinity)` renders the string "-Infinity%" straight into the
 *     page. `formatRupeesIndian` already coerces a non-finite input to zero, so
 *     the same bug shows up there as a confident "₹0" instead — arguably worse,
 *     because it looks like a real answer.
 *  2. ALL-ZERO RATES. A catalogue whose commissions are all zero means the rates
 *     have not been configured yet, not that the programme pays nothing. "0%"
 *     and "₹0" are technically what the API said and are still the wrong thing
 *     to put in front of a prospective affiliate.
 *
 * Individual fields are not re-validated: `normalisePackagesResponse` has
 * already coerced every number on the wire to a finite value, so a missing
 * `breakdown.earnPerSale` arrives here as 0 rather than as `undefined`.
 */
function deriveStats(packages: readonly EarningsPackage[]): Stat[] | null {
  if (packages.length === 0) return null;

  const highestRate = Math.max(...packages.map((pkg) => pkg.commissionRate));
  const largestCommission = Math.max(
    ...packages.map((pkg) => pkg.breakdown.earnPerSale),
  );

  if (highestRate <= 0 || largestCommission <= 0) return null;

  return [
    {
      value: String(packages.length),
      // A one-membership catalogue is a real state during a launch, and
      // "1 memberships to share" is the kind of detail that makes a page look
      // unattended.
      label:
        packages.length === 1 ? 'membership to share' : 'memberships to share',
    },
    {
      // "Highest", not "average": it is the number the hero's "up to 50%" is
      // claiming, so this is the strip that has to back it up.
      value: formatRate(highestRate),
      label: 'highest commission rate',
    },
    {
      // Whole rupees. At this size the paise are noise, and "₹3,207.54" reads
      // as a quotation rather than as the headline figure it is here — the
      // itemised version belongs in the hero's worked example.
      value: formatRupeesIndian(largestCommission),
      label: 'largest single commission',
    },
    { value: 'Weekly', label: 'payouts, every Monday' },
  ];
}

export default function Stats() {
  const { packages, loading, error } = usePackages();

  // ALL OR NOTHING. Three of the four figures are live, so a strip that loses
  // them keeps only a payout schedule and reads as broken rather than partial.
  // On a failed fetch — or a catalogue that cannot honestly fill the row —
  // `/join` simply has one band fewer today. The hero above and the commission
  // table below stand on their own, and a visitor sees a shorter page instead
  // of a row of dashes demanding an explanation. Rendering an error box here
  // would be worse still: a recruitment page is not the place to show a
  // stranger our API's problems.
  if (error) return null;

  const stats = loading ? null : deriveStats(packages);
  if (!loading && stats === null) return null;

  return (
    // This section owns its own bottom rhythm rather than leaving it to the
    // page. It takes no props by contract, the hero above it already pads
    // generously, and the section below paints an opaque ground — without this
    // the frosted panel would butt straight up against that hard edge.
    <section
      aria-label="Affiliate programme at a glance"
      className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8"
    >
      {stats === null ? (
        <>
          {/* The skeleton is announced once, in words, rather than by leaving a
              screen reader to make sense of four empty description terms. */}
          <p role="status" className="sr-only">
            Loading affiliate commission figures…
          </p>
          <div aria-hidden="true" className={FRAME_CLASSES}>
            {SKELETON_KEYS.map((key) => (
              <div key={key} className="flex flex-col items-center gap-2">
                <span className="h-9 w-24 rounded-md bg-gray-200/80 motion-safe:animate-pulse dark:bg-ink-800" />
                <span className="h-3 w-32 rounded bg-gray-200/60 motion-safe:animate-pulse dark:bg-ink-800/70" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <dl className={FRAME_CLASSES}>
          {stats.map((stat) => (
            // `flex-col-reverse` puts the big number above its caption on screen
            // while keeping the DOM order <dt> then <dd>, which is what a
            // description list requires.
            <div
              key={stat.label}
              className="flex flex-col-reverse items-center text-center"
            >
              <dt className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-ink-300 sm:text-sm sm:normal-case sm:tracking-normal">
                {stat.label}
              </dt>
              <dd className="font-display text-3xl font-bold tabular-nums text-gray-900 sm:text-4xl dark:text-ink-50">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
