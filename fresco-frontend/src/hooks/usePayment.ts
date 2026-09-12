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
  reportPaymentCollectedThunk,
  verifyPaymentThunk,
  setCurrentPayment,
  clearPaymentErrors,
  clearPaymentSuccess,
  resetPaymentState,
} from "../store/slices/paymentSlice";
import {
  Payment,
  CreatePaymentInput,
  RetryPaymentInput,
  ReportPaymentCollectedInput,
  VerifyPaymentInput,
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
    isReportingPayment,
    isVerifyingPayment,
    isFetchingRefunds,
    error,
    recordError,
    retryError,
    reportPaymentError,
    verifyPaymentError,
    refundsError,
    recordSuccess,
    retrySuccess,
    reportPaymentSuccess,
    verifyPaymentSuccess,
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

  const reportPaymentCollected = useCallback(
    async (paymentIdOrOrderId: string, data: ReportPaymentCollectedInput) => {
      const result = await dispatch(
        reportPaymentCollectedThunk({ paymentIdOrOrderId, data })
      );
      if (reportPaymentCollectedThunk.fulfilled.match(result)) {
        return result.payload;
      }
      return null;
    },
    [dispatch]
  );

  const verifyPayment = useCallback(
    async (paymentIdOrOrderId: string, data?: VerifyPaymentInput) => {
      const result = await dispatch(
        verifyPaymentThunk({ paymentIdOrOrderId, data })
      );
      if (verifyPaymentThunk.fulfilled.match(result)) {
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
    isReportingPayment,
    isVerifyingPayment,
    isFetchingRefunds,
    error,
    recordError,
    retryError,
    reportPaymentError,
    verifyPaymentError,
    refundsError,
    recordSuccess,
    retrySuccess,
    reportPaymentSuccess,
    verifyPaymentSuccess,

    loadPaymentByOrderId,
    loadPaymentById,
    loadCustomerPayments,
    loadPaymentRefunds,
    recordPayment,
    retryPayment,
    reportPaymentCollected,
    verifyPayment,
    selectPayment,
    clearErrors,
    clearSuccess,
    resetPayment,
  };
}
