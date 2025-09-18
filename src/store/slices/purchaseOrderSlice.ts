import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PurchaseOrderResponse } from "../api/purchaseOrderApi";

// Define the state interface
interface PurchaseOrderState {
  searchResults: PurchaseOrderResponse[];
  searchQuery: string;
  isSearching: boolean;
  lastSearchedId: number | null;
  error: string | null;
}

// Define the initial state
const initialState: PurchaseOrderState = {
  searchResults: [],
  searchQuery: "",
  isSearching: false,
  lastSearchedId: null,
  error: null,
};

// Create the purchase order slice
const purchaseOrderSlice = createSlice({
  name: "purchaseOrder",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.error = null;
    },
    setSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setSearchResults: (state, action: PayloadAction<PurchaseOrderResponse>) => {
      // Add to search results if not already present
      const existingIndex = state.searchResults.findIndex(
        (result) => result.id === action.payload.id
      );

      if (existingIndex === -1) {
        state.searchResults.push(action.payload);
      } else {
        // Update existing result
        state.searchResults[existingIndex] = action.payload;
      }

      state.lastSearchedId = action.payload.id;
      state.isSearching = false;
      state.error = null;
    },
    setSearchError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isSearching = false;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.lastSearchedId = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Export actions
export const {
  setSearchQuery,
  setSearching,
  setSearchResults,
  setSearchError,
  clearSearchResults,
  clearError,
} = purchaseOrderSlice.actions;

// Export reducer
export default purchaseOrderSlice.reducer;
