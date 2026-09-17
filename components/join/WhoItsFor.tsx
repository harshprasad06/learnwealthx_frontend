'use client';

import { useState } from 'react';

/**
 * WHO THE PROGRAMME IS FOR — an expanding panel row.
 *
 * Five audience segments sit side by side. One is open at a time: it widens to
 * show its paragraph while the rest stay narrow, showing only an icon and a
 * title. Pointing at a panel opens it.
 *
 * ── WHY NOT HOVER ALONE ───────────────────────────────────────────────────
 * The reference design opens these on hover. Hover does not exist on a phone,
 * and it is not reachable from a keyboard, so hover alone would hide four
 * fifths of this section's copy from a large share of readers. Three inputs
 * open a panel here:
 *
 *   - `onMouseEnter` — the pointer behaviour the design asks for.
 *   - `onFocus`      — every panel is a real <button>, so Tab walks them and
 *                      focusing one opens it. Focus-visible rings come free.
 *   - `onClick`      — taps on touch devices, where the first tap would
 *                      otherwise be swallowed as a synthetic hover.
 *
 * Below `md` the row stops being a row: all five render stacked and fully
 * expanded. A 60px-wide collapsed panel on a phone is unreadable, and there is
 * no pointer there to widen it with.
 *
 * ── WHY ONE ACCENT AND NOT FIVE ───────────────────────────────────────────
 * The reference gives each card its own pastel — lilac, amber, pink, peach,
 * mint. This app has a two-colour system (blue in light, mint in dark) applied
 * with discipline across every other surface, and five new hues would read as a
 * different site's section pasted in. The open panel takes the accent; the
 * closed ones stay neutral glass. The expansion itself carries the hierarchy,
 * which is what the interaction was for.
 *
 * At rest the first panel is open, so the section never presents as five blank
 * columns waiting to be touched.
 */

interface Segment {
  id: string;
  title: string;
  body: string;
  /** Inline SVG path data, 24×24 viewBox. */
  icon: string;
}

/**
 * The five segments, in the reference's order.
 *
 * Copy is written against what this programme actually offers: you promote
 * memberships you own, links are per membership, and payouts are weekly. No
 * segment is promised an income, a replacement salary, or a time commitment,
 * because none of those are things this business can honour.
 */
const SEGMENTS: readonly Segment[] = [
  {
    id: 'students',
    title: 'Students',
    body:
      'Already building an audience? Share what you are genuinely studying. A recommendation from someone actually taking the course reads as advice rather than an advert — and the membership you bought to learn from is the one you can earn on.',
    icon: 'M12 3 1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17z',
  },
  {
    id: 'professionals',
    title: 'Working professionals',
    body:
      'You already know which skills your industry pays for. Point people at the ones you use day to day. It runs alongside a full-time job because there is nothing to schedule — no calls, no targets, no stock to hold.',
    icon: 'M10 2h4a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2m4 4V4h-4v2z',
  },
  {
    id: 'creators',
    title: 'Content creators & influencers',
    body:
      'You have the audience and, more importantly, their trust. Promoting a membership you have been through yourself is the difference between a recommendation and a paid placement. Your followers can usually tell which is which.',
    icon: 'M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11z',
  },
  {
    id: 'freelancers',
    title: 'Freelancers & digital marketers',
    body:
      'Income that does not need another client call. You get one link per membership you own, so you always know which post, reel or newsletter produced which sale — and you can drop what is not working.',
    icon: 'M3.9 12A5.1 5.1 0 0 1 9 6.9h3V5H9a7 7 0 0 0 0 14h3v-1.9H9A5.1 5.1 0 0 1 3.9 12M8 13h8v-2H8m7-6h-3v1.9h3A5.1 5.1 0 0 1 20.1 12 5.1 5.1 0 0 1 15 17.1h-3V19h3a7 7 0 0 0 0-14',
  },
  {
    id: 'homemakers',
    title: 'Homemakers',
    body:
      'Fit it around the day you already have. Nothing here runs to a timetable: share a link when you have a moment, and commission lands in your wallet the moment someone buys through it.',
    icon: 'M12 3 2 12h3v8h6v-6h2v6h6v-8h3z',
  },
];

