import { apiClient } from "./client";
import {
  Payment,
  CreatePaymentInput,
  RetryPaymentInput,
  PaymentFilters,
  RefundTransaction,
  ReportPaymentCollectedInput,
  VerifyPaymentInput,
} from "../types/payment.types";
import { ApiResponse } from "../types/api.types";

export const paymentApi = {
  async createPayment(data: CreatePaymentInput): Promise<Payment> {
    const response = await apiClient.post<ApiResponse<{ payment: Payment }>>(
      "/payments",
      data
    );
    return response.data.data.payment;
  },

  async getPaymentByOrderId(orderId: string): Promise<Payment> {
    const response = await apiClient.get<ApiResponse<{ payment: Payment }>>(
      `/payments/order/${orderId}`
    );
    return response.data.data.payment;
  },

  async getPaymentById(id: string): Promise<Payment> {
    const response = await apiClient.get<ApiResponse<{ payment: Payment }>>(
      `/payments/${id}`
    );
    return response.data.data.payment;
  },

  async getCustomerPayments(): Promise<Payment[]> {
    const response = await apiClient.get<ApiResponse<{ payments: Payment[] }>>(
      "/payments/customer"
    );
    return response.data.data.payments;
  },

  async getPaymentRefunds(paymentId: string): Promise<RefundTransaction[]> {
    const response = await apiClient.get<
      ApiResponse<{ refunds: RefundTransaction[] }>
    >(`/payments/${paymentId}/refunds`);
    return response.data.data.refunds;
  },

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

  async getPayments(filters?: PaymentFilters): Promise<Payment[]> {
    const response = await apiClient.get<ApiResponse<{ payments: Payment[] }>>(
      "/payments",
      { params: filters }
    );
    return response.data.data.payments;
  },

  async reportPaymentCollected(
    paymentIdOrOrderId: string,
    data: ReportPaymentCollectedInput
  ): Promise<Payment> {
    const endpoint = paymentIdOrOrderId
      ? `/payments/${paymentIdOrOrderId}/report-collected`
      : `/payments/report-collected`;
    const response = await apiClient.post<ApiResponse<{ payment: Payment }>>(
      endpoint,
      data
    );
    return response.data.data.payment;
  },

  async verifyPayment(
    paymentIdOrOrderId: string,
    data?: VerifyPaymentInput
  ): Promise<Payment> {
    const response = await apiClient.post<ApiResponse<{ payment: Payment }>>(
      `/payments/${paymentIdOrOrderId}/verify`,
      data || {}
    );
    return response.data.data.payment;
  },
};
