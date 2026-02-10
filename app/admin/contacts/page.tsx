'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  userId: string | null;
  repliedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    picture: string | null;
  } | null;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    archived: 0,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [page, filters]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        offset: ((page - 1) * ITEMS_PER_PAGE).toString(),
      });

      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }

      if (filters.search) {
        params.append('search', filters.search);
      }

      const res = await fetch(`${API_URL}/api/contact/admin?${params}`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
        setTotal(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / ITEMS_PER_PAGE));
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        setError(errorData.error || `Failed to load contacts (${res.status})`);
      }
    } catch (err: any) {
      console.error('Contacts fetch error:', err);
      setError(`Failed to load contacts: ${err.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/contact/admin/stats/summary`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const handleStatusChange = async (contactId: string, newStatus: string) => {
    try {
      setProcessing(true);
      const res = await fetch(`${API_URL}/api/contact/admin/${contactId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchContacts();
        fetchStats();
        if (selectedContact?.id === contactId) {
          setSelectedContact({ ...selectedContact, status: newStatus });
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update status');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact submission?')) {
      return;
    }

    try {
      setProcessing(true);
      const res = await fetch(`${API_URL}/api/contact/admin/${contactId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        fetchContacts();
        fetchStats();
        if (selectedContact?.id === contactId) {
          setShowModal(false);
          setSelectedContact(null);
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete contact');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete contact');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'read':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'replied':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const renderAvatar = (contact: Contact) => {
    if (contact.user?.picture) {
      return (
        <img
          src={contact.user.picture}
          alt={contact.user.name || contact.user.email}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }

    const displayName = contact.user?.name || contact.name || contact.email;
    const initial = displayName.charAt(0).toUpperCase();

    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
        {initial}
      </div>
    );
  };

  if (loading && contacts.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">Loading contacts...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Contact Submissions</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Manage and respond to contact form submissions</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 transition-colors">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stats.total}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 transition-colors">
              <div className="text-sm text-gray-600 dark:text-gray-400">New</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.new}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 transition-colors">
              <div className="text-sm text-gray-600 dark:text-gray-400">Read</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.read}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 transition-colors">
              <div className="text-sm text-gray-600 dark:text-gray-400">Replied</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.replied}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 transition-colors">
              <div className="text-sm text-gray-600 dark:text-gray-400">Archived</div>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.archived}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 mb-6 transition-colors">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name, email, phone, subject, or message..."
                  value={filters.search}
                  onChange={(e) => {
                    setFilters({ ...filters, search: e.target.value });
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
              <div>
                <select
                  value={filters.status}
                  onChange={(e) => {
                    setFilters({ ...filters, status: e.target.value });
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Contacts Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {contacts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No contacts found.
                      </td>
                    </tr>
                  ) : (
                    contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {renderAvatar(contact)}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                                {contact.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-gray-50">{contact.subject}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contact.status)}`}
                          >
                            {contact.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedContact(contact);
                              setShowModal(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                          >
                            View
                          </button>
                          <select
                            value={contact.status}
                            onChange={(e) => handleStatusChange(contact.id, e.target.value)}
                            disabled={processing}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 mr-3"
                          >
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                            <option value="archived">Archived</option>
                          </select>
                          <button
                            onClick={() => handleDelete(contact.id)}
                            disabled={processing}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, total)} of {total} contacts
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Detail Modal */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Contact Details</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedContact(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <div className="mt-1 text-gray-900 dark:text-gray-50">{selectedContact.name}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <div className="mt-1 text-gray-900 dark:text-gray-50">
                    <a href={`mailto:${selectedContact.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {selectedContact.email}
                    </a>
                  </div>
                </div>
                {selectedContact.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                    <div className="mt-1 text-gray-900 dark:text-gray-50">
                      <a href={`tel:${selectedContact.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {selectedContact.phone}
                      </a>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                  <div className="mt-1 text-gray-900 dark:text-gray-50">{selectedContact.subject}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-50 whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedContact.status)}`}>
                      {selectedContact.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Submitted</label>
                  <div className="mt-1 text-gray-900 dark:text-gray-50">
                    {new Date(selectedContact.createdAt).toLocaleString()}
                  </div>
                </div>
                {selectedContact.repliedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Replied At</label>
                    <div className="mt-1 text-gray-900 dark:text-gray-50">
                      {new Date(selectedContact.repliedAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <select
                  value={selectedContact.status}
                  onChange={(e) => handleStatusChange(selectedContact.id, e.target.value)}
                  disabled={processing}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
                <button
                  onClick={() => handleDelete(selectedContact.id)}
                  disabled={processing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
