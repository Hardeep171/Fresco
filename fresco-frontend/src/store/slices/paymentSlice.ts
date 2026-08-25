import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import {
  Payment,
  CreatePaymentInput,
  RetryPaymentInput,
  RefundTransaction,
} from "../../types/payment.types";
import { paymentApi } from "../../api/payment.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";
import { logoutUser } from "./authSlice";

export interface PaymentState {
  currentPayment: Payment | null;
  payments: Payment[];
  refunds: RefundTransaction[];
  isLoading: boolean;
  isFetchingPayment: boolean;
  isFetchingPayments: boolean;
  isRecordingPayment: boolean;
  isRetryingPayment: boolean;
  isFetchingRefunds: boolean;
  error: NormalizedApiError | null;
  recordError: NormalizedApiError | null;
  retryError: NormalizedApiError | null;
  refundsError: NormalizedApiError | null;
  recordSuccess: boolean;
  retrySuccess: boolean;
}

const initialState: PaymentState = {
  currentPayment: null,
  payments: [],
  refunds: [],
  isLoading: false,
  isFetchingPayment: false,
  isFetchingPayments: false,
  isRecordingPayment: false,
  isRetryingPayment: false,
  isFetchingRefunds: false,
  error: null,
  recordError: null,
  retryError: null,
  refundsError: null,
  recordSuccess: false,
  retrySuccess: false,
};

/**
 * Async thunk to retrieve a payment by associated Order ID.
 */
export const fetchPaymentByOrderId = createAsyncThunk<
  Payment,
  string,
  { rejectValue: NormalizedApiError }
