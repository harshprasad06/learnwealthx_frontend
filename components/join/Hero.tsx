import Link from 'next/link';

/**
 * Affiliate join hero — the top of `/join`.
 *
 * A SERVER component on purpose. Everything here is static copy and two links;
 * there is no state, no effect and no event handler, so none of it needs to
 * reach the browser as JavaScript. The live numbers on this page arrive lower
 * down, in the sections that call `usePackages`. Keeping the first screen out
 * of the client bundle is the whole reason the page is split this way: a
 * recruitment page is judged on how fast its promise renders.
 *
 * WHAT THIS SECTION HAS TO DO. A visitor landing here has usually already
 * bought a membership and is asking one question — "how much do I actually
 * get?". So the left column states the offer in words and the right column
 * answers the question with an itemised worked example, rather than making them
 * scroll to the commission table to find out.
 *
 * Surface treatment comes from `app/globals.css` — `.grid-bg`, `.radial-fade`,
 * `.glass`, `.gradient-text`. Each of those defines a light appearance on
 * `:root` and swaps the values under `.dark`, so building the section out of
 * them keeps both themes correct without a second set of colour decisions.
 * Every literal colour below is a light/dark PAIR; light mode uses Tailwind's
 * gray/blue, dark mode uses `ink`/`mint` through `dark:` variants only.
 *
 * Muted copy is `ink-300`, never `ink-400`: `ink-400` on an `ink-800` surface
 * measures 4.28:1 and fails AA, and the card below is a `.glass` panel that can
 * sit over either ground.
 */

interface ExampleRow {
  label: string;
  /** Pre-formatted for display — this component does no arithmetic. */
  value: string;
  /**
   * The payout line. Exactly one row carries this: it is the number the whole
   * section exists to show, and emphasising two would emphasise neither.
   */
  payout?: boolean;
}

/**
 * The worked example in the right-hand column — ONE Alpha Membership sale.
 *
 * HARDCODED DELIBERATELY, and the only hardcoded money on this page. Every
 * other figure on `/join` is read live from `GET /api/earnings/packages` via
 * `usePackages`, because a commission rate quoted to a prospective affiliate is
 * a promise and has to match what the catalogue actually pays. This card is the
 * exception because it is ILLUSTRATIVE COPY, not data: it is here to make the
 * offer legible in the first screen, in a server component that deliberately
 * does not fetch, and it is labelled as one specific membership rather than
 * presented as a general rate.
 *
 * These are the REAL CURRENT CATALOGUE VALUES for the Alpha Membership.
 * REVIEW THIS BLOCK IF ALPHA'S PRICE OR COMMISSION RATE CHANGES — a stale
 * worked example sitting a screen above a live commission table that disagrees
 * with it is worse than no example at all.
 *
 * Reading the rows: commission is paid on the MEMBERSHIP PRICE, not on what the
 * buyer pays. Per the `/api/earnings/*` contract (see `app/earnings/types.ts`),
 * GST and the payment-gateway fee are added ON TOP of the price at checkout, so
 * "buyer pays" is the larger number while the commission base stays ₹7,729 —
 * 7729 × 0.415 = 3207.535, shown as ₹3,207.54. The result is written out rather
 * than computed so that whoever reviews this file checks the exact figure a
 * visitor will read.
 */
