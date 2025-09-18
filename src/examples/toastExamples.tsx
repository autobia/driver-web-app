/**
 * Toast Usage Examples
 *
 * This file demonstrates how to use the toast system throughout the application.
 * Import and use these patterns in your components as needed.
 */

import { useToast } from "../hooks/useToast";
import { showToast } from "../lib/toast";

// Example 1: Using the hook in a component
export const ExampleComponent = () => {
  const toast = useToast();

  const handleSave = async () => {
    try {
      // Show loading toast
      const loadingToast = toast.loading("Saving...");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Dismiss loading and show success
      toast.dismissById(loadingToast);
      toast.savingSuccess();
    } catch (error) {
      toast.savingError(error);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch("/api/delete");
      toast.deletingSuccess();
    } catch (error) {
      toast.deletingError(error);
    }
  };

  const handleApiError = () => {
    // Example API error format from your app
    const apiError = {
      status: false,
      scope: "purchase order",
      context: "PURCHASE ORDER_NOT_FOUND",
      timestamp: null,
      error: {
        message: "purchase order model object not found => 35299 received",
      },
    };

    toast.apiError(apiError);
  };

  const handlePromiseToast = async () => {
    const promise = fetch("/api/data").then((res) => res.json());

    toast.promise(promise, {
      loading: "Loading data...",
      success: (data) => `Loaded ${data.length} items successfully`,
      error: (error) =>
        `Failed to load data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
    });
  };

  return (
    <div className="space-y-4">
      <button onClick={handleSave}>Save Data</button>
      <button onClick={handleDelete}>Delete Item</button>
      <button onClick={handleApiError}>Trigger API Error</button>
      <button onClick={handlePromiseToast}>Promise Toast</button>

      {/* Basic toasts */}
      <button onClick={() => toast.success("Success!", "Operation completed")}>
        Success Toast
      </button>

      <button onClick={() => toast.error("Error!", "Something went wrong")}>
        Error Toast
      </button>

      <button onClick={() => toast.warning("Warning!", "Please be careful")}>
        Warning Toast
      </button>

      <button onClick={() => toast.info("Info", "Just so you know")}>
        Info Toast
      </button>

      {/* Localized toasts */}
      <button onClick={() => toast.successLocalized("saved")}>
        Localized Success
      </button>

      <button onClick={() => toast.errorLocalized("savingFailed")}>
        Localized Error
      </button>
    </div>
  );
};

// Example 2: Using toast directly without hook (for utility functions)
export const utilityFunction = () => {
  try {
    // Some operation
    showToast.success("Operation completed");
  } catch (error) {
    showToast.apiError(error, "Operation failed");
  }
};

// Example 3: RTK Query integration
export const useExampleMutation = () => {
  const toast = useToast();

  return {
    mutateWithToast: async (data: unknown) => {
      try {
        const result = await fetch("/api/mutate", {
          method: "POST",
          body: JSON.stringify(data),
        });

        if (!result.ok) {
          throw new Error("Request failed");
        }

        toast.operationSuccess("Data updated");
        return result.json();
      } catch (error) {
        toast.operationError("Data update", error);
        throw error;
      }
    },
  };
};

// Example 4: Common error patterns - Custom hook for error handling
export const useErrorHandler = () => {
  const toast = useToast();

  const handleCommonErrors = (error: unknown) => {
    // Handle different error types
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response: { status: number } };
      if (axiosError.response?.status === 401) {
        toast.error("Authentication required", "Please login again");
      } else if (axiosError.response?.status === 403) {
        toast.error(
          "Access denied",
          "You don't have permission for this action"
        );
      } else if (axiosError.response?.status === 404) {
        toast.error("Not found", "The requested resource was not found");
      } else if (axiosError.response?.status >= 500) {
        toast.error("Server error", "Something went wrong on our end");
      } else {
        // Let the API error handler deal with it
        toast.apiError(error);
      }
    } else {
      // Let the API error handler deal with it
      toast.apiError(error);
    }
  };

  return { handleCommonErrors };
};

/**
 * INTEGRATION NOTES:
 *
 * 1. The toast system is automatically integrated with axios interceptors,
 *    so API errors will show toasts automatically unless it's an auth route.
 *
 * 2. Use the useToast hook in React components for easy access to toast methods.
 *
 * 3. Use showToast directly in utility functions or outside React components.
 *
 * 4. The system supports both English and Arabic translations.
 *
 * 5. Toast positions and styling are handled automatically by the Sonner component.
 *
 * 6. All toasts are dismissible and have appropriate durations.
 */
