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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMode, setUploadMode] = useState<'upload' | 'manual'>('upload');

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

    setUploading(true);
    setUploadProgress(0);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('video', videoFile);
      formDataUpload.append('title', formData.title || videoFile.name);

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
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
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let bunnyVideoId = formData.bunnyVideoId;

    // If uploading a file, upload to Bunny.net first
    if (uploadMode === 'upload' && videoFile) {
      const uploadResult = await uploadVideoToBunny();
      if (!uploadResult) {
        return; // Upload failed, stop submission
      }
      bunnyVideoId = uploadResult.bunnyVideoId;
    }

    // Validate bunnyVideoId
    if (!bunnyVideoId) {
      alert('Please upload a video or enter a Bunny.net Video ID');
      return;
    }

    // Validate order
    if (!formData.order || isNaN(parseInt(formData.order))) {
      alert('Please enter a valid order number');
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
      } else {
        const data = await res.json();
        console.error('Error response:', data);
        alert(data.error || data.message || 'Failed to save video');
      }
    } catch (error) {
      console.error('Error saving video:', error);
      alert('Something went wrong: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/courses')}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Courses
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Manage Videos</h1>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              {editingVideo ? 'Edit Video' : 'Add Video'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400"
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400"
                  rows={2}
                  placeholder="Enter video description"
                />
              </div>
              {/* Upload Mode Toggle - Only show when adding new video */}
              {!editingVideo && (
                <div className="flex items-center space-x-4 mb-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={uploadMode === 'upload'}
                      onChange={() => setUploadMode('upload')}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Upload Video</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={uploadMode === 'manual'}
                      onChange={() => setUploadMode('manual')}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Enter Video ID</span>
                  </label>
                </div>
              )}

              {/* Upload Video Option */}
              {uploadMode === 'upload' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video File *
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Supported formats: MP4, WebM, MOV, AVI, MKV (Max 2GB)
                  </p>
                  {uploading && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Uploading... {Math.round(uploadProgress)}%
                      </p>
                    </div>
                  )}
                  {videoFile && !uploading && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ {videoFile.name} selected
                    </p>
                  )}
                </div>
              )}

              {/* Manual Video ID Option - Show when manual mode or editing */}
              {(uploadMode === 'manual' || editingVideo) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bunny.net Video ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bunnyVideoId}
                    onChange={(e) => setFormData({ ...formData, bunnyVideoId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter Bunny.net video ID (e.g., 0f7c32e5-6f2d-452a-93e3-5be5c2469c59)"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Order *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400"
                  placeholder="1"
                />
              </div>
              {/* Duration is auto-detected during upload (if available). No manual entry needed. */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : editingVideo ? 'Update Video' : 'Add Video'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingVideo(null);
                    setFormData({ title: '', description: '', bunnyVideoId: '', order: '' });
                    setVideoFile(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Videos ({videos.length})</h2>
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Video
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No videos yet</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bunny Video ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {videos.map((video) => (
                  <tr key={video.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{video.order}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{video.title}</div>
                      {video.description && (
                        <div className="text-sm text-gray-500">{video.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono text-xs">{video.bunnyVideoId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(video)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
