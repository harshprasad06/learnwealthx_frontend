import Link from 'next/link';

/**
 * Closing call-to-action band, ported from the reference landing design.
 *
 * The CTA points at `/courses`, NOT `/signup`. That route is the catalogue and
 * it lists BUNDLES, which are the only purchasable product on this platform
 * (see the note at the top of `app/courses/page.tsx`), so a visitor lands on
 * what they would actually be buying instead of on an account form. Signing up
 * happens inside checkout, once there is something to check out with.
 *
 * `.glass-strong` panel over a `.grid-bg .radial-fade` backdrop. Server
 * component — one link, no state.
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
            Start building <span className="gradient-text">today</span>
          </h2>

          <p className="mt-5 mx-auto max-w-xl text-base sm:text-lg text-gray-600 dark:text-ink-200">
            Built for action-takers. Browse the bundles, see exactly which courses are inside each
            one, and begin with whichever matches where you are headed.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/courses"
              className="
                inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5
                text-base font-semibold shadow-sm transition-colors
                bg-blue-600 text-white hover:bg-blue-700
                dark:bg-mint-500 dark:text-ink-950 dark:hover:bg-mint-400
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-blue-600 dark:focus-visible:ring-mint-500
                focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50
                dark:focus-visible:ring-offset-ink-950
              "
            >
              Browse bundles
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
          </div>

          <p className="mt-6 text-sm text-gray-600 dark:text-ink-300">
            One-time purchase. Lifetime access to the courses in your bundle.
          </p>
        </div>
      </div>
    </section>
  );
}
