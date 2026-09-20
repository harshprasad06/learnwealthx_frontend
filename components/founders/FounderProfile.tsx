import Image from 'next/image';
import type { ReactNode } from 'react';

/**
 * ONE LEADER, as a photo beside their story.
 *
 * Profiles alternate sides down the page — photo left, then right, then left.
 * That is the reference design's arrangement and it earns its place here: three
 * identical photo-left rows read as a list of records, while alternating them
 * makes each one its own moment and keeps the eye moving down the page.
 *
 * ── THE PHOTO IS A FIXED SQUARE, AND THE SOURCES ARE NOT ──────────────────
 * The three supplied photographs are 1440×1440, 1200×1600 and 780×1040 — one
 * square and two portrait, at three different resolutions. Rendering them at
 * their natural ratios would give three differently-shaped blocks down the
 * page. They are therefore placed in a fixed square frame with
 * `object-cover object-top`, which crops to a consistent shape; `object-top`
 * rather than the default `object-center` because these are portraits, and
 * centre-cropping a tall photograph is what cuts off foreheads.
 *
 * `sizes` is declared because the frame is capped well below full width. Without
 * it Next serves an image sized for the whole viewport, which on a phone is
 * several times more bytes than the frame can show.
 */

export interface Founder {
  name: string;
  role: string;
  /** Path under /public. */
  image: string;
  /** Pulled out above the bio. Optional — not every leader supplied one. */
  quote?: string;
  /** Paragraphs, in order. */
  bio: readonly string[];
  /** Optional labelled block, e.g. a vision statement. */
  aside?: { label: string; body: string };
  /** Optional bulleted list, e.g. core expertise. */
  list?: { label: string; items: readonly string[] };
  /** Optional sign-off, for a profile written in the first person. */
  signature?: string;
}

interface FounderProfileProps {
  founder: Founder;
  /** Photo on the right instead of the left. */
  reversed?: boolean;
  /** Only the first profile's photo is eager — it is the one above the fold. */
  priority?: boolean;
}

function SubHeading({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-mint-400">
      {children}
    </p>
  );
}

export default function FounderProfile({
  founder,
  reversed = false,
  priority = false,
}: FounderProfileProps) {
  return (
    <article className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
      <div
        className={`relative mx-auto w-full max-w-sm lg:max-w-none ${
          // `lg:order-2` is what flips the photo to the right. Only from `lg`,
          // where the two columns actually sit side by side — on a stacked
          // layout the photo must always come first, or every other profile
          // would open with a wall of text and no face.
          reversed ? 'lg:order-2' : ''
        }`}
      >
        <div className="glass relative aspect-square overflow-hidden rounded-3xl">
          <Image
            src={founder.image}
            alt={`${founder.name}, ${founder.role} at LearnWealthX`}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 40vw, (min-width: 640px) 24rem, 90vw"
            className="object-cover object-top"
          />
        </div>
      </div>

      <div className={reversed ? 'lg:order-1' : ''}>
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-ink-50">
          {founder.name}
        </h2>
        <p className="mt-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-mint-500/15 dark:text-mint-300">
          {founder.role}
        </p>

        {founder.quote && (
          // A real <blockquote>, so the pull quote is structure rather than
          // just larger italic text.
          <blockquote className="mt-6 border-l-2 border-blue-500 dark:border-mint-500 pl-4">
            <p className="text-base sm:text-lg italic leading-relaxed text-gray-800 dark:text-ink-100">
              “{founder.quote}”
            </p>
          </blockquote>
        )}

        <div className="mt-6 space-y-4">
          {founder.bio.map((paragraph) => (
            <p
              key={paragraph.slice(0, 40)}
              className="text-sm sm:text-base leading-relaxed text-gray-600 dark:text-ink-300"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {founder.aside && (
          <div className="glass mt-7 rounded-2xl p-5">
            <SubHeading>{founder.aside.label}</SubHeading>
            <p className="mt-2 text-sm sm:text-base italic leading-relaxed text-gray-700 dark:text-ink-200">
              “{founder.aside.body}”
            </p>
          </div>
        )}

        {founder.list && (
          <div className="mt-7">
            <SubHeading>{founder.list.label}</SubHeading>
            <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2 list-none p-0">
              {founder.list.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-ink-300"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600 dark:bg-mint-500"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {founder.signature && (
          <p className="mt-7 font-display text-base font-semibold text-gray-900 dark:text-ink-50">
            {founder.signature}
          </p>
        )}
      </div>
    </article>
  );
}
