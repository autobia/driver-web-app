import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

// Define purchase orders interfaces
export interface Manufacturer {
  id: number;
  name_en: string;
  name_ar: string;
}

export interface Brand {
  id: number;
  name_en: string;
  name_ar: string;
  is_active: boolean;
}

export interface Item {
  id: number;
  part_number: string;
  brand: Brand;
  manufacturer: Manufacturer;
  price: number;
  original_price: number;
  quantity: number;
  received_quantity: number;
  original_quantity: number;
  average_cost_price: number;
  average_selling_price: number;
  returned_quantity: number;
  stock_quantity: number;
}

export interface Company {
  id: number;
  name_en: string;
  name_ar: string;
  commercial_name: string;
  tax_number: number;
  national_address: string;
  phone: string;
  email: string | null;
  is_active: boolean;
}

export interface CompanyBranch {
  id: number;
  company: Company;
  type: string;
  is_active: boolean;
  street_name: string;
  building_number: number;
  postal_code: string;
}

export interface Warehouse {
  id: number;
  name_en: string;
  name_ar: string;
  is_active: boolean;
  latitude: number;
  longitude: number;
}

export interface PurchaseOrderRequest {
  purchaseOrderID: number;
}

export interface PurchaseOrderResponse {
  id: number;
  company_branch: CompanyBranch;
  warehouse: Warehouse;
  purchase_type: string;
  invoice_id: string;
  convert_into_invoice_at: string;
  actual_purchase_date: string;
  discount: number;
  items: Item[];
  created_at: string;
  note: string | null;
}

// Create the inventory API using axiosBaseQuery
export const purchaseOrderApi = createApi({
  reducerPath: "purchaseOrderApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["purchaseOrder"],
  endpoints: (builder) => ({
    getPurchaseOrder: builder.query<
      PurchaseOrderResponse,
      PurchaseOrderRequest
    >({
      query: ({ purchaseOrderID }) => ({
        url: `/purchases/orders/${purchaseOrderID}/`,
        method: "GET",
      }),
      providesTags: ["purchaseOrder"],
    }),
  }),
});

// Export hooks for usage in functional components
export const { useGetPurchaseOrderQuery } = purchaseOrderApi;

// Export the reducer
export default purchaseOrderApi.reducer;
