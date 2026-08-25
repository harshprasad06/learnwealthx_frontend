/**
 * Wire types and pure helpers for the affiliate Earnings page.
 *
 * Every shape here is transcribed from the agreed `/api/earnings/*` contract.
 * At the time of writing the three endpoints are NOT yet deployed — the running
 * backend answers all of them with a 404 whose body is Express' HTML error page,
 * not JSON. Two consequences are baked into this file:
 *
 *   1. `readError` never assumes a JSON body. `res.json()` on that HTML throws,
 *      and an unhandled throw inside the fetch's own try block would be reported
 *      as "could not reach the server", which is the wrong diagnosis entirely.
 *   2. Every response is pushed through a `normalise*` function on ingest. A
 *      half-built endpoint that omits, say, `breakdown.gstAmount` should render
 *      a zero, not crash the page on `undefined.toFixed(2)`. These are cheap and
 *      they are what lets this screen be developed against a contract rather
 *      than against a server.
 */

// ─────────────────────────────────────────────────────────────── wire types ──

/**
 * The itemised commission calculation, computed SERVER-SIDE.
 *
 * Note the direction of travel, which is the opposite of the reference design
 * this page is modelled on: our fees are added ON TOP of the package price
 * (`base` + `gstAmount` + `gatewayFeeAmount` = `customerPays`), rather than
 * deducted out of a tax-inclusive sticker price. Commission is paid on
 * `commissionBase` (the base, not what the customer paid), so it is quoted here
 * as its own field rather than re-derived — the backend owns the one
 * implementation so that this screen and any future payout report agree.
 */
export interface EarningsBreakdown {
  customerPays: number;
  base: number;
  gstAmount: number;
  gatewayFeeAmount: number;
  commissionBase: number;
  earnPerSale: number;
}

/** One membership option. Sourced from BUNDLES, cheapest-first. */
export interface EarningsPackage {
  id: string;
  title: string;
  image: string | null;
  price: number;
  courseCount: number;
  /** DECIMAL FRACTION 0..1 (0.4 = 40%). */
  commissionRate: number;
  /** Where that rate came from. Free-form on the wire; see `commissionSourceHint`. */
  commissionSource: string;
  breakdown: EarningsBreakdown;
}

export interface PackagesResponse {
  packages: EarningsPackage[];
  platformCommissionRate: number;
  rates: { gstRate: number; gatewayFeeRate: number };
}

export interface EarningsWallet {
  balance: number;
  totalEarned: number;
  totalPaid: number;
}

export interface EarningsTotals {
  salesCount: number;
  grossRevenue: number;
  commissionEarned: number;
}

/**
 * One PURCHASE ROW, which is not the same thing as one sale.
 *
 * A bundle sale writes one row per member course, all sharing a non-null
 * `bundlePurchaseGroupId`. Rendering these raw would show a three-course bundle
 * as three separate earnings. `groupSales` collapses them.
 */
export interface RecentSale {
  purchaseId: string;
  courseTitle: string | null;
  bundleTitle: string | null;
  bundlePurchaseGroupId: string | null;
  amount: number;
  commissionAmount: number;
  commissionRate: number;
  createdAt: string;
}

export interface MonthlyPoint {
  /** `YYYY-MM`. */
  month: string;
  salesCount: number;
  commission: number;
}

/**
 * NOT USED BY THIS PAGE.
 *
 * `/earnings` is a projection calculator only — it deliberately does not show
 * what the visitor has already earned. This type, `normaliseMeResponse`,
 * `groupSales`, `formatDate`, `formatMonthLabel` and the interfaces they depend
 * on (`EarningsWallet`, `EarningsTotals`, `RecentSale`, `MonthlyPoint`,
 * `SaleRow`) are the client for `GET /api/earnings/me`, which exists and is
 * tested on the backend.
 *
 * They are kept because that endpoint is live: if a "my earnings" view is ever
 * added to the affiliate dashboard, this is its ready-made client, including the
 * bundle-group collapsing that stops one 3-course bundle sale from being counted
 * as three. Delete this block along with the endpoint, not before.
 */
export interface MeResponse {
  isAffiliate: boolean;
  referralCode: string | null;
  wallet: EarningsWallet;
  totals: EarningsTotals;
  recentSales: RecentSale[];
  monthly: MonthlyPoint[];
}

export interface CalculateResponse {
  packageId: string;
  salesPerMonth: number;
  earnPerSale: number;
  monthly: number;
  quarterly: number;
  yearly: number;
  breakdown: EarningsBreakdown;
}

// ──────────────────────────────────────────────────────────────── constants ──

/** Slider bounds. The default matches the reference design's landing value. */
export const MIN_SALES_PER_MONTH = 0;
export const MAX_SALES_PER_MONTH = 100;
export const DEFAULT_SALES_PER_MONTH = 27;

