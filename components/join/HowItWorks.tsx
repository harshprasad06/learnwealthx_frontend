/**
 * "How it works" — the four-step affiliate funnel on `/join`.
 *
 * WHY THIS IS NUMBERED AND THE HOME-PAGE VERSION'S NUMBERING IS COSMETIC
 * On the home page the three steps are a narrative you could read in any order.
 * Here the numbers are a dependency chain the backend actually enforces, and
 * each one is a real gate rather than a suggestion:
 *
 *   1. Buying gates attribution — a referral is only credited for a bundle the
 *      referrer owns, so there is no link to share until a purchase exists.
 *   2. KYC approval (18+ required) is what flips the affiliate dashboard on;
 *      without it there is nowhere to read a link from.
 *   3. Referral links are issued PER BUNDLE, not one per account, which is why
 *      step 1 has to name a specific membership before step 3 can exist.
 *   4. Commission is written at payment success; the payout cron runs weekly on
 *      Monday 09:00.
 *
 * Every claim in the copy below maps to one of those behaviours. Nothing here
 * is aspirational — if the backend rules change, this copy is wrong and must
 * change with them. That is also why there are no numbers, testimonials or
 * income figures in this section: the only things stated are things the system
 * guarantees.
 *
 * The connector arrow is drawn only from `lg` up, where all four panels sit in
 * one row. At `sm` they wrap to a 2x2 grid, where an arrow off the right edge
 * of item 2 would point at item 1 on the next line — backwards. The <ol> keeps
 * the sequence available to assistive tech at every width regardless.
 *
 * Colours are paired light/dark throughout: light mode uses the built-in
 * gray/blue scales, dark mode the custom ink/mint scales via `dark:` only.
 *
 * No state, no effects: this renders as a server component.
 */

interface Step {
  title: string;
  description: string;
}

const STEPS: readonly Step[] = [
  {
    title: 'Buy a membership',
    description:
      'You promote what you own. Buying Alpha lets you share Alpha — and gives you lifetime access to every course inside it.',
  },
  {
    title: 'Verify your identity',
    description:
      'Submit KYC from your profile. You must be 18 or older. Approval unlocks the affiliate dashboard.',
  },
  {
    title: 'Share your link',
    description:
      'Your dashboard gives a unique link per membership you own. Post it anywhere — WhatsApp, Instagram, YouTube.',
  },
  {
    title: 'Get paid',
    description:
      'Commission lands in your wallet as soon as the buyer’s payment succeeds. Payouts run every Monday morning.',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24 bg-white dark:bg-ink-950 transition-colors">
      {/* Graph-paper grid, dissolved at the edges so it never ends in a hard line. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-bg radial-fade"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-mint-400">
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-ink-50 text-balance">
            Four steps, in this order
          </h2>
          <p className="mt-4 text-gray-600 dark:text-ink-300">
            Each one unlocks the next. You cannot share a link before steps 1 and 2 are done.
          </p>
        </div>

        <ol className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              <div className="glass rounded-2xl p-6 h-full transition-colors">
                {/* The numeral is the whole point of this section, so it leads
                    the panel. `tabular-nums` keeps 1–4 optically identical in
                    width, which matters once the panels sit side by side. */}
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

              {/* Connector, spanning the `gap-8` to the next panel. Decorative —
                  the ordered list already carries the sequence — and drawn only
                  at `lg`, the one breakpoint where "next" is always to the
                  right. See the note at the top of the file. */}
              {index < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="hidden lg:flex absolute top-12 left-full w-8 -translate-y-1/2 items-center"
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
