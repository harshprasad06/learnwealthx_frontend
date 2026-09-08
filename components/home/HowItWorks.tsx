/**
 * "How It Works" — a restyle, not a rewrite.
 *
 * The three steps, their titles and their copy are carried across verbatim from
 * the section this replaces (previously inline in `app/page.tsx`). Only the
 * presentation is new: `.glass` panels and `font-display` numerals from the
 * reference landing idiom, in place of the old `.app-card` + circular-badge
 * treatment.
 *
 * The numbering is kept because this is a genuine sequence — you browse, then
 * enrol, then track — and the connector between panels encodes that direction.
 * It is drawn only from `md` up, where the steps actually sit side by side; on
 * mobile the panels stack and a horizontal arrow would point nowhere.
 *
 * Every colour is paired light/dark: the reference was dark-only, this site is
 * not. Secondary copy stays at `ink-300` on the section surface and never lands
 * `ink-400` on an `ink-800` fill, which would fail AA at 4.28:1.
 *
 * No state, no effects: this renders as a server component.
 */

interface Step {
  title: string;
  description: string;
}

const STEPS: readonly Step[] = [
  {
    title: 'Browse Courses',
    description:
      'Explore our catalog and find the course that matches your goals and skill level.',
  },
  {
    title: 'Enroll & Learn',
    description:
      'Purchase once and get lifetime access. Learn at your own pace with structured modules.',
  },
  {
    title: 'Track Progress',
    description:
      'Resume where you left off, complete lessons, and track your improvement over time.',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24 bg-white dark:bg-ink-950 transition-colors">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-bg radial-fade"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-mint-400">
            Getting started
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-ink-50 text-balance">
            How It Works
          </h2>
          <p className="mt-4 text-gray-600 dark:text-ink-300">
            Getting started is simple. Follow these three steps to begin your learning journey.
          </p>
        </div>

        <ol className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              <div className="glass rounded-2xl p-6 h-full transition-colors">
                <span
                  aria-hidden="true"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-mint-500/10 dark:text-mint-400 font-display text-xl font-bold tabular-nums"
                >
                  {index + 1}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-ink-50">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-ink-300">
                  {step.description}
                </p>
              </div>

              {/* Connector, spanning the grid gap to the next panel. Decorative:
                  the ordered list already conveys the sequence to assistive
                  tech, and it is hidden below `md` where the panels stack. */}
              {index < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="hidden md:flex absolute top-12 left-full w-8 -translate-y-1/2 items-center"
                >
                  <span className="h-px flex-1 bg-gray-300 dark:bg-ink-700" />
                  <svg
                    className="h-3 w-3 shrink-0 text-gray-400 dark:text-ink-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
