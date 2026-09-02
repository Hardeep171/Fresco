import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { inspectionApi } from "../../api/inspection.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";
import {
  Inspection,
  CreateInspectionInput,
  UpdateInspectionInput,
  InspectionFilters,
} from "../../types/inspection.types";
import { logoutUser, logoutSuccess } from "./authSlice";

export interface InspectionState {
  inspections: Inspection[];
  currentInspection: Inspection | null;
  isFetchingInspection: boolean;
  isCreatingInspection: boolean;
  isUpdatingInspection: boolean;
  isSubmittingInspection: boolean;
  error: NormalizedApiError | null;
  createError: NormalizedApiError | null;
  updateError: NormalizedApiError | null;
  submitError: NormalizedApiError | null;
}

const initialState: InspectionState = {
  inspections: [],
  currentInspection: null,
  isFetchingInspection: false,
  isCreatingInspection: false,
  isUpdatingInspection: false,
  isSubmittingInspection: false,
  error: null,
  createError: null,
  updateError: null,
  submitError: null,
};

const defaultError = (message: string): NormalizedApiError => ({
  kind: "SERVER_ERROR",
  statusCode: 500,
  message,
  rawErrors: [],
  isNetworkError: false,
  isTimeout: false,
  isAuthError: false,
});

/**
 * Fetches the inspection record associated with a specific customer order.
 */
export const fetchInspectionByOrderId = createAsyncThunk<
  Inspection,
  string,
  { rejectValue: NormalizedApiError }
>("inspection/fetchInspectionByOrderId", async (orderId, { rejectWithValue }) => {
  try {
    return await inspectionApi.getInspectionByOrderId(orderId);
  } catch (err: unknown) {
    return rejectWithValue(normalizeApiError(err));
  }
});

/**
 * Fetches a single inspection by its unique identifier.
 */
export const fetchInspectionById = createAsyncThunk<
  Inspection,
  string,
  { rejectValue: NormalizedApiError }
>("inspection/fetchInspectionById", async (id, { rejectWithValue }) => {
  try {
    return await inspectionApi.getInspectionById(id);
  } catch (err: unknown) {
    return rejectWithValue(normalizeApiError(err));
  }
});

/**
 * Fetches inspections list matching query filters.
 */
export const fetchInspections = createAsyncThunk<
  Inspection[],
  InspectionFilters | undefined,
  { rejectValue: NormalizedApiError }
>("inspection/fetchInspections", async (filters, { rejectWithValue }) => {
  try {
    return await inspectionApi.getInspections(filters);
  } catch (err: unknown) {
    return rejectWithValue(normalizeApiError(err));
  }
});

/**
 * Creates a new inspection for an order (staff/inspector action).
 */
export const createInspectionThunk = createAsyncThunk<
  Inspection,
  CreateInspectionInput,
  { rejectValue: NormalizedApiError }
>("inspection/createInspection", async (payload, { rejectWithValue }) => {
  try {
    return await inspectionApi.createInspection(payload);
  } catch (err: unknown) {
    return rejectWithValue(normalizeApiError(err));
  }
});

/**
 * Updates a DRAFT inspection (staff/inspector action).
 */
export const updateInspectionThunk = createAsyncThunk<
  Inspection,
  { id: string; payload: UpdateInspectionInput },
  { rejectValue: NormalizedApiError }
>("inspection/updateInspection", async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await inspectionApi.updateInspection(id, payload);
  } catch (err: unknown) {
    return rejectWithValue(normalizeApiError(err));
  }
});

/**
 * Submits a DRAFT inspection, transitioning inspection to SUBMITTED and order to IN_PROCESS.
 */
export const submitInspectionThunk = createAsyncThunk<
  Inspection,
  string,
  { rejectValue: NormalizedApiError }
>("inspection/submitInspection", async (id, { rejectWithValue }) => {
  try {
    return await inspectionApi.submitInspection(id);
  } catch (err: unknown) {
    return rejectWithValue(normalizeApiError(err));
  }
});

