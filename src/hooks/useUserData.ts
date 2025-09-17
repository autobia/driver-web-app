"use client";

import { useFetchUsersQuery } from "@/store/api/coreApi";

// Custom hooks to access cached user data
export const useDrivers = () => {
  return useFetchUsersQuery({ role_id: 4 });
};

export const usePreparers = () => {
  return useFetchUsersQuery({ role_id: 11 });
};

// Generic hook to fetch users by role_id
export const useUsersByRole = (role_id: number) => {
  return useFetchUsersQuery({ role_id });
};

// Helper hook to check if all user data is loaded
export const useAllUsersLoadingState = () => {
  const drivers = useDrivers();
  const preparers = usePreparers();

  return {
    isLoading: drivers.isLoading || preparers.isLoading,
    isError: drivers.isError || preparers.isError,
    errors: {
      drivers: drivers.error,
      preparers: preparers.error,
    },
  };
};
