import { useCallback } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  fetchInspectionByOrderId,
  fetchInspectionById,
  fetchInspections,
  createInspectionThunk,
  updateInspectionThunk,
  submitInspectionThunk,
  setCurrentInspection,
  clearInspectionErrors,
  clearCurrentInspection,
} from "../store/slices/inspectionSlice";
import {
  Inspection,
  CreateInspectionInput,
  UpdateInspectionInput,
  InspectionFilters,
} from "../types/inspection.types";

/**
 * Custom hook providing access to Order Inspection state and operations.
 */
export function useInspection() {
  const dispatch = useAppDispatch();
  const {
    inspections,
    currentInspection,
    isFetchingInspection,
    isCreatingInspection,
    isUpdatingInspection,
    isSubmittingInspection,
    error,
    createError,
    updateError,
    submitError,
  } = useAppSelector((state) => state.inspection);

  const loadInspectionByOrderId = useCallback(
    async (orderId: string) => {
      const result = await dispatch(fetchInspectionByOrderId(orderId));
      return fetchInspectionByOrderId.fulfilled.match(result);
    },
    [dispatch]
  );

  const loadInspectionById = useCallback(
    async (id: string) => {
      const result = await dispatch(fetchInspectionById(id));
      return fetchInspectionById.fulfilled.match(result);
    },
    [dispatch]
  );

  const loadInspections = useCallback(
    async (filters?: InspectionFilters) => {
      return await dispatch(fetchInspections(filters));
    },
    [dispatch]
  );

  const createInspection = useCallback(
    async (payload: CreateInspectionInput) => {
      const result = await dispatch(createInspectionThunk(payload));
      return createInspectionThunk.fulfilled.match(result);
    },
    [dispatch]
  );

  const updateInspection = useCallback(
    async (id: string, payload: UpdateInspectionInput) => {
      const result = await dispatch(updateInspectionThunk({ id, payload }));
      return updateInspectionThunk.fulfilled.match(result);
    },
    [dispatch]
  );

  const submitInspection = useCallback(
    async (id: string) => {
      const result = await dispatch(submitInspectionThunk(id));
      return submitInspectionThunk.fulfilled.match(result);
    },
    [dispatch]
  );

  const selectInspection = useCallback(
    (inspection: Inspection | null) => {
      dispatch(setCurrentInspection(inspection));
    },
    [dispatch]
  );

  const clearErrors = useCallback(() => {
    dispatch(clearInspectionErrors());
  }, [dispatch]);

  const clearSelection = useCallback(() => {
    dispatch(clearCurrentInspection());
  }, [dispatch]);

  return {
    inspections,
    currentInspection,
    isFetchingInspection,
    isCreatingInspection,
    isUpdatingInspection,
    isSubmittingInspection,
    error,
    createError,
    updateError,
    submitError,
    loadInspectionByOrderId,
    loadInspectionById,
    loadInspections,
    createInspection,
    updateInspection,
    submitInspection,
    selectInspection,
    clearErrors,
    clearSelection,
  };
}
