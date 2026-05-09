/**
 * Central API URL utility.
 * VITE_API_URL is the root backend URL (e.g. http://localhost:5000).
 * All API calls must use this helper so /api is always included.
 */
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  if (typeof window !== 'undefined' && import.meta.env.PROD) return window.location.origin;
  return 'http://localhost:5000';
};

const BASE = getBaseURL();

export const API_URL = `${BASE}/api`;

/**
 * Resolves a game image URL to be environment-agnostic.
 * Handles:
 * 1. Absolute URLs (including replacing localhost with current BASE)
 * 2. Relative paths (prepending current BASE)
 */
export const resolveImageUrl = (url) => {
  if (!url) return '';
  
  // If it's a localhost URL from development, replace it with the current BASE
  if (url.includes('localhost:5000')) {
    return url.replace('http://localhost:5000', BASE);
  }
  
  // If it starts with http, it's already an absolute URL (likely a valid remote asset)
  if (url.startsWith('http')) {
    return url;
  }
  
  // If it's a relative path, prepend the BASE URL
  return `${BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};
