/**
 * Central API URL utility.
 * VITE_API_URL is the root backend URL (e.g. http://localhost:5000).
 * All API calls must use this helper so /api is always included.
 */
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export const API_URL = `${BASE}/api`;
