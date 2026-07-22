import axios from "axios";
import { store } from "../store";
import { clearUser } from "../store/slices/authSlice";

// Map to track active request AbortControllers
const activeRequests = new Map<string, AbortController>();

// Cache map to store GET responses to avoid redundant loading on remounts
interface CacheEntry {
  data: any;
  timestamp: number;
}
const responseCache = new Map<string, CacheEntry>();
const CACHE_TTL = 300000; // 5 minutes cache TTL

// Helper to generate a unique identifier for a request
const getRequestKey = (config: any): string => {
  const { method, url, params, data } = config;
  const serializedData = typeof data === "string" ? data : JSON.stringify(data);
  return [method, url, JSON.stringify(params), serializedData].join("&");
};

// Centralized Axios Instance
const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true, // Always send cookies (HTTP-only JWT)
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // 1. Attach JWT token from localStorage
    const token = localStorage.getItem("pyvp_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const requestKey = getRequestKey(config);

    // 2. Cache Invalidation: Invalidate cache on mutations (POST, PUT, DELETE, PATCH)
    if (config.method && config.method.toLowerCase() !== "get") {
      responseCache.clear();
    }

    // 3. Cache Check: Bypass network if valid response exists in cache for GET requests
    if (config.method?.toLowerCase() === "get") {
      const cached = responseCache.get(requestKey);
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        // Return a rejected promise with cache hit flag to resolve immediately in response interceptor
        return Promise.reject({
          __isCacheHit: true,
          response: {
            data: cached.data,
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          },
        });
      }
    }

    // 4. Prevent duplicate requests: Abort the previous identical request
    if (activeRequests.has(requestKey)) {
      const controller = activeRequests.get(requestKey);
      controller?.abort();
      activeRequests.delete(requestKey);
    }

    // Assign new AbortController if not already explicitly provided
    const controller = new AbortController();
    config.signal = config.signal || controller.signal;
    (controller as any).pathname = window.location.pathname;
    activeRequests.set(requestKey, controller);

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    const requestKey = getRequestKey(response.config);
    activeRequests.delete(requestKey);

    // Cache successful GET responses
    if (response.config.method?.toLowerCase() === "get") {
      responseCache.set(requestKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    return response;
  },
  (error) => {
    // Check if it's a cached response hit and resolve immediately
    if (error && error.__isCacheHit) {
      return Promise.resolve(error.response);
    }

    if (error.config) {
      const requestKey = getRequestKey(error.config);
      activeRequests.delete(requestKey);
    }

    // Handle abort/cancel errors gracefully
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    let userFriendlyMsg = "An unexpected error occurred. Please try again.";
    
    if (error.response) {
      const status = error.response.status;
      const serverMsg = error.response.data?.message;

      switch (status) {
        case 401:
          userFriendlyMsg = serverMsg || "Your session has expired. Please sign in again.";
          // Clear authentication states and redirect if unauthorized
          store.dispatch(clearUser());
          const publicPaths = ["/", "/about", "/executives", "/register", "/verify"];
          if (!publicPaths.some((p) => window.location.pathname.startsWith(p))) {
            window.location.href = "/dashboard";
          }
          break;
        case 403:
          userFriendlyMsg = serverMsg || "Access Denied. You do not have permissions to perform this action.";
          break;
        case 404:
          userFriendlyMsg = serverMsg || "The requested resources could not be found.";
          break;
        case 429:
          userFriendlyMsg = "Too many requests. Please slow down and try again later.";
          break;
        case 500:
          userFriendlyMsg = serverMsg || "Internal Server Error. Please contact backend support.";
          break;
        default:
          userFriendlyMsg = serverMsg || userFriendlyMsg;
      }

      // Inject friendly message back into error response structure so existing catches capture it
      if (error.response.data) {
        error.response.data.message = userFriendlyMsg;
      } else {
        error.response.data = { message: userFriendlyMsg };
      }
    } else if (error.request) {
      userFriendlyMsg = "Connection timeout. Please check your internet connection and try again.";
    }

    error.message = userFriendlyMsg;
    return Promise.reject(error);
  }
);

// Cancel all pending page requests from previous routes (called upon route change)
export const cancelAllPendingRequests = (currentPathname: string) => {
  activeRequests.forEach((controller, requestKey) => {
    const requestPathname = (controller as any).pathname;
    // Only abort if the request was started on a different route pathname
    if (requestPathname && requestPathname !== currentPathname) {
      if (!requestKey.includes("/logout") && !requestKey.includes("/profile")) {
        controller.abort();
      }
      activeRequests.delete(requestKey);
    }
  });
};

export default api;
