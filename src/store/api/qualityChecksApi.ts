import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

// Define the quality check item types - complete structure
export interface QualityCheckItem {
  id: number;
  brand_item: {
    id: number;
    item: {
      id: number;
      part_number: string;
      description: string;
      part_number_scan: string;
      description_ar: string | null;
      description_en: string | null;
      manufacturer: {
        id: number;
        name_en: string;
        name_ar: string;
      };
    };
    selling_price: number;
    average_cost_price: number;
    cost_price: number;
    oem: string | null;
    upc: string | null;
    general_point: string | null;
    brand: {
      id: number;
      name_en: string;
      name_ar: string;
      is_active: boolean;
    };
  };
  quantity: number;
  received_quantity: number;
  delayed_quantity: number;
  created_at: string;
  purchase_price: number;
}

// Define user role interface
interface UserRole {
  id: number;
  name_en: string;
  name_ar: string;
  is_staff: boolean;
  permissions: string[];
}

// Define language interface
interface Language {
  id: number;
  name_en: string;
  name_ar: string;
}

// Define user interface
interface User {
  id: number;
  language: Language;
  last_visit_platform: string | null;
  days_since_visit: number | null;
  is_recently_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  username: string;
  email: string | null;
  phone: string;
  first_name: string;
  last_name: string;
  status: string;
  email_verified_at: string | null;
  remember_token: string | null;
  client: unknown | null;
  vendor: unknown | null;
  last_login: string;
  is_admin: boolean;
  is_staff: boolean;
  is_active: boolean;
  is_superuser: boolean;
  notify_hash: string | null;
  is_beta: boolean;
  last_interest_sent_at: string | null;
  last_visit_at: string | null;
  created_by: number;
  updated_by: number | null;
  deleted_by: number | null;
  role: UserRole;
}

// Define company employee interface
interface CompanyEmployee {
  id: number;
  company_branch: number;
  user: User;
  assigned_by: User;
  assigned_at: string;
  is_active: boolean;
  expired_by: unknown | null;
  expired_at: string | null;
  type: {
    id: number;
    name_en: string;
    name_ar: string;
    is_active: boolean;
  };
}

// Define the main quality check types - complete structure
export interface QualityCheck {
  id: number;
  content_type: {
    id: number;
    app_label: string;
    model: string;
  };
  object_id: number;
  status: string;
  quality_checker: {
    id: number;
    language: Language;
    last_visit_platform: string | null;
    days_since_visit: number | null;
    is_recently_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    username: string;
    email: string | null;
    phone: string;
    first_name: string;
    last_name: string;
    status: string;
    email_verified_at: string | null;
    remember_token: string | null;
    client: unknown | null;
    vendor: unknown | null;
    last_login: string;
    is_admin: boolean;
    is_staff: boolean;
    is_active: boolean;
    is_superuser: boolean;
    notify_hash: string | null;
    is_beta: boolean;
    last_interest_sent_at: string | null;
    last_visit_at: string | null;
    created_by: number;
    updated_by: number | null;
    deleted_by: number | null;
    role: UserRole;
  };
  assign_by: User | null;
  assign_at: string;
  start_at: string | null;
  end_at: string | null;
  next_reminder: string | null;
  main_source_type: {
    id: number;
    app_label: string;
    model: string;
  };
  main_source_id: {
    id: number;
    company_branch: {
      id: number;
      company: {
        id: number;
        name_en: string;
        name_ar: string;
        company_type: {
          id: number;
          name_en: string;
          name_ar: string;
          description_en: string;
          description_ar: string;
        };
        cc_name: string | null;
        tax_number: string | null;
        commercial_name: string;
        national_address: string | null;
        is_active: boolean;
        note: string | null;
        phone: string;
        email: string | null;
        client_id: number;
        is_taxable: boolean;
        entity: {
          id: number;
          name_ar: string;
          name_en: string;
          logo: {
            id: string;
            content_type: {
              id: number;
              app_label: string;
              model: string;
            };
            object_id: number;
            type: {
              id: number;
              label_en: string;
              label_ar: string;
            };
            file: string;
            created_at: string;
          };
          is_active: boolean;
          description_en: string;
          description_ar: string;
          created_at: string;
          updated_at: string;
        };
        company_employees: CompanyEmployee[];
      };
      industry: {
        id: number;
        name_en: string;
        name_ar: string;
        city: {
          id: number;
          name_en: string;
          name_ar: string;
          administrative_area: {
            id: number;
            name_en: string;
            name_ar: string;
            country: {
              id: number;
              name_en: string;
              name_ar: string;
            };
          };
        };
      };
      type: string;
      is_active: boolean;
      latitude: number | null;
      longitude: number | null;
      shipping_company_branch: unknown | null;
      store_size: number | null;
      number_of_cashiers: number | null;
      number_of_doors: number | null;
      number_of_employee: number | null;
      note: string | null;
      last_visit: string | null;
      street_name: string | null;
      building_number: string | null;
      postal_code: string | null;
      files: unknown[];
    };
    warehouse: {
      id: number;
      name_en: string;
      name_ar: string;
      is_active: boolean;
      latitude: number;
      longitude: number;
      industry: unknown | null;
    };
    purchase_type: string;
    invoice_url: string | null;
    reason: string | null;
    reason_note: string | null;
    created_at: string;
    total_amount: number;
    note: string | null;
    quantity_status: string;
    actual_purchase_date: string | null;
    created_by: {
      id: number;
      language: Language;
      last_visit_platform: string | null;
      days_since_visit: number | null;
      is_recently_active: boolean;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
      username: string;
      email: string;
      phone: string;
      first_name: string;
      last_name: string;
      status: string;
      email_verified_at: string | null;
      remember_token: string | null;
      client: unknown | null;
      vendor: unknown | null;
      last_login: string;
      is_admin: boolean;
      is_staff: boolean;
      is_active: boolean;
      is_superuser: boolean;
      notify_hash: string | null;
      is_beta: boolean;
      last_interest_sent_at: string | null;
      last_visit_at: string | null;
      created_by: number;
      updated_by: number | null;
      deleted_by: number | null;
      role: UserRole;
    };
  };
  items: QualityCheckItem[];
  created_at: string;
  warehouse_qc: boolean;
}

export type QualityChecksResponse = QualityCheck[];

export interface QualityChecksParams {
  userId: number;
  status?: string;
}

// Create the quality checks API slice
export const qualityChecksApi = createApi({
  reducerPath: "qualityChecksApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["QualityChecks"],
  endpoints: (builder) => ({
    getQualityChecks: builder.query<QualityChecksResponse, QualityChecksParams>(
      {
        query: ({ userId, status = "pending,in_progress" }) => ({
          url: `/quality-checks/?user=${userId}&status=${status}`,
          method: "GET",
        }),
        providesTags: ["QualityChecks"],
      }
    ),
  }),
});

// Export hooks for usage in functional components
export const { useGetQualityChecksQuery } = qualityChecksApi;

// Export the reducer
export default qualityChecksApi.reducer;
