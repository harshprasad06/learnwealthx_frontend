'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Milestone {
  id: string;
  targetCount: number;
  reward: string;
  description: string | null;
  isActive: boolean;
  order: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminMilestonesPage() {
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [formData, setFormData] = useState({
    targetCount: '',
    rewardType: '',
    reward: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      const res = await fetch(`${API_URL}/api/milestones/admin`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setMilestones(data.milestones || []);
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Milestones API error:', errorData);
        setError(errorData.error || `Failed to load milestones (${res.status})`);
      }
    } catch (err: any) {
      console.error('Milestones fetch error:', err);
      setError(`Failed to load milestones: ${err.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getRewardText = (type: string): string => {
    switch (type) {
      case 'international':
        return 'International Trip';
      case 'national':
        return 'National Trip';
      case 'with_flight':
        return 'Trip with Flight';
      case 'without_flight':
        return 'Trip without Flight';
      default:
        return '';
    }
  };

  const handleRewardTypeChange = (type: string) => {
    setFormData({
      ...formData,
      rewardType: type,
      reward: type ? getRewardText(type) : formData.reward,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Use custom reward if provided, otherwise use reward type
    const finalReward = formData.reward.trim() || getRewardText(formData.rewardType);
    
    if (!finalReward) {
      setError('Please select a reward type or enter a custom reward');
      return;
    }

    try {
      const url = editingMilestone
        ? `${API_URL}/api/milestones/admin/${editingMilestone.id}`
        : `${API_URL}/api/milestones/admin`;
      const method = editingMilestone ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          targetCount: parseInt(formData.targetCount),
          reward: finalReward,
          description: formData.description || null,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingMilestone(null);
        setFormData({ targetCount: '', rewardType: '', reward: '', description: '' });
        fetchMilestones();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save milestone');
      }
    } catch (err) {
      console.error('Save milestone error:', err);
      setError('Failed to save milestone');
    }
  };

  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    // Parse reward to extract type if it matches a pattern
    const rewardLower = milestone.reward.toLowerCase();
    const rewardType = rewardLower.includes('international') ? 'international'
      : rewardLower.includes('national') ? 'national'
      : rewardLower.includes('with flight') || rewardLower.includes('with_flight') ? 'with_flight'
      : rewardLower.includes('without flight') || rewardLower.includes('without_flight') ? 'without_flight'
      : '';
    
    setFormData({
      targetCount: milestone.targetCount.toString(),
      rewardType: rewardType,
      reward: rewardType ? '' : milestone.reward, // Clear if type matches, keep if custom
      description: milestone.description || '',
      startDate: milestone.startDate ? new Date(milestone.startDate).toISOString().substring(0, 10) : '',
      endDate: milestone.endDate ? new Date(milestone.endDate).toISOString().substring(0, 10) : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this milestone? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/milestones/admin/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        fetchMilestones();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete milestone');
      }
    } catch (err) {
      console.error('Delete milestone error:', err);
      alert('Failed to delete milestone');
    }
  };

  const handleToggleActive = async (milestone: Milestone) => {
    try {
      const res = await fetch(`${API_URL}/api/milestones/admin/${milestone.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          isActive: !milestone.isActive,
        }),
      });

      if (res.ok) {
        fetchMilestones();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update milestone');
      }
    } catch (err) {
      console.error('Toggle active error:', err);
      alert('Failed to update milestone');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">Loading milestones...</div>
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
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Milestones & Offers</h1>
            <button
                    onClick={() => {
                      setShowForm(true);
                      setEditingMilestone(null);
                      setFormData({ targetCount: '', rewardType: '', reward: '', description: '' });
                    }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Milestone
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {showForm && (
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">
                {editingMilestone ? 'Edit Milestone' : 'Create Milestone'}
              </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Count (subscriptions)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.targetCount}
                    onChange={(e) => setFormData({ ...formData, targetCount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                  />
                </div>
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reward Type
                  </label>
                  <select
                    value={formData.rewardType}
                    onChange={(e) => handleRewardTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                  >
                    <option value="">Select reward type...</option>
                    <option value="international">International Trip</option>
                    <option value="national">National Trip</option>
                    <option value="with_flight">Trip with Flight</option>
                    <option value="without_flight">Trip without Flight</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Custom Reward (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.reward}
                    onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                    placeholder="Leave empty to use selected type, or enter custom reward text"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    If left empty, will use the selected reward type above. Enter custom text to override.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                    rows={3}
                    placeholder="Additional details about this reward..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingMilestone ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingMilestone(null);
                      setFormData({ targetCount: '', rewardType: '', reward: '', description: '' });
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-hidden transition-colors">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Reward
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {milestones.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No milestones found. Create your first milestone!
                    </td>
                  </tr>
                ) : (
                  milestones.map((milestone) => (
                    <tr key={milestone.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50">
                        {milestone.targetCount} subscriptions
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-50">
                        <div className="font-medium">{milestone.reward}</div>
                        {milestone.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {milestone.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            milestone.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {milestone.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleActive(milestone)}
                            className="inline-flex items-center px-3 py-1.5 rounded-md border border-blue-100 dark:border-blue-900/40 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                            title={milestone.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {milestone.isActive ? (
                              <>
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Deactivate
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Activate
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(milestone)}
                            className="inline-flex items-center px-3 py-1.5 rounded-md border border-indigo-100 dark:border-indigo-900/40 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                            title="Edit milestone"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 113 3L13 14l-4 1 1-4 8.5-8.5z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(milestone.id)}
                            className="inline-flex items-center px-3 py-1.5 rounded-md border border-red-100 dark:border-red-900/40 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                            title="Delete milestone"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
