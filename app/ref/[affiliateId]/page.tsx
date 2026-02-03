'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CheckoutModal from '@/components/CheckoutModal';

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number;
  thumbnail: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function RefLandingPage() {
  const { affiliateId } = useParams<{ affiliateId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Track click by affiliateId and set cookie with course IDs
  useEffect(() => {
    if (!affiliateId) return;
    const coursesParam = searchParams.get('courses');
    const url = coursesParam
      ? `${API_URL}/api/affiliate/track-by-id/${affiliateId}?courses=${encodeURIComponent(coursesParam)}`
      : `${API_URL}/api/affiliate/track-by-id/${affiliateId}`;
    fetch(url, {
      credentials: 'include',
    }).catch((err) => {
      console.error('Error tracking affiliate click by id:', err);
    });
  }, [affiliateId, searchParams]);

  // Load selected courses
  useEffect(() => {
    const coursesParam = searchParams.get('courses');
    if (!coursesParam) {
      setLoading(false);
      return;
    }
    const ids = coursesParam.split(',').map((c) => c.trim()).filter(Boolean);
    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const results: Course[] = [];
        for (const id of ids) {
          const res = await fetch(`${API_URL}/api/courses/${id}`, {
            credentials: 'include',
          });
          const data = await res.json();
          if (res.ok && data.course) {
            results.push({
              id: data.course.id,
              title: data.course.title,
              description: data.course.description,
              price: data.course.price,
              thumbnail: data.course.thumbnail,
            });
          }
        }
        setCourses(results);
      } catch (e) {
        console.error('Error loading referral courses', e);
        setError('Failed to load courses for this referral link.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recommended Courses</h1>
        <p className="text-gray-600 mb-6">
          You&apos;ve opened a special referral link. Select a course below and continue to
          checkout in a single flow.
        </p>

        {loading && (
          <div className="text-center py-12">Loading courses...</div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No valid courses were found for this referral link.
          </div>
        )}

        {!loading && courses.length > 0 && (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
              >
                <div className="h-40 bg-gray-200 overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h2>
                  <p className="text-sm text-gray-600 flex-1">
                    {course.description || 'No description available.'}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">
                      ₹{course.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowCheckout(true)}
              className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Checkout All Courses
            </button>
          </div>
          </>
        )}
      </div>
      {showCheckout && courses.length > 0 && (
        <CheckoutModal
          courseIds={courses.map((c) => c.id)}
          title={`All selected courses (${courses.length})`}
          totalPrice={courses.reduce((sum, c) => sum + c.price, 0)}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            router.push('/courses');
          }}
        />
      )}
    </div>
  );
}

