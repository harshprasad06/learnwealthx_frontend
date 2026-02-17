import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.learnwealthx.in/";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/profile", "/affiliate/", "/reset-password", "/forgot-password"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
