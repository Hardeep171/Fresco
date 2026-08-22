import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Order, CreateOrderInput, OrderFilters } from "../../types/order.types";
import { orderApi } from "../../api/order.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";
import { setCart } from "./cartSlice";

import { OrderFilterTab } from "../../constants/order.constants";

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  createdOrder: Order | null;
  isLoading: boolean; // Backwards compatible general loading flag
  isFetchingOrders: boolean;
  isFetchingDetails: boolean;
  isCancellingOrder: boolean;
  isPlacingOrder: boolean;
  error: NormalizedApiError | null; // Backwards compatible general error flag
  ordersError: NormalizedApiError | null;
  detailsError: NormalizedApiError | null;
  cancelError: NormalizedApiError | null;
  placeOrderError: NormalizedApiError | null;
  cancelSuccess: boolean;
  placeOrderSuccess: boolean;
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
  selectedStatusFilter: "ALL",
};



/**
 * Async thunk to create a new order from active cart snapshot.
 * Automatically clears the user's cart in Redux upon backend success.
 */
export const createOrder = createAsyncThunk<
  Order,
  CreateOrderInput,
  { rejectValue: NormalizedApiError }
>("order/createOrder", async (input, { dispatch, rejectWithValue }) => {
  try {
    const order = await orderApi.createOrder(input);
    // Backend automatically clears cart on order creation, synchronize Redux cart:
    dispatch(
      setCart({
        _id: "",
        userId: order.userId,
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

/**
 * Async thunk to fetch user's order history.
 */
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

/**
 * Async thunk to fetch a single order by ID.
 */
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

/**
 * Async thunk to cancel an order by ID.
 */
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
    },

  },
  extraReducers: (builder) => {
    // CREATE ORDER
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

    // FETCH USER ORDERS
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

    // FETCH ORDER BY ID
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

    // CANCEL ORDER
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
  },
});

export const {
  setCurrentOrder,
  clearCreatedOrder,
  setSelectedStatusFilter,
  clearCancelState,
  clearDetailsError,
  clearOrderErrors,
} = orderSlice.actions;

export default orderSlice.reducer;

