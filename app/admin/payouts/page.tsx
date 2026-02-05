'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Payout {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  paymentDetails: string | null;
  createdAt: string;
  processedAt: string | null;
  completedAt: string | null;
  failureReason: string | null;
  affiliate: {
    id: string;
    user: {
      id: string;
      email: string;
      name: string | null;
    };
    kyc: {
      bankAccountNumber: string | null;
      bankIFSC: string | null;
      bankName: string | null;
      accountHolderName: string | null;
    } | null;
  };
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: 'all',
  });
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<'completed' | 'failed'>('completed');
  const [failureReason, setFailureReason] = useState('');
  const [generatingWeekly, setGeneratingWeekly] = useState(false);
  const [nextPayoutDate, setNextPayoutDate] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchPayouts();
    fetchNextPayoutDate();
  }, [page, filters]);

  const fetchNextPayoutDate = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payouts/admin/next-payout-date`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setNextPayoutDate(data.nextPayoutDateFormatted);
      }
    } catch (err) {
      console.error('Error fetching next payout date:', err);
    }
  };

  const handleGenerateWeekly = async () => {
    if (!confirm('Generate weekly payouts for all eligible affiliates? This will create payout requests for all affiliates with approved KYC and sufficient balance.')) {
      return;
    }

    setGeneratingWeekly(true);
    try {
      const res = await fetch(`${API_URL}/api/payouts/admin/generate-weekly`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to generate weekly payouts');
        return;
      }

      alert(`Successfully generated ${data.generated} payout requests (Total: ₹${data.totalAmount.toFixed(2)})`);
      fetchPayouts();
    } catch (err) {
      console.error('Error generating weekly payouts:', err);
      alert('Failed to generate weekly payouts');
    } finally {
      setGeneratingWeekly(false);
    }
  };

  const fetchPayouts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(filters.status !== 'all' && { status: filters.status }),
      });

      const res = await fetch(`${API_URL}/api/payouts/admin/all?${params}`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load payouts');
        return;
      }

      setPayouts(data.payouts || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Payouts fetch error:', err);
      setError('Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async () => {
    if (!selectedPayout) return;

    if (processStatus === 'failed' && !failureReason.trim()) {
      alert('Please provide a failure reason');
      return;
    }

    if (!confirm(`Are you sure you want to mark this payout as ${processStatus}?`)) {
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/payouts/admin/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          payoutId: selectedPayout.id,
          status: processStatus,
          failureReason: processStatus === 'failed' ? failureReason.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to process payout');
        return;
      }

      alert(`Payout ${processStatus} successfully`);
      setShowModal(false);
      setSelectedPayout(null);
      setFailureReason('');
      fetchPayouts();
    } catch (err) {
      console.error('Process payout error:', err);
      alert('Failed to process payout');
    } finally {
      setProcessing(false);
    }
  };

  const openProcessModal = (payout: Payout) => {
    setSelectedPayout(payout);
    setProcessStatus('completed');
    setFailureReason('');
    setShowModal(true);
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

  const parsePaymentDetails = (details: string | null) => {
    if (!details) return null;
    try {
      return JSON.parse(details);
    } catch {
      return { raw: details };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Payout Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Review and process affiliate payout requests</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleGenerateWeekly}
                disabled={generatingWeekly}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {generatingWeekly ? 'Generating...' : 'Generate Weekly Payouts'}
              </button>
              <Link
                href="/admin/affiliates"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View Affiliates
              </Link>
            </div>
          </div>
          {nextPayoutDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <strong>Next automatic payout generation:</strong> {nextPayoutDate}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 mb-6 transition-colors">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md max-w-xs text-gray-900 bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading payouts...</div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-hidden transition-colors">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Affiliate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Requested
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {payout.affiliate.user.name || 'No name'}
                            </p>
                            <p className="text-xs text-gray-500">{payout.affiliate.user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">
                            ₹{payout.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {getPaymentMethodLabel(payout.paymentMethod)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              payout.status
                            )}`}
                          >
                            {payout.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(payout.createdAt).toLocaleDateString()}
                          <br />
                          <span className="text-xs text-gray-400">
                            {new Date(payout.createdAt).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 flex-wrap gap-1">
                            <button
                              onClick={() => {
                                setSelectedPayout(payout);
                                setShowModal(true);
                              }}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              View
                            </button>
                            {(payout.status === 'pending' || payout.status === 'processing') && (
                              <button
                                onClick={() => openProcessModal(payout)}
                                disabled={processing}
                                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                              >
                                Process
                              </button>
                            )}
                            {(() => {
                              try {
                                const details = payout.paymentDetails ? JSON.parse(payout.paymentDetails) : {};
                                if (details.autoGenerated) {
                                  return (
                                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded font-medium">
                                      Auto
                                    </span>
                                  );
                                }
                              } catch (e) {}
                              return null;
                            })()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing page {page} of {totalPages} (Total: {total} payouts)
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

        {/* View/Process Modal */}
        {showModal && selectedPayout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transition-colors">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Payout Details</h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedPayout(null);
                      setFailureReason('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Affiliate Info */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">Affiliate Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">
                          {selectedPayout.affiliate.user.name || 'No name'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedPayout.affiliate.user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payout Details */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">Payout Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium text-lg">₹{selectedPayout.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-medium">
                          {getPaymentMethodLabel(selectedPayout.paymentMethod)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            selectedPayout.status
                          )}`}
                        >
                          {selectedPayout.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Requested At</p>
                        <p className="font-medium">
                          {new Date(selectedPayout.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  {selectedPayout.affiliate.kyc && (
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold mb-3">Bank Account Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Account Holder</p>
                          <p className="font-medium">
                            {selectedPayout.affiliate.kyc.accountHolderName || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Account Number</p>
                          <p className="font-medium">
                            {selectedPayout.affiliate.kyc.bankAccountNumber || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">IFSC Code</p>
                          <p className="font-medium">{selectedPayout.affiliate.kyc.bankIFSC || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Bank Name</p>
                          <p className="font-medium">{selectedPayout.affiliate.kyc.bankName || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Payment Details */}
                  {selectedPayout.paymentDetails && (
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold mb-3">Additional Details</h3>
                      <div className="bg-gray-50 p-3 rounded">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {JSON.stringify(parsePaymentDetails(selectedPayout.paymentDetails), null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Failure Reason */}
                  {selectedPayout.failureReason && (
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold mb-3 text-red-600">Failure Reason</h3>
                      <p className="text-red-700">{selectedPayout.failureReason}</p>
                    </div>
                  )}

                  {/* Process Payout Form */}
                  {(selectedPayout.status === 'pending' || selectedPayout.status === 'processing') && (
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold mb-3">Process Payout</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <select
                            value={processStatus}
                            onChange={(e) =>
                              setProcessStatus(e.target.value as 'completed' | 'failed')
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                          >
                            <option value="completed">Mark as Completed</option>
                            <option value="failed">Mark as Failed</option>
                          </select>
                        </div>

                        {processStatus === 'failed' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Failure Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={failureReason}
                              onChange={(e) => setFailureReason(e.target.value)}
                              placeholder="Provide a reason for failure..."
                              rows={3}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400"
                            />
                          </div>
                        )}

                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => {
                              setShowModal(false);
                              setSelectedPayout(null);
                              setFailureReason('');
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleProcessPayout}
                            disabled={processing || (processStatus === 'failed' && !failureReason.trim())}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            {processing ? 'Processing...' : 'Process Payout'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
