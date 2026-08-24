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
        <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 dark:prose-p:text-ink-200 prose-a:text-blue-600 prose-img:rounded-xl prose-img:w-full prose-strong:text-gray-900 dark:prose-strong:text-white">
          <MDXRemote source={content} />
        </article>

        {/* CTA */}
        <div className="mt-12 p-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Ready to start your learning journey?</h3>
          <p className="text-blue-100 mb-6 text-lg">Explore expert-led courses on LearnWealthX and unlock your potential today.</p>
          <a
            href="https://www.learnwealthx.in/courses"
            className="inline-block bg-white text-blue-700 px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-md"
          >
            Browse Courses →
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
