import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002/api';
console.log(baseURL);


export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

export default apiClient;

// --- Automatic refresh-on-401 interceptor ---
// When a request gets a 401, attempt to call POST /users/refresh once to rotate tokens
// and then retry the original request. Queue other failed requests while refresh is in progress.

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error: any) => void;
  config: any;
}> = [];

const processQueue = (error: any) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(apiClient(p.config));
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    // If no response or not 401, just propagate
    if (!error?.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Avoid trying to refresh if the failing request was the refresh call itself
    if (originalRequest && originalRequest.url && originalRequest.url.includes('/users/refresh')) {
      return Promise.reject(error);
    }

    // If we've already retried this request, give up
    if (originalRequest && (originalRequest as any)._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue the request until refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    // Start refresh
    (originalRequest as any)._retry = true;
    isRefreshing = true;

    try {
      await apiClient.post('users/refresh');
      isRefreshing = false;
      processQueue(null);
      return apiClient(originalRequest);
    } catch (err) {
      isRefreshing = false;
      processQueue(err);
      // If refresh failed, redirect to login so user can re-authenticate
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return Promise.reject(err);
    }
  }
);

