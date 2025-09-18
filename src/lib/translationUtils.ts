// Translation function type
export type TranslationFunction = (
  key: string,
  values?: Record<string, string | number>
) => string;

// Store the translation function globally
let globalT: TranslationFunction | null = null;

// Set translation function for utilities
export const setGlobalTranslations = (translationFn: TranslationFunction) => {
  globalT = translationFn;
};

// Get translation function
export const getGlobalTranslations = (): TranslationFunction | null => {
  return globalT;
};

// Fallback translations for when globalT is not available
const fallbackTranslations: Record<string, string> = {
  anErrorOccurred: "An error occurred",
  error: "Error",
  sessionExpired: "Session expired",
  pleaseLoginAgain: "Please login again",
  notFound: "Not found",
  requestedResourceNotFound: "The requested resource was not found",
  serverError: "Server error",
  networkError: "Network error",
  checkInternetConnection: "Please check your internet connection",
  somethingWentWrong: "Something went wrong",
  requestFailed: "Request failed",
  accessForbidden: "Access forbidden",
  resourceNotFound: "Resource not found",
};

// Utility function that works with or without React context
export const translateUtil = (
  key: string,
  values?: Record<string, string | number>
): string => {
  if (globalT) {
    return globalT(key, values);
  }

  // Fallback to hardcoded English if no translation function is available
  return fallbackTranslations[key] || key;
};
