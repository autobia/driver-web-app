import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { QualityCheck } from "../api/qualityChecksApi";

// Define the counter state for each item
export interface QCItemCounter {
  itemId: number;
  regularQuantity: number; // Manual count of regular items
  originalQuantity: number; // The target quantity from QC
  status: "not-started" | "in-progress" | "completed";
  replacementItems: ReplacementItem[];
  delayedItems: DelayedItem[];
  // Computed fields (calculated by selectors)
  totalReplacementQuantity: number;
  totalDelayedQuantity: number;
  totalRequestedQuantity: number; // regularQuantity + totalReplacementQuantity + totalDelayedQuantity
}

// Define replacement item structure
export interface ReplacementItem {
  id: string; // temporary ID for frontend
  sku: string;
  quantity: number;
  manufacturer: {
    id: number;
    name: string;
  };
  brand: {
    id: number;
    name: string;
  };
  originalItemId: number; // ID of the item being replaced
}

// Define delayed item structure
export interface DelayedItem {
  id: string; // temporary ID for frontend
  quantity: number;
  originalItemId: number; // ID of the item being delayed
}

// Define the main QC state
export interface QCState {
  currentQC: QualityCheck | null;
  itemCounters: Record<number, QCItemCounter>; // itemId -> counter
  totalItems: number;
  countedItems: number;
  completedItems: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: QCState = {
  currentQC: null,
  itemCounters: {},
  totalItems: 0,
  countedItems: 0,
  completedItems: 0,
  isLoading: false,
  error: null,
};

// Helper function to recalculate computed values for a counter
const updateCounterCalculations = (counter: QCItemCounter) => {
  // Calculate total replacement quantity
  counter.totalReplacementQuantity = counter.replacementItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Calculate total delayed quantity
  counter.totalDelayedQuantity = counter.delayedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Calculate total requested quantity
  counter.totalRequestedQuantity =
    counter.regularQuantity +
    counter.totalReplacementQuantity +
    counter.totalDelayedQuantity;

  // Update status based on total requested quantity
  if (counter.totalRequestedQuantity === 0) {
    counter.status = "not-started";
  } else if (counter.totalRequestedQuantity >= counter.originalQuantity) {
    counter.status = "completed";
  } else {
    counter.status = "in-progress";
  }
};

const qcSlice = createSlice({
  name: "qc",
  initialState,
  reducers: {
    // Set the current QC and initialize counters
    setCurrentQC: (state, action: PayloadAction<QualityCheck>) => {
      state.currentQC = action.payload;
      state.totalItems = action.payload.items.length;

      // Initialize counters for all items
      state.itemCounters = {};
      action.payload.items.forEach((item) => {
        state.itemCounters[item.id] = {
          itemId: item.id,
          regularQuantity: 0,
          originalQuantity: item.quantity,
          status: "not-started",
          replacementItems: [],
          delayedItems: [],
          totalReplacementQuantity: 0,
          totalDelayedQuantity: 0,
          totalRequestedQuantity: 0,
        };
      });

      state.countedItems = 0;
      state.completedItems = 0;
    },

    // Reset current QC
    resetCurrentQC: (state) => {
      state.currentQC = null;
      state.itemCounters = {};
      state.totalItems = 0;
      state.countedItems = 0;
      state.completedItems = 0;
      state.error = null;
    },

    // Increment item counter
    incrementItemCounter: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      const counter = state.itemCounters[itemId];

      if (counter) {
        // Calculate what the total would be if we increment regular quantity
        const potentialTotal =
          counter.regularQuantity +
          1 +
          counter.totalReplacementQuantity +
          counter.totalDelayedQuantity;

        // Only allow increment if total requested quantity won't exceed original quantity
        if (potentialTotal <= counter.originalQuantity) {
          counter.regularQuantity += 1;
          updateCounterCalculations(counter);

          // Recalculate totals
          qcSlice.caseReducers.recalculateTotals(state);
        }
      }
    },

    // Decrement item counter
    decrementItemCounter: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      const counter = state.itemCounters[itemId];

      if (counter && counter.regularQuantity > 0) {
        counter.regularQuantity -= 1;
        updateCounterCalculations(counter);

        // Recalculate totals
        qcSlice.caseReducers.recalculateTotals(state);
      }
    },

    // Bulk scan - set item counter to full quantity
    bulkScanItem: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      const counter = state.itemCounters[itemId];

      if (counter) {
        // Set regular quantity to the remaining amount needed to reach original quantity
        const remainingQuantity =
          counter.originalQuantity -
          counter.totalReplacementQuantity -
          counter.totalDelayedQuantity;

        if (remainingQuantity > 0) {
          counter.regularQuantity = remainingQuantity;
          updateCounterCalculations(counter);

          // Recalculate totals
          qcSlice.caseReducers.recalculateTotals(state);
        }
      }
    },

