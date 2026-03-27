import { getAllBlogPosts } from '@/lib/blog';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Blog – LearnWealthX',
  description: 'Tips, guides and insights on online learning, affiliate marketing, and wealth building in India.',
};

export default async function BlogIndexPage() {
  const posts = await getAllBlogPosts();

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-gray-500 mb-10">Tips, guides and insights on online learning and wealth building.</p>

        {posts.length === 0 && (
          <p className="text-gray-400">No posts yet. Check back soon.</p>
        )}

        <div className="grid gap-8">
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <article className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="p-5">
                  <p className="text-xs text-gray-400 mb-1">{post.date}</p>
                  <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors mb-2">{post.title}</h2>
                  <p className="text-gray-500 text-sm line-clamp-2">{post.description}</p>
                  <span className="inline-block mt-3 text-blue-600 text-sm font-medium">Read more →</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
