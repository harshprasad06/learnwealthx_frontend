'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { lightTheme, darkTheme, type Theme } from '@/lib/theme';

type ThemeMode = 'light' | 'dark';

/**
 * Storage key. Deliberately NOT the old 'theme'.
 *
 * The previous provider wrote localStorage on every mount, not only when the
 * visitor used the toggle, so every returning visitor already has theme='light'
 * persisted despite never having chosen it. Reading that value back would pin
 * them to light forever and make the new default a no-op. A new key lets
 * everyone re-enter on the default while a real, explicit choice still sticks.
 *
 * Must stay in sync with the blocking script in app/layout.tsx.
 */
const STORAGE_KEY = 'theme-v2';
const DEFAULT_MODE: ThemeMode = 'dark';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function readStoredMode(): ThemeMode | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    // Private mode, or site data blocked. Treat as "no choice recorded".
    return null;
  }
}

function applyMode(mode: ThemeMode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Seeded with the same default the blocking <head> script uses, so the first
  // client render agrees with the class that script already put on <html>.
  const [mode, setMode] = useState<ThemeMode>(DEFAULT_MODE);

  useEffect(() => {
    // Adopt an explicitly stored choice. The blocking script has already set
    // the class for the first paint; this syncs React's copy of the state and
    // re-asserts the class as a safety net if that script was ever blocked.
    const resolved = readStoredMode() ?? DEFAULT_MODE;
    setMode(resolved);
    applyMode(resolved);
  }, []);

  // Persist ONLY a deliberate choice. Never write on mount -- that is what made
  // "no stored value" indistinguishable from "the user picked light".
  const commit = (next: ThemeMode) => {
    setMode(next);
    applyMode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable: the choice still applies for this page view.
    }
  };

  const toggleTheme = () => commit(mode === 'light' ? 'dark' : 'light');

  const setTheme = (newMode: ThemeMode) => commit(newMode);

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  // Always provide the context, even before mounting
  // This prevents the "useTheme must be used within a ThemeProvider" error
  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
