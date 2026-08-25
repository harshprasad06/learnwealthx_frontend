'use client';

import { useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import EarningsCalculator from './EarningsCalculator';
import {
  DEFAULT_SALES_PER_MONTH,
  normalisePackagesResponse,
  readError,
} from './types';
import type { PackagesResponse } from './types';

/**
 * The earnings calculator.
 *
 * Projection only — what a given package pays per sale, and what that comes to
 * over a month, a quarter and a year. It deliberately does NOT show what the
 * visitor has already earned; that lives on the affiliate dashboard.
 *
 * Raw `fetch` with `credentials: 'include'` and a locally declared API_URL,
 * matching every other screen in this app. `lib/api.ts` is unused everywhere and
 * unused here too — it resolves to a body and throws away the HTTP status, which
 * is the only thing distinguishing "not signed in" from a real failure.
 *
 * There is no client-side role gate, because this app has none: no middleware
 * and no auth context. A 401 is rendered as a sentence rather than a redirect.
 *
 * Every number on the page comes from the API. Nothing is computed here, so the
 * page and any future report or email can never disagree about what a sale pays.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function EarningsCalculatorPage() {
  const [packagesData, setPackagesData] = useState<PackagesResponse | null>(null);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [packagesError, setPackagesError] = useState('');

  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [salesPerMonth, setSalesPerMonth] = useState(DEFAULT_SALES_PER_MONTH);

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
      setPackagesError(
        'Could not reach the server to load the packages. Check your connection and retry.'
      );
    } finally {
      setPackagesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  return (
    <div className="app-page">
      <Navbar />
      <main className="app-main">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="section-title">Earnings Calculator</h1>
            <p className="section-subtitle">
              Pick a package and a monthly sales target to see what you would earn.
            </p>
          </div>

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
      </main>
    </div>
  );
}
