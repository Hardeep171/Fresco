import { useCallback } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  fetchUserProfile,
  updateUserProfile,
  changeUserPassword,
  clearUserError,
  clearUpdateSuccess,
  clearChangePasswordSuccess,
} from "../store/slices/userSlice";
import { UpdateProfileInput, ChangePasswordInput } from "../types/user.types";

export function useUser() {
  const dispatch = useAppDispatch();
  const {
    profile,
    isLoading,
    isUpdating,
    isChangingPassword,
    error,
    updateError,
    changePasswordError,
    updateSuccess,
    changePasswordSuccess,
  } = useAppSelector((state) => state.user);

  const loadProfile = useCallback(async () => {
    const result = await dispatch(fetchUserProfile());
    return fetchUserProfile.fulfilled.match(result);
  }, [dispatch]);

  const updateProfile = useCallback(
    async (input: UpdateProfileInput) => {
      const result = await dispatch(updateUserProfile(input));
      return updateUserProfile.fulfilled.match(result);
    },
    [dispatch]
  );

  const changePassword = useCallback(
    async (input: ChangePasswordInput) => {
      const result = await dispatch(changeUserPassword(input));
      return changeUserPassword.fulfilled.match(result);
    },
    [dispatch]
  );

  const clearErrors = useCallback(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  const resetUpdateSuccess = useCallback(() => {
    dispatch(clearUpdateSuccess());
  }, [dispatch]);

  const resetChangePasswordSuccess = useCallback(() => {
    dispatch(clearChangePasswordSuccess());
  }, [dispatch]);

  return {
    profile,
    isLoading,
    isUpdating,
    isChangingPassword,
    error,
    updateError,
    changePasswordError,
    updateSuccess,
    changePasswordSuccess,
    loadProfile,
    updateProfile,
    changePassword,
    clearErrors,
    resetUpdateSuccess,
    resetChangePasswordSuccess,
  };
}
