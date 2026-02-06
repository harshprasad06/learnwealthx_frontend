'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Video {
  id: string;
  title: string;
  description: string | null;
  bunnyVideoId: string;
  order: number;
}

export default function ManageVideosPage() {
  const params = useParams();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    bunnyVideoId: '',
    order: '',
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMode, setUploadMode] = useState<'upload' | 'manual'>('upload');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, [params.id]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses/${params.id}`, {
        credentials: 'include',
      });
      const data = await res.json();
      const fetchedVideos = data.course?.videos || [];
      setVideos(fetchedVideos);
      
      // Auto-set order to next number if adding new video
      if (!editingVideo && fetchedVideos.length > 0) {
        const maxOrder = Math.max(...fetchedVideos.map((v: Video) => v.order));
        if (!formData.order || formData.order === '') {
          setFormData(prev => ({ ...prev, order: (maxOrder + 1).toString() }));
        }
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setUploadProgress(0);
      // Auto-fill title from filename if title is empty
      if (!formData.title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setFormData({ ...formData, title: nameWithoutExt });
      }
    }
  };

  const uploadVideoToBunny = async (): Promise<{ bunnyVideoId: string } | null> => {
    if (!videoFile) {
      return null;
    }

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('video', videoFile);
      formDataUpload.append('title', formData.title || videoFile.name);

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const raw = (e.loaded / e.total) * 100;
            const percentComplete = Math.max(1, Math.min(raw, 99)); // keep 1–99 during upload
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve({
              bunnyVideoId: data.bunnyVideoId,
            });
          } else {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.error || 'Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', `${API_URL}/api/upload/bunny`);
        xhr.withCredentials = true;
        xhr.send(formDataUpload);
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // prevent double submit

    setSubmitting(true);
    setUploadProgress(0);

    let bunnyVideoId = formData.bunnyVideoId;

    // If uploading a file, upload to Bunny.net first
    if (uploadMode === 'upload' && videoFile) {
      const uploadResult = await uploadVideoToBunny();
      if (!uploadResult) {
        setSubmitting(false);
        setUploadProgress(0);
        return; // Upload failed, stop submission
      }
      bunnyVideoId = uploadResult.bunnyVideoId;
    }

    // Validate bunnyVideoId
    if (!bunnyVideoId) {
      alert('Please upload a video or enter a Bunny.net Video ID');
      setSubmitting(false);
      setUploadProgress(0);
      return;
    }

    // Validate order
    if (!formData.order || isNaN(parseInt(formData.order))) {
      alert('Please enter a valid order number');
      setSubmitting(false);
      setUploadProgress(0);
      return;
    }

    try {
      const url = editingVideo
        ? `${API_URL}/api/courses/${params.id}/videos/${editingVideo.id}`
        : `${API_URL}/api/courses/${params.id}/videos`;
      const method = editingVideo ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          bunnyVideoId,
          order: parseInt(formData.order),
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingVideo(null);
        setFormData({ title: '', description: '', bunnyVideoId: '', order: '' });
        setVideoFile(null);
        setUploadMode('upload');
        fetchVideos();
        alert('Video uploaded and saved successfully.');
      } else {
        const data = await res.json();
        console.error('Error response:', data);
        alert(data.error || data.message || 'Failed to save video');
      }
    } catch (error) {
      console.error('Error saving video:', error);
      alert('Something went wrong: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      bunnyVideoId: video.bunnyVideoId,
      order: video.order.toString(),
    });
    setVideoFile(null);
    setUploadMode('manual'); // Default to manual when editing
    setShowForm(true);
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const res = await fetch(`${API_URL}/api/courses/${params.id}/videos/${videoId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        fetchVideos();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Something went wrong');
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <button
            onClick={() => router.push('/admin/courses')}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 text-sm font-medium"
          >
            ← Back to Courses
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Manage Videos</h1>
            {submitting && (
              <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 text-xs font-medium border border-blue-200 dark:border-blue-700">
                <span className="mr-2 h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-300 animate-pulse" />
                {uploadMode === 'upload' && videoFile
                  ? 'Uploading video to Bunny.net…'
                  : 'Saving video details…'}
              </span>
            )}
          </div>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 mb-8 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">
              {editingVideo ? 'Edit Video' : 'Add Video'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  rows={2}
                  placeholder="Enter video description"
                />
              </div>
              {/* Upload Mode Toggle - Only show when adding new video */}
              {!editingVideo && (
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={uploadMode === 'upload'}
                      onChange={() => setUploadMode('upload')}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Upload Video
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={uploadMode === 'manual'}
                      onChange={() => setUploadMode('manual')}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enter Video ID
                    </span>
                  </label>
                </div>
              )}

              {/* Upload Video Option */}
              {uploadMode === 'upload' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Video File *
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Supported formats: MP4, WebM, MOV, AVI, MKV (Max 2GB)
                  </p>
                  {submitting && uploadMode === 'upload' && videoFile && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Uploading...{' '}
                        {uploadProgress > 0 ? `${Math.round(uploadProgress)}%` : 'Starting...'}
                      </p>
                    </div>
                  )}
                  {videoFile && !submitting && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      ✓ {videoFile.name} selected
                    </p>
                  )}
                </div>
              )}

              {/* Manual Video ID Option - Show when manual mode or editing */}
              {(uploadMode === 'manual' || editingVideo) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bunny.net Video ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bunnyVideoId}
                    onChange={(e) => setFormData({ ...formData, bunnyVideoId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Enter Bunny.net video ID (e.g., 0f7c32e5-6f2d-452a-93e3-5be5c2469c59)"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Order *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="1"
                />
              </div>
              {/* Duration is auto-detected during upload (if available). No manual entry needed. */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? uploadMode === 'upload' && videoFile
                      ? 'Uploading to Bunny...'
                      : editingVideo
                      ? 'Saving changes...'
                      : 'Saving video...'
                    : editingVideo
                    ? 'Update Video'
                    : 'Add Video'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingVideo(null);
                    setFormData({ title: '', description: '', bunnyVideoId: '', order: '' });
                    setVideoFile(null);
                  }}
                  className="bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-100 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
            Videos ({videos.length})
          </h2>
          <button
            onClick={() => {
              setEditingVideo(null);
              setFormData({ 
                title: '', 
                description: '', 
                bunnyVideoId: '', 
                order: videos.length > 0 ? (Math.max(...videos.map(v => v.order)) + 1).toString() : '1', 
              });
              setVideoFile(null);
              setUploadMode('upload');
              setShowForm(true);
            }}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Video
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            Loading videos...
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">No videos yet</div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden transition-colors">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Bunny Video ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {videos.map((video) => (
                  <tr key={video.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                        {video.order}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                        {video.title}
                      </div>
                      {video.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {video.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100 font-mono text-xs">
                        {video.bunnyVideoId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(video)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md border border-blue-100 dark:border-blue-900/40 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 113 3L13 14l-4 1 1-4 8.5-8.5z"
                            />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md border border-red-100 dark:border-red-900/40 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 7h12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-7 4v6m4-6v6M5 7h14l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7z"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {/* Full-screen loading overlay during full submit flow */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg px-6 py-4 flex flex-col items-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {uploadMode === 'upload' && videoFile
                ? 'Uploading video to Bunny.net...'
                : 'Saving video details...'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {uploadMode === 'upload' && videoFile
                ? uploadProgress > 0
                  ? `${Math.round(uploadProgress)}% completed. Please keep this tab open.`
                  : 'Starting upload... Please keep this tab open.'
                : 'Please wait, this will only take a moment.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
