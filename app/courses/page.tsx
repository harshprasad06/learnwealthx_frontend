'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number;
  thumbnail: string | null;
  videos: Array<{ id: string; title: string; order: number }>;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'price_low' | 'price_high'>('newest');

  useEffect(() => {
    fetchCourses();
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) {
        params.set('search', search.trim());
      }
      const query = params.toString();
      const url = query ? `${API_URL}/api/courses?${query}` : `${API_URL}/api/courses`;
      const res = await fetch(url, {
        credentials: 'include',
      });
      const data = await res.json();
      let list: Course[] = data.courses || [];

      // Simple client-side sort for nicer UX
      if (sort === 'price_low') {
        list = [...list].sort((a, b) => a.price - b.price);
      } else if (sort === 'price_high') {
        list = [...list].sort((a, b) => b.price - a.price);
      } else {
        // newest: assume API returns newest first, so keep order
      }

      setCourses(list);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses; // server-side already filtered by search

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <main className="flex-1">
        <section className="py-8 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header + search/sort */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">All Courses</h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xl">
                  Browse our complete catalog of courses. Filter by topic or search to find the
                  perfect next step in your learning journey.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/40 px-3 py-1 text-blue-700 dark:text-blue-300">
                    Lifetime access
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/40 px-3 py-1 text-emerald-700 dark:text-emerald-300">
                    Beginner friendly
                  </span>
                  <span className="inline-flex items-center rounded-full bg-purple-50 dark:bg-purple-900/40 px-3 py-1 text-purple-700 dark:text-purple-300">
                    Hands-on projects
                  </span>
                </div>
              </div>
              <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setLoading(true);
                        fetchCourses();
                      }
                    }}
                    placeholder="Search courses..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as typeof sort);
                    setLoading(true);
                    fetchCourses();
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-800"
                >
                  <option value="newest">Newest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
                <button
                  onClick={() => {
                    setLoading(true);
                    fetchCourses();
                  }}
                  className="btn-primary"
                >
                  Search
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-b-transparent border-blue-600 dark:border-blue-400" />
                <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
                  Loading courses...
                </p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 dark:text-gray-400 text-base mb-2">
                  No courses found.
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Try clearing the search or check back later for new courses.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="group bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/50 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-blue-400 to-indigo-600 overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-16 h-16 text-white opacity-60"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white dark:bg-gray-900/90 px-3 py-1 rounded-full text-xs font-medium text-gray-900 dark:text-gray-100">
                        {course.videos.length} Videos
                      </div>
                    </div>
                    <div className="p-5">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {course.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                        {course.description || 'No description available'}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          ₹{course.price.toFixed(2)}
                        </span>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Lifetime access
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
