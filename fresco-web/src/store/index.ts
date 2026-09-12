import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./rootReducer";
import { setTokens, logoutSuccess } from "./slices/authSlice";
import { setAuthCallbacks } from "../api/interceptors";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Synchronize API auth callbacks with Redux store
setAuthCallbacks({
  onTokenRefreshed: (tokens) => {
    store.dispatch(setTokens(tokens));
  },
  onAuthFailure: () => {
    store.dispatch(logoutSuccess());
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export * from "./rootReducer";
