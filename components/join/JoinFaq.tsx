import type { ReactNode } from 'react';
import Link from 'next/link';

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
 * THE ANSWERS ARE PRODUCT TRUTH, NOT MARKETING COPY. Each one is enforced
 * server-side, so softening any of them would put this page at odds with what
 * the backend actually does to a visitor who acts on it:
 *
 *  - OWNERSHIP GATES COMMISSION. You earn only on memberships you own; a link
 *    for a membership you have not bought still completes the buyer's purchase,
 *    it just attributes no commission. Enforced in `paymentService.ts` and
 *    `affiliateService.ts`. That is the one expectation most likely to be got
 *    wrong and most expensive to get wrong, so it is FIRST and it is the only
 *    entry rendered open — a visitor who reads nothing else reads this.
 *  - PAYOUTS are weekly (Monday 09:00) to the bank account on approved KYC;
 *    wallet credit itself is immediate on payment success. Two separate events,
 *    stated separately, because conflating them is what generates "where is my
 *    money" tickets on a Tuesday.
 *  - KYC requires the affiliate to be 18+. Under-18 applications are declined,
 *    and the answer says what a declined applicant keeps (course access) rather
 *    than leaving them to guess they have lost what they paid for.
 *  - THE REFUND ANSWER links to `/refund` and states no policy of its own
 *    beyond the plain fact that sales are final. That page is the single source
 *    of truth and it is stricter than a reader might assume, so nothing here
 *    may hint at a guarantee or a window.
 *
 * "No cap" is a statement about the absence of a ceiling, not a claim about
 * what anyone earns. No answer on this page contains an income claim, and none
 * may acquire one.
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
    question: 'Do I have to buy a membership before I can promote it?',
    defaultOpen: true,
    answer: (
      <>
        Yes. You can only earn on memberships you own. If you share a link for a membership you
        have not purchased, the sale still goes through for the buyer but no commission is
        attributed to you. Buying Alpha lets you promote Alpha; buying Legacy lets you promote
        Legacy.
      </>
    ),
  },
  {
    question: 'Is there a separate fee to become an affiliate?',
    answer: (
      <>
        No. There is no joining fee, monthly fee, or renewal. The only money you spend is on the
        membership itself, which also gives you lifetime access to the courses inside it.
      </>
    ),
  },
  {
    question: 'When and how do I get paid?',
    answer: (
      <>
        Commission is credited to your in-app wallet the moment the buyer&rsquo;s payment succeeds.
        Payouts to your bank account run automatically every Monday at 9:00 AM, to the account on
        your approved KYC.
      </>
    ),
  },
  {
    question: 'What do I need for KYC?',
    answer: (
      <>
        Identity details submitted from your profile, and you must be 18 or older. Applications
        from under-18s are declined — you can still watch every course you bought, but affiliate
        features stay locked until you are eligible.
      </>
    ),
  },
  {
    question: 'Is there a cap on what I can earn?',
    answer: (
      <>
        No cap. Commission is paid on every referred sale at the rate in effect for that
        membership at the time of the sale.
      </>
    ),
  },
  {
    // The written form of the reservation of rights shown under the commission
    // table. It belongs here too because this is where a reader goes looking
    // for the catch, and because the answer is genuinely true: per-bundle rates
    // are editable in the admin panel and the platform default is an
    // environment variable, so a rate can change after someone reads the table.
    question: 'Can the commission rates change?',
    answer: (
      <>
        Yes. LearnWealthX may change, suspend or withdraw commission rates, incentives and the
        affiliate programme itself at any time, at its sole discretion and without prior notice.
        Published rates apply to sales made while they are in effect and are not guaranteed for
        the future. Commission already credited to your wallet for a completed sale is not
        affected by a later change.
      </>
    ),
  },
  {
    question: 'Can I get a refund on a membership?',
    answer: (
      <>
        No. All sales are final and we do not offer refunds on course or membership purchases.
        Please be sure of your choice before you buy — our{' '}
        <Link
          href="/refund"
          className="font-medium text-blue-600 hover:text-blue-700 dark:text-mint-400 dark:hover:text-mint-300 underline underline-offset-4 transition-colors"
        >
          Refund Policy
        </Link>{' '}
        sets out the terms in full.
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

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-mint-400">
            Questions
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-ink-50">
            Before you <span className="gradient-text">join</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-ink-300">
            The rules that actually apply, stated plainly.
          </p>
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
    </section>
  );
}
