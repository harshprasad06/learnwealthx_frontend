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

  useEffect(() => {
    if (params.id) {
      fetchCourse();
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
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Course not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-64 object-cover"
            />
          )}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
            <p className="text-gray-600 mb-6">{course.description || 'No description'}</p>
            <div className="flex justify-between items-center mb-8">
              <span className="text-3xl font-bold text-blue-600">
                ₹{course.price.toFixed(2)}
              </span>
              {!hasAccess && (
                <button
                  onClick={() => setShowCheckout(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Checkout
                </button>
              )}
              {hasAccess && userRole !== 'ADMIN' && (
                <Link
                  href={`/courses/${course.id}/watch`}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  Watch Course
                </Link>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Course Content</h2>
              <div className="space-y-2">
                {course.videos.map((video, index) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-500 font-medium">{index + 1}</span>
                      <span className="text-gray-900">{video.title}</span>
                    </div>
                    {video.duration && (
                      <span className="text-gray-500 text-sm">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                ))}
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
