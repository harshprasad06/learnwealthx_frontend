import Link from 'next/link';

/**
 * Home hero — the reference landing hero, adapted to a two-theme site.
 *
 * A server component on purpose: there is no state, no effect and no event
 * handler here, so nothing about it needs to reach the browser as JS. The one
 * piece of behaviour, the pulsing status dot, is CSS (`animate-ping`), and the
 * one piece of navigation is a `<Link>`.
 *
 * All of the surface treatment comes from `app/globals.css` — `.grid-bg`,
 * `.radial-fade`, `.glass`, `.gradient-text`. Those utilities each define a
 * light appearance on `:root` and swap the values under `.dark`, so building
 * the section out of them keeps both themes correct without a second set of
 * colour decisions. Every literal colour written below is therefore a
 * light/dark PAIR; there are no bare `dark:` classes.
 *
 * Deliberately avoided: `ink-400` on an `ink-800` surface measures 4.28:1 and
 * fails AA, so the muted copy here is `ink-300` and the surfaces it sits on are
 * the page ground (`ink-950`) and `.glass`, never `ink-800`.
 */

interface FloatingCard {
  /** Inline SVG path data — the codebase uses inline `<svg>`, not an icon package. */
  path: string;
  label: string;
  subLabel: string;
  /**
   * Where the card floats at `lg` and up. Below `lg` these classes are inert
   * and the cards sit in normal flow underneath the headline, which is the
   * whole point: absolutely positioning them on a phone would drop them on top
   * of the h1.
   */
  position: string;
}

const FLOATING_CARDS: FloatingCard[] = [
  {
    // heroicons v2 outline · sparkles
    path: 'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z',
    label: 'AI Automation',
    subLabel: 'Build agents that work for you',
    position: 'lg:absolute lg:left-0 lg:top-16 lg:w-56',
  },
  {
    // heroicons v2 outline · arrow-trending-up
    path: 'M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941',
    label: 'Wealth Systems',
    subLabel: 'Compound income streams',
    position: 'lg:absolute lg:right-0 lg:top-28 lg:w-56',
  },
  {
    // heroicons v2 outline · currency-rupee
    path: 'M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    label: 'Financial Literacy',
    subLabel: 'Master money mechanics',
    position: 'lg:absolute lg:left-6 lg:bottom-16 lg:w-56',
  },
];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Decorative graph-paper ground. `.radial-fade` masks it so it dissolves
          toward the edges rather than stopping at a hard line. */}
      <div
        aria-hidden="true"
        className="grid-bg radial-fade pointer-events-none absolute inset-0"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          {/* Live-status pill. The ping ring is `motion-safe:` only, so anyone
              who has asked for reduced motion gets the dot without the pulse. */}
          <p className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-ink-200">
            <span aria-hidden="true" className="relative inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75 motion-safe:animate-ping dark:bg-mint-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600 dark:bg-mint-500" />
            </span>
            New cohort open now
          </p>

          <h1 className="text-balance mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-6xl lg:text-7xl dark:text-ink-50">
            Build Your{' '}
            <span className="gradient-text block">Income Streams</span>
          </h1>

          <p className="text-balance mx-auto mt-6 max-w-[65ch] text-lg text-gray-600 dark:text-ink-300">
            Learn the AI, automation and money systems that turn one skill into
            several income streams.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/courses"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-mint-500 dark:text-ink-950 dark:shadow-mint-500/20 dark:hover:bg-mint-400 dark:focus-visible:ring-mint-400 dark:focus-visible:ring-offset-ink-950"
            >
              Explore Memberships
              <svg
                className="h-5 w-5 transition-transform motion-reduce:transition-none group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>

            {/* In-page anchor. The `#what-you-will-learn` id belongs to another
                section; this only links to it. */}
            <a
              href="#what-you-will-learn"
              className="glass inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold text-gray-900 transition-colors hover:bg-gray-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-ink-50 dark:hover:bg-white/10 dark:focus-visible:ring-mint-400 dark:focus-visible:ring-offset-ink-950"
            >
              See What&apos;s Inside
            </a>
          </div>
        </div>

        {/* Floating feature cards.
            Mobile/tablet: a normal stacked grid BELOW the headline.
            `lg` and up: the list becomes a non-interactive overlay and each
            card takes its own absolute slot in the gutters either side of the
            centre column (max-w-7xl minus max-w-3xl leaves ~16rem a side, so
            `lg:w-56` clears the text). The cards carry no links or controls, so
            the overlay is `pointer-events-none` and can never sit in front of
            the CTAs above it. */}
        <ul className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:pointer-events-none lg:absolute lg:inset-0 lg:mt-0 lg:block">
          {FLOATING_CARDS.map((card) => (
            <li
              key={card.label}
              className={`glass flex items-start gap-3 rounded-2xl p-4 ${card.position}`}
            >
              <span className="shrink-0 text-blue-600 dark:text-mint-400">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.path} />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-gray-900 dark:text-ink-50">
                  {card.label}
                </span>
                <span className="mt-0.5 block text-xs text-gray-500 dark:text-ink-300">
                  {card.subLabel}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
