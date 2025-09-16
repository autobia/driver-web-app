import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { jwtDecode } from "jwt-decode";

// Define the login request and response types
export interface LoginRequest {
  phone: string;
  password: string;
  grant_type: string;
  is_staff: boolean;
  lang: string;
}

export interface LoginResponse {
  tokens: {
    refresh: string;
    access: string;
  };
  is_staff: boolean;
}

export interface DecodedUser {
  user_id: number;
  user: {
    id: number;
    username: string;
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    status: string;
    is_admin: boolean;
    is_staff: boolean;
    is_active: boolean;
    is_superuser: boolean;
    role: {
      id: number;
      name_en: string;
      name_ar: string;
      is_staff: boolean;
    };
    language: {
      id: number;
      name_en: string;
      name_ar: string;
    };
  };
  group: string[];
}

// Create the auth API slice
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/users/login/",
        method: "POST",
        data: credentials,
      }),
      // Transform the response to handle the data properly
      transformResponse: (response: LoginResponse) => {
        // Store the tokens in localStorage
        if (response.tokens?.access) {
          localStorage.setItem("authToken", response.tokens.access);
          localStorage.setItem("refreshToken", response.tokens.refresh);

          // Decode the access token to get user information
          try {
            const decodedToken = jwtDecode<DecodedUser>(response.tokens.access);
            localStorage.setItem("user", JSON.stringify(decodedToken.user));
          } catch (error) {
            console.error("Error decoding JWT token:", error);
          }
        }
        return response;
      },
      invalidatesTags: ["Auth"],
    }),
  }),
});

// Export hooks for usage in functional components
export const { useLoginMutation } = authApi;

// Export the reducer
export default authApi.reducer;
