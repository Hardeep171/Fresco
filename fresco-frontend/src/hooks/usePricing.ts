import { useCallback } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  fetchPricing,
  fetchAllPricingAdmin,
  fetchPricingById,
  createPricingThunk,
  updatePricingThunk,
  enablePricingThunk,
  disablePricingThunk,
  clearPricingErrors,
  clearPricingList,
  clearPricingMutationState,
} from "../store/slices/pricingSlice";
import {
  GetPricingParams,
  CreatePricingInput,
  UpdatePricingInput,
} from "../types/catalog.types";

/**
 * Custom hook providing access to Pricing state and actions.
 */
export function usePricing() {
  const dispatch = useAppDispatch();
  const {
    pricingList,
    isLoading,
    isMutating,
    error,
    mutationError,
    mutationSuccess,
  } = useAppSelector((state) => state.pricing);

  const loadPricing = useCallback(
    async (params?: GetPricingParams) => {
      const result = await dispatch(fetchPricing(params));
      return fetchPricing.fulfilled.match(result);
    },
    [dispatch]
  );

  const loadAllPricingAdmin = useCallback(
    async (filters?: { garmentId?: string; serviceId?: string }) => {
      const result = await dispatch(fetchAllPricingAdmin(filters));
      return fetchAllPricingAdmin.fulfilled.match(result);
    },
    [dispatch]
  );

  const loadPricingById = useCallback(
    async (id: string) => {
      const result = await dispatch(fetchPricingById(id));
      return fetchPricingById.fulfilled.match(result);
    },
    [dispatch]
  );

  const createPricing = useCallback(
    async (data: CreatePricingInput) => {
      const result = await dispatch(createPricingThunk(data));
      return createPricingThunk.fulfilled.match(result);
    },
    [dispatch]
  );

  const updatePricing = useCallback(
    async (id: string, data: UpdatePricingInput) => {
      const result = await dispatch(updatePricingThunk({ id, data }));
      return updatePricingThunk.fulfilled.match(result);
    },
    [dispatch]
  );

  const enablePricing = useCallback(
    async (id: string) => {
      const result = await dispatch(enablePricingThunk(id));
      return enablePricingThunk.fulfilled.match(result);
    },
    [dispatch]
  );

  const disablePricing = useCallback(
    async (id: string) => {
      const result = await dispatch(disablePricingThunk(id));
      return disablePricingThunk.fulfilled.match(result);
    },
    [dispatch]
  );

  const resetPricing = useCallback(() => {
    dispatch(clearPricingList());
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearPricingErrors());
  }, [dispatch]);

  const clearMutation = useCallback(() => {
    dispatch(clearPricingMutationState());
  }, [dispatch]);

  return {
    pricingList,
    isLoading,
    isMutating,
    error,
    mutationError,
    mutationSuccess,
    loadPricing,
    loadAllPricingAdmin,
    loadPricingById,
    createPricing,
    updatePricing,
    enablePricing,
    disablePricing,
    resetPricing,
    clearErrors,
    clearMutation,
  };
}

