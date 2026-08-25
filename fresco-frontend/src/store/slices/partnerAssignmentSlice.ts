import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { assignmentApi } from "../../api/assignment.api";
import { orderApi } from "../../api/order.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";
import { Assignment } from "../../types/assignment.types";
import { Order } from "../../types/order.types";
import {
  AssignmentFilterTab,
} from "../../constants/assignment.constants";
import { logoutUser } from "./authSlice";


export interface PartnerAssignmentState {
  assignments: Assignment[];
  selectedAssignment: Assignment | null;
  selectedAssignmentOrder: Order | null;
  isFetchingAssignments: boolean;
  isAcceptingAssignment: boolean;
  isCompletingAssignment: boolean;
  isFetchingOrderDetails: boolean;
  error: NormalizedApiError | null;
  acceptError: NormalizedApiError | null;
  completeError: NormalizedApiError | null;
  selectedStatusFilter: AssignmentFilterTab;
}

const initialState: PartnerAssignmentState = {
  assignments: [],
  selectedAssignment: null,
  selectedAssignmentOrder: null,
  isFetchingAssignments: false,
  isAcceptingAssignment: false,
  isCompletingAssignment: false,
  isFetchingOrderDetails: false,
  error: null,
  acceptError: null,
  completeError: null,
  selectedStatusFilter: "ALL",
};

/**
 * Fetches all assignments belonging to the authenticated delivery partner.
 */
export const fetchPartnerAssignments = createAsyncThunk<
  Assignment[],
  void,
  { rejectValue: NormalizedApiError }
>("partnerAssignment/fetchPartnerAssignments", async (_, { rejectWithValue }) => {
  try {
    return await assignmentApi.getPartnerAssignments();
  } catch (err: unknown) {
    return rejectWithValue(normalizeApiError(err));
  }
});

/**
 * Accepts an assigned pickup or delivery task for the delivery partner.
 */
export const acceptPartnerAssignment = createAsyncThunk<
  Assignment,
  string,
  { rejectValue: NormalizedApiError }
>("partnerAssignment/acceptPartnerAssignment", async (assignmentId, { rejectWithValue }) => {
  try {
    return await assignmentApi.acceptAssignment(assignmentId);
  } catch (err: unknown) {
    return rejectWithValue(normalizeApiError(err));
  }
});

/**
 * Completes an accepted pickup or delivery task for the delivery partner.
 */
export const completePartnerAssignment = createAsyncThunk<
  Assignment,
  string,
  { rejectValue: NormalizedApiError }
>("partnerAssignment/completePartnerAssignment", async (assignmentId, { rejectWithValue }) => {
  try {
    return await assignmentApi.completeAssignment(assignmentId);
  } catch (err: unknown) {
    return rejectWithValue(normalizeApiError(err));
  }
});

/**
 * Fetches customer order details associated with an assignment.
 */
export const fetchAssignmentOrderDetails = createAsyncThunk<
  Order,
  string,
  { rejectValue: NormalizedApiError }
>("partnerAssignment/fetchAssignmentOrderDetails", async (orderId, { rejectWithValue }) => {
  try {
    return await orderApi.getOrderById(orderId);
  } catch (err: unknown) {
    return rejectWithValue(normalizeApiError(err));
  }
});

