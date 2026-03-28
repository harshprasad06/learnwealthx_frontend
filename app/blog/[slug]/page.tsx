import { getBlogPost } from '@/lib/blog';
import { BlogImage } from '../BlogImage';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// Always render on-demand — blog posts are added after build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: `${post.frontmatter.title} | LearnWealthX Blog`,
    description: post.frontmatter.description,
    keywords: post.frontmatter.keywords ?? [],
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      images: post.frontmatter.image ? [post.frontmatter.image] : [],
      type: 'article',
      publishedTime: post.frontmatter.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPost(params.slug);
  if (!post) notFound();

  const { frontmatter, content } = post;

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-2">{frontmatter.date}</p>
          <h1 className="text-3xl font-bold leading-tight mb-4">{frontmatter.title}</h1>
          {frontmatter.description && (
            <p className="text-lg text-gray-500">{frontmatter.description}</p>
          )}
          {frontmatter.author && (
            <p className="text-sm text-gray-400 mt-3">By {frontmatter.author}</p>
          )}
        </div>

        {frontmatter.image && (
          <BlogImage src={frontmatter.image} alt={frontmatter.title} className="w-full rounded-xl mb-8 object-cover max-h-80" />
        )}

        {/* MDX content */}
        <article className="prose prose-gray dark:prose-invert max-w-none">
          <MDXRemote source={content} />
        </article>

        {/* CTA */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-950 rounded-xl text-center">
          <h3 className="text-xl font-bold mb-2">Ready to start learning?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Explore courses on LearnWealthX and start your journey today.</p>
          <a
            href="/courses"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Courses →
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
