// src/api/axios.js
import axios from "axios";

// Get the API URL from environment or use production default
const API_URL = import.meta.env.VITE_API_URL || "https://alveovitahealthandwellnesstour.onrender.com/api";

// Log for debugging (will show in browser console)
console.log("🔗 [API] Using URL:", API_URL);
console.log("📱 [API] Environment:", import.meta.env.MODE || 'development');
console.log("📱 [API] User Agent:", navigator.userAgent);

const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
  timeout: 30000, // 30 second timeout for mobile networks
});

// Request interceptor - Add token to every request
API.interceptors.request.use(
  (config) => {
    // Log request for debugging
    console.log(`📤 [API] ${config.method.toUpperCase()} ${config.url}`);
    console.log(`📤 [API] Full URL: ${config.baseURL}${config.url}`);
    
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ [API] Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration and errors
API.interceptors.response.use(
  (response) => {
    console.log(`📥 [API] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    // Detailed error logging for mobile debugging
    console.error("❌ [API] Response Error:", error);
    
    if (error.code === 'ECONNABORTED') {
      console.error("⏰ [API] Request timed out! Check your network connection.");
    }
    
    if (error.message === 'Network Error') {
      console.error("📶 [API] Network error - check your internet connection!");
      console.error("📶 [API] Make sure you can reach:", API_URL);
    }
    
    if (error.response) {
      console.error(`📥 [API] Status: ${error.response.status}`);
      console.error(`📥 [API] Data:`, error.response.data);
    }

    const originalRequest = error.config;

    // If token expired (401) and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          console.log("🔄 [API] Attempting token refresh...");
          
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });
          
          const { token, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem("token", token);
          localStorage.setItem("refreshToken", newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          console.log("✅ [API] Token refreshed, retrying request...");
          return API(originalRequest);
        }
      } catch (refreshError) {
        console.error("❌ [API] Refresh failed:", refreshError);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to test API connection
export const testAPIConnection = async () => {
  try {
    console.log("🔍 [API] Testing connection to:", API_URL);
    const response = await API.get('/health');
    console.log("✅ [API] Connection successful:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ [API] Connection test failed:", error);
    return { success: false, error: error.message };
  }
};

export default API;