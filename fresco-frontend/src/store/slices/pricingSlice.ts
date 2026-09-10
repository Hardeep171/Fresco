import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  Pricing,
  GetPricingParams,
  CreatePricingInput,
  UpdatePricingInput,
} from "../../types/catalog.types";
import { pricingApi } from "../../api/pricing.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";

export interface PricingState {
  pricingList: Pricing[];
  isLoading: boolean;
  isMutating: boolean;
  error: NormalizedApiError | null;
  mutationError: NormalizedApiError | null;
  mutationSuccess: boolean;
}

const initialState: PricingState = {
  pricingList: [],
  isLoading: false,
  isMutating: false,
  error: null,
  mutationError: null,
  mutationSuccess: false,
};

/**
 * Async thunk to fetch pricing records matching query filters (garmentId, serviceId, isActive).
 */
export const fetchPricing = createAsyncThunk<
  Pricing[],
  GetPricingParams | undefined,
  { rejectValue: NormalizedApiError }
>("pricing/fetchPricing", async (params, { rejectWithValue }) => {
  try {
    const pricing = await pricingApi.getPricing(params || {});
    return pricing;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to fetch all pricing records for admin (both active and inactive).
 */
export const fetchAllPricingAdmin = createAsyncThunk<
  Pricing[],
  { garmentId?: string; serviceId?: string } | undefined,
  { rejectValue: NormalizedApiError }
>("pricing/fetchAllPricingAdmin", async (filters, { rejectWithValue }) => {
  try {
    return await pricingApi.getAllPricingForAdmin(filters || {});
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to fetch a single pricing record by ID.
 */
export const fetchPricingById = createAsyncThunk<
  Pricing,
  string,
  { rejectValue: NormalizedApiError }
>("pricing/fetchPricingById", async (id, { rejectWithValue }) => {
  try {
    const pricing = await pricingApi.getPricingById(id);
    return pricing;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to create a new pricing entry (Admin operation).
 */
export const createPricingThunk = createAsyncThunk<
  Pricing,
  CreatePricingInput,
  { rejectValue: NormalizedApiError }
>("pricing/createPricing", async (data, { rejectWithValue }) => {
  try {
    return await pricingApi.createPricing(data);
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to update an existing pricing record (Admin operation).
 */
export const updatePricingThunk = createAsyncThunk<
  Pricing,
  { id: string; data: UpdatePricingInput },
  { rejectValue: NormalizedApiError }
>("pricing/updatePricing", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await pricingApi.updatePricing(id, data);
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to enable a pricing record (Admin operation).
 */
export const enablePricingThunk = createAsyncThunk<
  Pricing,
  string,
  { rejectValue: NormalizedApiError }
>("pricing/enablePricing", async (id, { rejectWithValue }) => {
  try {
    return await pricingApi.enablePricing(id);
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to disable a pricing record (soft-delete, Admin operation).
 */
export const disablePricingThunk = createAsyncThunk<
  Pricing,
  string,
  { rejectValue: NormalizedApiError }
>("pricing/disablePricing", async (id, { rejectWithValue }) => {
  try {
    return await pricingApi.disablePricing(id);
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const pricingSlice = createSlice({
  name: "pricing",
  initialState,
  reducers: {
    clearPricingErrors: (state) => {
      state.error = null;
    },
    clearPricingList: (state) => {
      state.pricingList = [];
    },
    clearPricingMutationState: (state) => {
      state.mutationError = null;
      state.mutationSuccess = false;
      state.isMutating = false;
    },
  },
  extraReducers: (builder) => {
    // FETCH PRICING LIST
    builder.addCase(fetchPricing.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPricing.fulfilled, (state, action) => {
      state.pricingList = action.payload;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchPricing.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || null;
    });

    // FETCH ALL PRICING ADMIN
    builder.addCase(fetchAllPricingAdmin.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAllPricingAdmin.fulfilled, (state, action) => {
      state.pricingList = action.payload;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchAllPricingAdmin.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || null;
    });

    // FETCH PRICING BY ID
    builder.addCase(fetchPricingById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPricingById.fulfilled, (state, action) => {
      const idx = state.pricingList.findIndex((p) => p._id === action.payload._id);
      if (idx !== -1) {
        state.pricingList[idx] = action.payload;
      } else {
        state.pricingList.push(action.payload);
      }
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchPricingById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || null;
    });

    // CREATE PRICING
    builder.addCase(createPricingThunk.pending, (state) => {
      state.isMutating = true;
      state.mutationError = null;
      state.mutationSuccess = false;
    });
    builder.addCase(createPricingThunk.fulfilled, (state, action) => {
      state.isMutating = false;
      state.mutationSuccess = true;
      state.mutationError = null;
      const idx = state.pricingList.findIndex((p) => p._id === action.payload._id);
      if (idx !== -1) {
        state.pricingList[idx] = action.payload;
      } else {
        state.pricingList.push(action.payload);
      }
    });
    builder.addCase(createPricingThunk.rejected, (state, action) => {
      state.isMutating = false;
      state.mutationError = action.payload || null;
      state.mutationSuccess = false;
    });

    // UPDATE PRICING
    builder.addCase(updatePricingThunk.pending, (state) => {
      state.isMutating = true;
      state.mutationError = null;
      state.mutationSuccess = false;
    });
    builder.addCase(updatePricingThunk.fulfilled, (state, action) => {
      state.isMutating = false;
      state.mutationSuccess = true;
      state.mutationError = null;
      const idx = state.pricingList.findIndex((p) => p._id === action.payload._id);
      if (idx !== -1) {
        state.pricingList[idx] = action.payload;
      } else {
        state.pricingList.push(action.payload);
      }
    });
    builder.addCase(updatePricingThunk.rejected, (state, action) => {
      state.isMutating = false;
      state.mutationError = action.payload || null;
      state.mutationSuccess = false;
    });

    // ENABLE PRICING
    builder.addCase(enablePricingThunk.pending, (state) => {
      state.isMutating = true;
      state.mutationError = null;
      state.mutationSuccess = false;
    });
    builder.addCase(enablePricingThunk.fulfilled, (state, action) => {
      state.isMutating = false;
      state.mutationSuccess = true;
      state.mutationError = null;
      const idx = state.pricingList.findIndex((p) => p._id === action.payload._id);
      if (idx !== -1) {
        state.pricingList[idx] = action.payload;
      }
    });
    builder.addCase(enablePricingThunk.rejected, (state, action) => {
      state.isMutating = false;
      state.mutationError = action.payload || null;
      state.mutationSuccess = false;
    });

    // DISABLE PRICING
    builder.addCase(disablePricingThunk.pending, (state) => {
      state.isMutating = true;
      state.mutationError = null;
      state.mutationSuccess = false;
    });
    builder.addCase(disablePricingThunk.fulfilled, (state, action) => {
      state.isMutating = false;
      state.mutationSuccess = true;
      state.mutationError = null;
      const idx = state.pricingList.findIndex((p) => p._id === action.payload._id);
      if (idx !== -1) {
        state.pricingList[idx] = action.payload;
      }
    });
    builder.addCase(disablePricingThunk.rejected, (state, action) => {
      state.isMutating = false;
      state.mutationError = action.payload || null;
      state.mutationSuccess = false;
    });
  },
});

export const {
  clearPricingErrors,
  clearPricingList,
  clearPricingMutationState,
} = pricingSlice.actions;

export default pricingSlice.reducer;

