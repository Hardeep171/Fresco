import React, { useEffect } from "react";
import { useAppDispatch } from "./hooks/useAppDispatch";
import { restoreUserSession, setTokens, logoutSuccess } from "./store/slices/authSlice";
import { setupInterceptors } from "./api/interceptors";
import { apiClient } from "./api/client";
import { AppRouter } from "./navigation/AppRouter";

export const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Ensure interceptors and store callbacks are connected
    setupInterceptors(apiClient, {
      onTokenRefreshed: (tokens) => {
        dispatch(setTokens(tokens));
      },
      onAuthFailure: () => {
        dispatch(logoutSuccess());
      },
    });

    dispatch(restoreUserSession());
  }, [dispatch]);

  return <AppRouter />;
};

export default App;
