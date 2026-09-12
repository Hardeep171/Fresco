import { PaymentMethod, RefundStatus } from "../constants/payment.constants";
import { PaymentStatus } from "../constants/order.constants";

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

export interface Payment {
  _id: string;
  orderId: string | any;
  customerId?: string | any;
  receivedByPartnerId?: any;
  collectedBy?: any;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  receivedAt?: string;
  collectionReported?: boolean;
  collectedByPartnerId?: any;
  collectedAt?: string;
  verificationStatus?: "NOT_REQUESTED" | "PENDING" | "VERIFIED" | "REJECTED" | string;
  verifiedByAdminId?: any;
  verifiedBy?: any;
  verifiedAt?: string;
  collectionNotes?: string;
  notes?: string;
  refunds: RefundTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  orderId: string;
  paymentMethod: PaymentMethod;
}

export interface ReportPaymentCollectedInput {
  orderId?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  transactionReference?: string;
  amount?: number;
}

export interface VerifyPaymentInput {
  orderId?: string;
  notes?: string;
  verificationStatus?: string;
}

export interface RetryPaymentInput {
  paymentMethod: PaymentMethod;
}

export interface PaymentFilters {
  orderId?: string;
  customerId?: string;
  status?: PaymentStatus;
  verificationStatus?: string;
}
