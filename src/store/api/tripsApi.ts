import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

// Define the trip types
export interface Trip {
  id: number;
  trip_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  status: string;
  distance: number;
  fare: number;
  created_at: string;
  updated_at: string;
}

export interface TripsResponse {
  trips: Trip[];
}

// Trip creation request interface
export interface CreateTripRequest {
  content_type: 14; // Always QC content type ID
  object_id: string;
  destination_point: string;
  destination_point_type: 32; // Always company branch content type ID
  trip_direction: "bring";
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
  }),
});

// Export hooks for usage in functional components
export const { useGetDriverTripsQuery, useCreateTripMutation } = tripsApi;

// Export the reducer
export default tripsApi.reducer;
