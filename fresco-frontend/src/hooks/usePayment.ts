import { useCallback } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  fetchPaymentByOrderId,
  fetchPaymentById,
  fetchCustomerPayments,
  fetchPaymentRefunds,
  recordPaymentThunk,
  retryPaymentThunk,
  setCurrentPayment,
  clearPaymentErrors,
  clearPaymentSuccess,
  resetPaymentState,
} from "../store/slices/paymentSlice";
import {
  Payment,
  CreatePaymentInput,
  RetryPaymentInput,
} from "../types/payment.types";

/**
 * Custom hook providing encapsulated access to Payment Redux state and operations.
 * Screens use this hook instead of directly manipulating Redux dispatch logic.
 */
export function usePayment() {
  const dispatch = useAppDispatch();
  const {
    currentPayment,
    payments,
    refunds,
    isLoading,
    isFetchingPayment,
    isFetchingPayments,
    isRecordingPayment,
    isRetryingPayment,
    isFetchingRefunds,
    error,
    recordError,
    retryError,
    refundsError,
    recordSuccess,
    retrySuccess,
  } = useAppSelector((state) => state.payment);

  const loadPaymentByOrderId = useCallback(
    async (orderId: string) => {
      const result = await dispatch(fetchPaymentByOrderId(orderId));
      if (fetchPaymentByOrderId.fulfilled.match(result)) {
        return result.payload;
      }
      return null;
    },
    [dispatch]
  );

  const loadPaymentById = useCallback(
    async (paymentId: string) => {
      const result = await dispatch(fetchPaymentById(paymentId));
      if (fetchPaymentById.fulfilled.match(result)) {
        return result.payload;
      }
      return null;
    },
    [dispatch]
  );

  const loadCustomerPayments = useCallback(async () => {
    const result = await dispatch(fetchCustomerPayments());
    return fetchCustomerPayments.fulfilled.match(result);
  }, [dispatch]);

  const loadPaymentRefunds = useCallback(
    async (paymentId: string) => {
      const result = await dispatch(fetchPaymentRefunds(paymentId));
      if (fetchPaymentRefunds.fulfilled.match(result)) {
        return result.payload;
      }
      return [];
    },
    [dispatch]
  );

  const recordPayment = useCallback(
    async (input: CreatePaymentInput) => {
      const result = await dispatch(recordPaymentThunk(input));
      if (recordPaymentThunk.fulfilled.match(result)) {
        return result.payload;
      }
      return null;
    },
    [dispatch]
  );

  const retryPayment = useCallback(
    async (paymentId: string, data: RetryPaymentInput) => {
      const result = await dispatch(
        retryPaymentThunk({ paymentId, data })
      );
      if (retryPaymentThunk.fulfilled.match(result)) {
        return result.payload;
      }
      return null;
    },
    [dispatch]
  );

  const selectPayment = useCallback(
    (payment: Payment | null) => {
      dispatch(setCurrentPayment(payment));
    },
    [dispatch]
  );

  const clearErrors = useCallback(() => {
    dispatch(clearPaymentErrors());
  }, [dispatch]);

  const clearSuccess = useCallback(() => {
    dispatch(clearPaymentSuccess());
  }, [dispatch]);

  const resetPayment = useCallback(() => {
    dispatch(resetPaymentState());
  }, [dispatch]);

  return {
    currentPayment,
    payments,
    refunds,
    isLoading,
    isFetchingPayment,
    isFetchingPayments,
    isRecordingPayment,
    isRetryingPayment,
    isFetchingRefunds,
    error,
    recordError,
    retryError,
    refundsError,
    recordSuccess,
    retrySuccess,

    loadPaymentByOrderId,
    loadPaymentById,
    loadCustomerPayments,
    loadPaymentRefunds,
    recordPayment,
    retryPayment,
    selectPayment,
    clearErrors,
    clearSuccess,
    resetPayment,
  };
}
