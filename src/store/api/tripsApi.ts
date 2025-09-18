import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

// Define language interface
interface Language {
  id: number;
  name_en: string;
  name_ar: string;
}

// Define user role interface
interface UserRole {
  id: number;
  name_en: string;
  name_ar: string;
  is_staff: boolean;
  permissions: string[];
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

// Define assignment interface
interface Assignment {
  id: number;
  assigned_type: string;
  assigned_to: User;
}

// Define the trip types (new structure with assignments)
// Warehouse destination interface
export interface WarehouseDestination {
  id: number;
  name_ar: string;
  name_en: string;
  telephone?: string;
  city_name?: string;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
  warehouse_id?: {
    id: number;
    name_en: string;
    name_ar: string;
    is_active: boolean;
    latitude?: number;
    longitude?: number;
  };
}

// Company Branch destination interface
export interface CompanyBranchDestination {
  id: number;
  name_ar: string;
  name_en: string;
  company_id: {
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
    phone?: string;
    email?: string;
    is_active: boolean;
  };
  type: string;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
}

export interface Trip {
  id: number;
  content_type: number;
  object_id: number;
  status: string;
  assignment: Assignment;
  trip_direction?: "bring" | "deliver";
  has_delayed_item?: boolean;
  destination_point_type?: "warehouse" | "companybranch";
  destination_point?: WarehouseDestination | CompanyBranchDestination;
  main_source_id?: number;
  main_source?: {
    warehouse?: {
      id: number;
    };
  };
}

export interface TripsResponse {
  trips: Trip[];
}

// Trip creation request interface
export interface CreateTripRequest {
  confirm_destination_point_lat: number;
  confirm_destination_point_long: number;
}

// Advanced trip creation request interface (based on Flutter code)
export interface CreateAdvancedTripRequest {
  content_type: number;
  object_id: number;
  destination_point: string;
  destination_point_type: number;
  trip_direction: "bring" | "deliver";
  assign_to: string;
  user_type: "user";
}

// Trip creation response interface
export interface CreateTripResponse {
  id: number;
  trip_number: string;
  status: string;
  created_at: string;
}

// Trip update location request interface
export interface UpdateTripLocationRequest {
  confirm_start_point_lat?: number;
  confirm_start_point_long?: number;
  confirm_destination_point_lat?: number;
  confirm_destination_point_long?: number;
  create_delayed_qc?: boolean;
}

// Trip update location response interface
export interface UpdateTripLocationResponse {
  id: number;
  status: string;
  confirm_start_point_lat: number;
  confirm_start_point_long: number;
  updated_at: string;
}

// Create the trips API slice
export const tripsApi = createApi({
  reducerPath: "tripsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Trips"],
  endpoints: (builder) => ({
    getDriverTrips: builder.query<TripsResponse, void>({
      query: () => ({
        url: "/driver-trips/",
        method: "GET",
      }),
      providesTags: ["Trips"],
    }),

    createTrip: builder.mutation<CreateTripResponse, CreateTripRequest>({
      query: (data) => ({
        url: "/trips/",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Trips"],
    }),

    createAdvancedTrip: builder.mutation<
      CreateTripResponse,
      CreateAdvancedTripRequest
    >({
      query: (data) => ({
        url: "/trips/",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Trips"],
    }),

    updateTripLocation: builder.mutation<
      UpdateTripLocationResponse,
      { tripId: number; data: UpdateTripLocationRequest }
    >({
      query: ({ tripId, data }) => ({
        url: `/trips/${tripId}/`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Trips"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetDriverTripsQuery,
  useCreateTripMutation,
  useCreateAdvancedTripMutation,
  useUpdateTripLocationMutation,
} = tripsApi;

// Export the reducer
export default tripsApi.reducer;
