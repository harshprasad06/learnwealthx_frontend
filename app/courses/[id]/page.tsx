'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Script from 'next/script';
import CheckoutModal from '@/components/CheckoutModal';

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number;
  thumbnail: string | null;
  videos: Array<{
    id: string;
    title: string;
    order: number;
    duration: number | null;
    bunnyVideoId: string | null;
  }>;
}

interface ReviewUser {
  id: string;
  name: string | null;
  email: string;
  picture: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: ReviewUser;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myRating, setMyRating] = useState<number>(0);
  const [myComment, setMyComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchCourse();
      fetchReviews();
    }
    fetchUserRole();
  }, [params.id]);

  const fetchUserRole = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.user?.role || null);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchCourse = async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses/${params.id}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setCourse(data.course);
      setHasAccess(data.hasAccess);
      if (data.reviewSummary) {
        setAverageRating(data.reviewSummary.averageRating || 0);
        setReviewCount(data.reviewSummary.reviewCount || 0);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses/${params.id}/reviews`, {
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();
      setAverageRating(data.averageRating || 0);
      setReviewCount(data.reviewCount || 0);
      setReviews(data.reviews || []);
      if (data.myReview) {
        setMyRating(data.myReview.rating);
        setMyComment(data.myReview.comment || '');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      // Create order
      const orderRes = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseIds: [params.id] }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        alert(orderData.error || 'Failed to create order');
        return;
      }

      // PAYMENT BYPASS MODE - Direct purchase without Razorpay
      if (orderData.bypass) {
        alert('Course purchased successfully! (Payment bypass mode)');
        router.refresh();
        fetchCourse();
        setPurchasing(false);
        return;
      }

      // Normal Razorpay flow
      // Check if Razorpay script is loaded
      if (typeof window.Razorpay === 'undefined') {
        alert('Payment gateway is loading. Please try again in a moment.');
        return;
      }

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Course Platform',
        description: `Purchase: ${course?.title}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyRes = await fetch(`${API_URL}/api/payments/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyRes.ok && verifyData.success) {
            alert('Payment successful! Course unlocked.');
            router.refresh();
            fetchCourse();
            fetchReviews();
          } else {
            alert('Payment verification failed');
          }
        },
        prefill: {
          email: '',
        },
        theme: {
          color: '#3399cc',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Something went wrong');
    } finally {
      setPurchasing(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !params.id) return;
    if (!hasAccess || userRole === 'ADMIN') {
      alert('Only students who purchased this course can leave a review.');
      return;
    }
    if (!myRating || myRating < 1 || myRating > 5) {
      alert('Please select a rating between 1 and 5 stars.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/api/courses/${course.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rating: myRating,
          comment: myComment.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to save review');
        return;
      }

      // Refresh reviews after successful submit
      await fetchReviews();
      alert('Your review has been saved.');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">Course not found</div>
        </div>
      </div>
    );
  }

  const canReview = hasAccess && userRole !== 'ADMIN';

  const renderStars = (rating: number) => {
    const full = Math.round(rating);
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= full ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden transition-colors">
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-64 object-cover"
            />
          )}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">{course.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{course.description || 'No description'}</p>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{course.price.toFixed(2)}
                </span>
                {reviewCount > 0 && (
                  <div className="flex items-center space-x-2">
                    {renderStars(averageRating)}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {averageRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {!hasAccess && (
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    Checkout
                  </button>
                )}
                {hasAccess && userRole !== 'ADMIN' && (
                  <Link
                    href={`/courses/${course.id}/watch`}
                    className="bg-green-600 dark:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                  >
                    Watch Course
                  </Link>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">Course Content</h2>
                <div className="space-y-2">
                  {course.videos.map((video, index) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">{index + 1}</span>
                        <span className="text-gray-900 dark:text-gray-50">{video.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-1">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">
                  Reviews & Ratings
                </h2>

                {reviewCount === 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    No reviews yet. Be the first to rate this course!
                  </p>
                )}

                {reviewCount > 0 && (
                  <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                          {averageRating.toFixed(1)}
                        </span>
                        {renderStars(averageRating)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}

                {canReview && (
                  <form onSubmit={handleSubmitReview} className="mb-6 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Your Rating
                      </label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setMyRating(star)}
                            className="p-1"
                          >
                            <svg
                              className={`w-5 h-5 ${
                                star <= myRating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Your Review (optional)
                      </label>
                      <textarea
                        value={myComment}
                        onChange={(e) => setMyComment(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm"
                        placeholder="Share your experience with this course..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 rounded-md text-sm font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-60 transition-colors"
                    >
                      {submittingReview ? 'Saving...' : 'Save Review'}
                    </button>
                  </form>
                )}

                {reviews.length > 0 && (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                              {review.user.name || review.user.email}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {renderStars(review.rating)}
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showCheckout && course && (
        <CheckoutModal
          courseIds={[course.id]}
          title={course.title}
          totalPrice={course.price}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            router.refresh();
            router.push(`/courses/${course.id}/watch`);
          }}
        />
      )}
    </div>
  );
}
