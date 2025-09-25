import axios, { AxiosRequestConfig } from "axios";
import { showToast } from "./toast";
import { translateUtil } from "./translationUtils";

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

      // Show toast notification for API errors (except for auth-related routes)
      const url = error.config?.url || "";
      const isAuthRoute = url.includes("/login") || url.includes("/register");

      if (!isAuthRoute && typeof window !== "undefined") {
        // Handle the specific response format: { status, scope, context, timestamp, error }
        if (data && typeof data === "object") {
          let errorMessage = translateUtil("anErrorOccurred");
          let errorTitle = translateUtil("error");

          // Check for error object with message
          if (
            data.error &&
            typeof data.error === "object" &&
            data.error.message
          ) {
            errorMessage = data.error.message;
          }
          // Fallback to context or direct message
          else if (data.context) {
            errorMessage = data.context;
          } else if (data.message) {
            errorMessage = data.message;
          } else if (typeof data.error === "string") {
            errorMessage = data.error;
          }

          // Use scope as title if available
          if (data.scope) {
            errorTitle = data.scope;
          }

          showToast.error(errorTitle, errorMessage);
        } else {
          showToast.apiError(
            data,
            `${translateUtil("requestFailed")} (${status})`
          );
        }
      }

      // Handle specific status codes - ONLY navigate on 404
      switch (status) {
        case 401:
          // Unauthorized - clear token but don't navigate, just show toast
          localStorage.removeItem("authToken");
          if (!isAuthRoute && typeof window !== "undefined") {
            showToast.error(
              translateUtil("sessionExpired"),
              translateUtil("pleaseLoginAgain")
            );
          }
          break;

          console.error(translateUtil("serverError"));
          // Just show toast, no navigation
          break;
        default:
          // For all other errors, just show toast and handle response
          break;
      }
    } else if (error.request) {
      // Network error
      console.error("❌ Network Error:", error.message);
      if (typeof window !== "undefined") {
        showToast.error(
          translateUtil("networkError"),
          translateUtil("checkInternetConnection")
        );
      }
    } else {
      // Other error
      console.error("❌ Error:", error.message);
      if (typeof window !== "undefined") {
        showToast.error(
          translateUtil("error"),
          error.message || translateUtil("somethingWentWrong")
        );
      }
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
