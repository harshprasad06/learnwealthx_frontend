'use client';

import { useMemo, useState } from 'react';
import type { AdminCourse } from './types';
import { formatRupees } from './types';

/**
 * The bundle membership control: a filterable CHECKBOX GROUP in a bordered panel.
 *
 * ── why not a native `<select multiple>` ───────────────────────────────────
 * It is effectively unstyleable (option rows cannot carry a Draft pill or a
 * price), and on a phone it collapses to a tiny scrolling box where selecting a
 * second item without wiping the first is genuinely hard. It also hides the
 * current selection the moment the list scrolls.
 *
 * ── why not a custom combobox ──────────────────────────────────────────────
 * A combobox is a listbox with roving tabindex, aria-activedescendant and a
 * hand-written key handler, and every one of those is a chance to ship
 * something a keyboard cannot drive. Here each row is a `<label>` wrapping a
 * real `<input type="checkbox">`: Tab moves between rows and Space toggles,
 * natively, with no JavaScript involved and no tabindex to get wrong. Clicking
 * the row text works because the input is INSIDE the label, so no `htmlFor`/`id`
 * pair can fall out of sync.
 *
 * ── why filter in memory ───────────────────────────────────────────────────
 * `GET /api/courses` is unpaginated and courses are hand-created by an admin, so
 * the list is tens of rows, not thousands. Filtering in memory keeps the
 * selection stable while typing; a server round trip per keystroke would drop
 * checked rows out of the DOM and make the chip row the only proof they exist.
 */

interface CoursePickerProps {
  courses: AdminCourse[];
  /** Selection ORDER is meaningful: it becomes the bundle's display order. */
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  loading: boolean;
  loadError: string;
  minimum: number;
  disabled?: boolean;
}

export default function CoursePicker({
  courses,
  selectedIds,
  onChange,
  loading,
  loadError,
  minimum,
  disabled = false,
}: CoursePickerProps) {
  const [filter, setFilter] = useState('');

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const visible = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return courses;
    return courses.filter((course) => course.title.toLowerCase().includes(needle));
  }, [courses, filter]);

  /**
   * Chips render in SELECTION order, and that is the order the API receives.
   * `BundleCourse.order` is assigned from the array position, so this row is a
   * live preview of how the bundle will list its courses.
   */
  const selectedCourses = useMemo(
    () =>
      selectedIds
        .map((id) => courses.find((course) => course.id === id))
        .filter((course): course is AdminCourse => Boolean(course)),
    [selectedIds, courses]
  );

  const toggle = (id: string) => {
    // Append on select, filter on deselect — never rebuild from `courses`,
    // which would silently re-sort the membership on every click.
    onChange(selectedSet.has(id) ? selectedIds.filter((value) => value !== id) : [...selectedIds, id]);
  };

  const shortBy = minimum - selectedIds.length;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-1">
        <span className="block text-sm font-medium text-gray-700 dark:text-ink-200">
          Courses in this bundle *
        </span>
        <span
          className={`text-xs ${
            shortBy > 0
              ? 'text-amber-700 dark:text-amber-300'
              : 'text-gray-500 dark:text-ink-300'
          }`}
          // The count changes as a RESULT of clicking a checkbox elsewhere in
          // the panel, so a screen reader user gets no feedback without this.
          aria-live="polite"
        >
          {selectedIds.length} selected
          {shortBy > 0 ? ` — ${shortBy} more needed (minimum ${minimum})` : ''}
        </span>
      </div>

      {/* Selected chips: the answer to "what did I pick?" without scrolling
          the panel back to the top. */}
      {selectedCourses.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-2">
          {selectedCourses.map((course, index) => (
            <li key={course.id}>
              <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-mint-900/30 text-blue-800 dark:text-mint-200 border border-blue-200 dark:border-mint-900/60">
                <span className="text-blue-500 dark:text-mint-400 tabular-nums">{index + 1}.</span>
                <span className="max-w-[12rem] truncate">{course.title}</span>
                <button
                  type="button"
                  onClick={() => toggle(course.id)}
                  disabled={disabled}
                  aria-label={`Remove ${course.title} from this bundle`}
                  className="rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-mint-900/60 disabled:opacity-60"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-md border border-gray-300 dark:border-ink-700 bg-white dark:bg-ink-900 overflow-hidden">
        {/* Filter */}
        <div className="p-2 border-b border-gray-200 dark:border-ink-800">
          <input
            type="text"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            disabled={disabled || loading || courses.length === 0}
            placeholder="Filter courses by name…"
            aria-label="Filter courses by name"
            className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-gray-900 dark:text-ink-50 placeholder:text-gray-400 dark:placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-mint-500 disabled:opacity-60 transition-colors"
          />
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-ink-800">
          {loading ? (
            <p className="px-3 py-6 text-sm text-center text-gray-600 dark:text-ink-300">
              Loading courses…
            </p>
          ) : loadError ? (
            <p className="px-3 py-6 text-sm text-center text-red-700 dark:text-red-300">{loadError}</p>
          ) : courses.length === 0 ? (
            /* Distinct from the no-match state below: nothing to fix by typing. */
            <div className="px-3 py-6 text-center">
              <p className="text-sm text-gray-600 dark:text-ink-300">No courses exist yet.</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-ink-400">
                A bundle is built out of courses, so create at least {minimum} on the Courses
                screen first.
              </p>
            </div>
          ) : visible.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <p className="text-sm text-gray-600 dark:text-ink-300">
                No course matches “{filter.trim()}”.
              </p>
              <button
                type="button"
                onClick={() => setFilter('')}
                className="mt-1 text-xs font-medium text-blue-700 dark:text-mint-300 underline underline-offset-2"
              >
                Clear the filter
              </button>
            </div>
          ) : (
            visible.map((course) => {
              const checked = selectedSet.has(course.id);
              return (
                <label
                  key={course.id}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                    checked
                      ? 'bg-blue-50/70 dark:bg-mint-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-ink-800'
                  } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(course.id)}
                    disabled={disabled}
                    className="h-4 w-4 shrink-0 rounded border-gray-300 dark:border-ink-600 text-blue-600 dark:text-mint-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-mint-500"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-gray-900 dark:text-ink-50 truncate">
                      {course.title}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-ink-300">
                      {formatRupees(course.price)}
                    </span>
                  </span>
                  {!course.isPublished && (
                    /* An unpublished member does not block SAVING, but it does
                       block activation server-side — so it has to be visible at
                       the moment of choosing, not only in the 400 afterwards. */
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-ink-800 text-gray-700 dark:text-ink-100 border border-gray-200 dark:border-ink-700">
                      Draft
                    </span>
                  )}
                </label>
              );
            })
          )}
        </div>
      </div>

      <p className="mt-1 text-xs text-gray-500 dark:text-ink-300">
        A bundle needs at least {minimum} courses. Its price is the sum of the courses you pick,
        in the order shown above.
      </p>
    </div>
  );
}
