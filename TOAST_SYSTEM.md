# Toast Notification System

This application uses **Sonner** (via shadcn/ui) for toast notifications. The system is globally integrated and provides consistent error handling and user feedback.

## Setup

The toast system is already set up with:

- ✅ Sonner component installed via `npx shadcn@latest add sonner`
- ✅ Global Toaster component added to `layout.tsx`
- ✅ Custom toast utility functions in `src/lib/toast.ts`
- ✅ React hook for easy component usage in `src/hooks/useToast.ts`
- ✅ Automatic API error integration in `src/lib/apiClient.ts`

## Usage

### 1. In React Components (Recommended)

```tsx
import { useToast } from "../hooks/useToast";

export const MyComponent = () => {
  const toast = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      toast.savingSuccess();
    } catch (error) {
      toast.savingError(error);
    }
  };

  return <button onClick={handleSave}>Save</button>;
};
```

### 2. Basic Toast Types

```tsx
const toast = useToast();

// Success notification
toast.success("Operation completed", "Description here");

// Error notification
toast.error("Something went wrong", "Error details");

// Warning notification
toast.warning("Please be careful", "Warning details");

// Info notification
toast.info("Just so you know", "Information here");

// Loading notification (returns ID for dismissal)
const loadingId = toast.loading("Processing...");
toast.dismissById(loadingId);
```

### 3. API Error Handling

The system automatically handles API errors, but you can also manually trigger:

```tsx
// For API errors with the format:
// {
//   "status": false,
//   "scope": "purchase order",
//   "context": "PURCHASE ORDER_NOT_FOUND",
//   "error": { "message": "purchase order model object not found" }
// }
toast.apiError(error, "Fallback message");
```

### 4. Promise-based Toasts

```tsx
const promise = fetch("/api/data");

toast.promise(promise, {
  loading: "Loading data...",
  success: "Data loaded successfully",
  error: "Failed to load data",
});
```

### 5. Convenient Methods

```tsx
// Common operations
toast.operationSuccess("Data updated");
toast.operationError("Data update", error);

// CRUD operations
toast.savingSuccess();
toast.savingError(error);
toast.deletingSuccess();
toast.deletingError(error);
toast.updatingSuccess();
toast.updatingError(error);

// Resource loading
toast.loadingError("user data", error);
```

### 6. Localized Messages

```tsx
// Uses translation keys from messages/en.json and messages/ar.json
toast.successLocalized("saved"); // Shows translated "Saved successfully"
toast.errorLocalized("savingFailed"); // Shows translated "Failed to save"
```

### 7. Outside React Components

```tsx
import { showToast } from "../lib/toast";

// In utility functions or non-React code
export const utilityFunction = () => {
  try {
    // Some operation
    showToast.success("Success!");
  } catch (error) {
    showToast.apiError(error);
  }
};
```

## Automatic API Integration

The system automatically shows toast notifications for:

- ❌ **Network errors** - "Please check your internet connection"
- ❌ **401 Unauthorized** - "Session expired, please login again"
- ❌ **403 Forbidden** - "You don't have permission"
- ❌ **500 Server errors** - "Something went wrong on our end"
- ❌ **API errors** - Shows the actual error message from your API

> **Note**: Auth routes (`/login`, `/register`) are excluded from automatic error toasts.

## Translation Keys

Add these keys to your `messages/en.json` and `messages/ar.json`:

```json
{
  "saved": "Saved successfully",
  "savingFailed": "Failed to save",
  "deleted": "Deleted successfully",
  "deletingFailed": "Failed to delete",
  "updated": "Updated successfully",
  "updatingFailed": "Failed to update"
}
```

## Customization

### Toast Positioning & Styling

The Toaster component in `layout.tsx` uses theme-aware styling. Modify `src/components/ui/sonner.tsx` for custom styling.

### Duration & Behavior

Default durations:

- Success: 4 seconds
- Error: 5 seconds
- Warning: 4 seconds
- Info: 3 seconds
- Loading: Until dismissed

### Custom Error Handling

Override the automatic API error handling by adding conditions in `src/lib/apiClient.ts`.

## Examples in the Codebase

- `TripsComponent.tsx` - Shows success toasts for trip operations
- `QualityCheckTicketsComponent.tsx` - Shows info toast when starting preparation
- API Client - Automatic error handling for all API calls

## Best Practices

1. ✅ **Use the hook in components**: `const toast = useToast()`
2. ✅ **Let API errors auto-handle**: The interceptor will show appropriate toasts
3. ✅ **Use specific methods**: `toast.savingSuccess()` vs generic `toast.success()`
4. ✅ **Provide descriptions**: Second parameter adds helpful context
5. ✅ **Use localized keys**: Better for multi-language support
6. ❌ **Don't over-toast**: Avoid showing toasts for every minor action
7. ❌ **Don't duplicate errors**: API interceptor already handles most errors
