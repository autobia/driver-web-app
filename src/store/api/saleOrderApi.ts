import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

export interface SaleOrder {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  bill_file: string | null;
  shipping_file: string | null;
  shipping_receipt_file: string | null;
  note: string | null;
  status: string;
  previous_status: string;
  approved_at: string | null;
  customer_approved_at: string | null;
  preparation_area_id: number | null;
  coupon_id: number | null;
  coupon_percentage: number | null;
  coupon_applied_at: string | null;
  coupon_max_price: number | null;
  coupon_type: string | null;
  total_price: number | null;
  total_refund_price: number | null;
  shipping_price: number;
  vat_rate: number | null;
  constant_discount: number;
  invoice_id: number | null;
  coupon_activated_at: string | null;
  client_id: number | null;
  is_ready: boolean;
  accounted: boolean;
  actual_shipping_price: number;
  private_note: string | null;
  convert_to_invoice_at: string | null;
  invoice_due_date: string | null;
  qrcode: string | null;
  constant_discount_reason_id: number | null;
  total_discount: number;
  remaining_constant_discount: number;
  convert_to_quotation_at: string | null;
  is_simplified_invoice: boolean;
  ready_to_quality_check_at: string | null;
  ready_to_package_at: string | null;
  out_to_delivery_at: string | null;
  upload_shipping_policy_at: string | null;
  quality_check_assign_at: string | null;
  start_quality_check_at: string | null;
  ready_to_delivery_at: string | null;
  saleperson_receive_order_at: string | null;
  confirm_order_paid_at: string | null;
  saleperson_deliver_order_at: string | null;
  late: boolean;
  priority: number;
  shipping_company_id: number;
  other_shipping_company: string | null;
  loading_fee: number;
  is_vat_included: boolean;
  cancel_reason: string | null;
  urgent: boolean;
  completed_at: string | null;
  total_packages: number;
  allow_prepare_at: string | null;
  current_status_at: string | null;
  order_completed_on: string | null;
  pricing_status_id: number | null;
  total_quantity: number;
  unavailable_quantity: number;
  total_stock: number;
  total_cancel: number;
  total_market: number;
  total_stock_exchange: number;
  app_id: number;
  last_item_scanned_at: string | null;
  confirm_order_to_deliver_at: string | null;
  allow_prepare: boolean;
  split_parent_id: number | null;
  split_at: string | null;
  public_order_id: string | null;
  no_of_payment_reminder: number;
  last_payment_reminder_at: string | null;
  e_invoice_status: string;
  clearance: boolean;
  created_by: number;
  updated_by: number | null;
  deleted_by: number | null;
  contact: number;
  saleperson: number | null;
  confirm_completed: number | null;
  approved_by: number;
  customer_approved_by: number | null;
  coupon_applied_by: number | null;
  payment_type: number | null;
  convert_to_invoice_by: number | null;
  ready_to_quality_check_by: number | null;
  ready_to_package_by: number | null;
  out_to_delivery_by: number | null;
  upload_shipping_policy_by: number | null;
  quality_check_by: number | null;
  quality_check_assign_by: number | null;
  start_quality_check_by: number | null;
  ready_to_delivery_by: number | null;
  send_to_saleperson: number | null;
  saleperson_receive_order_by: number | null;
  confirm_order_paid_by: number | null;
  saleperson_deliver_order_by: number | null;
  shipping_policy_approved_by: number | null;
  commission_saleperson: number | null;
  company_branch: number | null;
  warehouse: number;
  confirm_order_to_deliver_by: number | null;
  split_root_parent: number | null;
}

export type UnshippedOrdersResponse = SaleOrder[];

// File upload interfaces
export interface FileUploadRequest {
  content_type: number;
  object_id: number;
  type: number; // 1 for image
  base64_file: string;
}

export interface FileUploadResponse {
  file: string;
  id: number;
}

// Shipping document submission interfaces
export interface SubmitShippingDocumentRequest {
  content_type: number;
  object_id: number;
  url: string;
  type: string; // 'ShippingPolicy' or 'ShippingReceipt'
  shipping_company_id: number;
  shipping_price: number;
  is_vat_included: boolean;
  loading_fee: number;
  custom_shipping_company_name?: string;
}

export interface SubmitShippingDocumentResponse {
  success: boolean;
  message?: string;
}

const saleOrderApi = createApi({
  reducerPath: "saleOrderApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["SaleOrders"],
  endpoints: (builder) => ({
    getUnShippedOrders: builder.query<UnshippedOrdersResponse, void>({
      query: () => ({
        url: "sales/un-shipped-orders/",
        method: "GET",
      }),
      providesTags: ["SaleOrders"],
    }),

    uploadFile: builder.mutation<FileUploadResponse, FileUploadRequest>({
      query: (fileData) => ({
        url: "filer/",
        method: "POST",
        data: fileData,
      }),
    }),

    submitShippingDocument: builder.mutation<
      SubmitShippingDocumentResponse,
      SubmitShippingDocumentRequest
    >({
      query: (documentData) => ({
        url: "submit-shipping-url/",
        method: "POST",
        data: documentData,
      }),
      invalidatesTags: ["SaleOrders"],
    }),
  }),
});

export const {
  useGetUnShippedOrdersQuery,
  useUploadFileMutation,
  useSubmitShippingDocumentMutation,
} = saleOrderApi;

export default saleOrderApi;
