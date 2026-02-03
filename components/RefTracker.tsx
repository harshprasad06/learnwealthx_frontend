'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function RefTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (!ref) return;

    fetch(`${API_URL}/api/affiliate/track/${ref}`, {
      credentials: 'include',
    }).catch((err) => {
      console.error('Error tracking affiliate click:', err);
    });
  }, [searchParams]);

  return null;
}

