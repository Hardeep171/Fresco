import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { deliveryTaskApi } from "../../api/delivery-task.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";
import { DeliveryTask } from "../../types/delivery-task.types";
import { TaskFilterTab } from "../../constants/delivery-task.constants";
import { logoutUser, logoutSuccess } from "./authSlice";


export interface DeliveryTaskState {
  tasks: DeliveryTask[];
  selectedTask: DeliveryTask | null;
  isFetchingTasks: boolean;
  error: NormalizedApiError | null;
  selectedStatusFilter: TaskFilterTab;
}

const initialState: DeliveryTaskState = {
  tasks: [],
  selectedTask: null,
  isFetchingTasks: false,
  error: null,
  selectedStatusFilter: "ALL",
};

/**
 * Fetches all delivery tasks belonging to the authenticated delivery partner.
 */
export const fetchPartnerTasks = createAsyncThunk<
  DeliveryTask[],
  void,
  { rejectValue: NormalizedApiError }
>("deliveryTask/fetchPartnerTasks", async (_, { rejectWithValue }) => {
  try {
    return await deliveryTaskApi.getPartnerTasks();
  } catch (err: unknown) {
    return rejectWithValue(normalizeApiError(err));
  }
});

export const deliveryTaskSlice = createSlice({
  name: "deliveryTask",
  initialState,
  reducers: {
    setSelectedTask: (state, action: PayloadAction<DeliveryTask | null>) => {
      state.selectedTask = action.payload;
    },
    setTaskStatusFilter: (state, action: PayloadAction<TaskFilterTab>) => {
      state.selectedStatusFilter = action.payload;
    },
    clearTaskErrors: (state) => {
      state.error = null;
    },
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    },
    resetDeliveryTaskState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPartnerTasks.pending, (state) => {
      state.isFetchingTasks = true;
      state.error = null;
    });
    builder.addCase(fetchPartnerTasks.fulfilled, (state, action) => {
      state.isFetchingTasks = false;
      state.tasks = action.payload;
      state.error = null;
      if (state.selectedTask) {
        const fresh = action.payload.find((t) => t._id === state.selectedTask?._id);
        if (fresh) state.selectedTask = fresh;
      }
    });
    builder.addCase(fetchPartnerTasks.rejected, (state, action) => {
      state.isFetchingTasks = false;
      state.error = action.payload || {
        kind: "SERVER_ERROR",
        statusCode: 500,
        message: "Failed to retrieve delivery tasks.",
        rawErrors: [],
        isNetworkError: false,
        isTimeout: false,
        isAuthError: false,
      };
    });


    // LOGOUT RESET
    builder.addCase(logoutUser.fulfilled, () => initialState);
    builder.addCase(logoutSuccess, () => initialState);
  },
});


export const {
  setSelectedTask,
  setTaskStatusFilter,
  clearTaskErrors,
  clearSelectedTask,
  resetDeliveryTaskState,
} = deliveryTaskSlice.actions;

export default deliveryTaskSlice.reducer;
