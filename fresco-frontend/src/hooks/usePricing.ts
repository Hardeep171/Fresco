import { useCallback } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  fetchPricing,
  fetchPricingById,
  clearPricingErrors,
  clearPricingList,
} from "../store/slices/pricingSlice";
import { GetPricingParams } from "../types/catalog.types";

/**
 * Custom hook providing access to Pricing state and actions.
 */
export function usePricing() {
  const dispatch = useAppDispatch();
  const { pricingList, isLoading, error } = useAppSelector(
    (state) => state.pricing
  );

  const loadPricing = useCallback(
    async (params?: GetPricingParams) => {
      const result = await dispatch(fetchPricing(params));
      return fetchPricing.fulfilled.match(result);
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

  const resetPricing = useCallback(() => {
    dispatch(clearPricingList());
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearPricingErrors());
  }, [dispatch]);

  return {
    pricingList,
    isLoading,
    error,
    loadPricing,
    loadPricingById,
    resetPricing,
    clearErrors,
  };
}
