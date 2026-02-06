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

interface ReviewUser {
  id: string;
  name: string | null;
  email: string;
  picture: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: ReviewUser;
}

export default function WatchCoursePage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedVideoIds, setCompletedVideoIds] = useState<Set<string>>(new Set());
  const [resumeSeconds, setResumeSeconds] = useState<number>(0);
  const [lastSentProgress, setLastSentProgress] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [reviews, setReviews] = useState<Review[]>([]);

  const courseId = Array.isArray((params as any).id) ? (params as any).id[0] : ((params as any).id as string | undefined);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchReviews();
    }
  }, [courseId]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchCourse = async () => {
    try {
      if (!courseId) return;
      const res = await fetch(`${API_URL}/api/courses/${courseId}`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (!data.hasAccess) {
        router.push(`/courses/${courseId}`);
        return;
      }

      setCourse(data.course);
      if (data.reviewSummary) {
        setAverageRating(data.reviewSummary.averageRating || 0);
        setReviewCount(data.reviewSummary.reviewCount || 0);
      }
      if (data.course.videos.length > 0) {
        // Try resume from progress
        try {
          const progressRes = await fetch(`${API_URL}/api/progress/course/${courseId}`, {
            credentials: 'include',
          });
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            const resume = progressData?.resume as
              | { videoId: string; progressSeconds?: number | null }
              | undefined;
            const fallbackVideoId = data.course.videos[0].id;
            const targetVideoId = resume?.videoId || fallbackVideoId;
            const targetSeconds = resume?.progressSeconds && resume.progressSeconds > 5 ? resume.progressSeconds : 0;
            setResumeSeconds(targetSeconds);
            await loadVideo(targetVideoId);
          } else {
            await loadVideo(data.course.videos[0].id);
          }
        } catch (e) {
          await loadVideo(data.course.videos[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      if (!courseId) return;
      const res = await fetch(`${API_URL}/api/courses/${courseId}/reviews`, {
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();
      setAverageRating(data.averageRating || 0);
      setReviewCount(data.reviewCount || 0);
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const loadVideo = async (videoId: string) => {
    try {
      // Save "last watched" immediately (resume support)
      if (courseId) {
        fetch(`${API_URL}/api/progress/video/${videoId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            courseId,
            progressSeconds: 0,
            completed: completedVideoIds.has(videoId),
          }),
        }).catch(() => {});
      }

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
      // When switching videos, if this is not the resume target, reset resumeSeconds
      setLastSentProgress(0);
    } catch (error) {
      console.error('Error loading video:', error);
      alert('Failed to load video');
    }
  };

  const markCompleted = async (videoId: string) => {
    setCompletedVideoIds((prev) => new Set(prev).add(videoId));
    if (!courseId) return;
    try {
      await fetch(`${API_URL}/api/progress/video/${videoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          completed: true,
        }),
      });
    } catch (e) {
      // Non-blocking
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const el = e.currentTarget;
    const current = Math.floor(el.currentTime);
    // Seek to resume position on first metadata load
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const el = e.currentTarget;
    if (resumeSeconds && resumeSeconds > 5 && resumeSeconds < (el.duration || Infinity)) {
      try {
        el.currentTime = resumeSeconds;
      } catch {
        // ignore
      }
    }
  };

  const handleProgressTimeUpdate = async (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const el = e.currentTarget;
    const current = Math.floor(el.currentTime);
    // Throttle updates to every 5 seconds and only when moving forward
    if (!courseId || !currentVideo) return;
    if (current < lastSentProgress + 5) return;
    setLastSentProgress(current);
    try {
      await fetch(`${API_URL}/api/progress/video/${currentVideo.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          progressSeconds: current,
          completed: false,
        }),
      });
      // Update local resumeSeconds so if user refreshes immediately, we use the latest
      setResumeSeconds(current);
    } catch {
      // non-blocking
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const full = Math.round(rating);
    const cls = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${cls} ${
              star <= full ? 'text-yellow-400' : 'text-gray-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="app-page">
        <Navbar />
        <main className="app-main">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="state-loading">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-b-transparent border-blue-600 dark:border-blue-400" />
              <p className="mt-3 text-sm">Loading course...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!course || !currentVideo) {
    return (
      <div className="app-page">
        <Navbar />
        <main className="app-main">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="state-empty">
              <p className="text-base mb-2">Course not found or no videos available.</p>
              <p className="text-sm">
                Please go back to the course list and try again.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-page">
      <Navbar />
      <main className="app-main">
        <div className="flex h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-900">
          {/* Video Player */}
          <div className="flex-1 flex flex-col bg-black">
            <div className="flex-1 flex items-center justify-center">
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
                  className="w-full h-full max-w-7xl bg-black"
                  src={currentVideo.streamUrl}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleProgressTimeUpdate}
                  onEnded={() => markCompleted(currentVideo.id)}
                >
                  Your browser does not support the video tag.
                </video>
            )}
            </div>
            <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
                {currentVideo.title}
              </h2>
              <h3 className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {course.title}
              </h3>
            </div>
          </div>

          {/* Playlist + Reviews Sidebar */}
          <div className="w-96 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                Course Content
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {course.videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => loadVideo(video.id)}
                  className={`w-full text-left p-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    currentVideo.id === video.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium flex items-center gap-2 text-gray-900 dark:text-gray-50">
                        {video.title}
                        {completedVideoIds.has(video.id) && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                            Done
                          </span>
                        )}
                      </p>
                      {video.duration && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.floor(video.duration / 60)}:
                          {(video.duration % 60).toString().padStart(2, '0')}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                Reviews & Ratings
              </h3>

              {reviewCount === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No reviews yet. Go to the course page to add your review.
                </p>
              )}

              {reviewCount > 0 && (
                <>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-50">
                        {averageRating.toFixed(1)}
                      </span>
                      {renderStars(averageRating)}
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 mt-2">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border border-gray-200 dark:border-gray-800 rounded p-2 text-xs space-y-1 bg-gray-50 dark:bg-gray-900/60"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-50">
                              {review.user.name || review.user.email}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {renderStars(review.rating, 'sm')}
                        </div>
                        {review.comment && (
                          <p className="text-[11px] text-gray-700 dark:text-gray-200">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                To add or edit your review, open the course page.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
