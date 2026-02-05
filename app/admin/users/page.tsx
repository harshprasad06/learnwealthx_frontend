'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  picture: string | null;
  provider: string | null;
  createdAt: string;
  affiliate: {
    id: string;
    referralCode: string;
    kycStatus: string;
    totalClicks: number;
    totalSignups: number;
    totalEarnings: number;
    isActive: boolean;
    wallet?: {
      totalEarned: number;
    } | null;
  } | null;
  _count: {
    purchases: number;
  };
}

interface UserDetails extends User {
  purchases?: Array<{
    id: string;
    amount: number;
    createdAt: string;
    course: {
      id: string;
      title: string;
      price: number;
    };
  }>;
  subscriptions?: Array<{
    id: string;
    planType: string;
    status: string;
    amount: number;
  }>;
  affiliate?: {
    id: string;
    referralCode: string;
    kycStatus: string;
    totalClicks: number;
    totalSignups: number;
    totalEarnings: number;
    isActive: boolean;
    wallet?: {
      balance: number;
      totalEarned: number;
      totalPaid: number;
    };
    kyc?: {
      status: string;
      submittedAt: string;
    };
  } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    role: 'all',
    search: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchUsers();
  }, [page, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(filters.role !== 'all' && { role: filters.role }),
        ...(filters.search && { search: filters.search }),
      });

      const res = await fetch(`${API_URL}/api/admin/users?${params}`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load users');
        return;
      }

      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Users fetch error:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
  });
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleView = async (user: User) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${user.id}`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to load user details');
        return;
      }

      setSelectedUser(data.user);
      setShowViewModal(true);
    } catch (err) {
      console.error('View user error:', err);
      alert('Failed to load user details');
    }
  };

  const handleEdit = (user: User) => {
    setEditForm({
      name: user.name || '',
      email: user.email,
      role: user.role,
    });
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to update user');
        return;
      }

      alert('User updated successfully');
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Update user error:', err);
      alert('Failed to update user');
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user "${user.email}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to delete user');
        return;
      }

      alert('User deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Failed to delete user');
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'AFFILIATE':
        return 'bg-blue-100 text-blue-800';
      case 'BUYER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Users Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all users and their roles</p>
          </div>
          <Link
            href="/admin/affiliates"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View Affiliates
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 mb-6 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => {
                  setFilters({ ...filters, role: e.target.value });
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 transition-colors"
              >
                <option value="all">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="AFFILIATE">Affiliate</option>
                <option value="BUYER">Buyer</option>
                <option value="GUEST">Guest</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search (Email/Name)
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setPage(1);
                }}
                placeholder="Search users..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4 transition-colors">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading users...</div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-hidden transition-colors">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Purchases
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Affiliate Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {renderAvatar(user.picture, user.name, user.email, `user-${user.id}`)}
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                                {user.name || 'No name'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                              {user.provider && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  via {user.provider === 'google' ? 'Google' : user.provider}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-50">
                          {user._count.purchases} course{user._count.purchases !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {user.affiliate ? (
                            <div>
                              <p className="text-gray-900 dark:text-gray-50">Code: {user.affiliate.referralCode}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                KYC: {user.affiliate.kycStatus}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ₹
                                {(
                                  user.affiliate.wallet?.totalEarned ??
                                  user.affiliate.totalEarnings
                                ).toFixed(2)}{' '}
                                lifetime earnings
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleView(user)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                              title="View Details"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-md transition-colors"
                              title="Edit User"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                              title="Delete User"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
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
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing page {page} of {totalPages} (Total: {total} users)
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* View User Modal */}
        {showViewModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transition-colors">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">User Details</h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {renderAvatar(selectedUser.picture, selectedUser.name, selectedUser.email, `selected-user-${selectedUser.id}`)}
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">{selectedUser.name || 'No name'}</p>
                      <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                      <p className="font-medium text-gray-900 dark:text-gray-50">{selectedUser.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Provider</p>
                      <p className="font-medium text-gray-900 dark:text-gray-50">{selectedUser.provider || 'Email'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
                      <p className="font-medium text-gray-900 dark:text-gray-50">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Purchases</p>
                      <p className="font-medium text-gray-900 dark:text-gray-50">
                        {(selectedUser as any).purchases
                          ? (selectedUser as any).purchases.length
                          : selectedUser._count
                          ? selectedUser._count.purchases
                          : 0}{' '}
                        courses
                      </p>
                    </div>
                  </div>

                  {selectedUser.affiliate && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-50">Affiliate Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Referral Code</p>
                          <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-gray-50">
                            {selectedUser.affiliate.referralCode}
                          </code>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">KYC Status</p>
                          <p className="font-medium text-gray-900 dark:text-gray-50">{selectedUser.affiliate.kycStatus}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Lifetime Earnings</p>
                          <p className="font-medium text-green-600 dark:text-green-400">
                            ₹{selectedUser.affiliate.totalEarnings.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                          <p className="font-medium text-gray-900 dark:text-gray-50">
                            {selectedUser.affiliate.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50 max-w-md w-full mx-4 transition-colors">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Edit User</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 transition-colors"
                    >
                      <option value="GUEST">Guest</option>
                      <option value="BUYER">Buyer</option>
                      <option value="AFFILIATE">Affiliate</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
