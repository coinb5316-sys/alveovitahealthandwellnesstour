import axios from "axios";

// Get the API URL from environment or use production default
// REMOVED /api from the base URL - we'll add it in component endpoints
const API_URL = import.meta.env.VITE_API_URL || "https://alveovitahealthandwellnesstour.onrender.com";

// Log for debugging
console.log("🔗 [API] Using URL:", API_URL);
console.log("📱 [API] Environment:", import.meta.env.MODE || 'development');

const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor - Add token to every request
API.interceptors.request.use(
  (config) => {
    console.log(`📤 [API] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    
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

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log(`📥 [API] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error("❌ [API] Response Error:", error);
    
    if (error.code === 'ECONNABORTED') {
      console.error("⏰ [API] Request timed out!");
    }
    
    if (error.message === 'Network Error') {
      console.error("📶 [API] Network error - check your internet connection!");
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
          
          const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
            refreshToken,
          });
          
          const { token, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem("token", token);
          localStorage.setItem("refreshToken", newRefreshToken);

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
    const response = await API.get('/api/health');
    console.log("✅ [API] Connection successful:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ [API] Connection test failed:", error);
    return { success: false, error: error.message };
  }
};

export default API;