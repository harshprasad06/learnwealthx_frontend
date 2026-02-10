import type { Metadata } from "next";
import "./globals.css";
import RefTracker from "@/components/RefTracker";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "LearnWealthX - Learn Skills That Change Your Life",
  description:
    "Master in-demand skills with our comprehensive courses. Start learning today and unlock your potential.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)] transition-colors">
        <ThemeProvider>
          <RefTracker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
