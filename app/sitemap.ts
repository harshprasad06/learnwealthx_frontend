import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "@/lib/blog";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.learnwealthx.in").replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/courses`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/affiliate`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/refund`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  // Blog posts
  const blogPosts = await getAllBlogPosts();
  const blogEntries: MetadataRoute.Sitemap = blogPosts.map(post => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Courses from API
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  let courseEntries: MetadataRoute.Sitemap = [];
  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/api/courses`, { next: { revalidate: 3600 } });
      const data = await res.json();
      const courses = data?.courses ?? data ?? [];
      courseEntries = Array.isArray(courses)
        ? courses.map((c: { id: string }) => ({
            url: `${SITE_URL}/courses/${c.id}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.8,
          }))
        : [];
    } catch { /* ignore */ }
  }

  return [...base, ...blogEntries, ...courseEntries];
}
