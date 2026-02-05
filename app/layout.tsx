import type { Metadata } from "next";
import "./globals.css";
import RefTracker from "@/components/RefTracker";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "Course Platform - Learn Skills That Change Your Life",
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
      <body className="antialiased">
        <ThemeProvider>
          <RefTracker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
