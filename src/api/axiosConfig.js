import axios from "axios";

// During dev we proxy /api -> backend to avoid CORS issues.
// For prod set VITE_API to the full backend URL.
const baseURL = import.meta.env.VITE_API || "/api";

// Single shared axios instance for the app
const api = axios.create({
  baseURL,
});

// REQUEST interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      // Always attach bearer token
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token.trim()}`;
      // Debug preview to verify header presence
      console.log("=== AXIOS REQUEST ===", {
        url: config.url,
        method: config.method?.toUpperCase(),
        hasAuth: true,
      });
    } else {
      console.warn("=== AXIOS REQUEST (no token) ===", {
        url: config.url,
        method: config.method?.toUpperCase(),
        hasAuth: false,
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("⚠️ 401 Unauthorized");
    }
    return Promise.reject(error);
  }
);

export default api;
