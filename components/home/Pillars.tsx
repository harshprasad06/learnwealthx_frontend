/**
 * "What you'll learn" — the six-pillar curriculum grid.
 *
 * The hero links here with an in-page anchor, so `id="what-you-will-learn"`
 * is load-bearing rather than decorative: renaming it breaks that jump.
 * `scroll-mt-20` keeps the heading clear of the sticky header on arrival.
 *
 * Styling comes entirely from the shared landing utilities in `app/globals.css`
 * (`.glass`, `.grid-bg`, `.radial-fade`, `.gradient-text`), each of which
 * already defines a light AND a dark appearance. Nothing here is dark-only:
 * every colour is paired, because light mode is a supported theme on this site
 * even though the reference design was dark-only.
 *
 * Muted copy deliberately sits on the section surface (ink-950) rather than on
 * an `ink-800` fill — `ink-400` on `ink-800` measures 4.28:1 and fails AA — so
 * the palette here stops at `ink-300` for secondary text.
 *
 * No state, no effects: this renders as a server component.
 */

interface Pillar {
  title: string;
  description: string;
  /** Exactly three, matching the reference's card rhythm. */
  bullets: readonly [string, string, string];
  /** `d` attributes for a 24x24 stroked icon, drawn inline (no icon library). */
  iconPaths: readonly string[];
}

const PILLARS: readonly Pillar[] = [
  {
    title: 'AI & Automation',
    description:
      'Build AI agents, automate workflows, and create systems that earn while you sleep.',
    bullets: ['Prompt engineering', 'No-code AI tools', 'Agent frameworks'],
    iconPaths: [
      'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z',
      'M9 9h6v6H9z',
    ],
  },
  {
    title: 'Financial Literacy',
    description:
      'Understand money mechanics — budgeting, investing, taxes, and cash flow management.',
    bullets: ['Personal finance', 'Investing basics', 'Tax optimization'],
    iconPaths: [
      'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.247m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.247',
    ],
  },
  {
    title: 'Wealth Creation',
    description:
      'Design multiple income streams and compounding systems for long-term financial freedom.',
    bullets: ['Income stacking', 'Passive systems', 'Asset building'],
    iconPaths: ['M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'],
  },
  {
    title: 'Business Scaling',
    description:
      'Turn skills into sellable offers. Use AI to scale operations, marketing, and delivery.',
    bullets: ['Offer creation', 'AI operations', 'Growth systems'],
    iconPaths: [
      'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    ],
  },
  {
    title: 'Resource Library',
    description:
      'Templates, prompts, playbooks, and frameworks you can deploy from day one.',
    bullets: ['Prompt vaults', 'Step-by-step playbooks', 'Templates'],
    iconPaths: [
      'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    ],
  },
  {
    title: 'Mentorship & Community',
    description:
      'Live calls, direct guidance, and a community of action-takers holding you accountable.',
    bullets: ['Weekly live calls', 'Private community', 'Direct guidance'],
    iconPaths: [
      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    ],
  },
];

export default function Pillars() {
  return (
    <section
      id="what-you-will-learn"
      className="relative scroll-mt-20 overflow-hidden py-20 sm:py-24 bg-white dark:bg-ink-950 transition-colors"
    >
      {/* Graph-paper grid, dissolved at the edges so it never ends in a hard line. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-bg radial-fade"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-mint-400">
            What you&rsquo;ll learn
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-ink-50 text-balance">
            Six pillars to build <span className="gradient-text">real wealth</span>
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.title}
              className="glass rounded-2xl p-6 flex flex-col transition-colors"
            >
              {/* Tinted icon tile. The heading beside it already names the
                  pillar, so the glyph itself is decorative. */}
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-mint-500/10 dark:text-mint-400">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  {pillar.iconPaths.map((d) => (
                    <path key={d} d={d} />
                  ))}
                </svg>
              </span>

              <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-ink-50">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-ink-300">
                {pillar.description}
              </p>

              <ul className="mt-5 space-y-2 border-t border-gray-200 dark:border-ink-800 pt-4">
                {pillar.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-ink-200"
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-mint-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
