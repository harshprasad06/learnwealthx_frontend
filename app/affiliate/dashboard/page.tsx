'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface AffiliateInfo {
  id: string;
  referralCode: string;
  isActive: boolean;
  kycStatus: string;
  totalClicks: number;
  totalSignups: number;
  totalEarnings: number;
  createdAt: string;
}

interface ReferralUser {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  provider: string | null;
  createdAt: string;
  hasPurchased: boolean;
  purchaseCount: number;
  totalSpent: number;
  purchases: Array<{
    id: string;
    amount: number;
    createdAt: string;
    course: {
      title: string;
    };
  }>;
}

interface AffiliatePurchase {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  course: {
    id: string;
    title: string;
    price: number;
  };
  user: {
    id: string;
    email: string;
    name: string | null;
    picture: string | null;
    provider: string | null;
    signupDate: string;
  };
}

export default function AffiliateDashboardPage() {
  const [affiliate, setAffiliate] = useState<AffiliateInfo | null>(null);
  const [referrals, setReferrals] = useState<ReferralUser[]>([]);
  const [purchases, setPurchases] = useState<AffiliatePurchase[]>([]);
  const [courseLinks, setCourseLinks] = useState<
    { courseId: string; title: string; price: number; link: string; purchasedAt: string }[]
  >([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [commissionRate, setCommissionRate] = useState<number>(0.3); // Default 30%
  const [kycStatus, setKycStatus] = useState<'not_submitted' | 'pending' | 'under_review' | 'approved' | 'rejected'>('not_submitted');
  const [kycLoading, setKycLoading] = useState(false);
  const [kycError, setKycError] = useState('');
  const [kycMessage, setKycMessage] = useState('');
  const [walletBalance, setWalletBalance] = useState<{
    balance: number;
    totalEarned: number;
    totalPaid: number;
  } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/affiliate/me`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load affiliate dashboard');
        return;
      }

      setAffiliate(data.affiliate);
      setReferrals(data.referrals || []);
      setPurchases(data.purchases || []);
      setCommissionRate(data.commissionRate || 0.3); // Store commission rate from API
      setCourseLinks(
        (data.courseLinks || []).map((c: any) => ({
          ...c,
          link: '', // will be generated client-side
        }))
      );
      // After affiliate is ensured, fetch KYC status
      await fetchKycStatus();
      
      // Fetch wallet balance
      await fetchWalletBalance();
    } catch (err) {
      console.error('Affiliate dashboard error:', err);
      setError('Failed to load affiliate dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallet/balance`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setWalletBalance({
          balance: data.balance || 0,
          totalEarned: data.totalEarned || 0,
          totalPaid: data.totalPaid || 0,
        });
      }
    } catch (err) {
      console.error('Wallet balance fetch error:', err);
    }
  };

  const fetchKycStatus = async () => {
    setKycLoading(true);
    setKycError('');
    try {
      const res = await fetch(`${API_URL}/api/kyc/status`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        // If affiliate not found or other error, just show not submitted
        setKycStatus('not_submitted');
        return;
      }

      setKycStatus(data.status as any);
    } catch (err) {
      console.error('KYC status error:', err);
      setKycError('Failed to load KYC status');
    } finally {
      setKycLoading(false);
    }
  };

  const handleKycSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setKycError('');
    setKycMessage('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      setKycLoading(true);
      const res = await fetch(`${API_URL}/api/kyc/submit`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setKycError(data.error || 'Failed to submit KYC');
        return;
      }

      setKycMessage(data.message || 'KYC submitted successfully.');
      setKycStatus('pending');
      // Optionally reset form
      form.reset();
    } catch (err) {
      console.error('KYC submit error:', err);
      setKycError('Failed to submit KYC. Please try again.');
    } finally {
      setKycLoading(false);
    }
  };

  const handleGenerateLink = () => {
    if (!affiliate || selectedCourseIds.length === 0) {
      alert('Please select at least one course to generate a link.');
      return;
    }
    const origin =
      typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/ref/${affiliate.id}?courses=${selectedCourseIds.join(
      ','
    )}`;
    setGeneratedLink(link);
  };

  const handleCopyGeneratedLink = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      alert('Referral link copied to clipboard!');
    } catch {
      alert('Failed to copy link. Please copy it manually.');
    }
  };

  const handleImageLoad = (imageId: string) => {
    setLoadedImages((prev) => new Set(prev).add(imageId));
  };

  const handleImageError = (imageId: string) => {
    setFailedImages((prev) => new Set(prev).add(imageId));
  };

  const renderAvatar = (
    picture: string | null,
    name: string | null,
    email: string,
    imageId: string
  ) => {
    const displayName = name || email;
    const initial = displayName.charAt(0).toUpperCase();
    const hasPicture = !!picture;
    const imageLoaded = loadedImages.has(imageId);
    const imageFailed = failedImages.has(imageId);
    const showImage = hasPicture && imageLoaded && !imageFailed;

    return (
      <div className="relative w-8 h-8 rounded-full overflow-hidden">
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading affiliate dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              You are not registered as an affiliate yet.
            </p>
            <p className="text-gray-500">
              Ask admin to enable affiliate registration or add a registration button here later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If KYC is not approved, show KYC onboarding instead of full affiliate tools
  if (kycStatus !== 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-3">
              KYC Verification Required
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Complete your Know Your Customer (KYC) verification to unlock affiliate features and receive secure payouts.
            </p>
          </div>

          {/* Status Banner */}
          {kycLoading ? (
            <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 rounded-lg shadow-sm p-5 mb-6">
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 text-blue-500 dark:text-blue-300 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-blue-800 dark:text-blue-100 font-medium">
                  Checking your KYC status...
                </p>
              </div>
            </div>
          ) : kycStatus === 'pending' || kycStatus === 'under_review' ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 rounded-lg shadow-sm p-5 mb-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-300 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-yellow-800 dark:text-yellow-100 font-semibold mb-1">
                    KYC Under Review
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-100/90 text-sm">
                    Your KYC documents have been submitted and are currently under review. Once approved, your affiliate dashboard will be unlocked.
                  </p>
                </div>
              </div>
            </div>
          ) : kycStatus === 'rejected' ? (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 rounded-lg shadow-sm p-5 mb-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-red-600 dark:text-red-300 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-red-800 dark:text-red-100 font-semibold mb-1">
                    KYC Rejected
                  </h3>
                  <p className="text-red-700 dark:text-red-100/90 text-sm">
                    Your previous KYC submission was rejected. Please review your details and submit again with correct information.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* KYC Form */}
          {(kycStatus === 'not_submitted' || kycStatus === 'rejected') && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white mb-2">Complete Your Verification</h2>
                <p className="text-blue-100 text-sm">
                  All information is encrypted and secure. This process typically takes 1-2 business days.
                </p>
              </div>

              <div className="p-8">
                {kycError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-300 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-800 dark:text-red-100 text-sm">{kycError}</p>
                    </div>
                  </div>
                )}
                {kycMessage && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-300 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-green-800 dark:text-green-100 text-sm">{kycMessage}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleKycSubmit} className="space-y-8">
                  {/* Identity Section */}
                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                        Identity Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Document Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="documentType"
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700"
                        >
                          <option value="">Select document type</option>
                          <option value="aadhar">Aadhar Card</option>
                          <option value="pan">PAN Card</option>
                          <option value="passport">Passport</option>
                          <option value="driving_license">Driving License</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Document Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="documentNumber"
                          type="text"
                          required
                          placeholder="Enter document number"
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="dob"
                          type="date"
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          You must be 18 years or older to become an affiliate
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details Section */}
                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                        Bank Account Details
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 ml-13">
                      This account will be used for affiliate payouts.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Account Holder Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="accountHolderName"
                          type="text"
                          required
                          placeholder="As per bank records"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Bank Account Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="bankAccountNumber"
                          type="text"
                          required
                          placeholder="Enter account number"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Bank IFSC Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="bankIFSC"
                          type="text"
                          required
                          placeholder="e.g., HDFC0001234"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm uppercase text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Bank Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="bankName"
                          type="text"
                          required
                          placeholder="Enter bank name"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-6 ml-13">Upload clear, readable images or PDFs. Maximum file size: 5MB</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Document Front <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            name="documentFront"
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            required
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer border-2 border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">JPEG, PNG, or PDF</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Document Back <span className="text-gray-400">(Optional)</span>
                        </label>
                        <div className="relative">
                          <input
                            name="documentBack"
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 file:cursor-pointer border-2 border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">JPEG, PNG, or PDF</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Address Proof <span className="text-gray-400">(Optional)</span>
                        </label>
                        <div className="relative">
                          <input
                            name="addressProof"
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 file:cursor-pointer border-2 border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">JPEG, PNG, or PDF</p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-gray-200 flex justify-end">
                    <button
                      type="submit"
                      disabled={kycLoading}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center space-x-2"
                    >
                      {kycLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Submit KYC Verification</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">Affiliate Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your referral link and earn commissions on every sale.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 transition-colors">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Clicks</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">
              {affiliate.totalClicks}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 transition-colors">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Signups</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">
              {affiliate.totalSignups}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 transition-colors">
            <p className="text-sm text-gray-500 dark:text-gray-400">Lifetime Earnings</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              ₹{affiliate.totalEarnings.toFixed(2)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg p-4 text-white">
            <p className="text-sm font-medium opacity-90">Wallet Balance</p>
            <p className="text-2xl font-bold mt-1">
              ₹{walletBalance?.balance.toFixed(2) || '0.00'}
            </p>
            <Link
              href="/affiliate/wallet"
              className="text-xs opacity-75 hover:opacity-100 underline mt-1 inline-block"
            >
              View Details →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/affiliate/wallet"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg px-4 py-5 text-white hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1 text-white">My Wallet</h3>
                <p className="text-sm text-white/80">View balance and transactions</p>
              </div>
              <svg className="w-8 h-8 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </Link>
          <Link
            href="/affiliate/payouts"
            className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg px-4 py-5 text-white hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1 text-white">Request Payout</h3>
                <p className="text-sm text-white/80">Withdraw your earnings</p>
              </div>
              <svg className="w-8 h-8 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </Link>
          <Link
            href="/affiliate/analytics"
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg px-4 py-5 text-white hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1 text-white">Analytics</h3>
                <p className="text-sm text-white/80">Track performance & insights</p>
              </div>
              <svg className="w-8 h-8 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Course-specific Links (only for courses you own) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">Your Course Links</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            These links go directly to each course you have purchased. Share them with your
            audience to promote specific courses.
          </p>
          {courseLinks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              You haven&apos;t purchased any courses yet. Buy a course to get a unique link for it.
            </p>
          ) : (
            <>
              {/* Course selection and link generation */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Select one or more courses below and click &quot;Generate Referral Link&quot;.
                </p>
                <button
                  onClick={handleGenerateLink}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Generate Referral Link
                </button>
                {generatedLink && (
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      readOnly
                      value={generatedLink}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-gray-50"
                    />
                    <button
                      onClick={handleCopyGeneratedLink}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                    >
                      Copy Link
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Select
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Course
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {courseLinks.map((c) => {
                      const checked = selectedCourseIds.includes(c.courseId);
                      return (
                        <tr key={c.courseId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-50">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                setSelectedCourseIds((prev) =>
                                  e.target.checked
                                    ? [...prev, c.courseId]
                                    : prev.filter((id) => id !== c.courseId)
                                );
                              }}
                              className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-50">{c.title}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-50">
                            ₹{c.price.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Referrals */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">Referred Users ({referrals.length})</h2>
          {referrals.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No referred users yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Signup Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Purchases
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Total Spent
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {referrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          {renderAvatar(ref.picture, ref.name, ref.email, `ref-${ref.id}`)}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                              {ref.name || 'No name'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{ref.email}</p>
                            {ref.provider && (
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                via {ref.provider === 'google' ? 'Google' : ref.provider}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(ref.createdAt).toLocaleDateString()}
                        <br />
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(ref.createdAt).toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {ref.hasPurchased ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium">
                            Active Customer
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                            Not Purchased
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-50">
                        {ref.purchaseCount > 0 ? (
                          <div>
                            <span className="font-semibold">{ref.purchaseCount}</span> course
                            {ref.purchaseCount > 1 ? 's' : ''}
                            {ref.purchases.length > 0 && (
                              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {ref.purchases.slice(0, 2).map((p, idx) => (
                                  <div key={p.id}>
                                    • {p.course.title} (₹{p.amount.toFixed(2)})
                                  </div>
                                ))}
                                {ref.purchases.length > 2 && (
                                  <div>+ {ref.purchases.length - 2} more</div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {ref.totalSpent > 0 ? (
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            ₹{ref.totalSpent.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">₹0.00</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Purchases */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">
            Referred Purchases ({purchases.length})
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Total Commission: ₹
            {affiliate
              ? (affiliate.totalEarnings || 0).toFixed(2)
              : '0.00'}{' '}
            ({(commissionRate * 100).toFixed(0)}% of sales)
          </p>
          {purchases.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No referred purchases yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Commission
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Purchase Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {purchases.map((p) => {
                    const commission = p.amount * commissionRate;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            {renderAvatar(
                              p.user.picture,
                              p.user.name,
                              p.user.email,
                              `purchase-${p.id}`
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                                {p.user.name || 'No name'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{p.user.email}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                Joined:{' '}
                                {new Date(p.user.signupDate).toLocaleDateString()}
                                {p.user.provider && (
                                  <span> • via {p.user.provider === 'google' ? 'Google' : p.user.provider}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-50">
                          {p.course.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-50">
                          ₹{p.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            ₹{commission.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              p.status === 'success'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : p.status === 'pending'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(p.createdAt).toLocaleDateString()}
                          <br />
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(p.createdAt).toLocaleTimeString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

