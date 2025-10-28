import axios from 'axios';

// Determine API base URL with this precedence:
// 1. VITE_API_BASE_URL environment variable (preferred)
// 2. Map known production frontend hostnames to their API host
// 3. Fallback to localhost dev API
const baseURL = "https://api.prashn.swastify.life";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
