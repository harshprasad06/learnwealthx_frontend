'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface KYCSubmission {
  id: string;
  status: string;
  documentType: string | null;
  documentNumber: string | null;
  documentFront: string | null;
  documentBack: string | null;
  addressProof: string | null;
  bankAccountNumber: string | null;
  bankIFSC: string | null;
  bankName: string | null;
  accountHolderName: string | null;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  affiliate: {
    id: string;
    user: {
      id: string;
      email: string;
      name: string | null;
      picture: string | null;
      provider: string | null;
    };
  };
}

export default function AdminKYCPage() {
  const [kycs, setKycs] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  });
  const [selectedKyc, setSelectedKyc] = useState<KYCSubmission | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchKycs();
  }, [page, filters]);

  const fetchKycs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const res = await fetch(`${API_URL}/api/kyc/admin/all?${params}`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load KYC submissions');
        return;
      }

      setKycs(data.kycs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('KYC fetch error:', err);
      setError('Failed to load KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (kycId: string) => {
    if (!confirm('Are you sure you want to approve this KYC submission?')) {
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/kyc/admin/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ kycId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to approve KYC');
        return;
      }

      alert('KYC approved successfully');
      setShowModal(false);
      fetchKycs();
    } catch (err) {
      console.error('Approve KYC error:', err);
      alert('Failed to approve KYC');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedKyc) return;

    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    if (!confirm('Are you sure you want to reject this KYC submission?')) {
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/kyc/admin/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          kycId: selectedKyc.id,
          rejectionReason: rejectionReason.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to reject KYC');
        return;
      }

      alert('KYC rejected successfully');
      setShowModal(false);
      setRejectionReason('');
      fetchKycs();
    } catch (err) {
      console.error('Reject KYC error:', err);
      alert('Failed to reject KYC');
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (kyc: KYCSubmission) => {
    setSelectedKyc(kyc);
    setRejectionReason(kyc.rejectionReason || '');
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleImageLoad = (imageId: string) => {
    setLoadedImages((prev) => new Set(prev).add(imageId));
  };

  const handleImageError = (imageId: string) => {
    setFailedImages((prev) => new Set(prev).add(imageId));
  };

  const renderAvatar = (picture: string | null, name: string | null, email: string, imageId: string) => {
    const displayName = name || email;
    const initial = displayName.charAt(0).toUpperCase();
    const hasPicture = !!picture;
    const imageLoaded = loadedImages.has(imageId);
    const imageFailed = failedImages.has(imageId);
    const showImage = hasPicture && imageLoaded && !imageFailed;

    return (
      <div className="relative w-10 h-10 rounded-full overflow-hidden">
        {/* Fallback - Always visible initially, hidden when image loads successfully */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm transition-opacity duration-200 ${
            showImage ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {initial}
        </div>
        {/* Image - Only shown if picture exists and loaded successfully */}
        {hasPicture && !imageFailed && (
          <img
            src={picture}
            alt={name || email}
            className={`absolute inset-0 w-full h-full object-cover rounded-full transition-opacity duration-200 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => handleImageLoad(imageId)}
            onError={() => handleImageError(imageId)}
            loading="lazy"
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">KYC Management</h1>
            <p className="text-gray-600 mt-1">Review and manage affiliate KYC submissions</p>
          </div>
          <Link
            href="/admin/affiliates"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View Affiliates
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search (Email/Name)
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setPage(1);
                }}
                placeholder="Search affiliates..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading KYC submissions...</div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Affiliate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Document
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Bank Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {kycs.map((kyc) => (
                      <tr key={kyc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {renderAvatar(
                              kyc.affiliate.user.picture,
                              kyc.affiliate.user.name,
                              kyc.affiliate.user.email,
                              `kyc-${kyc.id}`
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {kyc.affiliate.user.name || 'No name'}
                              </p>
                              <p className="text-xs text-gray-500">{kyc.affiliate.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div>
                            <p className="text-gray-900 capitalize">
                              {kyc.documentType?.replace('_', ' ') || 'N/A'}
                            </p>
                            <p className="text-gray-500 text-xs">{kyc.documentNumber || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div>
                            <p className="text-gray-900">{kyc.accountHolderName || 'N/A'}</p>
                            <p className="text-gray-500 text-xs">
                              {kyc.bankName || 'N/A'} • {kyc.bankIFSC || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              kyc.status
                            )}`}
                          >
                            {kyc.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(kyc.submittedAt).toLocaleDateString()}
                          <br />
                          <span className="text-xs text-gray-400">
                            {new Date(kyc.submittedAt).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedKyc(kyc);
                                setShowModal(true);
                              }}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              View
                            </button>
                            {kyc.status !== 'approved' && kyc.status !== 'rejected' && (
                              <>
                                <button
                                  onClick={() => handleApprove(kyc.id)}
                                  disabled={processing}
                                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => openRejectModal(kyc)}
                                  disabled={processing}
                                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}
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
                  Showing page {page} of {totalPages} (Total: {total} submissions)
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

        {/* View/Reject Modal */}
        {showModal && selectedKyc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">KYC Details</h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedKyc(null);
                      setRejectionReason('');
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
                    <div className="flex items-center space-x-3">
                      {renderAvatar(
                        selectedKyc.affiliate.user.picture,
                        selectedKyc.affiliate.user.name,
                        selectedKyc.affiliate.user.email,
                        `kyc-modal-${selectedKyc.id}`
                      )}
                      <div>
                        <p className="font-medium">{selectedKyc.affiliate.user.name || 'No name'}</p>
                        <p className="text-sm text-gray-600">{selectedKyc.affiliate.user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">Identity Document</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Document Type</p>
                        <p className="font-medium capitalize">
                          {selectedKyc.documentType?.replace('_', ' ') || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Document Number</p>
                        <p className="font-medium">{selectedKyc.documentNumber || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {selectedKyc.documentFront && (
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Document Front</p>
                          <a
                            href={`${API_URL}${selectedKyc.documentFront}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View Document →
                          </a>
                        </div>
                      )}
                      {selectedKyc.documentBack && (
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Document Back</p>
                          <a
                            href={`${API_URL}${selectedKyc.documentBack}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View Document →
                          </a>
                        </div>
                      )}
                      {selectedKyc.addressProof && (
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Address Proof</p>
                          <a
                            href={`${API_URL}${selectedKyc.addressProof}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View Document →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">Bank Account Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Account Holder Name</p>
                        <p className="font-medium">{selectedKyc.accountHolderName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Account Number</p>
                        <p className="font-medium">{selectedKyc.bankAccountNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">IFSC Code</p>
                        <p className="font-medium">{selectedKyc.bankIFSC || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bank Name</p>
                        <p className="font-medium">{selectedKyc.bankName || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Dates */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Status Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            selectedKyc.status
                          )}`}
                        >
                          {selectedKyc.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Submitted At</p>
                        <p className="font-medium">
                          {new Date(selectedKyc.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      {selectedKyc.reviewedAt && (
                        <div>
                          <p className="text-sm text-gray-500">Reviewed At</p>
                          <p className="font-medium">
                            {new Date(selectedKyc.reviewedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {selectedKyc.rejectionReason && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Rejection Reason</p>
                          <p className="font-medium text-red-600">{selectedKyc.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reject Form (if not approved/rejected) */}
                  {selectedKyc.status !== 'approved' && selectedKyc.status !== 'rejected' && (
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold mb-3">Reject KYC</h3>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rejection Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Provide a reason for rejection..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => {
                            setShowModal(false);
                            setSelectedKyc(null);
                            setRejectionReason('');
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={processing || !rejectionReason.trim()}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                          {processing ? 'Rejecting...' : 'Reject KYC'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Approve Button (if not approved/rejected) */}
                  {selectedKyc.status !== 'approved' && selectedKyc.status !== 'rejected' && (
                    <div className="border-t pt-4">
                      <button
                        onClick={() => handleApprove(selectedKyc.id)}
                        disabled={processing}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {processing ? 'Processing...' : 'Approve KYC'}
                      </button>
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
