import { useCallback } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  loginUser,
  registerUser,
  restoreUserSession,
  logoutUser,
  clearAuthError,
} from "../store/slices/authSlice";
import { LoginInput, RegisterInput } from "../types/auth.types";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isRestoringToken, isLoading, error } =
    useAppSelector((state) => state.auth);

  const login = useCallback(
    async (input: LoginInput) => {
      const result = await dispatch(loginUser(input));
      return loginUser.fulfilled.match(result);
    },
    [dispatch]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await dispatch(registerUser(input));
      return registerUser.fulfilled.match(result);
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutUser());
  }, [dispatch]);

  const restoreSession = useCallback(async () => {
    await dispatch(restoreUserSession());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isRestoringToken,
    isLoading,
    error,
    login,
    register,
    logout,
    restoreSession,
    clearError,
  };
}
