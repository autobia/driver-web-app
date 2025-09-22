import { BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { AxiosRequestConfig } from "axios";
import { apiClient } from "../../lib/apiClient";

// Translation helper for specific error messages
const translateSpecificErrors = (errorData: unknown): unknown => {
  if (
    errorData &&
    typeof errorData === "object" &&
    "context" in errorData &&
    errorData.context === "there is pending replacements"
  ) {
    // Get the current locale from the document or default to 'en'
    const locale = document.documentElement.lang || "en";

    return {
      ...errorData,
      context:
        locale === "ar" ? "هناك بدائل معلقة" : "there is pending replacements",
    };
  }
  return errorData;
};

// Create a custom base query using your API client
export const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params }) => {
    try {
      const result = await apiClient.request({
        url,
        method,
        data,
        params,
      });
      return { data: result.data };
    } catch (axiosError: unknown) {
      const error = axiosError as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };

      // Translate specific error messages
      const translatedData = translateSpecificErrors(error.response?.data);

      return {
        error: {
          status: error.response?.status,
          data: translatedData || error.message,
        },
      };
    }
  };
