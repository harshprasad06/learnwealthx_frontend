import type { ReactNode } from 'react';

/**
 * Affiliate FAQ for `/join`.
 *
 * A native `<details>` / `<summary>` accordion, matching `components/home/Faq.tsx`.
 * This is deliberate: the open state, keyboard operation (Enter/Space on a
 * focused summary) and the screen-reader expanded/collapsed announcement all
 * come from the platform, so there is no state to manage, no `aria-expanded` to
 * keep in sync, and no reason for this to be a client component. Do not add a
 * click handler — that is what breaks the free behaviour.
 *
 * ── THE COPY IS THE PUBLISHED PROGRAMME TERMS ─────────────────────────────
 * These six questions and answers are the terms as the business publishes
 * them. They are NOT derived from this codebase, and two of them currently
 * describe a programme the backend does not yet implement:
 *
 *   "Do I need to buy a course before I can promote it?" answers NO, and the
 *   free-to-join answer says the same in other words. The running backend
 *   disagrees: `paymentService.ts` looks for a successful Purchase row for the
 *   referred bundle and, finding none, drops the affiliate id and records the
 *   sale unattributed. So an affiliate who acts on this answer today shares a
 *   link, the buyer completes the purchase, and the affiliate is paid nothing.
 *
 * Making the page true means removing that ownership check server-side. Until
 * that happens these two answers are a promise the system does not keep, and
 * this comment is here so whoever reads the file next knows which way the gap
 * runs rather than discovering it from a support ticket.
 *
 * The commission figure (~10%) matches the constants in `CommissionTable.tsx`
 * and has the same caveat: the backend pays each bundle's own configured rate.
 *
 * "No limit" is a statement about the absence of a ceiling, not a claim about
 * what anyone earns. No answer here contains an income claim, and none may
 * acquire one.
 */
interface JoinFaqItem {
  question: string;
  answer: ReactNode;
  /** Renders this entry expanded on first paint. Reserved for the one answer a
   *  visitor must not be able to miss — see the note above. */
  defaultOpen?: boolean;
}

const FAQS: JoinFaqItem[] = [
  {
    question: 'Is it really free to join? Are there any hidden charges?',
    answer: (
      <>
        Yes, joining is completely free. There is no registration fee, no monthly subscription
        and no hidden charges. You only ever earn from the programme — you never pay us to be
        part of it.
      </>
    ),
  },
  {
    question: 'Do I need to buy a course before I can promote it?',
    defaultOpen: true,
    answer: (
      <>
        No. You can promote any package without purchasing them yourself. Your earnings come
        purely from genuine sales made through your unique referral link, not from any purchase
        you make.
      </>
    ),
  },
  {
    question: 'How much commission do I earn per sale?',
    answer: (
      <>
        You earn approximately 10% commission on every package sold through your referral link.
        The exact rupee amount for each package is listed in the commission table above, so you
        always know what a sale is worth before you share it.
      </>
    ),
  },
  {
    question: 'Is there a limit on how much I can earn?',
    answer: (
      <>
        No limit. There is no cap on the number of sales you can make or on the commission you
        can earn. The more people who buy through your link, the more you earn.
      </>
    ),
  },
  {
    question: 'Who can join? Do I need experience or a big following?',
    answer: (
      <>
        Anyone 18 or older can join. You do not need prior experience, a large following or any
        technical skill — students, working professionals, creators, freelancers and homemakers
        all do well here. What matters is having people who trust what you recommend.
      </>
    ),
  },
  {
    question: 'Do I get lifetime access and support?',
    answer: (
      <>
        Yes. Every package you buy gives you lifetime access to the courses inside it, with no
        renewal. Our team is on hand to help with your account, your referral links and your
        payouts.
      </>
    ),
  },
];

export default function JoinFaq() {
  return (
    <section className="relative py-16 sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-bg radial-fade"
      />

      {/* TWO COLUMNS, as the reference lays it out: the question the section
          answers on the left, the accordion on the right. The headline stays
          on screen beside the list instead of scrolling away above it, and the
          "Talk to us" escape hatch sits with it — so the one question this page
          does not answer still has somewhere to go.

          `lg:items-start` pins the left column to the top rather than centring
          it against a much taller accordion. */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-10 lg:gap-16 lg:items-start">
          <div>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-blue-700 dark:bg-mint-500/15 dark:text-mint-300">
              FAQs
            </span>
            <h2 className="mt-5 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-ink-50 text-balance">
              What would you like to <span className="gradient-text">know about</span>?
            </h2>
            <a
              href="/contact"
              className="mt-7 inline-flex items-center gap-2 rounded-xl border border-gray-300 dark:border-ink-700 px-5 py-3 text-sm font-semibold text-gray-900 dark:text-ink-50 hover:bg-gray-100 dark:hover:bg-ink-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-mint-500"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-3.8-.9L3 21l2-4.9A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" />
              </svg>
              Talk to us
            </a>
          </div>

          <div className="space-y-3">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              open={faq.defaultOpen}
              className="glass group rounded-2xl shadow-sm dark:shadow-none"
            >
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
      </div>
    </section>
  );
}
