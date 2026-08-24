/**
 * Wire types and pure helpers for the bundle admin screens.
 *
 * Every shape here is copied from `serialiseBundle` in the backend's
 * src/services/bundleService.ts. Two of those fields are ADMIN-ONLY and are
 * therefore optional on the type rather than required: `commissionRate` and
 * `unpublishedCourseIds` are omitted entirely from a public response, so making
 * them required would be a lie that only shows up at runtime.
 */

/** A member course as it appears nested inside a bundle response. */
export interface BundleCourseMember {
  id: string;
  title: string;
  description: string | null;
  price: number;
  mrp: number;
  thumbnail: string | null;
  isPublished: boolean;
  order: number;
}

/** A bundle as serialised for an ADMIN viewer. */
export interface Bundle {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  /**
   * CACHED sum of the member course prices. Read-only at every endpoint:
   * `PUT /api/bundles/:id` returns 400 for a body carrying `price`.
   */
  price: number;
  isActive: boolean;
  isPurchasable: boolean;
  courseCount: number;
  createdAt: string;
  updatedAt: string;
  courses: BundleCourseMember[];
  // ── admin-only fields ────────────────────────────────────────────────────
  /** DECIMAL FRACTION 0..1 (0.4 = 40%). `null` = inherit the platform default. */
  commissionRate?: number | null;
  minimumCourses?: number;
  unpublishedCourseIds?: string[];
}

/** A course from `GET /api/courses`, narrowed to what the picker needs. */
export interface AdminCourse {
  id: string;
  title: string;
  price: number;
  thumbnail: string | null;
  isPublished: boolean;
}

/**
 * Mirrors MINIMUM_BUNDLE_COURSES in the backend's bundlePriceService.ts.
 *
 * Only a FALLBACK: an admin bundle response carries `minimumCourses`, and that
 * value wins wherever it is available, so the rule stays in one place if it
 * ever changes server-side.
 */
export const MINIMUM_BUNDLE_COURSES = 2;

// ────────────────────────────────────────────────────────────────── money ──

/**
 * Rupees to integer paise.
 *
 * Every client-side price sum goes through this. Adding `499.99 + 299.99` as
 * floats and rounding at the end drifts; adding 49999 + 29999 as integers
 * cannot. The server does the same thing (`Math.round(total * 100)` in
 * BundleService.getPrice).
 */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function fromPaise(paise: number): number {
  return paise / 100;
}

/** The client's view of a bundle price: an integer-paise sum of the members. */
export function sumPaise(prices: readonly number[]): number {
  return prices.reduce((total, price) => total + toPaise(price), 0);
}

/** House convention for currency. */
export function formatRupees(rupees: number): string {
  return `₹${rupees.toFixed(2)}`;
}

/** House convention for rates: a decimal fraction rendered as a percentage. */
export function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(0)}%`;
}

// ─────────────────────────────────────────────────────────────── commission ──

/**
 * The result of reading the commission field.
 *
 * `null` and `0` are DIFFERENT ANSWERS and the whole point of this type is that
 * they cannot be collapsed by accident: `null` means "clear the rate, inherit
 * the platform default at purchase time" and `0` means "pay zero per cent".
 * A falsy check (`rate || fallback`) turns an explicit 0% bundle into one that
 * silently pays the platform default, which is a real money bug — the backend
 * schema comment on `Bundle.commissionRate` calls out the same trap.
 */
export type CommissionParse =
  | { ok: true; value: number | null }
  | { ok: false; error: string };

/**
 * Parse the PERCENTAGE the admin typed into the DECIMAL FRACTION the API wants.
 *
 * The input is a percentage (0-100) because that is the number an admin reads
 * off their own dashboard; the wire is a fraction (0..1) because that is what
 * `Bundle.commissionRate`'s CHECK constraint and AFFILIATE_COMMISSION_RATE use.
 */
export function parseCommissionPercent(raw: string): CommissionParse {
  const trimmed = raw.trim();

  // Empty is not zero. It is "no bundle-specific rate".
  if (trimmed === '') return { ok: true, value: null };

  const percent = Number(trimmed);
  if (!Number.isFinite(percent)) {
    return { ok: false, error: `"${trimmed}" is not a number. Enter a percentage between 0 and 100, or leave the field empty to inherit the platform default.` };
  }
  if (percent < 0 || percent > 100) {
    return { ok: false, error: `A commission of ${percent}% is out of range. Enter a percentage between 0 and 100, or leave the field empty to inherit the platform default.` };
  }

  // Round at the fourth decimal of the FRACTION, i.e. two decimals of the
  // percentage. `40 / 100` is fine, but `20.1 / 100` is 0.20099999999999998 and
  // there is no reason to send that to a CHECK-constrained column.
  return { ok: true, value: Math.round(percent * 100) / 10000 };
}

/** The inverse, for populating the form from an existing bundle. */
export function commissionRateToPercentInput(rate: number | null | undefined): string {
  // `== null` catches null AND undefined (a non-admin response omits the field)
  // without catching 0, which must render as "0" and not as an empty field.
  if (rate == null) return '';
  return String(Math.round(rate * 10000) / 100);
}

// ───────────────────────────────────────────────────────────────── errors ──

/**
 * Turn a backend error body into a single admin-readable string.
 *
 * Wave 5 writes two different error shapes and BOTH matter:
 *   - a hand-written failure: `{ error, message, ...context }` where `message`
 *     is a full explanation of what to do about it;
 *   - a zod failure: `{ error: 'Invalid input', details: string[] }` with NO
 *     `message` at all.
 * Reading only `error` (the house pattern elsewhere in this app) would render
 * the zod case as the useless string "Invalid input", throwing away the field
 * names that say what was actually wrong.
 */
export function apiErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback;
  const data = body as Record<string, unknown>;

  const headline = typeof data.error === 'string' ? data.error : null;
  const detail =
    typeof data.message === 'string'
      ? data.message
      : Array.isArray(data.details)
      ? data.details.filter((d): d is string => typeof d === 'string').join(' ')
      : null;

  if (headline && detail) return `${headline}: ${detail}`;
  return headline || detail || fallback;
}

/** Read an error body defensively — a 502 from a proxy is not JSON. */
export async function readError(res: Response, fallback: string): Promise<string> {
  if (res.status === 401) {
    return 'Your session is not signed in. Sign in as an administrator and try again.';
  }
  if (res.status === 403) {
    return 'This account is not an administrator, so it cannot manage bundles.';
  }
  const body = await res.json().catch(() => null);
  return apiErrorMessage(body, `${fallback} (HTTP ${res.status})`);
}
