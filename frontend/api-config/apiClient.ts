import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002/api";
console.log(baseURL);

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

export default apiClient;

/* =========================================================
   SAFER REFRESH INTERCEPTOR - NO INFINITE LOOPS ✅
   ========================================================= */

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
    const status = error?.response?.status;

    // ✅ If no response → just reject
    if (!status) return Promise.reject(error);

    // ✅ If not a 401 → no refresh needed
    if (status !== 401) return Promise.reject(error);

    const url = originalRequest?.url || "";

    // ✅ Do NOT refresh for these calls - they handle auth themselves
    const isRefreshCall = url.includes("/users/refresh");
    const isMeCall = url.includes("/users/me");
    const isLoginCall = url.includes("/users/login");
    const isRegisterCall = url.includes("/users/register");

    if (isRefreshCall || isMeCall || isLoginCall || isRegisterCall) {
      return Promise.reject(error);
    }

    // ✅ Prevent retry loops
    if ((originalRequest as any)._retry) {
      return Promise.reject(error);
    }

    // ✅ If another refresh is already happening, queue the request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    (originalRequest as any)._retry = true;
    isRefreshing = true;

    try {
      await apiClient.post("/users/refresh");

      isRefreshing = false;
      processQueue(null);

      return apiClient(originalRequest);
    } catch (refreshErr) {
      isRefreshing = false;
      processQueue(refreshErr);

      // NOTE: previously we forced a global redirect to /login here when refresh failed.
      // That caused protected pages to immediately navigate away whenever any API call
      // returned 401 (for example when a user is not logged in). Instead of redirecting
      // at the network layer, we should reject and let the application/auth layer
      // decide what to do (show login prompt, toast, or navigate). This is less surprising
      // and avoids unexpected navigation from background requests.
      if (typeof window !== "undefined") {
        console.debug("[apiClient] token refresh failed; rejecting and handing control to app layer", refreshErr);
      }

      return Promise.reject(refreshErr);
    }
  }
);
