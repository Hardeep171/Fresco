import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  Garment,
  GetGarmentsParams,
  CreateGarmentInput,
  UpdateGarmentInput,
} from "../../types/catalog.types";
import { garmentApi } from "../../api/garment.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";

export interface GarmentState {
  garments: Garment[];
  selectedGarment: Garment | null;
  isLoading: boolean;
  isMutating: boolean;
  error: NormalizedApiError | null;
  mutationError: NormalizedApiError | null;
  mutationSuccess: boolean;
}

const initialState: GarmentState = {
  garments: [],
  selectedGarment: null,
  isLoading: false,
  isMutating: false,
  error: null,
  mutationError: null,
  mutationSuccess: false,
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
 * Async thunk to fetch all garments for admin (both active and inactive).
 */
export const fetchAllGarmentsAdmin = createAsyncThunk<
  Garment[],
  string | undefined,
  { rejectValue: NormalizedApiError }
>("garment/fetchAllGarmentsAdmin", async (categoryId, { rejectWithValue }) => {
  try {
    return await garmentApi.getAllGarmentsForAdmin(categoryId);
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

/**
 * Async thunk to create a new garment (Admin operation).
 */
export const createGarmentThunk = createAsyncThunk<
  Garment,
  CreateGarmentInput,
  { rejectValue: NormalizedApiError }
>("garment/createGarment", async (data, { rejectWithValue }) => {
  try {
    return await garmentApi.createGarment(data);
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to update an existing garment (Admin operation).
 */
export const updateGarmentThunk = createAsyncThunk<
  Garment,
  { id: string; data: UpdateGarmentInput },
  { rejectValue: NormalizedApiError }
>("garment/updateGarment", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await garmentApi.updateGarment(id, data);
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to enable a garment (Admin operation).
 */
export const enableGarmentThunk = createAsyncThunk<
  Garment,
  string,
  { rejectValue: NormalizedApiError }
>("garment/enableGarment", async (id, { rejectWithValue }) => {
  try {
    return await garmentApi.enableGarment(id);
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to disable a garment (soft-delete, Admin operation).
 */
export const disableGarmentThunk = createAsyncThunk<
  Garment,
  string,
  { rejectValue: NormalizedApiError }
>("garment/disableGarment", async (id, { rejectWithValue }) => {
  try {
    return await garmentApi.disableGarment(id);
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
    clearGarmentMutationState: (state) => {
      state.mutationError = null;
      state.mutationSuccess = false;
      state.isMutating = false;
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

    // FETCH ALL GARMENTS ADMIN
    builder.addCase(fetchAllGarmentsAdmin.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAllGarmentsAdmin.fulfilled, (state, action) => {
      state.garments = action.payload;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchAllGarmentsAdmin.rejected, (state, action) => {
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

    // CREATE GARMENT
    builder.addCase(createGarmentThunk.pending, (state) => {
      state.isMutating = true;
      state.mutationError = null;
      state.mutationSuccess = false;
    });
    builder.addCase(createGarmentThunk.fulfilled, (state, action) => {
      state.isMutating = false;
      state.mutationSuccess = true;
      state.mutationError = null;
      const index = state.garments.findIndex((g) => g._id === action.payload._id);
      if (index >= 0) {
        state.garments[index] = action.payload;
      } else {
        state.garments.push(action.payload);
      }
      state.garments.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    });
    builder.addCase(createGarmentThunk.rejected, (state, action) => {
      state.isMutating = false;
      state.mutationError = action.payload || null;
      state.mutationSuccess = false;
    });

    // UPDATE GARMENT
    builder.addCase(updateGarmentThunk.pending, (state) => {
      state.isMutating = true;
      state.mutationError = null;
      state.mutationSuccess = false;
    });
    builder.addCase(updateGarmentThunk.fulfilled, (state, action) => {
      state.isMutating = false;
      state.mutationSuccess = true;
      state.mutationError = null;
      const index = state.garments.findIndex((g) => g._id === action.payload._id);
      if (index >= 0) {
        state.garments[index] = action.payload;
      } else {
        state.garments.push(action.payload);
      }
      state.garments.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      if (state.selectedGarment?._id === action.payload._id) {
        state.selectedGarment = action.payload;
      }
    });
    builder.addCase(updateGarmentThunk.rejected, (state, action) => {
      state.isMutating = false;
      state.mutationError = action.payload || null;
      state.mutationSuccess = false;
    });

    // ENABLE GARMENT
    builder.addCase(enableGarmentThunk.pending, (state) => {
      state.isMutating = true;
      state.mutationError = null;
      state.mutationSuccess = false;
    });
    builder.addCase(enableGarmentThunk.fulfilled, (state, action) => {
      state.isMutating = false;
      state.mutationSuccess = true;
      state.mutationError = null;
      const index = state.garments.findIndex((g) => g._id === action.payload._id);
      if (index >= 0) {
        state.garments[index] = action.payload;
      }
    });
    builder.addCase(enableGarmentThunk.rejected, (state, action) => {
      state.isMutating = false;
      state.mutationError = action.payload || null;
      state.mutationSuccess = false;
    });

    // DISABLE GARMENT
    builder.addCase(disableGarmentThunk.pending, (state) => {
      state.isMutating = true;
      state.mutationError = null;
      state.mutationSuccess = false;
    });
    builder.addCase(disableGarmentThunk.fulfilled, (state, action) => {
      state.isMutating = false;
      state.mutationSuccess = true;
      state.mutationError = null;
      const index = state.garments.findIndex((g) => g._id === action.payload._id);
      if (index >= 0) {
        state.garments[index] = action.payload;
      }
    });
    builder.addCase(disableGarmentThunk.rejected, (state, action) => {
      state.isMutating = false;
      state.mutationError = action.payload || null;
      state.mutationSuccess = false;
    });
  },
});

export const {
  setSelectedGarment,
  clearGarmentErrors,
  clearGarmentMutationState,
} = garmentSlice.actions;

export default garmentSlice.reducer;

