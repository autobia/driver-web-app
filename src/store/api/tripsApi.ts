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
  }),
});

// Export hooks for usage in functional components
export const { useGetDriverTripsQuery } = tripsApi;

// Export the reducer
export default tripsApi.reducer;
