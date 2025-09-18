"use client";

import { useFetchContentTypesQuery } from "@/store/api/coreApi";

// Custom hooks to access cached content types data
export const useDriverAppContentTypes = () => {
  return useFetchContentTypesQuery({ type_name: "driver_app" });
};

export const useAllContentTypes = () => {
  return useFetchContentTypesQuery();
};

// Generic hook to fetch content types by type_name
export const useContentTypesByType = (type_name: string) => {
  return useFetchContentTypesQuery({ type_name });
};

// Helper hook to validate if a content type ID is allowed for driver app
export const useValidateContentType = (contentTypeId: number) => {
  const {
    data: driverAppContentTypes,
    isLoading,
    isError,
  } = useDriverAppContentTypes();

  const isValid =
    driverAppContentTypes?.content_types?.some(
      (ct) => ct.content_type_id === contentTypeId
    ) ?? false;

  return {
    isValid,
    isLoading,
    isError,
    allowedContentTypes: driverAppContentTypes,
  };
};

// Helper hook to get content type by ID
export const useContentTypeById = (contentTypeId: number) => {
  const { data: allContentTypes, isLoading, isError } = useAllContentTypes();

  const contentType = allContentTypes?.content_types?.find(
    (ct) => ct.content_type_id === contentTypeId
  );

  return {
    contentType,
    isLoading,
    isError,
    found: !!contentType,
  };
};

// Helper hook to check loading states for all content type queries
export const useContentTypesLoadingState = () => {
  const driverApp = useDriverAppContentTypes();
  const all = useAllContentTypes();

  return {
    isLoading: driverApp.isLoading || all.isLoading,
    isError: driverApp.isError || all.isError,
    errors: {
      driverApp: driverApp.error,
      all: all.error,
    },
  };
};
