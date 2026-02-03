'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Payout {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  processedAt: string | null;
  completedAt: string | null;
  failureReason: string | null;
}

interface WalletBalance {
  balance: number;
  totalEarned: number;
  totalPaid: number;
  availableForPayout: number;
}

export default function PayoutsPage() {
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    amount: '',
    paymentMethod: 'bank_transfer' as 'bank_transfer' | 'upi' | 'paypal',
    paymentDetails: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<string>('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const MIN_PAYOUT = 500; // This should match backend PAYOUT_MINIMUM_AMOUNT

  useEffect(() => {
    fetchWallet();
    fetchPayouts();
    fetchKycStatus();
  }, [page]);

  const fetchWallet = async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/balance`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok) {
        setWallet(data);
      }
    } catch (err) {
      console.error('Wallet fetch error:', err);
    }
  };

  const fetchPayouts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payouts/history?page=${page}&limit=20`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        return;
      }

      setPayouts(data.payouts || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Payouts fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchKycStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/kyc/status`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok) {
        setKycStatus(data.status || 'not_submitted');
      }
    } catch (err) {
      console.error('KYC status error:', err);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const amount = parseFloat(requestForm.amount);

    if (!amount || amount < MIN_PAYOUT) {
      setError(`Minimum payout amount is ₹${MIN_PAYOUT}`);
      return;
    }

    if (!wallet || wallet.balance < amount) {
      setError('Insufficient balance');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/payouts/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount,
          paymentMethod: requestForm.paymentMethod,
          paymentDetails: requestForm.paymentDetails || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to request payout');
        return;
      }

      setMessage(data.message || 'Payout request submitted successfully');
      setShowRequestForm(false);
      setRequestForm({ amount: '', paymentMethod: 'bank_transfer', paymentDetails: '' });
      fetchWallet();
      fetchPayouts();
    } catch (err) {
      console.error('Payout request error:', err);
      setError('Failed to request payout. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'upi':
        return 'UPI';
      case 'paypal':
        return 'PayPal';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  const canRequestPayout = kycStatus === 'approved' && wallet && wallet.balance >= MIN_PAYOUT;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payouts</h1>
            <p className="text-gray-600">Request payouts and track your withdrawal history</p>
          </div>
          <Link
            href="/affiliate/wallet"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            View Wallet
          </Link>
        </div>

        {/* Wallet Summary */}
        {wallet && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Available Balance</p>
                <p className="text-2xl font-bold">₹{wallet.balance.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Lifetime Earnings</p>
                <p className="text-2xl font-bold">₹{wallet.totalEarned.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Total Paid Out</p>
                <p className="text-2xl font-bold">₹{wallet.totalPaid.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* KYC Warning */}
        {kycStatus !== 'approved' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow-sm p-5">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-yellow-600 mr-3 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h3 className="text-yellow-800 font-semibold mb-1">KYC Verification Required</h3>
                <p className="text-yellow-700 text-sm mb-2">
                  You must complete KYC verification before requesting payouts.
                </p>
                <Link
                  href="/affiliate/dashboard"
                  className="text-yellow-800 font-medium hover:underline text-sm"
                >
                  Complete KYC →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Request Payout Section */}
        {canRequestPayout && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Request Payout</h2>
              {!showRequestForm && (
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  New Request
                </button>
              )}
            </div>

            {showRequestForm && (
              <form onSubmit={handleRequestPayout} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                    {message}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (Minimum: ₹{MIN_PAYOUT})
                  </label>
                  <input
                    type="number"
                    required
                    min={MIN_PAYOUT}
                    max={wallet?.balance || 0}
                    step="0.01"
                    value={requestForm.amount}
                    onChange={(e) => setRequestForm({ ...requestForm, amount: e.target.value })}
                    placeholder={`Enter amount (max: ₹${wallet?.balance.toFixed(2) || '0.00'})`}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: ₹{wallet?.balance.toFixed(2) || '0.00'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={requestForm.paymentMethod}
                    onChange={(e) =>
                      setRequestForm({
                        ...requestForm,
                        paymentMethod: e.target.value as 'bank_transfer' | 'upi' | 'paypal',
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                {requestForm.paymentMethod === 'upi' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={requestForm.paymentDetails}
                      onChange={(e) =>
                        setRequestForm({ ...requestForm, paymentDetails: e.target.value })
                      }
                      placeholder="yourname@upi"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestForm(false);
                      setError('');
                      setMessage('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Payout History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Payout History</h2>

          {payouts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No payout requests yet.</p>
              <p className="text-sm mt-2">
                {canRequestPayout
                  ? 'Request your first payout when you have earnings.'
                  : 'Complete KYC to request payouts.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Method
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Requested
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Processed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-900">
                            ₹{payout.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {getPaymentMethodLabel(payout.paymentMethod)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              payout.status
                            )}`}
                          >
                            {payout.status}
                          </span>
                          {payout.failureReason && (
                            <p className="text-xs text-red-600 mt-1">{payout.failureReason}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(payout.createdAt).toLocaleDateString()}
                          <br />
                          <span className="text-xs text-gray-400">
                            {new Date(payout.createdAt).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {payout.processedAt
                            ? new Date(payout.processedAt).toLocaleDateString()
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Showing page {page} of {totalPages}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
