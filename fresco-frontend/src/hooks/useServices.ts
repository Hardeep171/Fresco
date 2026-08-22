import { useCallback } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  fetchServices,
  fetchServiceById,
  setSelectedService,
  clearServiceErrors,
} from "../store/slices/serviceSlice";
import { Service, GetServicesParams } from "../types/catalog.types";

/**
 * Custom hook providing access to Service state and actions.
 */
export function useServices() {
  const dispatch = useAppDispatch();
  const { services, selectedService, isLoading, error } = useAppSelector(
    (state) => state.service
  );

  const loadServices = useCallback(
    async (params?: GetServicesParams) => {
      const result = await dispatch(fetchServices(params));
      return fetchServices.fulfilled.match(result);
    },
    [dispatch]
  );

  const loadServiceById = useCallback(
    async (id: string) => {
      const result = await dispatch(fetchServiceById(id));
      return fetchServiceById.fulfilled.match(result);
    },
    [dispatch]
  );

  const selectService = useCallback(
    (service: Service | null) => {
      dispatch(setSelectedService(service));
    },
    [dispatch]
  );

  const clearErrors = useCallback(() => {
    dispatch(clearServiceErrors());
  }, [dispatch]);

  return {
    services,
    selectedService,
    isLoading,
    error,
    loadServices,
    loadServiceById,
    selectService,
    clearErrors,
  };
}
