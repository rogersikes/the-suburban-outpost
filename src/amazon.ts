/**
 * Standardized Amazon Affiliate Link Helper
 * Enforces compliance with the Amazon Associates Operating Agreement:
 * 1. No stale or unverified hardcoded prices without real-time PA-API timestamp.
 * 2. Evergreen call-to-action ("Check Current Price on Amazon" or "View on Amazon").
 * 3. Clean canonical URL format: https://www.amazon.com/dp/{ASIN}?tag={TAG}
 * 4. Stripped tracking sessions, affiliate overwrites, and query clutter.
 * 5. Enforced rel="nofollow noopener noreferrer" and target="_blank".
 */

export const DEFAULT_AMAZON_TAG = 'thesuburbanoutpost-20';

export function getAmazonAffiliateTag(): string {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG) {
    return process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG;
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AMAZON_AFFILIATE_TAG) {
    return (import.meta as any).env.VITE_AMAZON_AFFILIATE_TAG;
  }
  if (typeof window !== 'undefined' && (window as any).__AMAZON_TAG__) {
    return (window as any).__AMAZON_TAG__;
  }
  return DEFAULT_AMAZON_TAG;
}

/**
 * Extracts a 10-character alphanumeric ASIN from a string, URL, or identifier.
 */
export function extractAsin(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  
  // Direct 10-character ASIN check
  if (/^[A-Z0-9]{10}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // Check URL patterns: /dp/B0..., /gp/product/B0..., /ASIN/B0...
  const match = trimmed.match(/(?:\/dp\/|\/gp\/product\/|\/ASIN\/)([A-Z0-9]{10})/i);
  if (match && match[1]) {
    return match[1].toUpperCase();
  }

  // Check query parameter asin=B0...
  const queryMatch = trimmed.match(/[?&]asin=([A-Z0-9]{10})/i);
  if (queryMatch && queryMatch[1]) {
    return queryMatch[1].toUpperCase();
  }

  return null;
}

/**
 * Standardizes an ASIN or raw Amazon URL into a clean canonical affiliate URL.
 * Output format: https://www.amazon.com/dp/{ASIN}?tag={TAG}
 */
export function formatAmazonUrl(input: string, customTag?: string): string {
  const tag = customTag || getAmazonAffiliateTag();
  const asin = extractAsin(input);

  if (asin) {
    return `https://www.amazon.com/dp/${asin}?tag=${tag}`;
  }

  // If input is not an ASIN or recognized link, search safely
  const cleanedSearch = input.replace(/https?:\/\/[^\s]+/g, '').trim();
  return `https://www.amazon.com/s?k=${encodeURIComponent(cleanedSearch || 'homestead gear')}&tag=${tag}`;
}

/**
 * Standard anchor attributes required for Amazon Associates compliance and SEO safety
 */
export const AMAZON_LINK_ATTRIBUTES = {
  target: '_blank' as const,
  rel: 'nofollow noopener noreferrer' as const,
};
