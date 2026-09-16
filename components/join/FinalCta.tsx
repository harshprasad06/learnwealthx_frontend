import Link from 'next/link';

/**
 * Closing call-to-action band for `/join`.
 *
 * The PRIMARY action is `/courses`, not a sign-up form. That route is the
 * catalogue and it lists the memberships, which are the only purchasable
 * product on this platform (see the note at the top of `app/courses/page.tsx`).
 * Sending a would-be affiliate there rather than to an account form is the
 * whole argument of this page: you earn on what you own, so the first step is
 * choosing which membership to buy, not registering as an affiliate. Signing up
 * happens inside checkout, once there is something to check out with.
 *
 * The SECONDARY action is `/earnings`, the commission calculator — a projection
 * of what a given membership pays per sale. It is secondary on purpose: the
 * numbers there are worth nothing to someone who has not yet picked a
 * membership, and leading with them would invert the point the headline makes.
 *
 * Nothing here quotes a rate or a total. Every live figure on this page comes
 * from `GET /api/earnings/packages` (see `components/join/usePackages.ts`), so a
 * number hard-coded into this band could silently contradict the rate an admin
 * set. No income claim, here or anywhere on `/join`.
 *
 * `.glass-strong` panel over a `.grid-bg .radial-fade` backdrop. Server
 * component — two links, no state.
 */

export default function FinalCta() {
  return (
    <section className="relative py-16 sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-bg radial-fade"
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-strong rounded-3xl px-6 py-12 sm:px-12 sm:py-16 text-center shadow-sm dark:shadow-none">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-ink-50">
            Start with the membership you want to{' '}
            <span className="gradient-text">learn from</span>
          </h2>

          <p className="mt-5 mx-auto max-w-xl text-base sm:text-lg text-gray-600 dark:text-ink-200">
            The one you buy is the one you can sell. Pick the level that fits what you actually
            want to study.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/courses"
              className="
                inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-7 py-3.5
                text-base font-semibold shadow-sm transition-colors
                bg-blue-600 text-white hover:bg-blue-700
                dark:bg-mint-500 dark:text-ink-950 dark:hover:bg-mint-400
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-blue-600 dark:focus-visible:ring-mint-500
                focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50
                dark:focus-visible:ring-offset-ink-950
              "
            >
              Browse memberships
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>

            <Link
              href="/earnings"
              className="
                inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-7 py-3.5
                text-base font-semibold transition-colors
                border border-gray-300 text-gray-900 hover:bg-gray-100
                dark:border-ink-700 dark:text-ink-50 dark:hover:bg-ink-800
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-blue-600 dark:focus-visible:ring-mint-500
                focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50
                dark:focus-visible:ring-offset-ink-950
              "
            >
              Open the earnings calculator
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-600 dark:text-ink-300">
            No joining fee. You earn only on memberships you own.
          </p>
        </div>
      </div>
    </section>
  );
}
