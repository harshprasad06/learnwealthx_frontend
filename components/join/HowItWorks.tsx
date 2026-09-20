import type { ReactNode } from 'react';

/**
 * HOW IT WORKS — the path to a first commission.
 *
 * Laid out as the reference design does it: a headline column on the left that
 * states the promise, and the steps as cards on the right. That split works
 * better than a centred heading over a four-across row, because the headline
 * and the steps are read as one sentence rather than as a title and a list.
 *
 * ── WHY THREE STEPS AND NOT FOUR ──────────────────────────────────────────
 * This used to be four: buy, verify, share, get paid. Buying and verifying are
 * both one-off setup that happen before anything can be shared, so they are now
 * one step. Sharing and getting paid are the parts that repeat. Three steps,
 * and the split matches how the process actually feels: set up once, then do
 * the loop.
 *
 * ── WHAT WAS NOT COPIED FROM THE REFERENCE, AND WHY ───────────────────────
 * The reference opens with "Register for Free" and "No investment needed", and
 * promises you can "promote any of our 9+ packages". All three are false here:
 *
 *   - Registration is free, but you cannot earn without owning the membership
 *     you promote. `paymentService.ts` drops the affiliate id at checkout when
 *     no owned Purchase row exists, so a "no investment" promise would send
 *     people to share links that pay them nothing.
 *   - You can promote the memberships you own, not any of them.
 *
 * So the STRUCTURE is the reference's and the CLAIMS are ours. The badges work
 * the same way: "Direct payout" is kept because payouts really do go to the
 * bank account on a verified KYC, and the reference's "FREE!" badge is replaced
 * with "One-time", which is what a membership purchase actually is.
 */

interface Step {
  label: string;
  title: string;
  body: string;
  /** Optional pill, echoing the reference's "FREE!" / "Direct Payout". */
  badge?: string;
  icon: ReactNode;
}

const STEPS: readonly Step[] = [
  {
    label: 'Step 1',
    title: 'Get set up',
    body: 'Buy the membership you want to promote, then submit KYC from your profile. You must be 18 or older. Once it is approved, your affiliate dashboard unlocks.',
    badge: 'One-time',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4M7.8 4.6a3 3 0 0 1 1.7-.7l1-.1a3 3 0 0 0 1.7-.7l.8-.6a3 3 0 0 1 3.8 0l.8.6a3 3 0 0 0 1.7.7l1 .1a3 3 0 0 1 2.7 2.7l.1 1a3 3 0 0 0 .7 1.7l.6.8a3 3 0 0 1 0 3.8l-.6.8a3 3 0 0 0-.7 1.7l-.1 1"
      />
    ),
  },
  {
    label: 'Step 2',
    title: 'Share your link',
    body: 'Your dashboard gives you a unique link for every membership you own. Post it on Instagram, YouTube, WhatsApp, or anywhere your audience already is.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.8 10.2a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.3-1.3m-1.9-7.8a4 4 0 0 1 5.7 0l3 3a4 4 0 0 1-5.7 5.7"
      />
    ),
  },
  {
    label: 'Step 3',
    title: 'Get paid',
    body: 'Commission lands in your wallet the moment the buyer’s payment succeeds. Payouts run automatically every Monday morning to the bank account on your KYC.',
    badge: 'Direct payout',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 6h18v12H3zM3 10h18M7 15h2m4 0h4"
      />
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-bg radial-fade opacity-70"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* `lg:items-start` keeps the headline pinned to the top of its column
            rather than floating to the centre of the taller card column. */}
        <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-12 lg:gap-16 lg:items-start">
          <div>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-blue-700 dark:bg-mint-500/15 dark:text-mint-300">
              How it works
            </span>
            <h2 className="mt-5 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-ink-50 text-balance">
              Three steps to your <span className="gradient-text">first commission</span>.
            </h2>
            {/* The reference says "No investment needed". It is not said here:
                you have to own a membership to earn on it, and that is the one
                expectation this page cannot afford to get wrong. */}
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-gray-600 dark:text-ink-300">
              No experience needed. No targets, no cold calls, nothing to stock. Just your
              network and what you have already learned.
            </p>
          </div>

          <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0">
            {STEPS.map((step) => (
              <li key={step.label} className="glass relative flex flex-col rounded-2xl p-5">
                {step.badge && (
                  <span className="absolute right-4 top-4 rounded-full bg-blue-50 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-blue-700 dark:bg-mint-500/15 dark:text-mint-300">
                    {step.badge}
                  </span>
                )}

                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-mint-500/15 dark:text-mint-300"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                  >
                    {step.icon}
                  </svg>
                </span>

                <span className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-blue-600 dark:text-mint-400">
                  {step.label}
                </span>
                <h3 className="mt-2 font-display text-lg font-bold tracking-tight text-gray-900 dark:text-ink-50">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-ink-300">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
