'use client';

import { useMemo, useState } from 'react';
import ThumbnailUploader from '@/components/ThumbnailUploader';
import CoursePicker from './CoursePicker';
import type { AdminCourse, Bundle } from './types';
import {
  MINIMUM_BUNDLE_COURSES,
  commissionRateToPercentInput,
  formatRupees,
  fromPaise,
  parseCommissionPercent,
  readError,
  sumPaise,
  toPaise,
} from './types';

/**
 * Create / edit form for a bundle. Rendered INLINE above the table, matching
 * the two other CRUD-shaped admin screens in this app (Courses, Milestones)
 * rather than introducing this repo's first modal.
 *
 * ── the price is never sent ────────────────────────────────────────────────
 * `Bundle.price` is a cached SUM of the member course prices. Every write
 * endpoint rejects a body carrying `price` with a 400 (BundleService.rejectPrice),
 * deliberately, so nothing here builds a payload containing it. The figure this
 * form shows is a LOCAL PREVIEW of what the server will compute.
 *
 * ── which calls a save makes ───────────────────────────────────────────────
 * Membership and scalar fields live behind different endpoints, so an edit is
 * up to two requests, and the ORDER is load-bearing:
 *   1. PUT /:id/courses  — replace the whole set atomically
 *   2. PUT /:id          — title/description/image/commissionRate/isActive
 * Activating checks the membership as it stands SERVER-SIDE at that moment
 * (BundleService.activationBlocker). Sending the fields first would validate
 * activation against the old member list, so "add a second course and switch it
 * on" would fail for a bundle that is, by then, perfectly valid.
 */

interface BundleFormProps {
  apiUrl: string;
  /** null = create. */
  bundle: Bundle | null;
  courses: AdminCourse[];
  coursesLoading: boolean;
  coursesError: string;
  onCancel: () => void;
  /** Called only after a 2xx. `warning` reports a partial outcome worth reading. */
  onSaved: (warning?: string) => void;
}

/** Member ids in stored display order. */
function memberIds(bundle: Bundle | null): string[] {
  if (!bundle) return [];
  return [...bundle.courses].sort((a, b) => a.order - b.order).map((course) => course.id);
}

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const inA = new Set(a);
  return b.every((id) => inA.has(id));
}

function sameOrderedList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

