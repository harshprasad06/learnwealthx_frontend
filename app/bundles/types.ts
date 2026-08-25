/**
 * Wire types and pure helpers for the PUBLIC bundle screens.
 *
 * A BUNDLE is the parent product and the only sellable unit; a COURSE is a child
 * shown inside one. That is why these types live here rather than being imported
 * from `app/admin/bundles/types.ts`: the admin module models the ADMIN
 * serialisation (it carries `commissionRate`, `minimumCourses` and
 * `unpublishedCourseIds`, none of which a public response contains) and it also
 * exports a `formatRupees` that predates the Indian-grouping fix. Sharing it
 * would mean a public screen depending on admin-only fields and on the older
 * money format.
 *
 * Verified against the running backend (localhost:5001) on 2026-08-25:
 *
 *   GET /api/bundles      → { bundles: [...] }                         200
 *   GET /api/bundles/:id  → { bundle, hasAccess, ownedCourseIds,
 *                             isPurchasable }                          200
 *   GET /api/bundles/:id  → { error: 'Bundle not found' }              404
 *   GET /api/bundles?search=…                                          200, filters
 *
 * ONE MISMATCH against the agreed contract, in the harmless direction: the
 * nested course objects are a SUPERSET of the documented
 * `{ id, title, price, thumbnail, isPublished, order }` — the live server also
 * sends `description` and `mrp`. Both are modelled here and both are optional at
 * runtime (see `normaliseBundleCourse`), so the screens keep working whether or
 * not the backend keeps sending them.
 */

// The one currency formatter in this app, so a bundle price cannot render as
// "₹3797.00" here and "₹3,797.00" on the earnings screen. Imported rather than
// copied on purpose — see the note in app/earnings/types.ts.
import { formatRupees } from '@/app/earnings/types';

export { formatRupees };

// ─────────────────────────────────────────────────────────────── wire types ──

/** A member course as it appears nested inside a public bundle response. */
export interface BundleCourse {
  id: string;
  title: string;
  description: string | null;
  /** What this course contributes to the bundle price. */
  price: number;
  /** List price. Falls back to `price` when the server omits it. */
  mrp: number;
  thumbnail: string | null;
  isPublished: boolean;
  order: number;
}

/** A bundle as serialised for a PUBLIC viewer. */
export interface PublicBundle {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  /** CACHED sum of the member course prices. Read-only at every endpoint. */
  price: number;
  isActive: boolean;
  isPurchasable: boolean;
  courseCount: number;
  createdAt: string;
  updatedAt: string;
  courses: BundleCourse[];
}

/** `GET /api/bundles/:id`. */
export interface BundleDetail {
  bundle: PublicBundle;
  /** True when the viewer owns EVERY course in the bundle. */
  hasAccess: boolean;
  /** Member courses the viewer already owns — a subset, possibly empty. */
  ownedCourseIds: string[];
  isPurchasable: boolean;
}

/**
 * `POST /api/payments/create-bundle-order`, bypass branch.
 *
 * Verified live: `{ bypass: true, success: true, message, orderId, amount,
 * currency, bundleId, bundlePurchaseGroupId, courseIds, breakdown }`. The
 * Razorpay branch instead carries `key` + `orderId` + `amount` + `currency`.
 */
export interface BundleOrderResponse {
  bypass?: boolean;
  success?: boolean;
  message?: string;
  key?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  bundleId?: string;
  courseIds?: string[];
}

// ───────────────────────────────────────────────────────────── normalisation ──

function toNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

/**
 * A nested member course.
 *
 * `mrp` defaults to `price`, not to zero: a missing list price means "no
 * discount to advertise", and a zero would render the contents of the bundle as
 * being worth nothing.
 */
export function normaliseBundleCourse(raw: unknown, index: number): BundleCourse | null {
  const data = asRecord(raw);
  const id = toStringOrNull(data.id);
  // A course with no id cannot be linked to, so it is dropped rather than
  // rendered as a dead row.
  if (!id) return null;
  const price = toNumber(data.price);
  return {
    id,
    title: toStringOrNull(data.title) ?? 'Untitled course',
    description: toStringOrNull(data.description),
    price,
    mrp: toNumber(data.mrp, price),
    thumbnail: toStringOrNull(data.thumbnail),
    // Absent means published: a public response only ever contains published
    // courses, so defaulting to `false` would hide every child course.
    isPublished: data.isPublished !== false,
    order: toNumber(data.order, index),
  };
}

