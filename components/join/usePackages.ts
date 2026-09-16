'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  normalisePackagesResponse,
  readError,
  type EarningsPackage,
  type PackagesResponse,
} from '@/app/earnings/types';

/**
 * THE ONE CLIENT for `GET /api/earnings/packages` on the affiliate join page.
 *
 * Every live number on `/join` — the stat strip, the commission table — comes
 * from this single fetch. The sections do not each call the API: two fetches of
 * the same endpoint on one page can disagree mid-render (an admin editing a
 * rate between them), and would show a visitor two different commission rates
 * for the same membership on the same screen.
 *
 * WHY THE WIRE TYPES ARE IMPORTED RATHER THAN REDECLARED
 * `/join` and `/earnings` are deliberately separate pages with no shared UI —
 * the calculator lives only on `/earnings`. But they read the SAME endpoint, so
 * they must agree about its shape. `app/earnings/types.ts` already owns that
 * contract, including the normalisation that stops a half-populated response
 * from crashing a render on `undefined.toFixed(2)`. Duplicating those types here
 * would create a second definition free to drift from the server. The types are
 * shared; the components are not.
 */
export interface UsePackagesResult {
  data: PackagesResponse | null;
  packages: EarningsPackage[];
  loading: boolean;
  error: string;
  reload: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function usePackages(): UsePackagesResult {
  const [data, setData] = useState<PackagesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // PUBLIC endpoint — no credentials needed. `/join` is a recruitment page,
      // so it must render identically for a signed-out visitor; sending
      // credentials would work but would imply a per-user answer that this
      // endpoint does not give.
      const res = await fetch(`${API_URL}/api/earnings/packages`);
      if (!res.ok) {
        setError(await readError(res, 'Could not load commission rates'));
        return;
      }
      const body = await res.json().catch(() => null);
      setData(normalisePackagesResponse(body));
      setError('');
    } catch {
      setError('Could not reach the server to load commission rates.');
    } finally {
      setLoading(false);
    }
    // NOTE: a failed reload leaves the PREVIOUS `data` in place, so `packages`
    // and `error` can both be non-empty at once. That is deliberate — a
    // transient network blip should not blank a table the visitor is reading —
    // but it means every consumer must check `error` BEFORE rendering figures,
    // or it will present stale commission rates as current ones.
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Cheapest first, so the table reads as a ladder. `?? 0` not `|| 0`: a
  // genuinely free membership must sort as free, not as missing data.
  //
  // MEMOISED because the sort allocates. Without this, `packages` would be a new
  // array identity on every render, and any consumer that put it in a
  // `useEffect` or `useMemo` dependency list would re-run forever. No section
  // does that today; the memo is what stops the next one from having to know.
  const packages = useMemo(
    () => [...(data?.packages ?? [])].sort((a, b) => (a.price ?? 0) - (b.price ?? 0)),
    [data]
  );

  return { data, packages, loading, error, reload: load };
}
