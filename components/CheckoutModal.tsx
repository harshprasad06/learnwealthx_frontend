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

interface PriceBreakdown {
  baseAmount: number;
  gstAmount: number;
  gatewayFeeAmount: number;
  totalAmount: number;
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
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);

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

      // Parse breakdown from API response or calculate client-side as fallback
      if (orderData.breakdown) {
        setPriceBreakdown(orderData.breakdown);
      } else {
        // Fallback: calculate client-side if breakdown not provided (backward compatibility)
        const GST_RATE = 0.18;
        const GATEWAY_FEE_RATE = 0.02;
        const gstAmount = Math.round(totalPrice * GST_RATE);
        const subtotalBeforeGatewayFee = totalPrice + gstAmount;
        const gatewayFeeAmount = Math.round(subtotalBeforeGatewayFee * GATEWAY_FEE_RATE);
        const totalAmount = totalPrice + gstAmount + gatewayFeeAmount;
        setPriceBreakdown({
          baseAmount: totalPrice,
          gstAmount,
          gatewayFeeAmount,
          totalAmount,
        });
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
        name: 'LearnWealthX',
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 backdrop-blur-sm transition-colors"
      onClick={closeOnBackground}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 relative border border-gray-200 dark:border-gray-700 transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">Checkout</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Complete your purchase to get lifetime access
          </p>
        </div>

        <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-5 py-4 border border-blue-100 dark:border-blue-800/50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-base font-semibold text-gray-900 dark:text-gray-50 mb-1">{title}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Lifetime access included</p>
            </div>
            <div className="ml-4 text-right">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{priceBreakdown ? priceBreakdown.totalAmount.toFixed(2) : totalPrice.toFixed(2)}
              </p>
            </div>
          </div>
          {priceBreakdown && (
            <div className="pt-3 border-t border-blue-200 dark:border-blue-800/50 space-y-1.5">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Course Price:</span>
                <span>₹{priceBreakdown.baseAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>GST (18%):</span>
                <span>₹{priceBreakdown.gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Payment Gateway Fee (2%):</span>
                <span>₹{priceBreakdown.gatewayFeeAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-gray-900 dark:text-gray-50 pt-1 border-t border-blue-200 dark:border-blue-800/50">
                <span>Total:</span>
                <span>₹{priceBreakdown.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {step === 'checking' && (
          <div className="py-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-b-transparent border-blue-600 dark:border-blue-400 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Checking your account...</p>
          </div>
        )}

        {step === 'auth' && (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="flex space-x-3 mb-4">
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                  authMode === 'signup'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                New here
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                  authMode === 'login'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                I have an account
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                placeholder="Minimum 6 characters"
              />
            </div>

            {authError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {authError}
              </div>
            )}
            {GOOGLE_CLIENT_ID && (
              <>
                {googleError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-3">
                    {googleError}
                  </div>
                )}
                <div className="flex items-center my-4">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  <span className="px-3 text-xs text-gray-500 dark:text-gray-400 font-medium">or</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                </div>
                <button
                  type="button"
                  onClick={() => googleLogin()}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
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
              className="w-full py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : authMode === 'signup' ? (
                'Create account & continue'
              ) : (
                'Login & continue'
              )}
            </button>
          </form>
        )}

        {step === 'paying' && (
          <div className="py-8 text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-3 border-b-transparent border-blue-600 dark:border-blue-400 mb-4" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Processing your payment
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Please wait while we complete your purchase...
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
              Payment Successful!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You now have lifetime access to this course.
            </p>
            {priceBreakdown && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-left space-y-1.5">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Payment Receipt:</p>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Course Price:</span>
                  <span>₹{priceBreakdown.baseAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>GST (18%):</span>
                  <span>₹{priceBreakdown.gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Payment Gateway Fee (2%):</span>
                  <span>₹{priceBreakdown.gatewayFeeAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-gray-900 dark:text-gray-50 pt-1 border-t border-gray-200 dark:border-gray-600">
                  <span>Total Paid:</span>
                  <span>₹{priceBreakdown.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 dark:bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 shadow-md hover:shadow-lg transition-all"
            >
              Continue Learning
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="py-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-center text-red-600 dark:text-red-400 text-sm font-medium mb-6">
              {payError || 'Something went wrong during checkout.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('auth')}
                className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Try again
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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


