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
    primary: '#111827', // gray-900
    secondary: '#1f2937', // gray-800
    tertiary: '#374151', // gray-700
    card: '#1f2937', // gray-800
    hover: '#374151', // gray-700
  },
  // Text colors
  text: {
    primary: '#f9fafb', // gray-50
    secondary: '#d1d5db', // gray-300
    tertiary: '#9ca3af', // gray-400
    muted: '#6b7280', // gray-500
    inverse: '#111827',
  },
  // Border colors
  border: {
    primary: '#374151', // gray-700
    secondary: '#4b5563', // gray-600
    focus: '#60a5fa', // blue-400
  },
  // Brand colors
  brand: {
    primary: '#3b82f6', // blue-500
    primaryHover: '#2563eb', // blue-600
    secondary: '#8b5cf6', // violet-500
    accent: '#fbbf24', // amber-400
  },
  // Status colors
  status: {
    success: '#34d399', // green-400
    successBg: '#064e3b', // green-900
    warning: '#fbbf24', // amber-400
    warningBg: '#78350f', // amber-900
    error: '#f87171', // red-400
    errorBg: '#7f1d1d', // red-900
    info: '#60a5fa', // blue-400
    infoBg: '#1e3a8a', // blue-900
  },
  // Input colors
  input: {
    bg: '#1f2937', // gray-800
    text: '#f9fafb', // gray-50
    placeholder: '#6b7280', // gray-500
    border: '#4b5563', // gray-600
    borderFocus: '#60a5fa', // blue-400
  },
  // Shadow
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.4)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
  },
};

export type Theme = typeof lightTheme;
