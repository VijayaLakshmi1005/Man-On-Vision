/**
 * Central API URL utility.
 * VITE_API_URL is the root backend URL (e.g. http://localhost:5000).
 * All API calls must use this helper so /api is always included.
 */
const getBaseURL = () => {
  // Priority 1: Explicit Environment Variable
  let url = import.meta.env.VITE_API_URL || '';

  // Priority 2: In production, if VITE_API_URL is missing, fallback to current origin
  if (!url && typeof window !== 'undefined' && import.meta.env.PROD) {
    url = window.location.origin;
  }

  // Priority 3: Development fallback
  if (!url) url = 'http://localhost:5000';

  // Strip trailing slashes and /api if present to get the root domain
  return url.replace(/\/$/, '').replace(/\/api$/, '');
};

const BASE = getBaseURL();

export const API_URL = `${BASE}/api`;

/**
 * Resolves a potentially relative or localhost URL to a fully qualified production-ready URL.
 */
export const resolveImageUrl = (url) => {
  if (!url) return '';

  // 1. If it's already an absolute URL (http or https), return as is
  // (unless it's a localhost URL that needs replacing)
  const isAbsolute = url.startsWith('http://') || url.startsWith('https://');

  if (isAbsolute) {
    // Special case: If it's a localhost URL stored in DB, replace it with current BASE
    if (url.includes('localhost:5000') || url.includes('127.0.0.1:5000')) {
      return url.replace(/http:\/\/(localhost|127\.0\.0\.1):5000/g, BASE);
    }
    return url;
  }

  // 2. Handle relative paths
  let resolvedUrl = url;
  if (url.startsWith('/')) {
    resolvedUrl = `${BASE}${url}`;
  } else {
    resolvedUrl = `${BASE}/${url}`;
  }

  // Debugging log for production issues
  if (import.meta.env.PROD && resolvedUrl.includes('localhost')) {
    console.warn('[IMAGE_ISSUE] Image resolved to localhost in production:', { original: url, resolved: resolvedUrl });
  }

  return resolvedUrl;
};