/**
 * The comparison baseline in "YOUR INCOME VS. AVERAGE", in rupees per year.
 *
 * A fixed editorial reference figure, NOT a derived number: it is not produced
 * by our commission math and so has nothing to do with the rule that the API
 * owns the arithmetic. It lives here, named, rather than inline in the markup so
 * that it is obvious what it is and where to change it.
 */
export const AVERAGE_FRESHER_SALARY = 300000;

// ──────────────────────────────────────────────────────────────────── money ──

/** Rupees to integer paise, so repeated sums cannot drift. */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function fromPaise(paise: number): number {
  return paise / 100;
}

/** House convention for precise money: two decimals, always. */
export function formatRupees(rupees: number): string {
  return `₹${rupees.toFixed(2)}`;
}

/**
 * The big projection numbers, in Indian digit grouping: `₹10,32,079`.
 *
 * Rounded to whole rupees on purpose. At this size the paise are noise, and
 * "₹10,32,078.60" reads as a quotation rather than as the projection it is.
 */
export function formatRupeesIndian(rupees: number): string {
  const safe = Number.isFinite(rupees) ? rupees : 0;
  return `₹${Math.round(safe).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

/** A decimal fraction rendered as a percentage: 0.4 → "40%". */
export function formatRate(rate: number): string {
  const percent = rate * 100;
  // Keeps 2.5% honest without printing "40.00%" for the common case.
  return `${Number.isInteger(percent) ? percent : Number(percent.toFixed(2))}%`;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * `"2026-08"` → `"Aug 2026"`.
 *
 * Parsed by splitting the string rather than with `new Date('2026-08')`, which
 * the spec parses as midnight UTC — so `getMonth()` west of Greenwich returns
 * July and every month label on the page would be off by one.
 */
export function formatMonthLabel(month: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return month;
  const monthIndex = Number(match[2]) - 1;
  const name = MONTH_NAMES[monthIndex];
  return name ? `${name} ${match[1]}` : month;
}

/** A date for the sales list. Fails soft on a value the backend never sent. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ───────────────────────────────────────────────────────────── normalisation ──

/** Coerce anything the wire hands us into a finite number. */
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

export function normaliseBreakdown(raw: unknown): EarningsBreakdown {
  const data = asRecord(raw);
  return {
    customerPays: toNumber(data.customerPays),
    base: toNumber(data.base),
    gstAmount: toNumber(data.gstAmount),
    gatewayFeeAmount: toNumber(data.gatewayFeeAmount),
    commissionBase: toNumber(data.commissionBase),
    earnPerSale: toNumber(data.earnPerSale),
  };
}

export function normalisePackagesResponse(raw: unknown): PackagesResponse {
  const data = asRecord(raw);
  const list = Array.isArray(data.packages) ? data.packages : [];
  return {
    packages: list
      .map((entry): EarningsPackage | null => {
        const pkg = asRecord(entry);
        const id = toStringOrNull(pkg.id);
        // A package with no id cannot be selected or sent to /calculate, so it
        // is dropped rather than rendered as an inert radio.
        if (!id) return null;
        return {
          id,
          title: toStringOrNull(pkg.title) ?? 'Untitled package',
          image: toStringOrNull(pkg.image),
          price: toNumber(pkg.price),
          courseCount: toNumber(pkg.courseCount),
          commissionRate: toNumber(pkg.commissionRate),
          commissionSource: toStringOrNull(pkg.commissionSource) ?? '',
          breakdown: normaliseBreakdown(pkg.breakdown),
        };
      })
      .filter((pkg): pkg is EarningsPackage => pkg !== null),
    platformCommissionRate: toNumber(data.platformCommissionRate),
    rates: {
      gstRate: toNumber(asRecord(data.rates).gstRate),
      gatewayFeeRate: toNumber(asRecord(data.rates).gatewayFeeRate),
    },
  };
}

export function normaliseMeResponse(raw: unknown): MeResponse {
  const data = asRecord(raw);
  const wallet = asRecord(data.wallet);
  const totals = asRecord(data.totals);
  return {
    // Anything other than an explicit `true` is treated as "not an affiliate",
    // which is the safe direction: it shows the explanatory empty state instead
    // of a grid of zeroes presented as somebody's earnings.
    isAffiliate: data.isAffiliate === true,
    referralCode: toStringOrNull(data.referralCode),
    wallet: {
      balance: toNumber(wallet.balance),
      totalEarned: toNumber(wallet.totalEarned),
      totalPaid: toNumber(wallet.totalPaid),
    },
    totals: {
      salesCount: toNumber(totals.salesCount),
      grossRevenue: toNumber(totals.grossRevenue),
      commissionEarned: toNumber(totals.commissionEarned),
    },
    recentSales: (Array.isArray(data.recentSales) ? data.recentSales : []).map((entry, index) => {
      const sale = asRecord(entry);
      return {
        purchaseId: toStringOrNull(sale.purchaseId) ?? `sale-${index}`,
        courseTitle: toStringOrNull(sale.courseTitle),
        bundleTitle: toStringOrNull(sale.bundleTitle),
        bundlePurchaseGroupId: toStringOrNull(sale.bundlePurchaseGroupId),
        amount: toNumber(sale.amount),
        commissionAmount: toNumber(sale.commissionAmount),
        commissionRate: toNumber(sale.commissionRate),
        createdAt: toStringOrNull(sale.createdAt) ?? '',
      };
    }),
    monthly: (Array.isArray(data.monthly) ? data.monthly : []).map((entry) => {
      const point = asRecord(entry);
      return {
        month: toStringOrNull(point.month) ?? '',
        salesCount: toNumber(point.salesCount),
        commission: toNumber(point.commission),
      };
    }),
  };
}

export function normaliseCalculateResponse(raw: unknown): CalculateResponse {
  const data = asRecord(raw);
  return {
    packageId: toStringOrNull(data.packageId) ?? '',
    salesPerMonth: toNumber(data.salesPerMonth),
    earnPerSale: toNumber(data.earnPerSale),
    monthly: toNumber(data.monthly),
    quarterly: toNumber(data.quarterly),
    yearly: toNumber(data.yearly),
    breakdown: normaliseBreakdown(data.breakdown),
  };
}

// ───────────────────────────────────────────────────────────── sale grouping ──

/** One SALE as a human counts it: a single course, or a whole bundle. */
export interface SaleRow {
  key: string;
  title: string;
  isBundle: boolean;
  courseCount: number;
  amount: number;
  commissionAmount: number;
  commissionRate: number;
  createdAt: string;
}

/**
 * Collapse purchase rows into sales.
 *
 * Rows sharing a `bundlePurchaseGroupId` are one bundle sale: their amounts and
 * commissions are summed (in integer paise) and the bundle's title is used. Rows
 * with a null group id are standalone course sales and pass through untouched.
 * Order of first appearance is preserved, so whatever ordering the API chose —
 * newest-first, per the contract — survives the grouping.
 */
export function groupSales(sales: readonly RecentSale[]): SaleRow[] {
  const rows: SaleRow[] = [];
  const byGroup = new Map<string, number>();
  // Sums are accumulated in paise alongside `rows` and written back at the end;
  // adding rupee floats row by row drifts on exactly the fractional commissions
  // this page exists to display.
  const paise: { amount: number; commission: number }[] = [];

  for (const sale of sales) {
    const groupId = sale.bundlePurchaseGroupId;

    if (groupId) {
      const existing = byGroup.get(groupId);
      if (existing !== undefined) {
        rows[existing].courseCount += 1;
        paise[existing].amount += toPaise(sale.amount);
        paise[existing].commission += toPaise(sale.commissionAmount);
        continue;
      }
      byGroup.set(groupId, rows.length);
    }

    rows.push({
      key: groupId ?? sale.purchaseId,
      title: (groupId ? sale.bundleTitle : sale.courseTitle) ?? sale.courseTitle ?? 'Purchase',
      isBundle: Boolean(groupId),
      courseCount: 1,
      amount: 0,
      commissionAmount: 0,
      commissionRate: sale.commissionRate,
      createdAt: sale.createdAt,
    });
    paise.push({ amount: toPaise(sale.amount), commission: toPaise(sale.commissionAmount) });
  }

  return rows.map((row, index) => ({
    ...row,
    amount: fromPaise(paise[index].amount),
    commissionAmount: fromPaise(paise[index].commission),
  }));
}

/**
 * A short parenthetical for where a commission rate came from.
 *
 * `commissionSource` is a backend enum this screen has never seen a real value
 * of, so only values we are confident about are labelled and everything else —
 * including an empty string — renders nothing at all. Echoing an unknown token
 * straight into the UI would be worse than staying quiet.
 */
export function commissionSourceHint(source: string): string | null {
  switch (source.toLowerCase()) {
    case 'bundle':
      return 'set on this package';
    case 'platform':
    case 'default':
    case 'platform_default':
      return 'platform default';
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────── errors ──

/**
 * Turn a failed response into one sentence a human can act on.
 *
 * Deliberately tolerant of a non-JSON body: today these endpoints 404 with
 * Express' HTML error page, and a proxy 502 would not be JSON either.
 */
export async function readError(res: Response, fallback: string): Promise<string> {
  if (res.status === 401) {
    return 'You are not signed in, so your earnings cannot be loaded. Sign in and try again.';
  }
  if (res.status === 404) {
    return `${fallback}: this endpoint is not available on the server yet (HTTP 404).`;
  }

  const body = await res.json().catch(() => null);
  if (!body || typeof body !== 'object') return `${fallback} (HTTP ${res.status})`;

  const data = body as Record<string, unknown>;
  const headline = typeof data.error === 'string' ? data.error : null;
  const detail =
    typeof data.message === 'string'
      ? data.message
      : Array.isArray(data.details)
      ? data.details.filter((item): item is string => typeof item === 'string').join(' ')
      : null;

  if (headline && detail) return `${headline}: ${detail}`;
  return headline || detail || `${fallback} (HTTP ${res.status})`;
}
