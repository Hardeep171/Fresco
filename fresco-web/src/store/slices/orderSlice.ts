import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Order, CreateOrderInput, OrderFilters } from "../../types/order.types";
import { orderApi } from "../../api/order.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";
import { setCart } from "./cartSlice";
import { logoutUser, logoutSuccess } from "./authSlice";
import { OrderFilterTab } from "../../constants/order.constants";

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  createdOrder: Order | null;
  isLoading: boolean;
  isFetchingOrders: boolean;
  isFetchingDetails: boolean;
  isCancellingOrder: boolean;
  isPlacingOrder: boolean;
  error: NormalizedApiError | null;
  ordersError: NormalizedApiError | null;
  detailsError: NormalizedApiError | null;
  cancelError: NormalizedApiError | null;
  placeOrderError: NormalizedApiError | null;
  cancelSuccess: boolean;
  placeOrderSuccess: boolean;
  isUpdatingStatus: boolean;
  updateStatusError: NormalizedApiError | null;
  updateStatusSuccess: boolean;
  selectedStatusFilter: OrderFilterTab;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  createdOrder: null,
  isLoading: false,
  isFetchingOrders: false,
  isFetchingDetails: false,
  isCancellingOrder: false,
  isPlacingOrder: false,
  error: null,
  ordersError: null,
  detailsError: null,
  cancelError: null,
  placeOrderError: null,
  cancelSuccess: false,
  placeOrderSuccess: false,
  isUpdatingStatus: false,
  updateStatusError: null,
  updateStatusSuccess: false,
  selectedStatusFilter: "ALL",
};

export const createOrder = createAsyncThunk<
  Order,
  CreateOrderInput,
  { rejectValue: NormalizedApiError }