export const partnerAssignmentSlice = createSlice({
  name: "partnerAssignment",
  initialState,
  reducers: {
    setSelectedAssignment: (state, action: PayloadAction<Assignment | null>) => {
      state.selectedAssignment = action.payload;
    },
    setAssignmentStatusFilter: (
      state,
      action: PayloadAction<AssignmentFilterTab>
    ) => {
      state.selectedStatusFilter = action.payload;
    },
    clearAssignmentErrors: (state) => {
      state.error = null;
      state.acceptError = null;
      state.completeError = null;
    },
    clearSelectedAssignment: (state) => {
      state.selectedAssignment = null;
      state.selectedAssignmentOrder = null;
    },
    resetPartnerAssignmentState: () => initialState,
  },
  extraReducers: (builder) => {
    // FETCH ASSIGNMENTS
    builder.addCase(fetchPartnerAssignments.pending, (state) => {
      state.isFetchingAssignments = true;
      state.error = null;
    });
    builder.addCase(fetchPartnerAssignments.fulfilled, (state, action) => {
      state.isFetchingAssignments = false;
      state.assignments = action.payload;
      state.error = null;
      // If an assignment is selected, update it if it's in the fresh list
      if (state.selectedAssignment) {
        const fresh = action.payload.find(
          (a) => a._id === state.selectedAssignment?._id
        );
        if (fresh) state.selectedAssignment = fresh;
      }
    });
    builder.addCase(fetchPartnerAssignments.rejected, (state, action) => {
      state.isFetchingAssignments = false;
      state.error = action.payload || {
        kind: "SERVER_ERROR",
        statusCode: 500,
        message: "Failed to retrieve partner assignments.",
        rawErrors: [],
        isNetworkError: false,
        isTimeout: false,
        isAuthError: false,
      };
    });

    // ACCEPT ASSIGNMENT
    builder.addCase(acceptPartnerAssignment.pending, (state) => {
      state.isAcceptingAssignment = true;
      state.acceptError = null;
    });
    builder.addCase(acceptPartnerAssignment.fulfilled, (state, action) => {
      state.isAcceptingAssignment = false;
      state.acceptError = null;
      state.selectedAssignment = action.payload;

      // Update in assignments array
      const index = state.assignments.findIndex((a) => a._id === action.payload._id);
      if (index !== -1) {
        state.assignments[index] = action.payload;
      }
    });
    builder.addCase(acceptPartnerAssignment.rejected, (state, action) => {
      state.isAcceptingAssignment = false;
      state.acceptError = action.payload || {
        kind: "SERVER_ERROR",
        statusCode: 500,
        message: "Failed to accept assignment.",
        rawErrors: [],
        isNetworkError: false,
        isTimeout: false,
        isAuthError: false,
      };
    });

    // COMPLETE ASSIGNMENT
    builder.addCase(completePartnerAssignment.pending, (state) => {
      state.isCompletingAssignment = true;
      state.completeError = null;
    });
    builder.addCase(completePartnerAssignment.fulfilled, (state, action) => {
      state.isCompletingAssignment = false;
      state.completeError = null;
      state.selectedAssignment = action.payload;

      // Update in assignments array
      const index = state.assignments.findIndex((a) => a._id === action.payload._id);
      if (index !== -1) {
        state.assignments[index] = action.payload;
      }
    });
    builder.addCase(completePartnerAssignment.rejected, (state, action) => {
      state.isCompletingAssignment = false;
      state.completeError = action.payload || {
        kind: "SERVER_ERROR",
        statusCode: 500,
        message: "Failed to complete assignment.",
        rawErrors: [],
        isNetworkError: false,
        isTimeout: false,
        isAuthError: false,
      };
    });


    // FETCH ORDER DETAILS
    builder.addCase(fetchAssignmentOrderDetails.pending, (state) => {
      state.isFetchingOrderDetails = true;
    });
    builder.addCase(fetchAssignmentOrderDetails.fulfilled, (state, action) => {
      state.isFetchingOrderDetails = false;
      state.selectedAssignmentOrder = action.payload;
    });
    builder.addCase(fetchAssignmentOrderDetails.rejected, (state) => {
      state.isFetchingOrderDetails = false;
    });

    // LOGOUT RESET
    builder.addCase(logoutUser.fulfilled, () => initialState);
  },
});


export const {
  setSelectedAssignment,
  setAssignmentStatusFilter,
  clearAssignmentErrors,
  clearSelectedAssignment,
  resetPartnerAssignmentState,
} = partnerAssignmentSlice.actions;

export default partnerAssignmentSlice.reducer;
