import { PaymentMethod, RefundStatus } from "../constants/payment.constants";
import { PaymentStatus } from "../constants/order.constants";

/**
 * Refund transaction record embedded within a Payment document.
 * Exactly matches backend RefundTransaction schema.
 */
export interface RefundTransaction {
  _id: string;
  amount: number;
  status: RefundStatus;
  processedBy?: string;
  reason?: string;
  processedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Payment entity strictly conforming to FRESCO backend PaymentModel schema.
 */
export interface Payment {
  _id: string;
  orderId: string;
  customerId: string;
  receivedByPartnerId?: any;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  receivedAt?: string;
  collectionReported?: boolean;
  collectedByPartnerId?: any;
  collectedAt?: string;
  verificationStatus?: "NOT_REQUESTED" | "PENDING" | "VERIFIED" | "REJECTED";
  verifiedByAdminId?: any;
  verifiedAt?: string;
  refunds: RefundTransaction[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Input payload for initializing/recording payment (customer operation).
 * POST /api/v1/payments
 */
export interface CreatePaymentInput {
  orderId: string;
  paymentMethod: PaymentMethod;
}

/**
 * Input payload for delivery partner reporting payment collection.
 * POST /api/v1/payments/:id/report-collected or POST /api/v1/payments/report-collected
 */
export interface ReportPaymentCollectedInput {
  orderId?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

/**
 * Input payload for admin payment verification.
 * POST /api/v1/payments/:id/verify
 */
export interface VerifyPaymentInput {
  orderId?: string;
  notes?: string;
}

/**
 * Input payload for retrying a failed payment attempt (customer operation).
 * POST /api/v1/payments/:id/retry
 */
export interface RetryPaymentInput {
  paymentMethod: PaymentMethod;
}

/**
 * Query filter parameters for payments.
 */
export interface PaymentFilters {
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  customerId?: string;
  orderId?: string;
  receivedByPartnerId?: string;
}
