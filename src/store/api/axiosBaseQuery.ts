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
    const result = await apiClient.request({
      url,
      method,
      data,
      params,
    });
    return { data: result.data };
  };
