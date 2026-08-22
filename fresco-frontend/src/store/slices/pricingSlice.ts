import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Pricing, GetPricingParams } from "../../types/catalog.types";
import { pricingApi } from "../../api/pricing.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";

export interface PricingState {
  pricingList: Pricing[];
  isLoading: boolean;
  error: NormalizedApiError | null;
}

const initialState: PricingState = {
  pricingList: [],
  isLoading: false,
  error: null,
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

    // FETCH PRICING BY ID
    builder.addCase(fetchPricingById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPricingById.fulfilled, (state, action) => {
      // If it exists in list, update; else add
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
  },
});

export const { clearPricingErrors, clearPricingList } = pricingSlice.actions;

export default pricingSlice.reducer;
