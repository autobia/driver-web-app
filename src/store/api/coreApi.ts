import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

// Define the user types
export interface CoreUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  role: {
    id: number;
    name_en: string;
    name_ar: string;
    is_staff: boolean;
    permissions: string[];
  };
  language: {
    id: number;
    name_en: string;
    name_ar: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type UsersResponse = CoreUser[];

export interface FetchUsersParams {
  role_id?: number;
}

// Define content type interfaces
export interface ContentType {
  content_type_id: number;
  app_label: string;
  model: string;
}

export interface ContentTypesApiResponse {
  content_types: ContentType[];
}

export type ContentTypesResponse = ContentTypesApiResponse;

export interface FetchContentTypesParams {
  type_name?: string;
}

// Create the core API slice
// Current role mappings: driver = 4, preparer = 11
export const coreApi = createApi({
  reducerPath: "coreApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Users", "ContentTypes"],
  endpoints: (builder) => ({
    fetchUsers: builder.query<UsersResponse, FetchUsersParams | void>({
      query: (params) => {
        let url = "/users/";

        // Add role_id as query parameter if provided
        if (params && params.role_id) {
          url += `?role_id=${params.role_id}`;
        }

        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["Users"],
    }),

    fetchContentTypes: builder.query<
      ContentTypesResponse,
      FetchContentTypesParams | void
    >({
      query: (params) => {
        let url = "/content-types/";

        // Add type_name as query parameter if provided
        if (params && params.type_name) {
          url += `?type_name=${params.type_name}`;
        }

        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["ContentTypes"],
    }),
  }),
});

// Export hooks for usage in functional components
export const { useFetchUsersQuery, useFetchContentTypesQuery } = coreApi;

// Export the reducer
export default coreApi.reducer;
