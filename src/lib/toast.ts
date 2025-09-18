import { toast } from "sonner";

interface ApiError {
  status: boolean;
  scope?: string;
  context?: string;
  timestamp?: string | null;
  error?: {
    message: string;
  };
}

interface AxiosError {
  response?: {
    data?: ApiError | { message?: string };
  };
  message?: string;
}

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 3000,
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  // Specific handler for API errors
  apiError: (
    error: ApiError | AxiosError | string | unknown,
    fallbackMessage = "An error occurred"
  ) => {
    let message = fallbackMessage;
    let description = "";

    // Handle the specific API error format you provided
    if (
      error &&
      typeof error === "object" &&
      "error" in error &&
      error.error &&
      typeof error.error === "object" &&
      "message" in error.error
    ) {
      const apiError = error as ApiError;
      message = apiError.error!.message;
      if (apiError.scope) {
        description = `Scope: ${apiError.scope}`;
      }
      if (apiError.context) {
        description += description
          ? ` | Context: ${apiError.context}`
          : `Context: ${apiError.context}`;
      }
    }
    // Handle other error formats
    else if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
    ) {
      message = (error as { message: string }).message;
    }
    // Handle string errors
    else if (typeof error === "string") {
      message = error;
    }
    // Handle axios errors
    else if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as AxiosError;
      if (
        axiosError.response?.data &&
        typeof axiosError.response.data === "object" &&
        "error" in axiosError.response.data
      ) {
        const responseData = axiosError.response.data as ApiError;
        if (responseData.error?.message) {
          message = responseData.error.message;
          if (responseData.scope) {
            description = `Scope: ${responseData.scope}`;
          }
        }
      }
      // Handle axios errors with different structure
      else if (
        axiosError.response?.data &&
        typeof axiosError.response.data === "object" &&
        "message" in axiosError.response.data
      ) {
        const responseData = axiosError.response.data as { message?: string };
        if (responseData.message) {
          message = responseData.message;
        }
      }
    }

    toast.error(message, {
      description: description || undefined,
      duration: 5000,
    });
  },

  // Promise-based toast for async operations
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },

  // Dismiss all toasts
  dismiss: () => {
    toast.dismiss();
  },

  // Dismiss specific toast
  dismissById: (id: string | number) => {
    toast.dismiss(id);
  },
};

export default showToast;