    // Reset all counters
    resetAllCounters: (state) => {
      Object.values(state.itemCounters).forEach((counter) => {
        counter.regularQuantity = 0;
        counter.replacementItems = [];
        counter.delayedItems = [];
        updateCounterCalculations(counter);
      });

      state.countedItems = 0;
      state.completedItems = 0;
    },

    // Reset specific item counter
    resetItemCounter: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      const counter = state.itemCounters[itemId];

      if (counter) {
        counter.regularQuantity = 0;
        counter.replacementItems = [];
        counter.delayedItems = [];
        updateCounterCalculations(counter);

        // Recalculate totals
        qcSlice.caseReducers.recalculateTotals(state);
      }
    },

    // Add replacement item
    addReplacementItem: (state, action: PayloadAction<ReplacementItem>) => {
      const replacementItem = action.payload;
      const counter = state.itemCounters[replacementItem.originalItemId];

      if (counter) {
        // Calculate what the total would be if we add this replacement
        const potentialTotal =
          counter.regularQuantity +
          counter.totalReplacementQuantity +
          replacementItem.quantity +
          counter.totalDelayedQuantity;

        // Only allow adding replacement if total requested quantity won't exceed original quantity
        if (potentialTotal <= counter.originalQuantity) {
          counter.replacementItems.push(replacementItem);
          updateCounterCalculations(counter);

          // Recalculate totals
          qcSlice.caseReducers.recalculateTotals(state);
        }
      }
    },

    // Remove replacement item
    removeReplacementItem: (
      state,
      action: PayloadAction<{ itemId: number; replacementId: string }>
    ) => {
      const { itemId, replacementId } = action.payload;
      const counter = state.itemCounters[itemId];

      if (counter) {
        // Remove the replacement item
        counter.replacementItems = counter.replacementItems.filter(
          (item) => item.id !== replacementId
        );

        updateCounterCalculations(counter);

        // Recalculate totals
        qcSlice.caseReducers.recalculateTotals(state);
      }
    },

    // Add delayed item
    addDelayedItem: (state, action: PayloadAction<DelayedItem>) => {
      const delayedItem = action.payload;
      const counter = state.itemCounters[delayedItem.originalItemId];

      if (counter) {
        // Calculate what the total would be if we add this delayed item
        const potentialTotal =
          counter.regularQuantity +
          counter.totalReplacementQuantity +
          counter.totalDelayedQuantity +
          delayedItem.quantity;

        // Only allow adding delayed item if total requested quantity won't exceed original quantity
        if (potentialTotal <= counter.originalQuantity) {
          counter.delayedItems.push(delayedItem);
          updateCounterCalculations(counter);

          // Recalculate totals
          qcSlice.caseReducers.recalculateTotals(state);
        }
      }
    },

    // Remove delayed item
    removeDelayedItem: (
      state,
      action: PayloadAction<{ itemId: number; delayedId: string }>
    ) => {
      const { itemId, delayedId } = action.payload;
      const counter = state.itemCounters[itemId];

      if (counter) {
        // Remove the delayed item
        counter.delayedItems = counter.delayedItems.filter(
          (item) => item.id !== delayedId
        );

        updateCounterCalculations(counter);

        // Recalculate totals
        qcSlice.caseReducers.recalculateTotals(state);
      }
    },

    // Recalculate totals (helper function)
    recalculateTotals: (state) => {
      const counters = Object.values(state.itemCounters);

      state.countedItems = counters.filter(
        (counter) => counter.totalRequestedQuantity > 0
      ).length;
      state.completedItems = counters.filter(
        (counter) => counter.status === "completed"
      ).length;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCurrentQC,
  resetCurrentQC,
  incrementItemCounter,
  decrementItemCounter,
  bulkScanItem,
  resetAllCounters,
  resetItemCounter,
  addReplacementItem,
  removeReplacementItem,
  addDelayedItem,
  removeDelayedItem,
  recalculateTotals,
  setLoading,
  setError,
} = qcSlice.actions;

export default qcSlice.reducer;

// Helper functions
export const calculateCounterTotals = (counter: QCItemCounter) => {
  const totalReplacementQuantity = counter.replacementItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalDelayedQuantity = counter.delayedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalRequestedQuantity =
    counter.regularQuantity + totalReplacementQuantity + totalDelayedQuantity;

  let status: "not-started" | "in-progress" | "completed";
  if (totalRequestedQuantity === 0) {
    status = "not-started";
  } else if (totalRequestedQuantity >= counter.originalQuantity) {
    status = "completed";
  } else {
    status = "in-progress";
  }

  return {
    totalReplacementQuantity,
    totalDelayedQuantity,
    totalRequestedQuantity,
    status,
  };
};

// Selectors
export const selectItemCounter = (
  state: { qc: QCState },
  itemId: number
): QCItemCounter | null => {
  const counter = state.qc.itemCounters[itemId];
  if (!counter) return null;

  const calculations = calculateCounterTotals(counter);

  return {
    ...counter,
    ...calculations,
  };
};
