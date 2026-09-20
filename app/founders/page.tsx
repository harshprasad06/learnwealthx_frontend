import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FounderProfile, { type Founder } from '@/components/founders/FounderProfile';

/**
 * THE FOUNDERS PAGE.
 *
 * Who runs LearnWealthX, in their own words. A server component: it is three
 * photographs and some prose, none of it per-visitor, so it ships no JavaScript
 * and is prerendered at build time.
 *
 * ── THE COPY IS THEIRS, NOT MINE ──────────────────────────────────────────
 * Every sentence below is transcribed from the biographies the leadership team
 * supplied. Nothing is embellished and no claim has been added: no follower
 * counts, no revenue figures, no awards, no years-in-industry. The reference
 * design this page is modelled on leads with "₹100 Cr+" and "1.5M+ YouTube
 * subscribers"; those are that company's numbers and there is no equivalent
 * here, so this page leads with what these three actually said instead.
 *
 * Ordered by seniority — CEO, COO, CMO — and the profiles alternate sides.
 */
export const metadata: Metadata = {
  title: 'Founders | LearnWealthX',
  description:
    'Meet the team behind LearnWealthX — Mayank Chandra, Founder and CEO; K Mukesh, COO; and Muskan Chakravarti, CMO.',
  alternates: { canonical: '/founders' },
};

const FOUNDERS: readonly Founder[] = [
  {
    name: 'Mr. Mayank Chandra',
    role: 'Founder & CEO',
    image: '/founders/mayank-chandra.jpeg',
    quote:
      'The future belongs to those who build with artificial intelligence. Our mission is to democratize cutting-edge AI skills and ensure every student has an equal path to success.',
    bio: [
      'Welcome! I am Mayank, the Founder and CEO behind our platform. In a world driven by rapid technological evolution, I recognized a major gap between traditional education and the real-world skills demanded by the modern industry. That realization sparked the creation of our EdTech platform — an ecosystem dedicated to helping students master high-demand AI skills, bridge the learning gap, and transform their careers.',
      'We are on a mission to make advanced AI education practical, engaging, and accessible to everyone. Whether a student is taking their very first step into technology or looking to master sophisticated AI tools and workflows, our platform is designed to turn curiosity into real-world competence.',
      'I firmly believe that talent is universal, but opportunities often aren’t. That is why we are deeply committed to providing equal opportunities for everyone, ensuring that anyone with passion and dedication can thrive, regardless of their background.',
      'More than just an educational platform, we believe in growing together. We offer our community members a unique chance to work with us as Growth Partners — collaborating, scaling new heights, and sharing in a journey of mutual success.',
      'Thank you for trusting us as your partner in growth. Let’s build the future of AI, together.',
    ],
    signature: '— Mayank, Founder & CEO',
  },
  {
    name: 'Mr. K Mukesh',
    role: 'COO',
    image: '/founders/k-mukesh.jpeg',
    bio: [
      'As COO, Mukesh focuses on strengthening day-to-day operations, supporting team development, improving learning initiatives, and contributing to the long-term growth and vision of LearnWealthX.',
    ],
    aside: {
      label: 'Vision',
      body: 'To build a future-focused organization where people learn valuable digital skills, turn knowledge into practical action, and grow together through innovation, discipline and continuous learning.',
    },
    list: {
      label: 'Core expertise',
      items: [
        'Online & Digital Industry',
        'AI & Digital Learning',
        'Team Building & Training',
        'Business Operations',
        'Communication & Leadership',
        'Digital Growth & Strategy',
        'People Development',
      ],
    },
  },
  {
    name: 'Ms. Muskan Chakravarti',
    role: 'CMO',
    image: '/founders/muskan-chakravarti.jpeg',
    bio: [
      'The creative force behind brand growth and audience connection — Ms. Muskan Chakravarti focuses on strengthening LearnWealthX through strategic marketing, digital branding, and effective communication. From building brand visibility to engaging new audiences, she works towards creating meaningful growth and opportunities.',
      'With a passion for innovation and leadership, Muskan brings energy, consistency, and a growth-focused mindset to every initiative. She believes in building strong teams, inspiring people, and turning ideas into impactful results.',
    ],
  },
];

export default function FoundersPage() {
  return (
    <div className="app-page">
      <Navbar />
      <main className="app-main">
        <section className="relative py-16 sm:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid-bg radial-fade opacity-70"
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-blue-700 dark:bg-mint-500/15 dark:text-mint-300">
                Leadership
              </span>
              <h1 className="mt-5 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-ink-50 text-balance">
                Meet the minds driving{' '}
                <span className="gradient-text">LearnWealthX</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-gray-600 dark:text-ink-300">
                Three people building a place where practical AI skills are within reach of
                anyone willing to learn them.
              </p>
            </div>
          </div>
        </section>

        {/* `divide-y` rather than a margin on each profile: the rule belongs
            BETWEEN profiles, and a per-item border would also draw one under
            the last. */}
        <section className="relative pb-20 sm:pb-28">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="divide-y divide-gray-200 dark:divide-ink-800">
              {FOUNDERS.map((founder, index) => (
                <div key={founder.name} className="py-12 sm:py-16 first:pt-0">
                  <FounderProfile
                    founder={founder}
                    reversed={index % 2 === 1}
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative pb-20 sm:pb-28">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass rounded-3xl px-6 py-12 sm:px-12 text-center">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-ink-50 text-balance">
                Want to grow with us?
              </h2>
              <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-gray-600 dark:text-ink-300">
                Start with a membership, or get in touch if you would like to talk to the team
                first.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-mint-500 dark:text-ink-950 dark:hover:bg-mint-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-mint-500"
                >
                  Browse memberships
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-300 dark:border-ink-700 px-6 py-3 text-sm font-semibold text-gray-900 dark:text-ink-50 transition-colors hover:bg-gray-100 dark:hover:bg-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-mint-500"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
