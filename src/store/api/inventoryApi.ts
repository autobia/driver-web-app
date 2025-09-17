import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

// Define manufacturer and brand interfaces
export interface Manufacturer {
  id: number;
  name_en: string;
  name_ar: string;
  logo?: string;
  status: string;
  linked_brands: number[];
}

export interface Brand {
  id: number;
  name_en: string;
  name_ar: string;
  is_active: boolean;
  linked_manufacturers: number[];
  status: string;
  genuinity: string | null;
}

export type ManufacturersResponse = Manufacturer[];
export type BrandsResponse = Brand[];

// Create the inventory API using axiosBaseQuery
export const inventoryApi = createApi({
  reducerPath: "inventoryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Manufacturer", "Brand"],
  endpoints: (builder) => ({
    getManufacturers: builder.query<ManufacturersResponse, void>({
      query: () => ({
        url: "/inventory/manufacturers-v2/",
        method: "GET",
      }),
      providesTags: ["Manufacturer"],
    }),
    getBrands: builder.query<BrandsResponse, void>({
      query: () => ({
        url: "/inventory/brands/",
        method: "GET",
      }),
      providesTags: ["Brand"],
    }),
  }),
});

// Export hooks for usage in functional components
export const { useGetManufacturersQuery, useGetBrandsQuery } = inventoryApi;

// Export the reducer
export default inventoryApi.reducer;
