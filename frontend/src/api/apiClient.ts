import axios from 'axios';

// Determine API base URL with this precedence:
// 1. VITE_API_BASE_URL environment variable (preferred)
// 2. Map known production frontend hostnames to their API host
// 3. Fallback to localhost dev API
const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
const fallbackLocal = 'http://localhost:3000/api/';

let baseURL: string;
if (envBase && envBase.length > 0) {
  baseURL = envBase;
} else if (typeof window !== 'undefined' && window.location?.hostname?.includes('prashn.swastify.life')) {
  // ASSUMPTION: production API is hosted at api.prashn.swastify.life and exposes routes under /api/
  // If your production API host differs, set VITE_API_BASE_URL in your deployment instead.
  baseURL = 'https://api.prashn.swastify.life/api/';
} else {
  baseURL = fallbackLocal;
}

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
