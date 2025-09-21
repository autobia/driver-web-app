import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import qcReducer from "./slices/qcSlice";
import purchaseOrderReducer from "./slices/purchaseOrderSlice";
import { middlewares } from "./middleware";
import { authApi } from "./api/authApi";
import { tripsApi } from "./api/tripsApi";
import { qualityChecksApi } from "./api/qualityChecksApi";
import { inventoryApi } from "./api/inventoryApi";
import { coreApi } from "./api/coreApi";
import { purchaseOrderApi } from "./api/purchaseOrderApi";
import { filerApi } from "./api/filerApi";
import saleOrderApi from "./api/saleOrderApi";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      qc: qcReducer,
      purchaseOrder: purchaseOrderReducer,
      [authApi.reducerPath]: authApi.reducer,
      [tripsApi.reducerPath]: tripsApi.reducer,
      [qualityChecksApi.reducerPath]: qualityChecksApi.reducer,
      [inventoryApi.reducerPath]: inventoryApi.reducer,
      [coreApi.reducerPath]: coreApi.reducer,
      [purchaseOrderApi.reducerPath]: purchaseOrderApi.reducer,
      [filerApi.reducerPath]: filerApi.reducer,
      [saleOrderApi.reducerPath]: saleOrderApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(middlewares)
        .concat(authApi.middleware)
        .concat(tripsApi.middleware)
        .concat(qualityChecksApi.middleware)
        .concat(inventoryApi.middleware)
        .concat(coreApi.middleware)
        .concat(purchaseOrderApi.middleware)
        .concat(filerApi.middleware)
        .concat(saleOrderApi.middleware),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
