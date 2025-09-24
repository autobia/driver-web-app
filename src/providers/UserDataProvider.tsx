"use client";

import { ReactNode, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  useFetchUsersQuery,
  useFetchContentTypesQuery,
} from "@/store/api/coreApi";

interface UserDataProviderProps {
  children: ReactNode;
}

export default function UserDataProvider({ children }: UserDataProviderProps) {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  // Fetch drivers when authenticated (role_id = 4)
  const { data: driversData, error: driversError } = useFetchUsersQuery(
    { role_id: 4 },
    {
      skip: !isAuthenticated, // Skip the query if not authenticated
    }
  );

  // Fetch preparers when authenticated (role_id = 11)
  const { data: preparersData, error: preparersError } = useFetchUsersQuery(
    { role_id: 11 },
    {
      skip: !isAuthenticated, // Skip the query if not authenticated
    }
  );

  // Fetch all content types when authenticated
  const { data: contentTypesData, error: contentTypesError } =
    useFetchContentTypesQuery(undefined, {
      skip: !isAuthenticated, // Skip the query if not authenticated
    });

  useEffect(() => {
    if (isAuthenticated) {
      console.log(
        "User data fetching initialized for authenticated user:",
        user?.username
      );

      // Log successful data fetches
      if (driversData) {
        console.log("Drivers loaded:", driversData.length, "users");
      }
      if (preparersData) {
        console.log("Preparers loaded:", preparersData.length, "users");
      }
      if (contentTypesData) {
        console.log(
          "Content types loaded:",
          contentTypesData.content_types?.length || 0,
          "types"
        );
      }
    }
  }, [isAuthenticated, user, driversData, preparersData, contentTypesData]);

  // Log any errors
  useEffect(() => {
    if (driversError) console.error("Error fetching drivers:", driversError);
    if (preparersError)
      console.error("Error fetching preparers:", preparersError);
    if (contentTypesError)
      console.error("Error fetching content types:", contentTypesError);
  }, [driversError, preparersError, contentTypesError]);

  // Make user data available via global state or context
  // For now, we're just fetching and caching in RTK Query cache
  // The data will be available to any component that uses the same hooks

  return <>{children}</>;
}