export default function BundleForm({
  apiUrl,
  bundle,
  courses,
  coursesLoading,
  coursesError,
  onCancel,
  onSaved,
}: BundleFormProps) {
  const isEdit = Boolean(bundle);
  const initialCourseIds = useMemo(() => memberIds(bundle), [bundle]);

  const [title, setTitle] = useState(bundle?.title ?? '');
  const [description, setDescription] = useState(bundle?.description ?? '');
  const [image, setImage] = useState(bundle?.image ?? '');
  const [selectedIds, setSelectedIds] = useState<string[]>(initialCourseIds);
  /**
   * The commission field is a STRING on purpose, and stays one until submit.
   * '' and '0' are different answers ('' = inherit the platform default, '0' =
   * pay zero per cent) and a `number | null` state cannot hold that difference
   * while the admin is mid-edit without inventing a second flag.
   */
  const [commissionInput, setCommissionInput] = useState(
    commissionRateToPercentInput(bundle?.commissionRate)
  );
  const [isActive, setIsActive] = useState(bundle?.isActive ?? false);

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const minimum = bundle?.minimumCourses ?? MINIMUM_BUNDLE_COURSES;

  // ── the price preview ────────────────────────────────────────────────────

  const priceById = useMemo(() => {
    const map = new Map<string, number>();
    courses.forEach((course) => map.set(course.id, course.price));
    // A member course the picker never loaded still has a price on the bundle
    // itself; without this the preview would silently under-count.
    bundle?.courses.forEach((course) => {
      if (!map.has(course.id)) map.set(course.id, course.price);
    });
    return map;
  }, [courses, bundle]);

  /** Summed in INTEGER PAISE. Floats drift; 49999 + 29999 cannot. */
  const clientPaise = useMemo(
    () => sumPaise(selectedIds.map((id) => priceById.get(id) ?? 0)),
    [selectedIds, priceById]
  );

  const membershipChanged = !sameOrderedList(selectedIds, initialCourseIds);
  /** Only the SET affects the sum, so only the set gates the reconciliation. */
  const membershipSetUnchanged = sameSet(selectedIds, initialCourseIds);

  /**
   * The server is the source of truth for price. When our sum disagrees with
   * the stored one over a membership we have NOT touched, something is off —
   * a course price edited in another tab, or genuine cache drift — and saying
   * so is better than rendering a number that quietly contradicts the table.
   */
  const serverPaise = bundle ? toPaise(bundle.price) : null;
  const priceDisagreement =
    serverPaise !== null && membershipSetUnchanged && Math.abs(clientPaise - serverPaise) > 1
      ? serverPaise
      : null;

  // ── dirty tracking ───────────────────────────────────────────────────────

  const isDirty =
    title !== (bundle?.title ?? '') ||
    description !== (bundle?.description ?? '') ||
    image !== (bundle?.image ?? '') ||
    commissionInput !== commissionRateToPercentInput(bundle?.commissionRate) ||
    isActive !== (bundle?.isActive ?? false) ||
    membershipChanged;

  const handleCancel = () => {
    // No toast system here, so `window.confirm` is the house pattern for
    // "are you sure" — same as every destructive action on the other screens.
    if (isDirty && !window.confirm('Discard your unsaved changes to this bundle?')) return;
    onCancel();
  };

  // ── submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Give the bundle a name.');
      return;
    }

    if (selectedIds.length < minimum) {
      setError(
        `A bundle needs at least ${minimum} courses and you have selected ${selectedIds.length}. ` +
          `A bundle with fewer either charges ₹0 for nothing or duplicates a course already sold on its own.`
      );
      return;
    }

    const commission = parseCommissionPercent(commissionInput);
    if (!commission.ok) {
      setError(commission.error);
      return;
    }

    setSaving(true);
    try {
      // `image` is stored relative to the API host; '' means "no image", which
      // the API models as null rather than an empty string.
      const imageValue = image.trim() ? image.trim() : null;

      if (!isEdit) {
        // ── create ───────────────────────────────────────────────────────
        // NOTE: `price` is deliberately absent. So is `isActive` — it is not in
        // createBundleSchema and a bundle is ALWAYS born inactive.
        const res = await fetch(`${apiUrl}/api/bundles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title: trimmedTitle,
            description: description.trim() || null,
            image: imageValue,
            commissionRate: commission.value,
            courseIds: selectedIds,
          }),
        });

        if (!res.ok) {
          setError(await readError(res, 'Could not create the bundle'));
          return;
        }

        const created = (await res.json())?.bundle as Bundle | undefined;

        // A new bundle is inactive by construction, so "Active" on the create
        // form is a SECOND request. It can legitimately fail (an unpublished
        // member) — and when it does the bundle still exists, so this reports
        // the shortfall instead of pretending the whole save failed.
        if (isActive && created?.id) {
          const statusRes = await fetch(`${apiUrl}/api/bundles/${created.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ isActive: true }),
          });
          if (!statusRes.ok) {
            onSaved(
              `"${trimmedTitle}" was created but could not be activated, so it is saved as inactive. ` +
                (await readError(statusRes, 'Activation was refused'))
            );
            return;
          }
        }

        onSaved();
        return;
      }

      // ── edit ─────────────────────────────────────────────────────────────
      const id = bundle!.id;
      let warning: string | undefined;

      // 1. Membership first — see the header comment on why the order matters.
      if (membershipChanged) {
        const res = await fetch(`${apiUrl}/api/bundles/${id}/courses`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ courseIds: selectedIds }),
        });

        if (!res.ok) {
          setError(await readError(res, 'Could not update the courses in this bundle'));
          return;
        }

        // The backend takes a bundle off sale when a membership change drops it
        // below the minimum. That is an admin's live product going dark, so it
        // is never left implicit.
        if ((await res.json())?.deactivated) {
          warning =
            'Changing the courses took this bundle below the minimum, so it has been deactivated and is no longer on sale.';
        }
      }

      // 2. Scalar fields, including activation.
      const res = await fetch(`${apiUrl}/api/bundles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: trimmedTitle,
          description: description.trim() || null,
          image: imageValue,
          commissionRate: commission.value,
          isActive,
        }),
      });

      if (!res.ok) {
        setError(await readError(res, 'Could not save the bundle'));
        return;
      }

      onSaved(warning);
    } catch {
      setError('Could not reach the server. Check your connection and try again — nothing has been saved.');
    } finally {
      setSaving(false);
    }
  };

  const busy = saving || uploading;

  const inputClass =
    'w-full px-3 py-2 rounded-md border border-gray-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-gray-900 dark:text-ink-50 placeholder:text-gray-400 dark:placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-mint-500 focus:border-blue-500 dark:focus:border-mint-400 transition-colors';

  return (
    <div className="app-card app-card-padding mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-ink-50">
        {isEdit ? `Edit “${bundle!.title}”` : 'New bundle'}
      </h2>

      {error && (
        // The backend's own wording, verbatim: wave 5 writes these to be read
        // by an admin, and paraphrasing them here would lose the instructions.
        <div className="state-error mb-4" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="bundle-title"
            className="block text-sm font-medium text-gray-700 dark:text-ink-200 mb-1"
          >
            Name *
          </label>
          <input
            id="bundle-title"
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={busy}
            placeholder="e.g. Complete Trading Starter Pack"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="bundle-description"
            className="block text-sm font-medium text-gray-700 dark:text-ink-200 mb-1"
          >
            Description
          </label>
          <textarea
            id="bundle-description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={busy}
            placeholder="What a buyer gets, in a sentence or two."
            className={inputClass}
          />
        </div>

        <ThumbnailUploader
          value={image}
          onChange={setImage}
          apiUrl={apiUrl}
          disabled={saving}
          onUploadingChange={setUploading}
        />

        <CoursePicker
          courses={courses}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
          loading={coursesLoading}
          loadError={coursesError}
          minimum={minimum}
          disabled={busy}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* ── read-only price ───────────────────────────────────────────
              An <output>, not a disabled <input>. A disabled field is skipped
              by keyboard navigation and announced as "unavailable", which reads
              as "broken, come back later" — the opposite of the truth. This
              value is always current; it simply is not yours to type. */}
          <div>
            <label
              htmlFor="bundle-price"
              className="block text-sm font-medium text-gray-700 dark:text-ink-200 mb-1"
            >
              Price
            </label>
            <div className="relative">
              <output
                id="bundle-price"
                // Announced when the membership changes, which is the only way
                // it ever moves.
                aria-live="polite"
                className="block w-full pl-3 pr-10 py-2 rounded-md border border-dashed border-gray-400 dark:border-ink-600 bg-gray-100 dark:bg-ink-950 text-gray-900 dark:text-ink-50 font-semibold tabular-nums shadow-inner"
              >
                {formatRupees(fromPaise(clientPaise))}
              </output>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-ink-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-ink-300">
              Calculated, not entered: always the sum of the courses above. Change the courses to
              change the price.
            </p>

            {membershipChanged && (
              <p className="mt-1 text-xs text-blue-700 dark:text-mint-300">
                Preview of the new total. The server recalculates it when you save.
              </p>
            )}

            {priceDisagreement !== null && (
              /* Amber, not silence: the stored price is what a customer would
                 actually be charged, so a discrepancy is worth an admin's
                 attention even though this form cannot fix it directly. */
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-300" role="status">
                The stored price is {formatRupees(fromPaise(priceDisagreement))}, which does not
                match the sum of these courses. The stored figure is what customers are charged.
                Re-saving the bundle recalculates it.
              </p>
            )}
          </div>

          {/* ── commission ──────────────────────────────────────────────── */}
          <div>
            <label
              htmlFor="bundle-commission"
              className="block text-sm font-medium text-gray-700 dark:text-ink-200 mb-1"
            >
              Affiliate commission
            </label>
            <div className="relative">
              <input
                id="bundle-commission"
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.01"
                value={commissionInput}
                onChange={(event) => setCommissionInput(event.target.value)}
                disabled={busy}
                placeholder="Platform default"
                aria-describedby="bundle-commission-help"
                className={`${inputClass} pr-8`}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-ink-300"
              >
                %
              </span>
            </div>
            <p id="bundle-commission-help" className="mt-1 text-xs text-gray-500 dark:text-ink-300">
              Leave <strong className="font-medium">empty</strong> to inherit the platform default
              rate. Enter <strong className="font-medium">0</strong> to pay no commission at all —
              these are not the same thing.
            </p>
          </div>
        </div>

        {/* ── active ────────────────────────────────────────────────────── */}
        <div className="rounded-md border border-gray-200 dark:border-ink-800 bg-gray-50 dark:bg-ink-950/60 p-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              disabled={busy}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 dark:border-ink-600 text-blue-600 dark:text-mint-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-mint-500"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900 dark:text-ink-50">
                Active — available for purchase
              </span>
              <span className="block text-xs text-gray-500 dark:text-ink-300 mt-0.5">
                Every course in the bundle must be published before it can go on sale.
                {!isEdit && ' A new bundle is created inactive and switched on straight after.'}
              </span>
            </span>
          </label>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <button type="submit" disabled={busy} className="btn-primary">
            {uploading ? 'Waiting for the image…' : saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create bundle'}
          </button>
          <button type="button" onClick={handleCancel} disabled={saving} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
