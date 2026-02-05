'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { lightTheme, darkTheme, type Theme } from '@/lib/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage first, default to 'light' if not set
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    
    // Default to 'light' theme (ignore system preference)
    const initialMode = savedTheme || 'light';
    setMode(initialMode);
    setMounted(true);
    
    // Apply theme class to html element
    document.documentElement.classList.toggle('dark', initialMode === 'dark');
  }, []);

  useEffect(() => {
    if (mounted) {
      // Update localStorage
      localStorage.setItem('theme', mode);
      // Update html class
      document.documentElement.classList.toggle('dark', mode === 'dark');
    }
  }, [mode, mounted]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

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
