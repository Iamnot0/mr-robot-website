// Currency conversion utilities
// 1 USD = 4250 MMK

export const USD_TO_MMK_RATE = 4250;

/**
 * Convert USD to MMK
 * @param {number} usd - Amount in USD
 * @returns {number} Amount in MMK
 */
export const usdToMmk = (usd) => {
  return Math.round(usd * USD_TO_MMK_RATE);
};

/**
 * Convert MMK to USD
 * @param {number} mmk - Amount in MMK
 * @returns {number} Amount in USD (rounded to 2 decimal places)
 */
export const mmkToUsd = (mmk) => {
  return Math.round((mmk / USD_TO_MMK_RATE) * 100) / 100;
};

/**
 * Format price with both MMK and USD
 * @param {number} mmk - Amount in MMK
 * @param {Object} options - Formatting options
 * @returns {Object} Formatted price object
 */
export const formatPrice = (mmk, options = {}) => {
  const { showBoth = true, primaryCurrency = 'MMK' } = options;
  
  const usd = mmkToUsd(mmk);
  
  if (!showBoth) {
    return {
      primary: primaryCurrency === 'MMK' ? `${mmk} MMK` : `$${usd} USD`,
      secondary: null
    };
  }
  
  return {
    primary: `${mmk} MMK`,
    secondary: `$${usd} USD`,
    mmk: mmk,
    usd: usd
  };
};

/**
 * Format price for display in components
 * @param {number} mmk - Amount in MMK
 * @param {string} className - CSS class for styling
 * @returns {JSX.Element} Formatted price display
 */
export const PriceDisplay = ({ mmk, className = "", showBoth = true }) => {
  const price = formatPrice(mmk, { showBoth });
  
  if (!showBoth) {
    return <span className={className}>{price.primary}</span>;
  }
  
  return (
    <div className={className}>
      <div className="text-2xl font-bold text-primary">
        {price.primary}
      </div>
      <div className="text-sm text-foreground/60">
        {price.secondary}
      </div>
    </div>
  );
};
