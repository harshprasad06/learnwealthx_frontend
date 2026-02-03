'use client';

import { useEffect, useState } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

interface CheckoutModalProps {
  courseIds: string[];
  title: string;
  totalPrice: number;
  onClose: () => void;
  onSuccess: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Step = 'checking' | 'auth' | 'paying' | 'success' | 'error';
type AuthMode = 'signup' | 'login';

function InnerCheckoutModal({
  courseIds,
  title,
  totalPrice,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const [step, setStep] = useState<Step>('checking');
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [payError, setPayError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setGoogleError('');
      try {
        const userInfoRes = await fetch(
          `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`
        );
        if (!userInfoRes.ok) {
          throw new Error('Failed to fetch Google user info');
        }
        const userInfo = await userInfoRes.json();

        const res = await fetch(`${API_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: userInfo.email,
            name: userInfo.name || null,
            picture: userInfo.picture || null,
            googleId: userInfo.sub,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setGoogleError(data.error || 'Google sign-in failed');
          return;
        }

        // After successful Google login, go straight to payment
        setStep('paying');
        await startPayment();
      } catch (err: any) {
        console.error('Google sign-in error:', err);
        setGoogleError(err.message || 'Google sign-in failed');
      } finally {
        setLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Google OAuth error:', errorResponse);
      setGoogleError('Google sign-in failed. Please try again.');
    },
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          credentials: 'include',
        });
        if (res.ok) {
          // Already logged in -> go directly to payment
          setStep('paying');
          await startPayment();
        } else {
          setStep('auth');
        }
      } catch (e) {
        console.error('Auth check error:', e);
        setStep('auth');
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      if (authMode === 'signup') {
        const res = await fetch(`${API_URL}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || 'Failed to create account');
          return;
        }
      } else {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || 'Login failed');
          return;
        }
      }

      // Auth successful -> start payment
      setStep('paying');
      await startPayment();
    } catch (err) {
      console.error('Auth error:', err);
      setAuthError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startPayment = async () => {
    setPayError('');
    setLoading(true);
    try {
      const orderRes = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseIds }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setPayError(orderData.error || 'Failed to create order');
        setStep('error');
        return;
      }

      // Bypass mode
      if (orderData.bypass) {
        setStep('success');
        onSuccess();
        return;
      }

      // Razorpay flow
      if (typeof window.Razorpay === 'undefined') {
        setPayError('Payment gateway is loading. Please try again in a moment.');
        setStep('error');
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Course Platform',
        description: `Purchase: ${title}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
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
              setStep('success');
              onSuccess();
            } else {
              setPayError('Payment verification failed');
              setStep('error');
            }
          } catch (err) {
            console.error('Verify error:', err);
            setPayError('Payment verification failed');
            setStep('error');
          }
        },
        prefill: {
          email,
        },
        theme: {
          color: '#3399cc',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Payment error:', err);
      setPayError('Something went wrong while processing payment.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const closeOnBackground = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={closeOnBackground}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 relative border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-1">Smart Checkout</h2>
        <p className="text-xs uppercase tracking-wide text-gray-400 mb-4">
          One continuous flow for account + payment
        </p>
        <div className="mb-4 rounded-lg bg-gray-50 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="text-xs text-gray-500">You will get lifetime access</p>
          </div>
        <p className="text-sm text-gray-600">
          {title} &middot; <span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
        </p>
        </div>

        {step === 'checking' && (
          <div className="py-6 text-center text-gray-500">Checking your account...</div>
        )}

        {step === 'auth' && (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="flex space-x-2 mb-1">
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 text-sm font-medium rounded-md border ${
                  authMode === 'signup'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                New here
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 text-sm font-medium rounded-md border ${
                  authMode === 'login'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                I have an account
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {authError}
              </div>
            )}
            {GOOGLE_CLIENT_ID && (
              <>
                {googleError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-2">
                    {googleError}
                  </div>
                )}
                <div className="flex items-center my-1">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="px-2 text-xs text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <button
                  type="button"
                  onClick={() => googleLogin()}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? 'Processing...'
                : authMode === 'signup'
                ? 'Create account & pay'
                : 'Login & pay'}
            </button>
          </form>
        )}

        {step === 'paying' && (
          <div className="py-6 text-center text-gray-500">
            Processing your payment, please wait...
          </div>
        )}

        {step === 'success' && (
          <div className="py-6 text-center">
            <p className="text-green-600 font-semibold mb-2">
              Payment successful! You now own this course.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="py-6">
            <p className="text-red-600 text-sm mb-3">
              {payError || 'Something went wrong during checkout.'}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setStep('auth')}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              >
                Try again
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-sm rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutModal(props: CheckoutModalProps) {
  if (!GOOGLE_CLIENT_ID) {
    return <InnerCheckoutModal {...props} />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <InnerCheckoutModal {...props} />
    </GoogleOAuthProvider>
  );
}


