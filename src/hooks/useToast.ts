"use client";

import { useTranslations } from "next-intl";
import { showToast } from "../lib/toast";

export const useToast = () => {
  const t = useTranslations();

  return {
    // Basic toast methods
    success: showToast.success,
    error: showToast.error,
    warning: showToast.warning,
    info: showToast.info,
    loading: showToast.loading,
    apiError: showToast.apiError,
    promise: showToast.promise,
    dismiss: showToast.dismiss,
    dismissById: showToast.dismissById,

    // Localized convenience methods
    successLocalized: (key: string, description?: string) => {
      showToast.success(t(key), description);
    },

    errorLocalized: (key: string, description?: string) => {
      showToast.error(t(key), description);
    },

    warningLocalized: (key: string, description?: string) => {
      showToast.warning(t(key), description);
    },

    infoLocalized: (key: string, description?: string) => {
      showToast.info(t(key), description);
    },

    // Common app-specific toasts
    operationSuccess: (operation = "Operation") => {
      showToast.success(`${operation} completed successfully`);
    },

    operationError: (operation = "Operation", error?: unknown) => {
      if (error) {
        showToast.apiError(error, `${operation} failed`);
      } else {
        showToast.error(`${operation} failed`);
      }
    },

    savingSuccess: () => {
      showToast.success(t("saved") || "Saved successfully");
    },

    savingError: (error?: unknown) => {
      if (error) {
        showToast.apiError(error, t("savingFailed") || "Failed to save");
      } else {
        showToast.error(t("savingFailed") || "Failed to save");
      }
    },

    loadingError: (resource = "data", error?: unknown) => {
      if (error) {
        showToast.apiError(error, `Failed to load ${resource}`);
      } else {
        showToast.error(`Failed to load ${resource}`);
      }
    },

    deletingSuccess: () => {
      showToast.success(t("deleted") || "Deleted successfully");
    },

    deletingError: (error?: unknown) => {
      if (error) {
        showToast.apiError(error, t("deletingFailed") || "Failed to delete");
      } else {
        showToast.error(t("deletingFailed") || "Failed to delete");
      }
    },

    updatingSuccess: () => {
      showToast.success(t("updated") || "Updated successfully");
    },

    updatingError: (error?: unknown) => {
      if (error) {
        showToast.apiError(error, t("updatingFailed") || "Failed to update");
      } else {
        showToast.error(t("updatingFailed") || "Failed to update");
      }
    },
  };
};