export function normaliseBundle(raw: unknown): PublicBundle | null {
  const data = asRecord(raw);
  const id = toStringOrNull(data.id);
  if (!id) return null;

  const courses = (Array.isArray(data.courses) ? data.courses : [])
    .map((entry, index) => normaliseBundleCourse(entry, index))
    .filter((course): course is BundleCourse => course !== null)
    // The API sends these in `order`, but sorting locally means the parent/child
    // list on the detail page cannot be reordered by a serialisation change.
    .sort((a, b) => a.order - b.order);

  return {
    id,
    title: toStringOrNull(data.title) ?? 'Untitled bundle',
    description: toStringOrNull(data.description),
    image: toStringOrNull(data.image),
    price: toNumber(data.price),
    isActive: data.isActive !== false,
    isPurchasable: data.isPurchasable !== false,
    // Trust the server's count, but fall back to what we can actually see so the
    // card never claims "3 courses" above a list of one.
    courseCount: toNumber(data.courseCount, courses.length),
    createdAt: toStringOrNull(data.createdAt) ?? '',
    updatedAt: toStringOrNull(data.updatedAt) ?? '',
    courses,
  };
}

export function normaliseBundleList(raw: unknown): PublicBundle[] {
  const data = asRecord(raw);
  const list = Array.isArray(data.bundles) ? data.bundles : [];
  return list
    .map((entry) => normaliseBundle(entry))
    .filter((bundle): bundle is PublicBundle => bundle !== null);
}

/**
 * `GET /api/bundles/:id`.
 *
 * Returns `null` for a body with no readable bundle, which the caller renders as
 * "not found" rather than as an empty bundle page.
 */
export function normaliseBundleDetail(raw: unknown): BundleDetail | null {
  const data = asRecord(raw);
  const bundle = normaliseBundle(data.bundle);
  if (!bundle) return null;
  return {
    bundle,
    // Anything other than an explicit `true` is "no access", which is the safe
    // direction: it shows the price instead of unlocking the content.
    hasAccess: data.hasAccess === true,
    ownedCourseIds: (Array.isArray(data.ownedCourseIds) ? data.ownedCourseIds : []).filter(
      (id): id is string => typeof id === 'string'
    ),
    // `isPurchasable` is the bundle's own flag echoed at the top level; prefer
    // the top-level value and fall back to the bundle's.
    isPurchasable: data.isPurchasable === undefined ? bundle.isPurchasable : data.isPurchasable === true,
  };
}

// ──────────────────────────────────────────────────────────────────── money ──

/**
 * What the courses in a bundle would cost at list price.
 *
 * Summed from the members' own `mrp` rather than stored on the bundle, because
 * the bundle has no MRP of its own on the wire — only `price`, the cached sum of
 * the member prices. Summed in integer paise so repeated addition cannot drift.
 */
export function bundleMrp(bundle: PublicBundle): number {
  const paise = bundle.courses.reduce(
    (total, course) => total + Math.round(course.mrp * 100),
    0
  );
  return paise / 100;
}

/**
 * The saving a bundle represents, as whole per cent, or 0 when there is none.
 *
 * Guarded on `mrp > price` so a bundle whose members carry no list price — where
 * `bundleMrp` equals `price` — advertises no discount at all rather than "-0%".
 */
export function bundleDiscountPercent(bundle: PublicBundle): number {
  const mrp = bundleMrp(bundle);
  if (!(mrp > bundle.price) || mrp <= 0) return 0;
  return Math.round(((mrp - bundle.price) / mrp) * 100);
}

/** `3` → `"3 courses"`, `1` → `"1 course"`. */
export function courseCountLabel(count: number): string {
  return `${count} course${count === 1 ? '' : 's'}`;
}

// ─────────────────────────────────────────────────────────────────── errors ──

/**
 * Turn a failed response into one sentence a visitor can act on.
 *
 * Tolerant of a non-JSON body: a proxy 502 and Express' HTML 404 page are both
 * things this app has actually rendered, and `res.json()` throws on either.
 */
export async function readError(res: Response, fallback: string): Promise<string> {
  if (res.status === 401) {
    return 'You are not signed in. Sign in and try again.';
  }
  if (res.status === 404) {
    return `${fallback}: not found (HTTP 404).`;
  }

  const body = await res.json().catch(() => null);
  if (!body || typeof body !== 'object') return `${fallback} (HTTP ${res.status})`;

  const data = body as Record<string, unknown>;
  const headline = typeof data.error === 'string' ? data.error : null;
  const detail =
    typeof data.message === 'string'
      ? data.message
      : Array.isArray(data.details)
      ? data.details
          .map((item) =>
            typeof item === 'string'
              ? item
              : typeof asRecord(item).message === 'string'
              ? String(asRecord(item).message)
              : null
          )
          .filter((item): item is string => item !== null)
          .join(' ')
      : null;

  if (headline && detail) return `${headline}: ${detail}`;
  return headline || detail || `${fallback} (HTTP ${res.status})`;
}
