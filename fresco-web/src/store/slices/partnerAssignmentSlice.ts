import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { assignmentApi } from "../../api/assignment.api";
import { orderApi } from "../../api/order.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";
import { Assignment } from "../../types/assignment.types";
import { Order } from "../../types/order.types";
import { AssignmentFilterTab } from "../../constants/assignment.constants";
import { ADMIN_ROLES } from "../../constants/user.constants";
import { logoutUser, logoutSuccess } from "./authSlice";

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

export const fetchPartnerAssignments = createAsyncThunk<
  Assignment[],
  void,
  { rejectValue: NormalizedApiError }
>("partnerAssignment/fetchPartnerAssignments", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const userRole = state?.auth?.user?.role;
    if (userRole && (ADMIN_ROLES as readonly string[]).includes(userRole)) {
      return await assignmentApi.getAllAssignments();
    }
    return await assignmentApi.getPartnerAssignments();
  } catch (err: unknown) {
    return rejectWithValue(normalizeApiError(err));
  }
});

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
    builder.addCase(fetchPartnerAssignments.pending, (state) => {
      state.isFetchingAssignments = true;
      state.error = null;
    });
    builder.addCase(fetchPartnerAssignments.fulfilled, (state, action) => {
      state.isFetchingAssignments = false;
      state.assignments = action.payload;
      state.error = null;
      if (state.selectedAssignment) {
        const fresh = action.payload.find(
          (a) => a._id === state.selectedAssignment?._id
        );
        if (fresh) state.selectedAssignment = fresh;
      }
    });
    builder.addCase(fetchPartnerAssignments.rejected, (state, action) => {
      state.isFetchingAssignments = false;
      state.error = action.payload || null;
    });

    builder.addCase(acceptPartnerAssignment.pending, (state) => {
      state.isAcceptingAssignment = true;
      state.acceptError = null;
    });
    builder.addCase(acceptPartnerAssignment.fulfilled, (state, action) => {
      state.isAcceptingAssignment = false;
      state.acceptError = null;
      state.selectedAssignment = action.payload;

      const index = state.assignments.findIndex((a) => a._id === action.payload._id);
      if (index !== -1) {
        state.assignments[index] = action.payload;
      }
    });
    builder.addCase(acceptPartnerAssignment.rejected, (state, action) => {
      state.isAcceptingAssignment = false;
      state.acceptError = action.payload || null;
    });

    builder.addCase(completePartnerAssignment.pending, (state) => {
      state.isCompletingAssignment = true;
      state.completeError = null;
    });
    builder.addCase(completePartnerAssignment.fulfilled, (state, action) => {
      state.isCompletingAssignment = false;
      state.completeError = null;
      state.selectedAssignment = action.payload;

      const index = state.assignments.findIndex((a) => a._id === action.payload._id);
      if (index !== -1) {
        state.assignments[index] = action.payload;
      }
    });
    builder.addCase(completePartnerAssignment.rejected, (state, action) => {
      state.isCompletingAssignment = false;
      state.completeError = action.payload || null;
    });

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

    builder.addCase(logoutUser.fulfilled, () => initialState);
    builder.addCase(logoutSuccess, () => initialState);
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
