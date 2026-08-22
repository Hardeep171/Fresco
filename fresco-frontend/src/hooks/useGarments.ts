import { useCallback } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  fetchGarments,
  fetchGarmentById,
  setSelectedGarment,
  clearGarmentErrors,
} from "../store/slices/garmentSlice";
import { Garment, GetGarmentsParams } from "../types/catalog.types";

/**
 * Custom hook providing access to Garment state and actions.
 */
export function useGarments() {
  const dispatch = useAppDispatch();
  const { garments, selectedGarment, isLoading, error } = useAppSelector(
    (state) => state.garment
  );

  const loadGarments = useCallback(
    async (params?: GetGarmentsParams) => {
      const result = await dispatch(fetchGarments(params));
      return fetchGarments.fulfilled.match(result);
    },
    [dispatch]
  );

  const loadGarmentById = useCallback(
    async (id: string) => {
      const result = await dispatch(fetchGarmentById(id));
      return fetchGarmentById.fulfilled.match(result);
    },
    [dispatch]
  );

  const selectGarment = useCallback(
    (garment: Garment | null) => {
      dispatch(setSelectedGarment(garment));
    },
    [dispatch]
  );

  const clearErrors = useCallback(() => {
    dispatch(clearGarmentErrors());
  }, [dispatch]);

  return {
    garments,
    selectedGarment,
    isLoading,
    error,
    loadGarments,
    loadGarmentById,
    selectGarment,
    clearErrors,
  };
}
