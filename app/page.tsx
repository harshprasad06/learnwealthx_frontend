'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PricingDisplay from '@/components/PricingDisplay';
import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import Pillars from '@/components/home/Pillars';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import Faq from '@/components/home/Faq';
import FinalCta from '@/components/home/FinalCta';

interface Course {
  id: string;
  title: string;
  description: string | null;
  mrp: number;
  price: number;
  thumbnail: string | null;
  videos: Array<{ id: string; title: string; order: number }>;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchCourses();
    fetchUser();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses`, {
        credentials: 'include',
      });
      const data = await res.json();
      // Show only first 6 courses on homepage
      setCourses((data.courses || []).slice(0, 6));
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  return (
    <div className="app-page">
      <Navbar />
      <main className="app-main">
        <Hero />
        <Stats />
        <Pillars />
        {/* Featured Courses Section */}
        <section className="py-16 bg-gray-50 dark:bg-ink-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-2">
              Featured Courses
            </h2>
            <p className="text-xl text-gray-600 dark:text-ink-300 max-w-2xl mx-auto">
              Discover our most popular courses and start your learning journey today
            </p>
          </div>

          {loading ? (
            <div className="state-loading">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-b-transparent border-blue-600 dark:border-mint-400" />
              <p className="mt-3 text-sm">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="state-empty">
              <p className="text-base mb-1">No courses available yet.</p>
              <p className="text-sm">Check back soon for new content.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {courses.map((course) => {
                const imageSrc =
                  course.thumbnail && !course.thumbnail.startsWith('http')
                    ? `${API_URL}${course.thumbnail}`
                    : course.thumbnail || '';

                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="group bg-white dark:bg-ink-900 rounded-xl shadow-md dark:shadow-black/40 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-blue-400 dark:from-mint-800 to-indigo-600 dark:to-mint-950 overflow-hidden">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-20 h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white dark:bg-ink-900 bg-opacity-90 dark:bg-opacity-90 px-3 py-1 rounded-full text-sm font-semibold text-gray-900 dark:text-ink-50">
                        {course.videos.length} Videos
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-ink-50 mb-2 group-hover:text-blue-600 dark:group-hover:text-mint-400 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 dark:text-ink-300 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                        {course.description || 'No description available'}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-ink-800">
                        <PricingDisplay
                          mrp={course.mrp}
                          actualPrice={course.price}
                          discountPercentage={
                            course.mrp && course.mrp > course.price
                              ? Math.round(((course.mrp - course.price) / course.mrp) * 100)
                              : 0
                          }
                          isLoggedIn={!!user}
                          size="md"
                        />
                        <span className="text-blue-600 dark:text-mint-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                          View Course
                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                </Link>
              )})}
              </div>
              
              {courses.length >= 6 && (
                <div className="text-center">
                  <Link
                    href="/courses"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-mint-500 text-white dark:text-ink-950 font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-mint-400 transition-colors"
                  >
                    View All Courses
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
        </section>

        <HowItWorks />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
