import axios, { AxiosRequestConfig } from "axios";

// Create Axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_WATCHTOWER_APP_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor - runs before every request
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["app-name"] = "staff";

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log("🚀 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - runs after every response
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (process.env.NODE_ENV === "development") {
      console.log("✅ API Response:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      console.error("❌ API Error Response:", {
        status,
        url: error.config?.url,
        data,
      });

      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem("authToken");
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          break;
        case 403:
          console.error("Access forbidden");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          break;
      }
    } else if (error.request) {
      // Network error
      console.error("❌ Network Error:", error.message);
    } else {
      // Other error
      console.error("❌ Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;

// Helper functions for different HTTP methods
export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config),
  post: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ) => apiClient.post<T>(url, data, config),
  put: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ) => apiClient.put<T>(url, data, config),
  patch: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ) => apiClient.patch<T>(url, data, config),
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config),
};