export const inspectionSlice = createSlice({
  name: "inspection",
  initialState,
  reducers: {
    setCurrentInspection: (state, action: PayloadAction<Inspection | null>) => {
      state.currentInspection = action.payload;
    },
    clearInspectionErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.submitError = null;
    },
    clearCurrentInspection: (state) => {
      state.currentInspection = null;
    },
    resetInspectionState: () => initialState,
  },
  extraReducers: (builder) => {
    // FETCH BY ORDER ID
    builder.addCase(fetchInspectionByOrderId.pending, (state) => {
      state.isFetchingInspection = true;
      state.error = null;
    });
    builder.addCase(fetchInspectionByOrderId.fulfilled, (state, action) => {
      state.isFetchingInspection = false;
      state.currentInspection = action.payload;
      state.error = null;
      const index = state.inspections.findIndex((i) => i._id === action.payload._id);
      if (index !== -1) {
        state.inspections[index] = action.payload;
      } else {
        state.inspections.push(action.payload);
      }
    });
    builder.addCase(fetchInspectionByOrderId.rejected, (state, action) => {
      state.isFetchingInspection = false;
      state.error = action.payload || defaultError("Failed to fetch order inspection.");
    });

    // FETCH BY ID
    builder.addCase(fetchInspectionById.pending, (state) => {
      state.isFetchingInspection = true;
      state.error = null;
    });
    builder.addCase(fetchInspectionById.fulfilled, (state, action) => {
      state.isFetchingInspection = false;
      state.currentInspection = action.payload;
      state.error = null;
      const index = state.inspections.findIndex((i) => i._id === action.payload._id);
      if (index !== -1) {
        state.inspections[index] = action.payload;
      } else {
        state.inspections.push(action.payload);
      }
    });
    builder.addCase(fetchInspectionById.rejected, (state, action) => {
      state.isFetchingInspection = false;
      state.error = action.payload || defaultError("Failed to fetch inspection.");
    });

    // FETCH LIST
    builder.addCase(fetchInspections.pending, (state) => {
      state.isFetchingInspection = true;
      state.error = null;
    });
    builder.addCase(fetchInspections.fulfilled, (state, action) => {
      state.isFetchingInspection = false;
      state.inspections = action.payload;
      state.error = null;
    });
    builder.addCase(fetchInspections.rejected, (state, action) => {
      state.isFetchingInspection = false;
      state.error = action.payload || defaultError("Failed to retrieve inspections list.");
    });

    // CREATE
    builder.addCase(createInspectionThunk.pending, (state) => {
      state.isCreatingInspection = true;
      state.createError = null;
    });
    builder.addCase(createInspectionThunk.fulfilled, (state, action) => {
      state.isCreatingInspection = false;
      state.createError = null;
      state.currentInspection = action.payload;
      state.inspections.unshift(action.payload);
    });
    builder.addCase(createInspectionThunk.rejected, (state, action) => {
      state.isCreatingInspection = false;
      state.createError = action.payload || defaultError("Failed to create inspection.");
    });

    // UPDATE
    builder.addCase(updateInspectionThunk.pending, (state) => {
      state.isUpdatingInspection = true;
      state.updateError = null;
    });
    builder.addCase(updateInspectionThunk.fulfilled, (state, action) => {
      state.isUpdatingInspection = false;
      state.updateError = null;
      state.currentInspection = action.payload;
      const index = state.inspections.findIndex((i) => i._id === action.payload._id);
      if (index !== -1) {
        state.inspections[index] = action.payload;
      }
    });
    builder.addCase(updateInspectionThunk.rejected, (state, action) => {
      state.isUpdatingInspection = false;
      state.updateError = action.payload || defaultError("Failed to update inspection.");
    });

    // SUBMIT
    builder.addCase(submitInspectionThunk.pending, (state) => {
      state.isSubmittingInspection = true;
      state.submitError = null;
    });
    builder.addCase(submitInspectionThunk.fulfilled, (state, action) => {
      state.isSubmittingInspection = false;
      state.submitError = null;
      state.currentInspection = action.payload;
      const index = state.inspections.findIndex((i) => i._id === action.payload._id);
      if (index !== -1) {
        state.inspections[index] = action.payload;
      }
    });
    builder.addCase(submitInspectionThunk.rejected, (state, action) => {
      state.isSubmittingInspection = false;
      state.submitError = action.payload || defaultError("Failed to submit inspection.");
    });

    // LOGOUT RESET
    builder.addCase(logoutUser.fulfilled, () => initialState);
    builder.addCase(logoutSuccess, () => initialState);
  },
});

export const {
  setCurrentInspection,
  clearInspectionErrors,
  clearCurrentInspection,
  resetInspectionState,
} = inspectionSlice.actions;

export default inspectionSlice.reducer;
