import Link from 'next/link';

/**
 * Success Stories — the home page's social-proof band.
 *
 * The quotes, names and role lines here are CARRIED OVER VERBATIM from the
 * "What Our Learners Say" section that this replaces (`app/page.tsx`). Nothing
 * is invented: on a financial-education site a fabricated testimonial is a
 * legal exposure, not a copy shortcut, so this file is a restyling of existing
 * content and must stay that way. If a quote needs to change, it changes with
 * the owner's sign-off — and no earnings figure gets added to any of them.
 *
 * Restyled as `.glass` cards to match the reference landing design. Server
 * component: there is no state and no interactivity beyond one link.
 */

interface Testimonial {
  /** Quote body, WITHOUT the surrounding quote marks — those are rendered. */
  quote: string;
  name: string;
  /** The role line the reference design shows beneath the name. */
  role: string;
  initial: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'The course structure is clear and practical. I was able to apply what I learned to real projects within a week.',
    name: 'Shayam',
    role: 'Video Editing Student',
    initial: 'S',
  },
  {
    quote:
      'Lifetime access and progress tracking make it easy to learn at my own pace, without any pressure.',
    name: 'Anita',
    role: 'Working Professional',
    initial: 'A',
  },
  {
    quote:
      'The affiliate program is transparent and fair. I can clearly see my earnings and payouts from referrals.',
    name: 'Rahul',
    role: 'Affiliate Partner',
    initial: 'R',
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-16 sm:py-20">
      {/* Decorative grid, dissolved at the edges so it never ends in a hard line. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-bg radial-fade"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-mint-400">
            Success Stories
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-ink-50">
            Real feedback from real{' '}
            <span className="gradient-text">learners</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-ink-300">
            Students who have built practical skills with our courses, in their own words.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="glass rounded-2xl p-6 flex flex-col h-full shadow-sm dark:shadow-none"
            >
              <svg
                className="w-8 h-8 text-blue-600/30 dark:text-mint-400/30"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M9.5 5.5A6.5 6.5 0 0 0 3 12v5.5A1.5 1.5 0 0 0 4.5 19h4A1.5 1.5 0 0 0 10 17.5v-4A1.5 1.5 0 0 0 8.5 12H6a3.5 3.5 0 0 1 3.5-3.5V5.5Zm11 0A6.5 6.5 0 0 0 14 12v5.5A1.5 1.5 0 0 0 15.5 19h4a1.5 1.5 0 0 0 1.5-1.5v-4a1.5 1.5 0 0 0-1.5-1.5H17a3.5 3.5 0 0 1 3.5-3.5V5.5Z" />
              </svg>

              <blockquote className="mt-4 text-sm sm:text-base text-gray-700 dark:text-ink-100 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-auto flex items-center gap-3 pt-6">
                <span
                  aria-hidden="true"
                  className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold bg-blue-600 text-white dark:bg-mint-500 dark:text-ink-950"
                >
                  {testimonial.initial}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-900 dark:text-ink-50">
                    {testimonial.name}
                  </span>
                  <span className="block text-xs text-gray-600 dark:text-ink-300">
                    {testimonial.role}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-gray-600 dark:text-ink-300">
          <Link
            href="/courses"
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-mint-400 dark:hover:text-mint-300 underline underline-offset-4 transition-colors"
          >
            Browse the bundles
          </Link>{' '}
          and see what is inside each one.
        </p>
      </div>
    </section>
  );
}
