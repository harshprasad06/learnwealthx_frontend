'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Course {
  id: string;
  title: string;
  description: string | null;
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
        return `${API_URL}${data.url}`;
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
          price: parseFloat(formData.price),
          isPublished: formData.isPublished,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingCourse(null);
        setFormData({ title: '', description: '', price: '', thumbnail: '', isPublished: false });
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
    setFormData({
      title: course.title,
      description: course.description || '',
      price: course.price.toString(),
      thumbnail: course.thumbnail || '',
      isPublished: course.isPublished,
    });
    setThumbnailFile(null);
    setThumbnailPreview(course.thumbnail || '');
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Manage Courses</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingCourse(null);
              setFormData({ title: '', description: '', price: '', thumbnail: '', isPublished: false });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Course
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 mb-8 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">
              {editingCourse ? 'Edit Course' : 'New Course'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                  placeholder="Enter course title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                  rows={3}
                  placeholder="Enter course description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (₹) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail
                </label>
                
                {/* File Upload */}
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Upload an image (JPG, PNG, GIF, WEBP - Max 5MB)
                  </p>
                </div>

                {/* Preview */}
                {(thumbnailPreview || formData.thumbnail) && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img
                      src={thumbnailPreview || formData.thumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}

                {/* Or use URL (fallback) */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or enter thumbnail URL:
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => {
                      setFormData({ ...formData, thumbnail: e.target.value });
                      setThumbnailPreview(e.target.value);
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400"
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
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                  Published
                </label>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : editingCourse ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCourse(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">No courses yet</div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden transition-colors">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Videos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-50">{course.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-50">₹{course.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-50">{course.videos.length}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAddVideo(course.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Videos
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
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
