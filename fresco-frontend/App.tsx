import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { store } from "./src/store";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { setupInterceptors } from "./src/api";
import { setTokens, logoutSuccess } from "./src/store/slices/authSlice";

export default function App() {
  useEffect(() => {
    // Initialize networking interceptors with Redux session synchronization
    const cleanup = setupInterceptors({
      onTokenRefreshed: (tokens) => {
        store.dispatch(setTokens(tokens));
      },
      onAuthFailure: () => {
        store.dispatch(logoutSuccess());
      },
    });

    return () => {
      cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <RootNavigator />
      </Provider>
    </SafeAreaProvider>
  );
}
