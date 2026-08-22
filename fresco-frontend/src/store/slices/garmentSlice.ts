import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Garment, GetGarmentsParams } from "../../types/catalog.types";
import { garmentApi } from "../../api/garment.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";

export interface GarmentState {
  garments: Garment[];
  selectedGarment: Garment | null;
  isLoading: boolean;
  error: NormalizedApiError | null;
}

const initialState: GarmentState = {
  garments: [],
  selectedGarment: null,
  isLoading: false,
  error: null,
};

/**
 * Async thunk to fetch garments matching query parameters (e.g. categoryId, isActive).
 */
export const fetchGarments = createAsyncThunk<
  Garment[],
  GetGarmentsParams | undefined,
  { rejectValue: NormalizedApiError }
>("garment/fetchGarments", async (params, { rejectWithValue }) => {
  try {
    const garments = await garmentApi.getGarments(params || {});
    return garments;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to fetch single garment by ID.
 */
export const fetchGarmentById = createAsyncThunk<
  Garment,
  string,
  { rejectValue: NormalizedApiError }
>("garment/fetchGarmentById", async (id, { rejectWithValue }) => {
  try {
    const garment = await garmentApi.getGarmentById(id);
    return garment;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const garmentSlice = createSlice({
  name: "garment",
  initialState,
  reducers: {
    setSelectedGarment: (state, action: PayloadAction<Garment | null>) => {
      state.selectedGarment = action.payload;
    },
    clearGarmentErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // FETCH GARMENTS
    builder.addCase(fetchGarments.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchGarments.fulfilled, (state, action) => {
      state.garments = action.payload;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchGarments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || null;
    });

    // FETCH GARMENT BY ID
    builder.addCase(fetchGarmentById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchGarmentById.fulfilled, (state, action) => {
      state.selectedGarment = action.payload;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchGarmentById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || null;
    });
  },
});

export const { setSelectedGarment, clearGarmentErrors } =
  garmentSlice.actions;

export default garmentSlice.reducer;
