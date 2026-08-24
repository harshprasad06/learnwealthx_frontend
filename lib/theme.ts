// Theme color palette definitions
export const lightTheme = {
  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb', // gray-50
    tertiary: '#f3f4f6', // gray-100
    card: '#ffffff',
    hover: '#f9fafb',
  },
  // Text colors
  text: {
    primary: '#111827', // gray-900
    secondary: '#4b5563', // gray-600
    tertiary: '#6b7280', // gray-500
    muted: '#9ca3af', // gray-400
    inverse: '#ffffff',
  },
  // Border colors
  border: {
    primary: '#e5e7eb', // gray-200
    secondary: '#d1d5db', // gray-300
    focus: '#3b82f6', // blue-500
  },
  // Brand colors
  brand: {
    primary: '#2563eb', // blue-600
    primaryHover: '#1d4ed8', // blue-700
    secondary: '#7c3aed', // violet-600
    accent: '#f59e0b', // amber-500
  },
  // Status colors
  status: {
    success: '#10b981', // green-500
    successBg: '#d1fae5', // green-100
    warning: '#f59e0b', // amber-500
    warningBg: '#fef3c7', // amber-100
    error: '#ef4444', // red-500
    errorBg: '#fee2e2', // red-100
    info: '#3b82f6', // blue-500
    infoBg: '#dbeafe', // blue-100
  },
  // Input colors
  input: {
    bg: '#ffffff',
    text: '#111827', // gray-900
    placeholder: '#9ca3af', // gray-400
    border: '#d1d5db', // gray-300
    borderFocus: '#3b82f6', // blue-500
  },
  // Shadow
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
};

export const darkTheme = {
  // Background colors
  background: {
    primary: '#0A0F0D', // ink-950
    secondary: '#111A16', // ink-900
    tertiary: '#1A2621', // ink-800
    card: '#111A16', // ink-900
    hover: '#1A2621', // ink-800
  },
  // Text colors
  text: {
    primary: '#E8EDEB', // ink-50
    secondary: '#9CACA6', // ink-200
    tertiary: '#8B9C95', // ink-300
    muted: '#778A83', // ink-400
    inverse: '#0A0F0D', // ink-950
  },
  // Border colors
  border: {
    primary: '#1A2621', // ink-800
    secondary: '#26332D', // ink-700
    focus: '#00D68F', // mint-500
  },
  // Brand colors
  brand: {
    primary: '#00D68F', // mint-500
    primaryHover: '#16E0A5', // mint-400
    secondary: '#43F0BC', // mint-300
    accent: '#fbbf24', // amber-400 (warm highlight, intentionally not mint)
  },
  // Status colors
  status: {
    // Success stays on the yellower `green` hue so it remains distinguishable
    // from the blue-green `mint` brand accent.
    success: '#4ade80', // green-400
    successBg: '#052e16', // green-950
    warning: '#fbbf24', // amber-400
    warningBg: '#451a03', // amber-950
    error: '#f87171', // red-400
    errorBg: '#450a0a', // red-950
    info: '#16E0A5', // mint-400
    infoBg: '#00301F', // mint-950
  },
  // Input colors
  input: {
    bg: '#111A16', // ink-900
    text: '#E8EDEB', // ink-50
    placeholder: '#778A83', // ink-400
    border: '#26332D', // ink-700
    borderFocus: '#00D68F', // mint-500
  },
  // Shadow
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.5)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.6)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.7)',
  },
};

export type Theme = typeof lightTheme;
