import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Service, GetServicesParams } from "../../types/catalog.types";
import { serviceApi } from "../../api/service.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";

export interface ServiceState {
  services: Service[];
  selectedService: Service | null;
  isLoading: boolean;
  error: NormalizedApiError | null;
}

const initialState: ServiceState = {
  services: [],
  selectedService: null,
  isLoading: false,
  error: null,
};

/**
 * Async thunk to fetch all active services from backend.
 */
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

/**
 * Async thunk to fetch a single service by ID.
 */
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
  },
  extraReducers: (builder) => {
    // FETCH SERVICES
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

    // FETCH SERVICE BY ID
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
  },
});

export const { setSelectedService, clearServiceErrors } =
  serviceSlice.actions;

export default serviceSlice.reducer;
