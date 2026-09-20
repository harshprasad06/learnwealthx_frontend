'use client';

import { useEffect, useState } from 'react';

/**
 * The greeting at the top of the affiliate dashboard.
 *
 * ── WHY IT FETCHES ITS OWN USER ───────────────────────────────────────────
 * `GET /api/affiliate/me` returns the affiliate record — referral code, click
 * and signup counts, earnings — and no name, because nothing on that screen
 * needed one until now. Rather than widen that response and require a backend
 * deploy for a line of text, this reads `GET /api/auth/me`, exactly as the
 * Navbar already does on every page. It is a small, already-warm request.
 *
 * ── NO HONORIFIC ──────────────────────────────────────────────────────────
 * "Welcome back, Harsh", not "Welcome back, Mr Harsh". The account record holds
 * a name and an email and nothing else: there is no title field and no gender
 * field, so any honorific would be inferred from the name. That inference is
 * wrong often enough that it would greet real customers with the wrong title on
 * the first line of their dashboard. The bare first name is warmer anyway.
 *
 * ── RESERVED SPACE, NOT A SPINNER ─────────────────────────────────────────
 * The block keeps its height while the name loads and renders the neutral
 * "Welcome back" until it arrives. A spinner, or collapsing to nothing, would
 * make the whole dashboard jump down the moment the request returns.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * The name to greet someone by.
 *
 * First word of their display name; failing that the local part of their email,
 * which is a better guess at a human's name than showing them nothing. Both are
 * trimmed, because a stored name of `"  "` is not a name.
 */
function greetingName(name: string | null, email: string | null): string | null {
  const firstWord = (name ?? '').trim().split(/\s+/)[0];
  if (firstWord) return firstWord;

  const localPart = (email ?? '').split('@')[0]?.trim();
  return localPart || null;
}

export default function DashboardGreeting() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
        if (!res.ok) return;
        const body = await res.json().catch(() => null);
        // Guarded against an unmount mid-flight: this sits above a dashboard
        // people navigate away from quickly.
        if (!cancelled) {
          setName(greetingName(body?.user?.name ?? null, body?.user?.email ?? null));
        }
      } catch {
        // A failed greeting is not worth an error state. The neutral wording
        // below reads perfectly well without a name.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-ink-50">
        Welcome back{name ? <>, <span className="gradient-text">{name}</span></> : ''}
      </p>
      <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-ink-300">
        Learn something new every day.
      </p>
    </div>
  );
}
