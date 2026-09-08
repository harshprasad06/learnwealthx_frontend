import type { ReactNode } from 'react';
import Link from 'next/link';

/**
 * Frequently asked questions.
 *
 * A native `<details>` / `<summary>` accordion. This is deliberate: the open
 * state, keyboard operation (Enter/Space on a focused summary) and the
 * screen-reader expanded/collapsed announcement all come from the platform, so
 * there is no state to manage, no `aria-expanded` to keep in sync, and no
 * reason for this to be a client component. Do not add a click handler — that
 * is what breaks the free behaviour.
 *
 * The QUESTIONS come from the reference landing design. The ANSWERS are written
 * against what this codebase can actually support, which is narrower than
 * marketing copy usually assumes:
 *
 *  - Lifetime access is safe to affirm: a bundle is one purchase and grants
 *    access to its courses with no renewal (see `app/bundles/[id]/page.tsx`).
 *  - Upgrades are NOT promised. Bundles overlap by design, and buying a second
 *    bundle that shares a course with one already owned is not a flow checkout
 *    handles today, so the answer points at support instead of implying a
 *    self-serve upgrade path.
 *  - The "not for me" answer links to `/refund` and states no policy of its
 *    own. That page is the single source of truth and it is stricter than a
 *    reader might assume, so nothing here may hint at a guarantee or a window.
 *
 * No answer contains an income claim.
 */

interface FaqItem {
  question: string;
  answer: ReactNode;
}

const FAQS: FaqItem[] = [
  {
    question: 'Do I need any prior experience with AI or finance?',
    answer: (
      <>
        No. Every course starts from the basics and assumes no background in either subject.
        Lessons are ordered so each one builds on the one before it, and you can rewatch any
        lesson as many times as you need.
      </>
    ),
  },
  {
    question: 'How is this different from free YouTube content?',
    answer: (
      <>
        Free videos are scattered and unordered; a bundle is a structured curriculum meant to be
        followed start to finish. Your progress is saved lesson by lesson, so you always pick up
        where you left off instead of hunting for what to watch next.
      </>
    ),
  },
  {
    question: 'Is it really a one-time payment for lifetime access?',
    answer: (
      <>
        Yes. A bundle is a single one-time purchase that gives you lifetime access to the courses
        inside it. There is no subscription and nothing to renew, so you can come back to the
        material whenever you want.
      </>
    ),
  },
  {
    question: "What if it's not for me?",
    answer: (
      <>
        Every bundle page lists its full course line-up and lesson breakdown before you pay, so
        you can see exactly what is included and decide beforehand. Our{' '}
        <Link
          href="/refund"
          className="font-medium text-blue-600 hover:text-blue-700 dark:text-mint-400 dark:hover:text-mint-300 underline underline-offset-4 transition-colors"
        >
          Refund Policy
        </Link>{' '}
        sets out the purchase terms in full — please read it before buying.
      </>
    ),
  },
  {
    question: 'Can I upgrade my plan later?',
    answer: (
      <>
        Bundles are built to overlap, so moving between them is not a self-serve step today. We
        add new bundles regularly, so if you want to move from one to another, please{' '}
        <Link
          href="/contact"
          className="font-medium text-blue-600 hover:text-blue-700 dark:text-mint-400 dark:hover:text-mint-300 underline underline-offset-4 transition-colors"
        >
          contact support
        </Link>{' '}
        and we will go through the options with you.
      </>
    ),
  },
  {
    question: 'How much time do I need per week?',
    answer: (
      <>
        There is no schedule to keep up with — the courses are self-paced and your progress is
        saved, so you can study in whatever blocks your week allows. A few focused hours a week is
        enough to keep moving through a bundle steadily.
      </>
    ),
  },
];

export default function Faq() {
  return (
    <section className="relative py-16 sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-bg radial-fade"
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-mint-400">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-ink-50">
            Questions, <span className="gradient-text">answered</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-ink-300">
            Everything worth knowing before you start.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq) => (
            <details key={faq.question} className="glass group rounded-2xl shadow-sm dark:shadow-none">
              <summary
                className="
                  flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl
                  px-5 py-4 text-left text-base font-semibold
                  text-gray-900 dark:text-ink-50
                  list-none [&::-webkit-details-marker]:hidden
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-blue-600 dark:focus-visible:ring-mint-500
                  focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50
                  dark:focus-visible:ring-offset-ink-950
                "
              >
                <span>{faq.question}</span>
                {/* Rotates to point up once the panel is open. `motion-reduce`
                    drops the tween for anyone who has asked for less motion —
                    the chevron still flips, it just does not animate. */}
                <svg
                  className="
                    w-5 h-5 shrink-0 text-gray-500 dark:text-ink-300
                    transition-transform duration-200 group-open:-rotate-180
                    motion-reduce:transition-none
                  "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="px-5 pb-5 -mt-1 text-sm sm:text-base leading-relaxed text-gray-600 dark:text-ink-200">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
