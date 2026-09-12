import { useCallback } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  fetchServices,
  fetchAllServicesAdmin,
  fetchServiceById,
  createServiceThunk,
  updateServiceThunk,
  enableServiceThunk,
  disableServiceThunk,
  setSelectedService,
  clearServiceErrors,
  clearServiceMutationState,
} from "../store/slices/serviceSlice";
import {
  Service,
  GetServicesParams,
  CreateServiceInput,
  UpdateServiceInput,
} from "../types/catalog.types";

export function useServices() {
  const dispatch = useAppDispatch();
  const {
    services,
    selectedService,
    isLoading,
    isMutating,
    error,
    mutationError,
    mutationSuccess,
  } = useAppSelector((state) => state.service);

  const loadServices = useCallback(
    async (params?: GetServicesParams) => {
      const result = await dispatch(fetchServices(params));
      return fetchServices.fulfilled.match(result);
    },
    [dispatch]
  );

  const loadAllServicesAdmin = useCallback(async () => {
    const result = await dispatch(fetchAllServicesAdmin());
    return fetchAllServicesAdmin.fulfilled.match(result);
  }, [dispatch]);

  const loadServiceById = useCallback(
    async (id: string) => {
      const result = await dispatch(fetchServiceById(id));
      return fetchServiceById.fulfilled.match(result);
    },
    [dispatch]
  );

  const createService = useCallback(
    async (data: CreateServiceInput) => {
      const result = await dispatch(createServiceThunk(data));
      return createServiceThunk.fulfilled.match(result);
    },
    [dispatch]
  );

  const updateService = useCallback(
    async (id: string, data: UpdateServiceInput) => {
      const result = await dispatch(updateServiceThunk({ id, data }));
      return updateServiceThunk.fulfilled.match(result);
    },
    [dispatch]
  );

  const enableService = useCallback(
    async (id: string) => {
      const result = await dispatch(enableServiceThunk(id));
      return enableServiceThunk.fulfilled.match(result);
    },
    [dispatch]
  );

  const disableService = useCallback(
    async (id: string) => {
      const result = await dispatch(disableServiceThunk(id));
      return disableServiceThunk.fulfilled.match(result);
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

  const clearMutation = useCallback(() => {
    dispatch(clearServiceMutationState());
  }, [dispatch]);

  return {
    services,
    selectedService,
    isLoading,
    isMutating,
    error,
    mutationError,
    mutationSuccess,
    loadServices,
    loadAllServicesAdmin,
    loadServiceById,
    createService,
    updateService,
    enableService,
    disableService,
    selectService,
    clearErrors,
    clearMutation,
  };
}