const EXAMPLE_ROWS: ExampleRow[] = [
  { label: 'Membership price', value: '₹7,729' },
  { label: 'Commission rate', value: '41.5%' },
  { label: 'Buyer pays at checkout', value: '₹7,969' },
  { label: 'You earn', value: '₹3,207.54', payout: true },
];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Decorative graph-paper ground. `.radial-fade` masks it so it dissolves
          toward the edges instead of stopping at a hard line. Purely visual, so
          it is hidden from assistive tech and cannot swallow a click. */}
      <div
        aria-hidden="true"
        className="grid-bg radial-fade pointer-events-none absolute inset-0"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        {/* Two columns from `lg` up, stacked below. The copy is first in the DOM
            in both cases, so a phone reads the offer before the arithmetic —
            which is the order the argument is actually made in. `items-center`
            keeps the card optically level with the headline block rather than
            stretching it to the full column height. */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="glass inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-ink-200">
              Affiliate programme
            </p>

            <h1 className="text-balance mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-ink-50">
              Earn from the membership{' '}
              <span className="gradient-text">you already own</span>.
            </h1>

            {/* `max-w-[65ch]` rather than a column width: the measure is a
                property of the text, so it holds at every breakpoint instead of
                only at the one the grid was tuned for. */}
            <p className="mt-6 max-w-[65ch] text-lg text-gray-600 dark:text-ink-300">
              Buy a membership, verify your identity once, and share your link.
              You keep up to 50% of the price on every sale you refer — credited
              to your wallet the moment the payment clears.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Primary CTA points DOWN the page, not away from it. The
                  commission table is the evidence for the claim in the lede, so
                  the strongest button keeps the visitor on `/join` and lets the
                  page finish its argument. */}
              <Link
                href="#commissions"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-mint-500 dark:text-ink-950 dark:shadow-mint-500/20 dark:hover:bg-mint-400 dark:focus-visible:ring-mint-400 dark:focus-visible:ring-offset-ink-950"
              >
                See what each sale pays
                <svg
                  className="h-5 w-5 transition-transform motion-reduce:transition-none group-hover:translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                  />
                </svg>
              </Link>

              {/* Sized to match the primary button rather than reusing
                  `.btn-secondary`: that component is `px-4 py-2 text-sm`, built
                  for form and card controls, and next to a hero-scale primary
                  it reads as a disabled sibling instead of a second choice. */}
              <Link
                href="/earnings"
                className="glass inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold text-gray-900 transition-colors hover:bg-gray-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-ink-50 dark:hover:bg-white/10 dark:focus-visible:ring-mint-400 dark:focus-visible:ring-offset-ink-950"
              >
                Open the earnings calculator
              </Link>
            </div>

            {/* Answers the two objections that otherwise stop the scroll here:
                "which memberships can I promote?" and "what does joining cost
                me?". Both are product facts, not claims. */}
            <p className="mt-6 text-sm text-gray-500 dark:text-ink-300">
              You can promote any membership you have purchased. No separate
              affiliate fee.
            </p>
          </div>

          {/* The worked example. A `<dl>` because that is exactly what it is —
              four labelled values — and it means a screen reader announces each
              figure with the label it belongs to instead of reading eight
              disconnected strings. `lg:justify-self-end` stops the card from
              stretching to the full grid column, which at desktop widths would
              leave the numbers marooned at opposite edges of one long row. */}
          <div className="glass-strong w-full rounded-2xl p-6 sm:p-8 lg:max-w-md lg:justify-self-end">
            <h2 className="font-display text-base font-semibold text-gray-900 dark:text-ink-50">
              One Alpha Membership sale
            </h2>

            <dl className="mt-6 space-y-0">
              {EXAMPLE_ROWS.map((row) => (
                <div
                  key={row.label}
                  className={
                    row.payout
                      ? // The payout gets a rule above it and extra breathing
                        // room: it is the conclusion of the three rows above,
                        // and the separator is what makes it read that way.
                        'mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-gray-900/10 pt-4 dark:border-white/10'
                      : 'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2'
                  }
                >
                  <dt
                    className={
                      row.payout
                        ? 'text-sm font-semibold text-gray-900 dark:text-ink-50'
                        : 'text-sm text-gray-600 dark:text-ink-300'
                    }
                  >
                    {row.label}
                  </dt>
                  {/* `tabular-nums` so the digits line up in a column of money;
                      proportional figures make ₹7,729 and ₹7,969 look like
                      different lengths and invite a double-take. */}
                  <dd
                    className={
                      row.payout
                        ? 'font-display text-3xl font-bold tabular-nums text-blue-600 dark:text-mint-400'
                        : 'text-base font-medium tabular-nums text-gray-900 dark:text-ink-50'
                    }
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
