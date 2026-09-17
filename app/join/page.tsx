import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/join/Hero';
import Stats from '@/components/join/Stats';
import HowItWorks from '@/components/join/HowItWorks';
import WhoItsFor from '@/components/join/WhoItsFor';
import CommissionTable from '@/components/join/CommissionTable';
import Benefits from '@/components/join/Benefits';
import JoinFaq from '@/components/join/JoinFaq';
import FinalCta from '@/components/join/FinalCta';

/**
 * THE AFFILIATE JOIN PAGE.
 *
 * The recruitment pitch for the affiliate programme: what a sale pays, what you
 * have to do first, and what the programme will and will not do for you.
 *
 * ── SEPARATE FROM /earnings, ON PURPOSE ───────────────────────────────────
 * These two pages read the same endpoint and could easily have been one. They
 * are not, and the split is deliberate:
 *
 *   /earnings  is the TOOL. A calculator, and nothing else. Someone already
 *              interested arrives, moves a slider, and leaves with a number.
 *   /join      is the PITCH. It answers "should I do this at all?" — the
 *              ownership requirement, KYC, the payout schedule, the refund
 *              policy — and hands the calculator off to /earnings.
 *
 * So this page carries NO calculator. The two CTAs that want one link to
 * /earnings instead. One implementation of the slider, one place to fix it, and
 * neither page is a worse version of the other. If a future change makes them
 * overlap again, delete one rather than letting both drift.
 *
 * ── A SERVER COMPONENT ────────────────────────────────────────────────────
 * Like `app/page.tsx`. Only `Stats` and `CommissionTable` are client components,
 * because only they read live commission rates; the rest render on the server
 * and ship no JavaScript. A server component may render client children, so this
 * composition is fine.
 *
 * Section order walks a visitor from the offer to the objections: what you earn,
 * the numbers behind it, what you must do first, what every membership pays,
 * what you get, what you are probably worried about, then the ask.
 */
export const metadata: Metadata = {
  title: 'Affiliate Programme | LearnWealthX',
  description:
    'Share the LearnWealthX memberships you own and earn commission on every referred sale. See the rate for each membership, how payouts work, and what you need to start.',
  alternates: { canonical: '/join' },
};

export default function JoinPage() {
  return (
    <div className="app-page">
      <Navbar />
      <main className="app-main">
        <Hero />
        <Stats />
        <HowItWorks />
        <WhoItsFor />
        <CommissionTable />
        <Benefits />
        <JoinFaq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
