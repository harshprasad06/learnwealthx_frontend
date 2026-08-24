import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // ── Dark-mode-only palettes (additive) ────────────────────────────────
        // These scales are referenced exclusively from `dark:` variants and
        // `.dark`-scoped CSS. Light mode continues to use Tailwind's built-in
        // gray/blue/etc. scales, which are deliberately left untouched.

        // `ink` — near-black neutrals carrying a faint green undertone.
        ink: {
          50: '#E8EDEB',
          100: '#C7D2CE',
          200: '#9CACA6',
          300: '#8B9C95',
          400: '#778A83',
          500: '#4C5F58',
          600: '#35443E',
          700: '#26332D',
          800: '#1A2621',
          900: '#111A16',
          950: '#0A0F0D',
        },
        // `mint` — the dark-mode brand accent, replacing blue.
        mint: {
          50: '#E6FFF7',
          100: '#B8FFE8',
          200: '#7DFAD3',
          300: '#43F0BC',
          400: '#16E0A5',
          500: '#00D68F',
          600: '#00B87A',
          700: '#009463',
          800: '#00714C',
          900: '#005439',
          950: '#00301F',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
