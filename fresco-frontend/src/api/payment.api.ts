import { apiClient } from "./client";
import {
  Payment,
  CreatePaymentInput,
  RetryPaymentInput,
  PaymentFilters,
  RefundTransaction,
} from "../types/payment.types";
import { ApiResponse } from "../types/api.types";

/**
 * Payment API service strictly conforming to FRESCO backend Payment & Refund endpoints.
 * Base URL prefix: /payments
 */
export const paymentApi = {
  /**
   * Create or initialize a new payment for an order (customer operation).
   * Backend endpoint: POST /api/v1/payments
   */
  async createPayment(data: CreatePaymentInput): Promise<Payment> {
    const response = await apiClient.post<ApiResponse<{ payment: Payment }>>(
      "/payments",
      data
    );
    return response.data.data.payment;
  },

  /**
   * Retrieve payment record associated with a specific order ID.
   * Backend endpoint: GET /api/v1/payments/order/:orderId
   */
  async getPaymentByOrderId(orderId: string): Promise<Payment> {
    const response = await apiClient.get<ApiResponse<{ payment: Payment }>>(
      `/payments/order/${orderId}`
    );
    return response.data.data.payment;
  },

  /**
   * Retrieve a single payment by ID.
   * Backend endpoint: GET /api/v1/payments/:id
   */
  async getPaymentById(id: string): Promise<Payment> {
    const response = await apiClient.get<ApiResponse<{ payment: Payment }>>(
      `/payments/${id}`
    );
    return response.data.data.payment;
  },

  /**
   * Retrieve all payment records for the authenticated customer.
   * Backend endpoint: GET /api/v1/payments/customer
   */
  async getCustomerPayments(): Promise<Payment[]> {
    const response = await apiClient.get<ApiResponse<{ payments: Payment[] }>>(
      "/payments/customer"
    );
    return response.data.data.payments;
  },

  /**
   * Retrieve refund transaction history for a payment by ID.
   * Backend endpoint: GET /api/v1/payments/:id/refunds
   */
  async getPaymentRefunds(paymentId: string): Promise<RefundTransaction[]> {
    const response = await apiClient.get<
      ApiResponse<{ refunds: RefundTransaction[] }>
    >(`/payments/${paymentId}/refunds`);
    return response.data.data.refunds;
  },

  /**
   * Retry a failed payment attempt (customer operation).
   * Backend endpoint: POST /api/v1/payments/:id/retry
   */
  async retryPayment(
    paymentId: string,
    data: RetryPaymentInput
  ): Promise<Payment> {
    const response = await apiClient.post<ApiResponse<{ payment: Payment }>>(
      `/payments/${paymentId}/retry`,
      data
    );
    return response.data.data.payment;
  },

  /**
   * Query payments with filters (staff/admin or general filter if authorized).
   * Backend endpoint: GET /api/v1/payments
   */
  async getPayments(filters?: PaymentFilters): Promise<Payment[]> {
    const response = await apiClient.get<ApiResponse<{ payments: Payment[] }>>(
      "/payments",
      { params: filters }
    );
    return response.data.data.payments;
  },
};
