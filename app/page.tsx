import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import Pillars from '@/components/home/Pillars';
import BundleShowcase from '@/components/home/BundleShowcase';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import Faq from '@/components/home/Faq';
import FinalCta from '@/components/home/FinalCta';

/**
 * The home page.
 *
 * A SERVER COMPONENT, and no longer a client one. It used to hold `'use client'`
 * plus state and two fetches — courses for the old Featured Courses grid, and
 * `/api/auth/me` for a `user` that nothing in the markup ever read. Both are
 * gone: the memberships live in BundleShowcase, which fetches its own data, and
 * the dead user fetch went with them. So the page now ships no JavaScript of its
 * own and makes no request before first paint.
 *
 * Only BundleShowcase is a client component; the rest render on the server. A
 * server component may render client children, so this composition is fine.
 *
 * Section order walks a visitor from claim to proof to price: what this is, the
 * numbers behind it, what you learn, what it costs, how it works, who it worked
 * for, the objections, then the ask.
 */
export default function Home() {
  return (
    <div className="app-page">
      <Navbar />
      <main className="app-main">
        <Hero />
        <Stats />
        <Pillars />
        <BundleShowcase />
        <HowItWorks />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
