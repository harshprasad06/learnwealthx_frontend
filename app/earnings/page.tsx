'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import EarningsCalculator from './EarningsCalculator';
import MyEarnings from './MyEarnings';
import {
  DEFAULT_SALES_PER_MONTH,
  normaliseMeResponse,
  normalisePackagesResponse,
  readError,
} from './types';
import type { MeResponse, PackagesResponse } from './types';

/**
 * The affiliate Earnings page.
 *
 * Raw `fetch` with `credentials: 'include'` and a locally declared API_URL,
 * matching every other screen in this app; `lib/api.ts` is unused everywhere and
 * is unused here too — it resolves to a body and throws away the HTTP status,
 * which is the only thing that distinguishes "not signed in" from "not an
 * affiliate" on this page.
 *
 * There is no client-side role gate, because this app has none: no middleware
 * and no auth context. A 401 is rendered as a sentence rather than a redirect.
 *
 * The two panels fetch INDEPENDENTLY and hold independent errors. They fail for
 * different reasons — `/me` needs a session, the package list does not — and a
 * signed-out visitor should still be able to use the calculator to see what the
 * programme pays.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const TABS = [
  { id: 'earnings', label: 'My earnings' },
  { id: 'calculator', label: 'Calculator' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function EarningsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('earnings');

  const [packagesData, setPackagesData] = useState<PackagesResponse | null>(null);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [packagesError, setPackagesError] = useState('');

  const [meData, setMeData] = useState<MeResponse | null>(null);
  const [meLoading, setMeLoading] = useState(true);
  const [meError, setMeError] = useState('');

  // Calculator inputs live here, not in the calculator, so that switching to
  // "My earnings" and back does not silently reset the visitor's slider.
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [salesPerMonth, setSalesPerMonth] = useState(DEFAULT_SALES_PER_MONTH);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/earnings/packages`, { credentials: 'include' });
      if (!res.ok) {
        setPackagesError(await readError(res, 'Could not load the packages'));
        return;
      }
      const body = await res.json().catch(() => null);
      if (body === null) {
        setPackagesError('The server returned a package list this page could not read.');
        return;
      }
      const normalised = normalisePackagesResponse(body);
      setPackagesData(normalised);
      setPackagesError('');
      // The contract sorts cheapest-first, so the first entry is the natural
      // default. Selected by id rather than by index: nothing on this page may
      // assume a package name or a price, so that publishing a new bundle adds
      // a membership option here with no code change at all.
      setSelectedPackageId((current) =>
        current && normalised.packages.some((pkg) => pkg.id === current)
          ? current
          : normalised.packages[0]?.id ?? ''
      );
    } catch {
      setPackagesError('Could not reach the server to load the packages. Check your connection and retry.');
    } finally {
      setPackagesLoading(false);
    }
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/earnings/me`, { credentials: 'include' });
      if (!res.ok) {
        setMeError(await readError(res, 'Could not load your earnings'));
        return;
      }
      const body = await res.json().catch(() => null);
      if (body === null) {
        setMeError('The server returned an earnings summary this page could not read.');
        return;
      }
      setMeData(normaliseMeResponse(body));
      setMeError('');
    } catch {
      setMeError('Could not reach the server to load your earnings. Check your connection and retry.');
    } finally {
      setMeLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
    fetchMe();
  }, [fetchPackages, fetchMe]);

  /**
   * Arrow-key navigation across the tabs, per the WAI-ARIA tabs pattern.
   * Selection follows focus, which is the right choice here because both panels
   * are already loaded — moving through them costs nothing.
   */
  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (index + 1) % TABS.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (index - 1 + TABS.length) % TABS.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = TABS.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setActiveTab(TABS[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="app-page">
      <Navbar />
      <main className="app-main">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="section-title">Earnings</h1>
            <p className="section-subtitle">
              What you have actually earned, plus a projection calculator for what is next.
            </p>
          </div>

          {/* ── pill tabs ───────────────────────────────────────────────────
              Real tablist semantics with a roving tabindex: only the selected
              tab is in the tab order, and the arrow keys move between them. */}
          <div
            role="tablist"
            aria-label="Earnings views"
            className="inline-flex gap-1 rounded-full bg-gray-100 dark:bg-ink-900 p-1 mb-6"
          >
            {TABS.map((tab, index) => {
              const selected = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`earnings-tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls={`earnings-panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-mint-500 ${
                    selected
                      ? 'bg-white dark:bg-ink-800 text-gray-900 dark:text-ink-50 shadow-sm'
                      : 'text-gray-600 dark:text-ink-200 hover:text-gray-900 dark:hover:text-ink-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Both panels stay mounted and the inactive one carries the `hidden`
              attribute, which takes it out of the accessibility tree and out of
              the tab order. That keeps the slider position and the last
              projection alive across a tab switch, at the cost of one extra
              request on load. */}
          <div
            role="tabpanel"
            id="earnings-panel-earnings"
            aria-labelledby="earnings-tab-earnings"
            hidden={activeTab !== 'earnings'}
            tabIndex={0}
          >
            <MyEarnings
              data={meData}
              loading={meLoading}
              error={meError}
              onOpenCalculator={() => setActiveTab('calculator')}
            />
          </div>

          <div
            role="tabpanel"
            id="earnings-panel-calculator"
            aria-labelledby="earnings-tab-calculator"
            hidden={activeTab !== 'calculator'}
            tabIndex={0}
          >
            <EarningsCalculator
              apiUrl={API_URL}
              data={packagesData}
              loading={packagesLoading}
              error={packagesError}
              selectedPackageId={selectedPackageId}
              onSelectPackage={setSelectedPackageId}
              salesPerMonth={salesPerMonth}
              onSalesPerMonthChange={setSalesPerMonth}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
