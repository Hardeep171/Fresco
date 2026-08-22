import { PaymentMethod, RefundStatus } from "../constants/payment.constants";
import { PaymentStatus } from "../constants/order.constants";

export interface RefundTransaction {
  _id: string;
  refundId: string;
  amount: number;
  reason?: string;
  status: RefundStatus;
  createdAt: string;
}

export interface Payment {
  _id: string;
  orderId: string;
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  collectedBy?: string;
  collectedAt?: string;
  failureReason?: string;
  refundedAmount: number;
  refunds: RefundTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  orderId: string;
  paymentMethod: PaymentMethod;
}

export interface RetryPaymentInput {
  paymentMethod?: PaymentMethod;
}