>("payment/fetchPaymentByOrderId", async (orderId, { rejectWithValue }) => {
  try {
    const payment = await paymentApi.getPaymentByOrderId(orderId);
    return payment;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to retrieve a payment by its Payment ID.
 */
export const fetchPaymentById = createAsyncThunk<
  Payment,
  string,
  { rejectValue: NormalizedApiError }
>("payment/fetchPaymentById", async (paymentId, { rejectWithValue }) => {
  try {
    const payment = await paymentApi.getPaymentById(paymentId);
    return payment;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to retrieve all payments for the authenticated customer.
 */
export const fetchCustomerPayments = createAsyncThunk<
  Payment[],
  void,
  { rejectValue: NormalizedApiError }
>("payment/fetchCustomerPayments", async (_, { rejectWithValue }) => {
  try {
    const payments = await paymentApi.getCustomerPayments();
    return payments;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to retrieve refund transaction history for a payment.
 */
export const fetchPaymentRefunds = createAsyncThunk<
  RefundTransaction[],
  string,
  { rejectValue: NormalizedApiError }
>("payment/fetchPaymentRefunds", async (paymentId, { rejectWithValue }) => {
  try {
    const refunds = await paymentApi.getPaymentRefunds(paymentId);
    return refunds;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk for customer to create or initialize a payment record for an order.
 */
export const recordPaymentThunk = createAsyncThunk<
  Payment,
  CreatePaymentInput,
  { rejectValue: NormalizedApiError }
>("payment/recordPayment", async (input, { rejectWithValue }) => {
  try {
    const payment = await paymentApi.createPayment(input);
    return payment;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk for customer to retry a failed payment attempt.
 */
export const retryPaymentThunk = createAsyncThunk<
  Payment,
  { paymentId: string; data: RetryPaymentInput },
  { rejectValue: NormalizedApiError }
>("payment/retryPayment", async ({ paymentId, data }, { rejectWithValue }) => {
  try {
    const payment = await paymentApi.retryPayment(paymentId, data);
    return payment;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setCurrentPayment: (state, action: PayloadAction<Payment | null>) => {
      state.currentPayment = action.payload;
    },
    clearPaymentErrors: (state) => {
      state.error = null;
      state.recordError = null;
      state.retryError = null;
      state.refundsError = null;
    },
    clearPaymentSuccess: (state) => {
      state.recordSuccess = false;
      state.retrySuccess = false;
    },
    resetPaymentState: () => initialState,
  },
  extraReducers: (builder) => {
    // FETCH PAYMENT BY ORDER ID
    builder.addCase(fetchPaymentByOrderId.pending, (state) => {
      state.isFetchingPayment = true;
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPaymentByOrderId.fulfilled, (state, action) => {
      state.currentPayment = action.payload;
      if (action.payload.refunds) {
        state.refunds = action.payload.refunds;
      }
      const index = state.payments.findIndex(
        (p) => p._id === action.payload._id
      );
      if (index !== -1) {
        state.payments[index] = action.payload;
      } else {
        state.payments.unshift(action.payload);
      }
      state.isFetchingPayment = false;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchPaymentByOrderId.rejected, (state, action) => {
      state.isFetchingPayment = false;
      state.isLoading = false;
      state.error = action.payload || null;
    });

    // FETCH PAYMENT BY ID
    builder.addCase(fetchPaymentById.pending, (state) => {
      state.isFetchingPayment = true;
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPaymentById.fulfilled, (state, action) => {
      state.currentPayment = action.payload;
      if (action.payload.refunds) {
        state.refunds = action.payload.refunds;
      }
      const index = state.payments.findIndex(
        (p) => p._id === action.payload._id
      );
      if (index !== -1) {
        state.payments[index] = action.payload;
      } else {
        state.payments.unshift(action.payload);
      }
      state.isFetchingPayment = false;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchPaymentById.rejected, (state, action) => {
      state.isFetchingPayment = false;
      state.isLoading = false;
      state.error = action.payload || null;
    });

    // FETCH CUSTOMER PAYMENTS
    builder.addCase(fetchCustomerPayments.pending, (state) => {
      state.isFetchingPayments = true;
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCustomerPayments.fulfilled, (state, action) => {
      state.payments = action.payload;
      state.isFetchingPayments = false;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchCustomerPayments.rejected, (state, action) => {
      state.isFetchingPayments = false;
      state.isLoading = false;
      state.error = action.payload || null;
    });

    // FETCH PAYMENT REFUNDS
    builder.addCase(fetchPaymentRefunds.pending, (state) => {
      state.isFetchingRefunds = true;
      state.refundsError = null;
    });
    builder.addCase(fetchPaymentRefunds.fulfilled, (state, action) => {
      state.refunds = action.payload;
      if (state.currentPayment) {
        state.currentPayment.refunds = action.payload;
      }
      state.isFetchingRefunds = false;
      state.refundsError = null;
    });
    builder.addCase(fetchPaymentRefunds.rejected, (state, action) => {
      state.isFetchingRefunds = false;
      state.refundsError = action.payload || null;
    });

    // RECORD PAYMENT
    builder.addCase(recordPaymentThunk.pending, (state) => {
      state.isRecordingPayment = true;
      state.recordError = null;
      state.recordSuccess = false;
    });
    builder.addCase(recordPaymentThunk.fulfilled, (state, action) => {
      state.currentPayment = action.payload;
      const index = state.payments.findIndex(
        (p) => p._id === action.payload._id
      );
      if (index !== -1) {
        state.payments[index] = action.payload;
      } else {
        state.payments.unshift(action.payload);
      }
      state.isRecordingPayment = false;
      state.recordSuccess = true;
      state.recordError = null;
    });
    builder.addCase(recordPaymentThunk.rejected, (state, action) => {
      state.isRecordingPayment = false;
      state.recordSuccess = false;
      state.recordError = action.payload || null;
    });

    // RETRY PAYMENT
    builder.addCase(retryPaymentThunk.pending, (state) => {
      state.isRetryingPayment = true;
      state.retryError = null;
      state.retrySuccess = false;
    });
    builder.addCase(retryPaymentThunk.fulfilled, (state, action) => {
      state.currentPayment = action.payload;
      const index = state.payments.findIndex(
        (p) => p._id === action.payload._id
      );
      if (index !== -1) {
        state.payments[index] = action.payload;
      }
      state.isRetryingPayment = false;
      state.retrySuccess = true;
      state.retryError = null;
    });
    builder.addCase(retryPaymentThunk.rejected, (state, action) => {
      state.isRetryingPayment = false;
      state.retrySuccess = false;
      state.retryError = action.payload || null;
    });

    // LOGOUT RESET
    builder.addCase(logoutUser.fulfilled, () => initialState);
  },
});

export const {
  setCurrentPayment,
  clearPaymentErrors,
  clearPaymentSuccess,
  resetPaymentState,
} = paymentSlice.actions;

export default paymentSlice.reducer;
