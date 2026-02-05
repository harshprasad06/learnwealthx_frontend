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
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses; // server-side already filtered by search

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">All Courses</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchCourses();
                  }
                }}
                placeholder="Search courses by title or description..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
            <button
              onClick={() => {
                setLoading(true);
                fetchCourses();
              }}
              className="px 4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">No courses available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden hover:shadow-lg transition-all"
              >
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">
                    {course.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {course.description || 'No description available'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ₹{course.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {course.videos.length} videos
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
