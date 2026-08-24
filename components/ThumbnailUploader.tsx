'use client';

import { useState } from 'react';

/**
 * A thumbnail picker that uploads AS SOON AS A FILE IS CHOSEN.
 *
 * The existing admin Courses screen defers the upload to form submit. That
 * hides a failure behind an action the admin thinks is unrelated: they pick a
 * file, fill in five more fields, press Save, and only then learn the image was
 * too big. Uploading on pick means the answer arrives while the file is still
 * the thing they are thinking about.
 *
 * It also makes the retry cheap. The parent holds only the RETURNED URL, so a
 * validation error or a 400 on the surrounding form leaves the uploaded image
 * untouched — the admin fixes the other field and saves, and the upload never
 * repeats.
 *
 * Wire contract (backend src/routes/upload.ts, unchanged since before wave 1):
 *   POST /api/upload/thumbnail   multipart, field name `thumbnail`, ADMIN-only
 *   → { success, url, filename, key? }   `url` is RELATIVE to the API host.
 */

const MAX_BYTES = 5 * 1024 * 1024;
/** Mirrors the multer fileFilter regex in the backend's src/routes/upload.ts. */
const ALLOWED_EXTENSIONS = ['jpeg', 'jpg', 'png', 'gif', 'webp'];

/**
 * Make a stored URL displayable.
 *
 * The backend returns and stores a path relative to the API host (e.g.
 * `/api/upload/thumbnail-proxy?key=...`) so the value stays portable between
 * environments. Rendering it needs the host back on the front.
 */
export function resolveAssetUrl(url: string | null | undefined, apiUrl: string): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${apiUrl}${url}`;
}

/** The inverse: never persist the API host, so a deploy to a new host still resolves. */
export function toRelativeAssetUrl(url: string, apiUrl: string): string {
  return url.startsWith(apiUrl) ? url.slice(apiUrl.length) : url;
}

interface ThumbnailUploaderProps {
  /** The stored value: a path relative to the API host, or ''. */
  value: string;
  /** Receives a path relative to the API host, or '' when cleared. */
  onChange: (relativeUrl: string) => void;
  apiUrl: string;
  label?: string;
  /** Lets the parent block interaction while the surrounding form is saving. */
  disabled?: boolean;
  /** Tells the parent not to submit mid-upload. */
  onUploadingChange?: (uploading: boolean) => void;
}

export default function ThumbnailUploader({
  value,
  onChange,
  apiUrl,
  label = 'Cover image',
  disabled = false,
  onUploadingChange,
}: ThumbnailUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const setUploadingState = (next: boolean) => {
    setUploading(next);
    onUploadingChange?.(next);
  };

  /**
   * Validate before spending the round trip.
   *
   * Both checks exist server-side too — this is not the enforcement, it is the
   * fast answer. Extension AND mime are both checked because the backend checks
   * both, so passing here and failing there would be the confusing outcome.
   */
  const rejectionReason = (file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.includes(extension) || !file.type.startsWith('image/')) {
      return `"${file.name}" is not a supported image. Use a JPG, PNG, GIF or WEBP file.`;
    }
    if (file.size > MAX_BYTES) {
      const megabytes = (file.size / (1024 * 1024)).toFixed(1);
      return `"${file.name}" is ${megabytes}MB. The limit is 5MB — compress or resize it and try again.`;
    }
    return null;
  };

  const handlePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Always clear the native input: picking the SAME file after a failure must
    // fire `change` again, and it does not if the value is still that file.
    event.target.value = '';
    if (!file) return;

    setError('');
    const reason = rejectionReason(file);
    if (reason) {
      setError(reason);
      return;
    }

    setUploadingState(true);
    try {
      const body = new FormData();
      body.append('thumbnail', file);

      const res = await fetch(`${apiUrl}/api/upload/thumbnail`, {
        method: 'POST',
        credentials: 'include',
        body,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        const reported = typeof data?.error === 'string' ? data.error : null;
        setError(
          res.status === 401 || res.status === 403
            ? 'Only an administrator can upload images. Sign in again and retry.'
            : reported || `Upload failed (HTTP ${res.status}).`
        );
        return;
      }

      onChange(toRelativeAssetUrl(data.url as string, apiUrl));
    } catch {
      setError('Upload failed: could not reach the server. Check your connection and try again.');
    } finally {
      setUploadingState(false);
    }
  };

  const preview = resolveAssetUrl(value, apiUrl);

  return (
    <div>
      <span className="block text-sm font-medium text-gray-700 dark:text-ink-200 mb-1">
        {label}
      </span>

      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {preview ? (
          <div className="relative w-full sm:w-40 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- the API host
                is not in next.config.js images.remotePatterns, so next/image
                cannot load a backend-proxied thumbnail. Matches every other
                admin screen in this app. */}
            <img
              src={preview}
              alt=""
              className="w-full sm:w-40 h-24 object-cover rounded-md border border-gray-200 dark:border-ink-700 bg-gray-50 dark:bg-ink-900"
              onError={(event) => {
                (event.target as HTMLImageElement).style.visibility = 'hidden';
              }}
            />
          </div>
        ) : (
          <div className="w-full sm:w-40 h-24 shrink-0 rounded-md border border-dashed border-gray-300 dark:border-ink-700 bg-gray-50 dark:bg-ink-900 flex items-center justify-center text-gray-400 dark:text-ink-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handlePick}
            disabled={disabled || uploading}
            className="block w-full text-sm text-gray-500 dark:text-ink-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-mint-900/20 file:text-blue-700 dark:file:text-mint-300 hover:file:bg-blue-100 dark:hover:file:bg-mint-900/40 file:cursor-pointer disabled:opacity-60"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-ink-300">
            JPG, PNG, GIF or WEBP, up to 5MB. Uploads as soon as you choose a file.
          </p>

          {uploading && (
            <p className="mt-2 text-xs text-blue-700 dark:text-mint-300" role="status">
              Uploading…
            </p>
          )}

          {value && !uploading && (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-xs text-green-700 dark:text-green-400">Image uploaded.</span>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  onChange('');
                }}
                disabled={disabled}
                className="text-xs font-medium text-gray-600 dark:text-ink-200 underline underline-offset-2 hover:text-gray-900 dark:hover:text-ink-50 disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          )}

          {error && (
            <p className="mt-2 text-xs text-red-700 dark:text-red-300" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