>("order/createOrder", async (input, { dispatch, rejectWithValue }) => {
  try {
    const order = await orderApi.createOrder(input);
    dispatch(
      setCart({
        _id: "",
        userId: typeof order.userId === "object" ? order.userId._id : order.userId,
        items: [],
        totalAmount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
    return order;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const fetchUserOrders = createAsyncThunk<
  Order[],
  OrderFilters | undefined,
  { rejectValue: NormalizedApiError }
>("order/fetchUserOrders", async (filters, { rejectWithValue }) => {
  try {
    const orders = await orderApi.getUserOrders(filters);
    return orders;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const fetchAllOrders = createAsyncThunk<
  Order[],
  OrderFilters | undefined,
  { rejectValue: NormalizedApiError }
>("order/fetchAllOrders", async (filters, { rejectWithValue }) => {
  try {
    const orders = await orderApi.getAllOrders(filters);
    return orders;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const fetchOrderById = createAsyncThunk<
  Order,
  string,
  { rejectValue: NormalizedApiError }
>("order/fetchOrderById", async (id, { rejectWithValue }) => {
  try {
    const order = await orderApi.getOrderById(id);
    return order;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const cancelUserOrder = createAsyncThunk<
  Order,
  string,
  { rejectValue: NormalizedApiError }
>("order/cancelUserOrder", async (id, { rejectWithValue }) => {
  try {
    const order = await orderApi.cancelOrder(id);
    return order;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const updateOrderStatusAction = createAsyncThunk<
  Order,
  { id: string; status: string },
  { rejectValue: NormalizedApiError }
>("order/updateOrderStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const order = await orderApi.updateOrderStatus(id, status);
    return order;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const updatePaymentStatusAction = createAsyncThunk<
  Order,
  { id: string; paymentStatus: string },
  { rejectValue: NormalizedApiError }
>("order/updatePaymentStatus", async ({ id, paymentStatus }, { rejectWithValue }) => {
  try {
    const order = await orderApi.updatePaymentStatus(id, paymentStatus);
    return order;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    clearCreatedOrder: (state) => {
      state.createdOrder = null;
      state.placeOrderSuccess = false;
    },
    setSelectedStatusFilter: (
      state,
      action: PayloadAction<OrderFilterTab>
    ) => {
      state.selectedStatusFilter = action.payload;
    },
    clearCancelState: (state) => {
      state.cancelError = null;
      state.cancelSuccess = false;
    },
    clearDetailsError: (state) => {
      state.detailsError = null;
    },
    clearOrderErrors: (state) => {
      state.error = null;
      state.ordersError = null;
      state.placeOrderError = null;
      state.detailsError = null;
      state.cancelError = null;
      state.updateStatusError = null;
    },
    clearUpdateStatusState: (state) => {
      state.isUpdatingStatus = false;
      state.updateStatusError = null;
      state.updateStatusSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createOrder.pending, (state) => {
      state.isPlacingOrder = true;
      state.placeOrderError = null;
      state.placeOrderSuccess = false;
    });
    builder.addCase(createOrder.fulfilled, (state, action) => {
      state.createdOrder = action.payload;
      state.currentOrder = action.payload;
      state.orders.unshift(action.payload);
      state.isPlacingOrder = false;
      state.placeOrderSuccess = true;
      state.placeOrderError = null;
    });
    builder.addCase(createOrder.rejected, (state, action) => {
      state.isPlacingOrder = false;
      state.placeOrderSuccess = false;
      state.placeOrderError = action.payload || null;
    });

    builder.addCase(fetchUserOrders.pending, (state) => {
      state.isFetchingOrders = true;
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUserOrders.fulfilled, (state, action) => {
      state.orders = action.payload;
      state.isFetchingOrders = false;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchUserOrders.rejected, (state, action) => {
      state.isFetchingOrders = false;
      state.isLoading = false;
      state.error = action.payload || null;
    });

    builder.addCase(fetchAllOrders.pending, (state) => {
      state.isFetchingOrders = true;
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAllOrders.fulfilled, (state, action) => {
      state.orders = action.payload;
      state.isFetchingOrders = false;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchAllOrders.rejected, (state, action) => {
      state.isFetchingOrders = false;
      state.isLoading = false;
      state.error = action.payload || null;
    });

    builder.addCase(fetchOrderById.pending, (state) => {
      state.isFetchingDetails = true;
      state.isLoading = true;
      state.detailsError = null;
      state.error = null;
    });
    builder.addCase(fetchOrderById.fulfilled, (state, action) => {
      state.currentOrder = action.payload;
      const index = state.orders.findIndex((o) => o._id === action.payload._id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      state.isFetchingDetails = false;
      state.isLoading = false;
      state.detailsError = null;
      state.error = null;
    });
    builder.addCase(fetchOrderById.rejected, (state, action) => {
      state.isFetchingDetails = false;
      state.isLoading = false;
      state.detailsError = action.payload || null;
      state.error = action.payload || null;
    });

    builder.addCase(cancelUserOrder.pending, (state) => {
      state.isCancellingOrder = true;
      state.isLoading = true;
      state.cancelError = null;
      state.error = null;
      state.cancelSuccess = false;
    });
    builder.addCase(cancelUserOrder.fulfilled, (state, action) => {
      state.currentOrder = action.payload;
      const index = state.orders.findIndex((o) => o._id === action.payload._id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      state.isCancellingOrder = false;
      state.isLoading = false;
      state.cancelSuccess = true;
      state.cancelError = null;
      state.error = null;
    });
    builder.addCase(cancelUserOrder.rejected, (state, action) => {
      state.isCancellingOrder = false;
      state.isLoading = false;
      state.cancelSuccess = false;
      state.cancelError = action.payload || null;
      state.error = action.payload || null;
    });

    builder.addCase(updateOrderStatusAction.pending, (state) => {
      state.isUpdatingStatus = true;
      state.updateStatusError = null;
      state.updateStatusSuccess = false;
    });
    builder.addCase(updateOrderStatusAction.fulfilled, (state, action) => {
      state.isUpdatingStatus = false;
      state.updateStatusSuccess = true;
      state.updateStatusError = null;
      state.currentOrder = action.payload;
      const index = state.orders.findIndex((o) => o._id === action.payload._id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    });
    builder.addCase(updateOrderStatusAction.rejected, (state, action) => {
      state.isUpdatingStatus = false;
      state.updateStatusSuccess = false;
      state.updateStatusError = action.payload || null;
      state.error = action.payload || null;
    });

    builder.addCase(updatePaymentStatusAction.fulfilled, (state, action) => {
      state.currentOrder = action.payload;
      const index = state.orders.findIndex((o) => o._id === action.payload._id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    });

    builder.addCase(logoutUser.fulfilled, () => initialState);
    builder.addCase(logoutSuccess, () => initialState);
  },
});

export const {
  setCurrentOrder,
  clearCreatedOrder,
  setSelectedStatusFilter,
  clearCancelState,
  clearDetailsError,
  clearOrderErrors,
  clearUpdateStatusState,
} = orderSlice.actions;

export default orderSlice.reducer;
