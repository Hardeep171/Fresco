import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  Service,
  GetServicesParams,
  CreateServiceInput,
  UpdateServiceInput,
} from "../../types/catalog.types";
import { serviceApi } from "../../api/service.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";

export interface ServiceState {
  services: Service[];
  selectedService: Service | null;
  isLoading: boolean;
  isMutating: boolean;
  error: NormalizedApiError | null;
  mutationError: NormalizedApiError | null;
  mutationSuccess: boolean;
}

const initialState: ServiceState = {
  services: [],
  selectedService: null,
  isLoading: false,
  isMutating: false,
  error: null,
  mutationError: null,
  mutationSuccess: false,
};

export const fetchServices = createAsyncThunk<
  Service[],
  GetServicesParams | undefined,
  { rejectValue: NormalizedApiError }
>("service/fetchServices", async (params, { rejectWithValue }) => {
  try {
    const services = await serviceApi.getServices(params || {});
    return services;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const fetchAllServicesAdmin = createAsyncThunk<
  Service[],
  void,
  { rejectValue: NormalizedApiError }
>("service/fetchAllServicesAdmin", async (_, { rejectWithValue }) => {
  try {
    return await serviceApi.getAllServicesForAdmin();
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const fetchServiceById = createAsyncThunk<
  Service,
  string,
  { rejectValue: NormalizedApiError }
>("service/fetchServiceById", async (id, { rejectWithValue }) => {
  try {
    const service = await serviceApi.getServiceById(id);
    return service;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const createServiceThunk = createAsyncThunk<
  Service,
  CreateServiceInput,
  { rejectValue: NormalizedApiError }
>("service/createService", async (data, { rejectWithValue }) => {
  try {
    return await serviceApi.createService(data);
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const updateServiceThunk = createAsyncThunk<
  Service,
  { id: string; data: UpdateServiceInput },
  { rejectValue: NormalizedApiError }
>("service/updateService", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await serviceApi.updateService(id, data);
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const enableServiceThunk = createAsyncThunk<
  Service,
  string,
  { rejectValue: NormalizedApiError }
>("service/enableService", async (id, { rejectWithValue }) => {
  try {
    return await serviceApi.enableService(id);
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const disableServiceThunk = createAsyncThunk<
  Service,
  string,
  { rejectValue: NormalizedApiError }
>("service/disableService", async (id, { rejectWithValue }) => {
  try {
    return await serviceApi.disableService(id);
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    setSelectedService: (state, action: PayloadAction<Service | null>) => {
      state.selectedService = action.payload;
    },
    clearServiceErrors: (state) => {
      state.error = null;
    },
    clearServiceMutationState: (state) => {
      state.mutationError = null;
      state.mutationSuccess = false;
      state.isMutating = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchServices.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchServices.fulfilled, (state, action) => {
      state.services = action.payload;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchServices.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || null;
    });

    builder.addCase(fetchAllServicesAdmin.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAllServicesAdmin.fulfilled, (state, action) => {
      state.services = action.payload;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchAllServicesAdmin.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || null;
    });

    builder.addCase(fetchServiceById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchServiceById.fulfilled, (state, action) => {
      state.selectedService = action.payload;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchServiceById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || null;
    });

    builder.addCase(createServiceThunk.pending, (state) => {
      state.isMutating = true;
      state.mutationError = null;
      state.mutationSuccess = false;
    });
    builder.addCase(createServiceThunk.fulfilled, (state, action) => {
      state.isMutating = false;
      state.mutationSuccess = true;
      state.mutationError = null;
      const index = state.services.findIndex((s) => s._id === action.payload._id);
      if (index >= 0) {
        state.services[index] = action.payload;
      } else {
        state.services.push(action.payload);
      }
      state.services.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    });
    builder.addCase(createServiceThunk.rejected, (state, action) => {
      state.isMutating = false;
      state.mutationError = action.payload || null;
      state.mutationSuccess = false;
    });

    builder.addCase(updateServiceThunk.pending, (state) => {
      state.isMutating = true;
      state.mutationError = null;
      state.mutationSuccess = false;
    });
    builder.addCase(updateServiceThunk.fulfilled, (state, action) => {
      state.isMutating = false;
      state.mutationSuccess = true;
      state.mutationError = null;
      const index = state.services.findIndex((s) => s._id === action.payload._id);
      if (index >= 0) {
        state.services[index] = action.payload;
      } else {
        state.services.push(action.payload);
      }
      state.services.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      if (state.selectedService?._id === action.payload._id) {
        state.selectedService = action.payload;
      }
    });
    builder.addCase(updateServiceThunk.rejected, (state, action) => {
      state.isMutating = false;
      state.mutationError = action.payload || null;
      state.mutationSuccess = false;
    });

    builder.addCase(enableServiceThunk.pending, (state) => {
      state.isMutating = true;
      state.mutationError = null;
      state.mutationSuccess = false;
    });
    builder.addCase(enableServiceThunk.fulfilled, (state, action) => {
      state.isMutating = false;
      state.mutationSuccess = true;
      state.mutationError = null;
      const index = state.services.findIndex((s) => s._id === action.payload._id);
      if (index >= 0) {
        state.services[index] = action.payload;
      }
    });
    builder.addCase(enableServiceThunk.rejected, (state, action) => {
      state.isMutating = false;
      state.mutationError = action.payload || null;
      state.mutationSuccess = false;
    });

    builder.addCase(disableServiceThunk.pending, (state) => {
      state.isMutating = true;
      state.mutationError = null;
      state.mutationSuccess = false;
    });
    builder.addCase(disableServiceThunk.fulfilled, (state, action) => {
      state.isMutating = false;
      state.mutationSuccess = true;
      state.mutationError = null;
      const index = state.services.findIndex((s) => s._id === action.payload._id);
      if (index >= 0) {
        state.services[index] = action.payload;
      }
    });
    builder.addCase(disableServiceThunk.rejected, (state, action) => {
      state.isMutating = false;
      state.mutationError = action.payload || null;
      state.mutationSuccess = false;
    });
  },
});

export const {
  setSelectedService,
  clearServiceErrors,
  clearServiceMutationState,
} = serviceSlice.actions;

export default serviceSlice.reducer;
