import { BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { AxiosRequestConfig } from "axios";
import { apiClient } from "../../lib/apiClient";

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
      return {
        error: {
          status: error.response?.status,
          data: error.response?.data || error.message,
        },
      };
    }
  };
