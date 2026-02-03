'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Video {
  id: string;
  title: string;
  order: number;
  duration: number | null;
  streamUrl: string;
  playerUrl?: string;
}

interface Course {
  id: string;
  title: string;
  videos: Array<{
    id: string;
    title: string;
    order: number;
    duration: number | null;
  }>;
}

export default function WatchCoursePage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchCourse();
    }
  }, [params.id]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchCourse = async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses/${params.id}`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (!data.hasAccess) {
        router.push(`/courses/${params.id}`);
        return;
      }

      setCourse(data.course);
      if (data.course.videos.length > 0) {
        loadVideo(data.course.videos[0].id);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVideo = async (videoId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/videos/${videoId}/stream`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to load video');
        return;
      }

      setCurrentVideo({
        id: data.video.id,
        title: data.video.title,
        order: 0,
        duration: data.video.duration,
        streamUrl: data.streamUrl,
        playerUrl: data.playerUrl,
      });
    } catch (error) {
      console.error('Error loading video:', error);
      alert('Failed to load video');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!course || !currentVideo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Course not found or no videos available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Video Player */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black flex items-center justify-center">
            {currentVideo.playerUrl ? (
              <iframe
                key={currentVideo.id}
                src={currentVideo.playerUrl}
                className="w-full h-full max-w-7xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                key={currentVideo.id}
                controls
                className="w-full h-full max-w-7xl"
                src={currentVideo.streamUrl}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          <div className="bg-gray-800 text-white p-6">
            <h2 className="text-2xl font-bold mb-2">{currentVideo.title}</h2>
            <h3 className="text-lg text-gray-300">{course.title}</h3>
          </div>
        </div>

        {/* Playlist Sidebar */}
        <div className="w-80 bg-gray-800 text-white overflow-y-auto">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold">Course Content</h3>
          </div>
          <div className="divide-y divide-gray-700">
            {course.videos.map((video) => (
              <button
                key={video.id}
                onClick={() => loadVideo(video.id)}
                className={`w-full text-left p-4 hover:bg-gray-700 transition-colors ${
                  currentVideo.id === video.id ? 'bg-gray-700' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{video.title}</p>
                    {video.duration && (
                      <p className="text-sm text-gray-400">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
