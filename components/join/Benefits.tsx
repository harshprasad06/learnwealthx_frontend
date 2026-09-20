import type { ReactNode } from 'react';

/**
 * WHY TRUST US — the six things the programme offers, as a tile grid.
 *
 * Laid out as the reference does it: the headline held in a column on the left,
 * the tiles in a 3×2 grid on the right, each a filled panel with an icon chip
 * above its label.
 *
 * ── THE TINTS ─────────────────────────────────────────────────────────────
 * The reference gives each tile its own pastel. These are the same six
 * positions, rendered in this app's own palette rather than a second one: a
 * blue family in light, the mint family in dark, varied by weight rather than
 * by hue so the grid reads as one set. The icon chip stays a plain white /
 * ink-900 square in every tile, which is what gives the reference grid its
 * rhythm.
 *
 * ── THE CLAIMS ────────────────────────────────────────────────────────────
 * Six labels, matching the reference. Two of them describe things this
 * codebase can demonstrate on its own — lifetime access (a membership is one
 * purchase with no renewal) and updated content. The other four —
 * MSME certification, the private community, upgrading between memberships and
 * niche guidance — are business facts that live outside this repository. They
 * are published here on the owner's instruction. If any of them stops being
 * true, this is the file to change: nothing else on the page repeats them.
 */

interface Benefit {
  title: string;
  /** Tailwind classes for the tile's fill. */
  tint: string;
  icon: ReactNode;
}

const BENEFITS: readonly Benefit[] = [
  {
    title: 'Lifetime Access',
    tint: 'bg-blue-50 dark:bg-mint-500/10',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.2 9.8a3.5 3.5 0 1 0 0 4.4M18.2 9.8 12 12l6.2 2.2M12 12H4m0 0-1.5-1.5M4 12l-1.5 1.5"
      />
    ),
  },
  {
    title: 'MSME Certified',
    tint: 'bg-indigo-50 dark:bg-mint-400/10',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4M5 4h14v12a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"
      />
    ),
  },
  {
    title: 'Private Community',
    tint: 'bg-sky-50 dark:bg-mint-300/10',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zm10 13v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"
      />
    ),
  },
  {
    title: 'Upgrade Anytime',
    tint: 'bg-blue-50 dark:bg-mint-500/10',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-8.5-6M3 12a9 9 0 0 1 9-9 9 9 0 0 1 8.5 6M12 16V8m0 0-3 3m3-3 3 3"
      />
    ),
  },
  {
    title: 'Updated Content',
    tint: 'bg-sky-50 dark:bg-mint-300/10',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 0v6h6M9 15l2 2 4-4"
      />
    ),
  },
  {
    title: 'Niche Guidance',
    tint: 'bg-indigo-50 dark:bg-mint-400/10',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm3.5-12.5-2 5-5 2 2-5z"
      />
    ),
  },
];

export default function Benefits() {
  return (
    <section className="relative py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-bg radial-fade opacity-70"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-12 lg:gap-16 lg:items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-blue-700 dark:bg-mint-500/15 dark:text-mint-300">
              Why trust us
            </span>
            <h2 className="mt-5 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-ink-50 text-balance">
              Built on transparency.{' '}
              <span className="gradient-text">Backed by results.</span>
            </h2>
          </div>

          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4 list-none p-0">
            {BENEFITS.map((benefit) => (
              <li
                key={benefit.title}
                className={`flex flex-col justify-between rounded-2xl p-5 min-h-[9.5rem] ${benefit.tint}`}
              >
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-ink-900 text-blue-600 dark:text-mint-400 shadow-sm dark:shadow-none"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                  >
                    {benefit.icon}
                  </svg>
                </span>
                <h3 className="mt-6 font-display text-base font-bold leading-snug tracking-tight text-gray-900 dark:text-ink-50">
                  {benefit.title}
                </h3>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
