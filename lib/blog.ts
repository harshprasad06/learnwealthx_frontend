import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'app', 'blog');

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  image?: string;
  keywords?: string[];
  author?: string;
}

export interface BlogPost {
  frontmatter: BlogPostMeta;
  content: string;
}

/** Get all blog post slugs from the filesystem */
export async function getAllBlogPosts(): Promise<BlogPostMeta[]> {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
  const posts: BlogPostMeta[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const mdxPath = path.join(BLOG_DIR, entry.name, 'page.mdx');
    if (!fs.existsSync(mdxPath)) continue;

    const raw = fs.readFileSync(mdxPath, 'utf-8');
    const { data } = matter(raw);

    posts.push({
      slug: entry.name,
      title: data.title ?? entry.name,
      description: data.description ?? '',
      date: data.date ?? '',
      image: data.image,
      keywords: data.keywords,
      author: data.author,
    });
  }

  // Sort by date descending
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Get a single blog post by slug */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const mdxPath = path.join(BLOG_DIR, slug, 'page.mdx');
  if (!fs.existsSync(mdxPath)) return null;

  const raw = fs.readFileSync(mdxPath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    frontmatter: {
      slug,
      title: data.title ?? slug,
      description: data.description ?? '',
      date: data.date ?? '',
      image: data.image,
      keywords: data.keywords,
      author: data.author,
    },
    content,
  };
}
