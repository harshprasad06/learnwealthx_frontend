/**
 * Home stat strip.
 *
 * A server component: pure presentation, no state, no effects.
 *
 * The figures are PROPS, not markup. Two reasons, and the second is the
 * important one:
 *
 *  1. They are marketing copy. The owner has to be able to change them without
 *     a code change, and eventually to feed them from the API.
 *  2. On a financial-education site an earnings figure is a regulated claim.
 *     Hardcoding something like "₹4.2 Cr paid out" into a component means an
 *     unsubstantiated payout claim ships the moment anyone renders it, and
 *     stays live until someone remembers to edit it. So the DEFAULTS below are
 *     deliberately conservative and non-monetary — catalogue size, learners,
 *     rating, and the one genuinely verifiable product property (lifetime
 *     access). Nothing about money is claimed by default.
 *
 * Every colour is a light/dark pair. The muted caption is `ink-300`, not
 * `ink-400`: `ink-400` on an `ink-800` surface measures 4.28:1 and fails AA.
 */

export interface Stat {
  /** Pre-formatted for display — the component never does arithmetic or i18n. */
  value: string;
  label: string;
}

export interface StatsProps {
  /** Defaults to {@link DEFAULT_STATS}. Pass 3–4 for the layout to read well. */
  stats?: Stat[];
  /** Escape hatch for the page assembler to own the vertical rhythm. */
  className?: string;
}

/**
 * Conservative placeholders. NOT verified — these need the owner's sign-off
 * (and ideally a source) before launch. Only "Lifetime / Access to every
 * module" is a product property rather than a metric.
 */
export const DEFAULT_STATS: Stat[] = [
  { value: '40+', label: 'Courses in the catalogue' },
  { value: '12k+', label: 'Learners enrolled' },
  { value: '4.7', label: 'Avg rating' },
  { value: 'Lifetime', label: 'Access to every module' },
];

export default function Stats({ stats = DEFAULT_STATS, className = '' }: StatsProps) {
  // An empty array is a caller mistake (or an API that returned nothing);
  // render nothing rather than an empty frosted bar.
  if (stats.length === 0) return null;

  return (
    <section
      aria-label="Platform at a glance"
      className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}
    >
      <dl className="glass grid grid-cols-2 gap-y-8 rounded-2xl px-6 py-8 sm:px-8 lg:grid-cols-4">
        {stats.map((stat) => (
          // `flex-col-reverse` puts the big number above its caption on screen
          // while keeping the DOM order <dt> then <dd>, which is what a
          // description list requires.
          <div key={stat.label} className="flex flex-col-reverse items-center text-center">
            <dt className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-ink-300 sm:text-sm sm:normal-case sm:tracking-normal">
              {stat.label}
            </dt>
            <dd className="font-display text-3xl font-bold tabular-nums text-gray-900 sm:text-4xl dark:text-ink-50">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
