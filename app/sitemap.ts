import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.learnwealthx.in/";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/courses`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/refund`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/api/courses`, { next: { revalidate: 3600 } });
      const data = await res.json();
      const courses = data?.courses ?? data ?? [];
      const courseEntries: MetadataRoute.Sitemap = Array.isArray(courses)
        ? courses.map((c: { id: string }) => ({
            url: `${SITE_URL}/courses/${c.id}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.8,
          }))
        : [];
      return [...base, ...courseEntries];
    } catch {
      // ignore; use static entries only
    }
  }

  return base;
}
