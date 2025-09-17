import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import qcReducer from "./slices/qcSlice";
import { middlewares } from "./middleware";
import { authApi } from "./api/authApi";
import { tripsApi } from "./api/tripsApi";
import { qualityChecksApi } from "./api/qualityChecksApi";
import { inventoryApi } from "./api/inventoryApi";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      qc: qcReducer,
      [authApi.reducerPath]: authApi.reducer,
      [tripsApi.reducerPath]: tripsApi.reducer,
      [qualityChecksApi.reducerPath]: qualityChecksApi.reducer,
      [inventoryApi.reducerPath]: inventoryApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(middlewares)
        .concat(authApi.middleware)
        .concat(tripsApi.middleware)
        .concat(qualityChecksApi.middleware)
        .concat(inventoryApi.middleware),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
