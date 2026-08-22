import { useCallback } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  fetchAddresses,
  fetchAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  clearAddressErrors,
  clearAddressSuccess,
  setSelectedAddress,
} from "../store/slices/addressSlice";
import {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
} from "../types/address.types";

/**
 * Custom hook providing access to Address state and CRUD actions.
 */
export function useAddress() {
  const dispatch = useAppDispatch();
  const {
    addresses,
    selectedAddress,
    isLoading,
    isFetchingById,
    isCreating,
    isUpdating,
    isDeleting,
    deletingAddressId,
    isSettingDefault,
    settingDefaultAddressId,
    error,
    actionError,
    createSuccess,
    updateSuccess,
    deleteSuccess,
  } = useAppSelector((state) => state.address);

  const defaultAddress = addresses.find((a) => a.isDefault) || null;

  const loadAddresses = useCallback(async () => {
    const result = await dispatch(fetchAddresses());
    return fetchAddresses.fulfilled.match(result);
  }, [dispatch]);

  const loadAddressById = useCallback(
    async (id: string) => {
      const result = await dispatch(fetchAddressById(id));
      return fetchAddressById.fulfilled.match(result);
    },
    [dispatch]
  );

  const addAddress = useCallback(
    async (input: CreateAddressInput) => {
      const result = await dispatch(createAddress(input));
      return createAddress.fulfilled.match(result);
    },
    [dispatch]
  );

  const editAddress = useCallback(
    async (id: string, input: UpdateAddressInput) => {
      const result = await dispatch(updateAddress({ id, input }));
      return updateAddress.fulfilled.match(result);
    },
    [dispatch]
  );

  const removeAddress = useCallback(
    async (id: string) => {
      const result = await dispatch(deleteAddress(id));
      return deleteAddress.fulfilled.match(result);
    },
    [dispatch]
  );

  const makeDefault = useCallback(
    async (id: string) => {
      const result = await dispatch(setDefaultAddress(id));
      return setDefaultAddress.fulfilled.match(result);
    },
    [dispatch]
  );

  const clearErrors = useCallback(() => {
    dispatch(clearAddressErrors());
  }, [dispatch]);

  const resetSuccess = useCallback(() => {
    dispatch(clearAddressSuccess());
  }, [dispatch]);

  const selectAddress = useCallback(
    (address: Address | null) => {
      dispatch(setSelectedAddress(address));
    },
    [dispatch]
  );

  return {
    addresses,
    defaultAddress,
    selectedAddress,
    isLoading,
    isFetchingById,
    isCreating,
    isUpdating,
    isDeleting,
    deletingAddressId,
    isSettingDefault,
    settingDefaultAddressId,
    error,
    actionError,
    createSuccess,
    updateSuccess,
    deleteSuccess,
    loadAddresses,
    loadAddressById,
    addAddress,
    editAddress,
    removeAddress,
    makeDefault,
    clearErrors,
    resetSuccess,
    selectAddress,
  };
}
