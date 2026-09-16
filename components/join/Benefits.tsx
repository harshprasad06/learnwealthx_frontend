/**
 * "What you get" — the six checkable promises on `/join`.
 *
 * WHY THE HEADING SAYS "CHECKABLE"
 * Affiliate recruitment pages usually sell with testimonials, member counts and
 * earnings screenshots. This one deliberately has none of those, because none of
 * them can be verified by the person reading the page. Every item below is
 * instead a statement about a mechanism the reader can confirm for themselves
 * once they are inside — a rate printed before they promote, a dated wallet row
 * per sale, a dashboard list that is the same list checkout enforces. If a claim
 * cannot be checked from the product, it does not belong in this array.
 *
 * WHY THESE ARE NOT CARDS
 * The section shell, the eyebrow/heading rhythm, the accent tokens and the
 * light/dark pairings are all lifted from `components/home/Pillars.tsx`, which
 * is the established six-up idiom on this site. The one deliberate departure is
 * the per-item treatment: Pillars gives each pillar a `.glass` panel because a
 * pillar is a whole curriculum area carrying an icon and three bullets, and it
 * is the only grid on its page. Here, `HowItWorks` already renders four glass
 * panels directly above these six. Six more identical panels would turn `/join`
 * into ten interchangeable boxes and leave the reader no idea which section is
 * the spine of the page — the four gated steps — and which is supporting detail.
 *
 * So each benefit gets a left rule instead: same type scale, same colours, a
 * fraction of the visual weight. The heavier card treatment is reserved for the
 * numbered steps, where it earns the attention. The rule also does real work at
 * `sm` and `lg`, where it is the only thing separating two or three items
 * sitting shoulder to shoulder in a row.
 *
 * Muted copy stays at `ink-300` on the `ink-950` section surface; `ink-400` here
 * would measure below AA.
 *
 * No state, no effects: this renders as a server component.
 */

interface Benefit {
  title: string;
  description: string;
}

const BENEFITS: readonly Benefit[] = [
  {
    title: 'Lifetime course access',
    description:
      'Buying a membership is a one-time payment. Every course inside stays yours, with no renewal.',
  },
  {
    title: 'Rates set per membership',
    description:
      'Each membership carries its own commission rate, shown in full before you promote anything.',
  },
  {
    title: 'Wallet you can audit',
    description:
      'Every commission appears as a dated wallet transaction tied to the sale that produced it.',
  },
  {
    title: 'Weekly payouts',
    description:
      'Payouts are processed every Monday morning to the bank account on your verified KYC.',
  },
  {
    title: 'Promote only what you own',
    description:
      'Your dashboard lists the memberships you have bought. That is the whole list, and it is enforced at checkout.',
  },
  {
    title: 'One link per membership',
    description:
      'Referral links are per membership, so you always know which share produced which sale.',
  },
];

export default function Benefits() {
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
            What you get
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-ink-50 text-balance">
            Built to be checkable
          </h2>
        </div>

        {/* `gap-x-10` runs wider than the vertical gap on purpose: the left rule
            is the column divider here, and it needs clear air on its left to
            read as a rule rather than as the underline of the item beside it. */}
        <ul className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
          {BENEFITS.map((benefit) => (
            <li
              key={benefit.title}
              className="border-l-2 border-gray-200 dark:border-ink-800 pl-5 transition-colors"
            >
              <h3 className="text-base font-semibold text-gray-900 dark:text-ink-50">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-ink-300">
                {benefit.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
