'use client';

interface PricingDisplayProps {
  mrp: number;
  actualPrice: number;
  discountPercentage: number;
  isLoggedIn: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function PricingDisplay({
  mrp,
  actualPrice,
  discountPercentage,
  isLoggedIn,
  size = 'md',
}: PricingDisplayProps) {
  const priceSizeClass =
    size === 'lg'
      ? 'text-lg'
      : size === 'sm'
      ? 'text-sm'
      : 'text-sm';

  const mrpSizeClass =
    size === 'lg'
      ? 'text-[11px]'
      : size === 'sm'
      ? 'text-[11px]'
      : 'text-xs';

  // Safety: fall back to actualPrice if mrp is undefined/null/NaN
  const safeMrp =
    typeof mrp === 'number' && !Number.isNaN(mrp) ? mrp : actualPrice;
  const safeActual =
    typeof actualPrice === 'number' && !Number.isNaN(actualPrice) ? actualPrice : 0;

  const hasDiscount = safeMrp > safeActual && discountPercentage > 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(value);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-start leading-tight">
        <div className="flex items-baseline gap-1.5">
          <span className={`${mrpSizeClass} text-gray-500 dark:text-gray-400`}>
            M.R.P.:
          </span>
          <span className={`${priceSizeClass} font-semibold text-blue-600 dark:text-blue-400`}>
            ₹{formatCurrency(safeMrp)}
          </span>
        </div>
        <span className={`${mrpSizeClass} text-gray-500 dark:text-gray-400 mt-0.5`}>
          Use referral link for discount
        </span>
      </div>
    );
  }

  if (!hasDiscount) {
    return (
      <div className="flex flex-col items-start leading-tight">
        <span className={`${priceSizeClass} font-semibold text-blue-600 dark:text-blue-400`}>
          ₹{formatCurrency(safeActual)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start leading-tight">
      <div className="flex items-baseline gap-1.5">
        <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-900/30 px-2 py-0.5 text-[11px] font-semibold text-red-600 dark:text-red-300">
          -{discountPercentage}%
        </span>
        <span className={`${priceSizeClass} font-semibold text-blue-600 dark:text-blue-400 tracking-tight`}>
          ₹{formatCurrency(safeActual)}
        </span>
      </div>
      <div className={`${mrpSizeClass} text-gray-500 dark:text-gray-400 mt-0.5`}>
        <span className="mr-1">M.R.P.:</span>
        <span className="line-through">₹{formatCurrency(safeMrp)}</span>
      </div>
    </div>
  );
}

