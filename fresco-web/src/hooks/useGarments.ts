import { useCallback } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  fetchGarments,
  fetchAllGarmentsAdmin,
  fetchGarmentById,
  createGarmentThunk,
  updateGarmentThunk,
  enableGarmentThunk,
  disableGarmentThunk,
  setSelectedGarment,
  clearGarmentErrors,
  clearGarmentMutationState,
} from "../store/slices/garmentSlice";
import {
  Garment,
  GetGarmentsParams,
  CreateGarmentInput,
  UpdateGarmentInput,
} from "../types/catalog.types";

export function useGarments() {
  const dispatch = useAppDispatch();
  const {
    garments,
    selectedGarment,
    isLoading,
    isMutating,
    error,
    mutationError,
    mutationSuccess,
  } = useAppSelector((state) => state.garment);

  const loadGarments = useCallback(
    async (params?: GetGarmentsParams) => {
      const result = await dispatch(fetchGarments(params));
      return fetchGarments.fulfilled.match(result);
    },
    [dispatch]
  );

  const loadAllGarmentsAdmin = useCallback(
    async (categoryId?: string) => {
      const result = await dispatch(fetchAllGarmentsAdmin(categoryId));
      return fetchAllGarmentsAdmin.fulfilled.match(result);
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

  const createGarment = useCallback(
    async (data: CreateGarmentInput) => {
      const result = await dispatch(createGarmentThunk(data));
      return createGarmentThunk.fulfilled.match(result);
    },
    [dispatch]
  );

  const updateGarment = useCallback(
    async (id: string, data: UpdateGarmentInput) => {
      const result = await dispatch(updateGarmentThunk({ id, data }));
      return updateGarmentThunk.fulfilled.match(result);
    },
    [dispatch]
  );

  const enableGarment = useCallback(
    async (id: string) => {
      const result = await dispatch(enableGarmentThunk(id));
      return enableGarmentThunk.fulfilled.match(result);
    },
    [dispatch]
  );

  const disableGarment = useCallback(
    async (id: string) => {
      const result = await dispatch(disableGarmentThunk(id));
      return disableGarmentThunk.fulfilled.match(result);
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

  const clearMutation = useCallback(() => {
    dispatch(clearGarmentMutationState());
  }, [dispatch]);

  return {
    garments,
    selectedGarment,
    isLoading,
    isMutating,
    error,
    mutationError,
    mutationSuccess,
    loadGarments,
    loadAllGarmentsAdmin,
    loadGarmentById,
    createGarment,
    updateGarment,
    enableGarment,
    disableGarment,
    selectGarment,
    clearErrors,
    clearMutation,
  };
}
