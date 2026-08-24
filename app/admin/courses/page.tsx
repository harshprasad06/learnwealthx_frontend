'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Course {
  id: string;
  title: string;
  description: string | null;
  mrp: number;
  price: number;
  thumbnail: string | null;
  isPublished: boolean;
  videos: Array<{ id: string; title: string; order: number }>;
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mrp: '',
    price: '',
    thumbnail: '',
    isPublished: false,
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses`, {
        credentials: 'include',
      });
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadThumbnail = async (): Promise<string | null> => {
    if (!thumbnailFile) {
      return formData.thumbnail || null;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('thumbnail', thumbnailFile);

      const res = await fetch(`${API_URL}/api/upload/thumbnail`, {
        method: 'POST',
        credentials: 'include',
        body: formDataUpload,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        // Store the path exactly as returned by backend (e.g. /api/upload/thumbnail-proxy?key=...)
        const uploadedUrl = data.url as string;
        // Update preview to show the uploaded image
        if (!uploadedUrl.startsWith('http') && !uploadedUrl.startsWith('data:')) {
          setThumbnailPreview(`${API_URL}${uploadedUrl}`);
        } else {
          setThumbnailPreview(uploadedUrl);
        }
        return uploadedUrl;
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      alert('Failed to upload thumbnail');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Upload thumbnail first if a new file is selected
      let thumbnailUrl = formData.thumbnail;
      if (thumbnailFile) {
        const uploadedUrl = await uploadThumbnail();
        if (!uploadedUrl) {
          return; // Upload failed, stop submission
        }
        thumbnailUrl = uploadedUrl;
      }
      // The URL field carries the full URL (host included) for display, but the
      // DB should store the path relative to the backend so it stays portable
      // across environments. Strip the API host before persisting.
      if (thumbnailUrl && thumbnailUrl.startsWith(API_URL)) {
        thumbnailUrl = thumbnailUrl.slice(API_URL.length);
      }

      const url = editingCourse
        ? `${API_URL}/api/courses/${editingCourse.id}`
        : `${API_URL}/api/courses`;
      const method = editingCourse ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          thumbnail: thumbnailUrl,
          mrp: formData.mrp ? parseFloat(formData.mrp) : undefined,
          price: parseFloat(formData.price),
          isPublished: formData.isPublished,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingCourse(null);
        setFormData({ title: '', description: '', mrp: '', price: '', thumbnail: '', isPublished: false });
        setThumbnailFile(null);
        setThumbnailPreview('');
        fetchCourses();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save course');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Something went wrong');
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    // Build the full URL for relative paths so the URL field shows a valid,
    // complete URL (matching the preview) instead of a relative path that
    // fails the browser's native <input type="url"> validation.
    const thumbUrl = course.thumbnail || '';
    const fullThumbUrl =
      thumbUrl && !thumbUrl.startsWith('http') && !thumbUrl.startsWith('data:')
        ? `${API_URL}${thumbUrl}`
        : thumbUrl;
    setFormData({
      title: course.title,
      description: course.description || '',
      mrp: (course.mrp ?? course.price).toString(),
      price: course.price.toString(),
      thumbnail: fullThumbUrl,
      isPublished: course.isPublished,
    });
    setThumbnailFile(null);
    setThumbnailPreview(fullThumbUrl);
    setShowForm(true);
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const res = await fetch(`${API_URL}/api/courses/${courseId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        fetchCourses();
      } else {
        alert('Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Something went wrong');
    }
  };

  const handleAddVideo = (courseId: string) => {
    router.push(`/admin/courses/${courseId}/videos`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-ink-950 transition-colors">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-ink-50 text-center sm:text-left">
            Manage Courses
          </h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingCourse(null);
              setFormData({ title: '', description: '', mrp: '', price: '', thumbnail: '', isPublished: false });
              setThumbnailFile(null);
              setThumbnailPreview('');
            }}
            className="w-full sm:w-auto bg-blue-600 dark:bg-mint-500 text-white dark:text-ink-950 px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-mint-400"
          >
            Add Course
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-ink-900 rounded-lg shadow-md dark:shadow-black/40 p-6 mb-8 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-ink-50">
              {editingCourse ? 'Edit Course' : 'New Course'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-ink-200">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-ink-700 rounded-md text-gray-900 dark:text-ink-50 bg-white dark:bg-ink-800 placeholder:text-gray-400 dark:placeholder:text-ink-400 transition-colors"
                  placeholder="Enter course title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-ink-200">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-ink-700 rounded-md text-gray-900 dark:text-ink-50 bg-white dark:bg-ink-800 placeholder:text-gray-400 dark:placeholder:text-ink-400 transition-colors"
                  rows={3}
                  placeholder="Enter course description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-ink-200">M.R.P. (₹) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-ink-700 rounded-md text-gray-900 dark:text-ink-50 bg-white dark:bg-ink-800 placeholder:text-gray-400 dark:placeholder:text-ink-400 transition-colors"
                  placeholder="e.g., 899.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-ink-200">Sale Price (₹) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-ink-700 rounded-md text-gray-900 dark:text-ink-50 bg-white dark:bg-ink-800 placeholder:text-gray-400 dark:placeholder:text-ink-400 transition-colors"
                  placeholder="e.g., 589.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-ink-200 mb-2">
                  Thumbnail
                </label>
                
                {/* File Upload */}
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="mt-1 block w-full text-sm text-gray-500 dark:text-ink-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-mint-900/20 file:text-blue-700 dark:file:text-mint-400 hover:file:bg-blue-100 dark:hover:file:bg-mint-900/30"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-ink-400">
                    Upload an image (JPG, PNG, GIF, WEBP - Max 5MB)
                  </p>
                </div>

                {/* Preview */}
                {(thumbnailPreview || formData.thumbnail) && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-ink-300 mb-2">Preview:</p>
                    <img
                      src={
                        thumbnailPreview
                          ? thumbnailPreview
                          : formData.thumbnail.startsWith('http') || formData.thumbnail.startsWith('data:')
                          ? formData.thumbnail
                          : `${API_URL}${formData.thumbnail}`
                      }
                      alt="Thumbnail preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-ink-700"
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Or use URL (fallback) */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-ink-200 mb-2">
                    Or enter thumbnail URL:
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => {
                      const url = e.target.value;
                      setFormData({ ...formData, thumbnail: url });
                      // Update preview - if it's a relative path, prepend API_URL
                      if (url && !url.startsWith('http') && !url.startsWith('data:')) {
                        setThumbnailPreview(`${API_URL}${url}`);
                      } else {
                        setThumbnailPreview(url);
                      }
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-ink-700 rounded-md text-gray-900 dark:text-ink-50 bg-white dark:bg-ink-800 placeholder:text-gray-400 dark:placeholder:text-ink-400"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700 dark:text-ink-200">
                  Published
                </label>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-blue-600 dark:bg-mint-500 text-white dark:text-ink-950 px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-mint-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : editingCourse ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCourse(null);
                  }}
                  className="bg-gray-300 dark:bg-ink-700 text-gray-700 dark:text-ink-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-ink-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-600 dark:text-ink-300">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-ink-300">No courses yet</div>
        ) : (
          <div className="bg-white dark:bg-ink-900 rounded-lg shadow-md dark:shadow-black/40 overflow-hidden transition-colors">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-ink-800">
              <thead className="bg-gray-50 dark:bg-ink-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-ink-200 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-ink-200 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-ink-200 uppercase">Videos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-ink-200 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-ink-200 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-ink-900 divide-y divide-gray-200 dark:divide-ink-800">
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-ink-50">{course.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-ink-50">₹{course.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-ink-50">{course.videos.length}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        course.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md border border-blue-100 dark:border-mint-900/40 text-xs font-medium text-blue-700 dark:text-mint-300 bg-blue-50 dark:bg-mint-900/20 hover:bg-blue-100 dark:hover:bg-mint-900/40 transition-colors"
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
                          onClick={() => handleAddVideo(course.id)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md border border-green-100 dark:border-green-900/50 text-xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-950/60 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m-6 2h5a2 2 0 002-2V8a2 2 0 00-2-2H9m-4 0h5a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
                            />
                          </svg>
                          Videos
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md border border-red-100 dark:border-red-900/50 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors"
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
    </div>
  );
}