export default function WhoItsFor() {
  /**
   * `null` = nothing open. The row rests with all five panels closed and opens
   * one only while it is pointed at or focused. Leaving the first panel open at
   * rest made it look pre-selected, and the row never returned to a neutral
   * state once the pointer had been anywhere near it.
   */
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="relative py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-bg radial-fade opacity-70"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-blue-700 dark:bg-mint-500/15 dark:text-mint-300">
            Who it is for
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-ink-50 text-balance">
            You do not need an <span className="gradient-text">audience of millions</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-ink-300">
            You need people who trust what you recommend. That is the whole requirement.
          </p>
        </div>

        {/* The row. `md:h-[24rem]` fixes the height so widening a panel cannot
            reflow the page; below `md` the height is released and the panels
            stack at their natural size. */}
        {/* `md:items-end` bottom-aligns the row, so the open panel grows UPWARD
            past its neighbours rather than all five sharing one height. That
            height difference is most of what makes the open panel read as
            selected in the reference design. */}
        <ul
          className="mt-12 flex flex-col md:flex-row md:items-end gap-3 list-none p-0"
          // Closing on leave is what returns the row to its resting state.
          // Without it the last panel touched would stay open for good.
          onMouseLeave={() => setActive(null)}
        >
          {SEGMENTS.map((segment, index) => {
            const open = index === active;

            return (
              <li
                key={segment.id}
                className="min-w-0 md:transition-[flex-grow] md:duration-[450ms] motion-reduce:transition-none"
                style={{
                  flexBasis: 0,
                  // 1.7 : 1. At 2.2 the four closed panels fell under ~200px and
                  // "Content creators & influencers" still wrapped to three
                  // lines. Closed panels need to hold a two-line title without
                  // re-wrapping — that is the constraint that sets this number,
                  // not the look of the open one.
                  flexGrow: open ? 1.7 : 1,
                  // Decelerating curve: fast at the start so the panel answers
                  // the pointer immediately, then settles.
                  transitionTimingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
                }}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`${segment.id}-body`}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onClick={() => setActive(index)}
                  className={[
                    'group relative flex w-full flex-col justify-end overflow-hidden rounded-3xl p-6 text-left',
                    // NO FIXED HEIGHT. The panel is exactly as tall as its
                    // content plus `p-6`, which is what makes the space above
                    // the icon equal the space below the title — a fixed height
                    // with bottom-anchored content put all the slack on top.
                    //
                    // It also means the open panel grows by exactly the height
                    // of its paragraph. Combined with `items-end` on the row,
                    // that growth happens upward, so the open panel still rises
                    // above its neighbours without any height being hardcoded.
                    // `height` is deliberately NOT in this list — the panel has
                    // no fixed height any more, and `auto` cannot be animated.
                    // Its growth is driven entirely by the paragraph's
                    // `0fr`→`1fr` grid track below, which animates smoothly.
                    'transition-[background-color,border-color] duration-[450ms] motion-reduce:transition-none',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    'focus-visible:ring-blue-500 dark:focus-visible:ring-mint-500 dark:focus-visible:ring-offset-ink-950',
                    open
                      ? 'glass-strong ring-1 ring-blue-500/40 dark:ring-mint-400/40 bg-blue-50/60 dark:bg-mint-500/10'
                      : 'glass hover:bg-gray-50 dark:hover:bg-ink-900',
                  ].join(' ')}
                >
                  {/* THE FIXED-WIDTH CONTENT BLOCK — the whole trick.
                      Text inside a panel whose width is animating re-wraps on
                      every frame, and re-wrapping text is what reads as jank.
                      So the copy is laid out once at the OPEN panel's width and
                      never reflows; the panel's own `overflow-hidden` clips it
                      while closed.

                      Icon, title and body are ONE bottom-anchored group. They
                      were split before — icon pinned to the top, title pushed to
                      the bottom by `mt-auto` — which left a band of dead space
                      through the middle of every closed panel. */}
                  <div className="w-[17rem] max-w-full">
                    <span
                      aria-hidden="true"
                      className={[
                        'mb-4 flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 motion-reduce:transition-none',
                        open
                          ? 'bg-blue-600 text-white dark:bg-mint-500 dark:text-ink-950'
                          : 'bg-blue-50 text-blue-600 dark:bg-mint-500/15 dark:text-mint-300',
                      ].join(' ')}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d={segment.icon} />
                      </svg>
                    </span>

                    {/* Two lines' worth of height, always. Four of these titles
                        wrap to two lines and "Homemakers" does not, so without a
                        floor the one-line title sat lower than its neighbours
                        and dragged its icon down with it — five icons and five
                        titles on five different baselines. Reserving the second
                        line puts them all on two. */}
                    <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-gray-900 dark:text-ink-50 md:min-h-[3.5rem]">
                      {segment.title}
                    </h3>

                    {/* COLLAPSING WITHOUT A HEIGHT ANIMATION.
                        A closed panel must not reserve space for its paragraph
                        — with the group bottom-anchored, reserved space pushes
                        the icon and title straight out through the top of the
                        card, where `overflow-hidden` clips them.

                        Animating `height` to `auto` is not possible, and a fixed
                        pixel height would be wrong for five paragraphs of
                        different lengths. So this is the `0fr` → `1fr` grid
                        track: a grid row CAN be animated between those two, and
                        `1fr` resolves to exactly the content's natural height.
                        The child carries `overflow-hidden` so it is clipped
                        while the track closes.

                        The paragraph stays in the DOM throughout, so screen
                        readers and find-in-page still reach every segment's
                        copy. */}
                    <div
                      className={[
                        // Base `1fr` is the mobile state: stacked panels are all
                        // open, so every paragraph is visible. Only from `md` up
                        // does the closed state collapse the track. This has to
                        // be classes rather than an inline style — an inline
                        // style cannot be breakpoint-scoped, so it would have
                        // collapsed four of five paragraphs on phones too.
                        'grid grid-rows-[1fr]',
                        'md:transition-[grid-template-rows] md:duration-[450ms] motion-reduce:transition-none',
                        open ? 'md:grid-rows-[1fr]' : 'md:grid-rows-[0fr]',
                      ].join(' ')}
                      style={{ transitionTimingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1)' }}
                    >
                      <p
                        id={`${segment.id}-body`}
                        className={[
                          'overflow-hidden text-sm leading-relaxed text-gray-600 dark:text-ink-300',
                          'md:transition-opacity md:duration-300 motion-reduce:transition-none',
                          open ? 'pt-3 opacity-100 md:delay-150' : 'pt-3 opacity-100 md:opacity-0',
                        ].join(' ')}
                      >
                        {segment.body}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
