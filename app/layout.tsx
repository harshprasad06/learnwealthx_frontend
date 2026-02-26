import type { Metadata } from "next";
import "./globals.css";
import RefTracker from "@/components/RefTracker";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Suspense } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.learnwealthx.in/";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LearnWealthX – Learn Skills That Change Your Life | Online Courses",
    template: "%s | LearnWealthX",
  },
  description:
    "LearnWealthX (Learn Wealth X) – Master in-demand skills with expert-led online courses. Start learning today and unlock your potential. Curated courses for career growth.",
  keywords: [
    "LearnWealthX",
    "learnwealthx",
    "learnwealthx.in",
    "Learn Wealth X",
    "learn wealth",
    "learn wealth x",
    "learnwealth",
    "learn wealth courses",
    "learn wealth online",
    "online courses",
    "learn skills",
    "online learning",
    "courses India",
    "skill development",
    "expert courses",
  ],
  authors: [{ name: "LearnWealthX" }],
  creator: "LearnWealthX",
  publisher: "LearnWealthX",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "LearnWealthX",
    title: "LearnWealthX – Learn Skills That Change Your Life",
    description: "Master in-demand skills with our comprehensive courses. Start learning today and unlock your potential.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LearnWealthX – Online Courses" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LearnWealthX – Learn Skills That Change Your Life",
    description: "Master in-demand skills with our comprehensive courses. Start learning today.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    // Add when you have them: google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LearnWealthX",
  alternateName: ["Learn Wealth X", "Learn Wealth", "learn wealth", "learnwealth"],
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: "LearnWealthX – Master in-demand skills with expert-led online courses. Start learning today and unlock your potential.",
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)] transition-colors">
        <ThemeProvider>
          <Suspense fallback={null}>
            <RefTracker />
          </Suspense>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
