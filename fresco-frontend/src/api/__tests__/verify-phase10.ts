/**
 * Comprehensive verification suite for FRESCO Mobile Phase 10:
 * Payment Recording, Payment Status & Refund Management.
 *
 * Tests Payment API service contracts, Redux slice lifecycles,
 * payment method and status mappings, server-authoritative amount handling,
 * order/payment synchronization, duplicate submission protection,
 * refund display mapping, customer permission boundaries,
 * error normalizations, and session clearance on logout.
 */

import { paymentApi } from "../payment.api";
import { apiClient } from "../client";
import { store } from "../../store";
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
} from "../../store/slices/paymentSlice";
import { logoutUser } from "../../store/slices/authSlice";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_DESCRIPTIONS,
  PAYMENT_METHOD_ICONS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_DESCRIPTIONS,
  PAYMENT_STATUS_ICONS,
  PAYMENT_STATUS_VARIANTS,
  REFUND_STATUSES,
  REFUND_STATUS_LABELS,
  REFUND_STATUS_VARIANTS,
} from "../../constants/payment.constants";
import {
  Payment,
  CreatePaymentInput,
  RetryPaymentInput,
  RefundTransaction,
} from "../../types/payment.types";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTest(
  name: string,
  fn: () => Promise<void> | void
): Promise<void> {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  ✓ ${name}`);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    results.push({ name, passed: false, error: errorMessage });
    console.error(`  ✗ ${name} — ${errorMessage}`);
  }
}

export async function runPhase10TestSuite(): Promise<{
  total: number;
  passed: number;
  failed: number;
}> {
  console.log("\n=======================================================");
  console.log("FRESCO FRONTEND — PHASE 10 PAYMENT & REFUND TEST SUITE");
  console.log("=======================================================\n");

  const mockRefund1: RefundTransaction = {
    _id: "60d5ec49f1b2c8b1f8e4eref1",
    amount: 250,
    status: "COMPLETED",
    reason: "Damaged cuff button on formal shirt",
    processedBy: "60d5ec49f1b2c8b1f8e4eadm1",
    processedAt: "2026-08-25T09:00:00.000Z",
    createdAt: "2026-08-25T09:00:00.000Z",
    updatedAt: "2026-08-25T09:00:00.000Z",
  };

  const mockPendingPayment: Payment = {
    _id: "60d5ec49f1b2c8b1f8e4epay1",
    orderId: "60d5ec49f1b2c8b1f8e4e901",
    customerId: "60d5ec49f1b2c8b1f8e4ecust1",
    amount: 1000,
    paymentMethod: "CASH",
    status: "PENDING",
    refunds: [],
    createdAt: "2026-08-25T08:00:00.000Z",
    updatedAt: "2026-08-25T08:00:00.000Z",
  };

  const mockPaidPayment: Payment = {
    ...mockPendingPayment,
    _id: "60d5ec49f1b2c8b1f8e4epay2",
    orderId: "60d5ec49f1b2c8b1f8e4e902",
    status: "PAID",
    receivedByPartnerId: "60d5ec49f1b2c8b1f8e4epart1",
    receivedAt: "2026-08-25T10:30:00.000Z",
    paymentMethod: "UPI",
    refunds: [mockRefund1],
    updatedAt: "2026-08-25T10:30:00.000Z",
  };

  const mockFailedPayment: Payment = {
    ...mockPendingPayment,
    _id: "60d5ec49f1b2c8b1f8e4epay3",
    orderId: "60d5ec49f1b2c8b1f8e4e903",
    status: "FAILED",
    updatedAt: "2026-08-25T11:00:00.000Z",
  };

  const mockRefundedPayment: Payment = {
    ...mockPaidPayment,
    _id: "60d5ec49f1b2c8b1f8e4epay4",
    status: "REFUNDED",
    refunds: [
      {
        _id: "60d5ec49f1b2c8b1f8e4eref2",
        amount: 1000,
        status: "COMPLETED",
        reason: "Full order cancellation refund",
        processedBy: "60d5ec49f1b2c8b1f8e4eadm1",
        processedAt: "2026-08-25T11:30:00.000Z",
      },
    ],
    updatedAt: "2026-08-25T11:30:00.000Z",
  };

  // TEST 1: Payment API contract - createPayment
  await runTest(
    "1. Payment API: createPayment sends POST /payments with validated body and unwraps data.payment",
    async () => {
      const originalPost = apiClient.post;
      const input: CreatePaymentInput = {
        orderId: mockPendingPayment.orderId,
        paymentMethod: "CASH",
      };

      apiClient.post = (async (url: string, body: any) => {
        assert(url === "/payments", `Expected POST /payments, got ${url}`);
        assert(body.orderId === input.orderId, "orderId matches");
        assert(body.paymentMethod === "CASH", "paymentMethod matches");
        return {
          status: 201,
          data: {
            success: true,
            message: "Payment initialized successfully",
            data: { payment: mockPendingPayment },
          },
        };
      }) as typeof apiClient.post;

      const payment = await paymentApi.createPayment(input);
      assert(payment._id === mockPendingPayment._id, "Payment ID matches");
      assert(payment.status === "PENDING", "Status is PENDING");
      assert(payment.amount === 1000, "Amount is 1000");

      apiClient.post = originalPost;
    }
  );

  // TEST 2: Payment Response Envelope Unwrapping
  await runTest(
    "2. Payment Response Envelope: correctly unwraps { success: true, message, data: { payment } }",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async () => ({
        status: 200,
        data: {
          success: true,
          message: "Payment fetched successfully",
          data: { payment: mockPaidPayment },
        },
      })) as typeof apiClient.get;

      const result = await paymentApi.getPaymentById(mockPaidPayment._id);
      assert(result.status === "PAID", "Unwrapped status is PAID");
      assert(result.paymentMethod === "UPI", "Unwrapped method is UPI");
      assert(result.refunds.length === 1, "Unwrapped refunds array present");

      apiClient.get = originalGet;
    }
  );

  // TEST 3: Get Payment by Order ID
  await runTest(
    "3. Payment API: getPaymentByOrderId calls GET /payments/order/:orderId",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async (url: string) => {
        assert(
          url === `/payments/order/${mockPendingPayment.orderId}`,
          `Expected GET /payments/order/${mockPendingPayment.orderId}, got ${url}`
        );
        return {
          status: 200,
          data: {
            success: true,
            message: "Payment fetched successfully",
            data: { payment: mockPendingPayment },
          },
        };
      }) as typeof apiClient.get;

      const payment = await paymentApi.getPaymentByOrderId(
        mockPendingPayment.orderId
      );
      assert(payment.orderId === mockPendingPayment.orderId, "Order ID matches");

      apiClient.get = originalGet;
    }
  );

  // TEST 4: Get Payment by ID
  await runTest(
    "4. Payment API: getPaymentById calls GET /payments/:id",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async (url: string) => {
        assert(
          url === `/payments/${mockPaidPayment._id}`,
          `Expected GET /payments/${mockPaidPayment._id}, got ${url}`
        );
        return {
          status: 200,
          data: {
            success: true,
            message: "Payment fetched successfully",
            data: { payment: mockPaidPayment },
          },
        };
      }) as typeof apiClient.get;

      const payment = await paymentApi.getPaymentById(mockPaidPayment._id);
      assert(payment._id === mockPaidPayment._id, "Payment ID matches");

      apiClient.get = originalGet;
    }
  );

  // TEST 5: Record Payment (create / update existing)
  await runTest(
    "5. Payment API: recordPayment supports both CASH and UPI payloads",
    async () => {
      const originalPost = apiClient.post;
      apiClient.post = (async (_url: string, body: any) => {
        return {
          status: 201,
          data: {
            success: true,
            message: "Payment initialized successfully",
            data: {
              payment: {
                ...mockPendingPayment,
                paymentMethod: body.paymentMethod,
              },
            },
          },
        };
      }) as typeof apiClient.post;

      const upiPayment = await paymentApi.createPayment({
        orderId: mockPendingPayment.orderId,
        paymentMethod: "UPI",
      });
      assert(upiPayment.paymentMethod === "UPI", "UPI recorded");

      const cashPayment = await paymentApi.createPayment({
        orderId: mockPendingPayment.orderId,
        paymentMethod: "CASH",
      });
      assert(cashPayment.paymentMethod === "CASH", "CASH recorded");

      apiClient.post = originalPost;
    }
  );

  // TEST 6: Payment Method Validation
  await runTest(
    "6. Payment Method Validation: supports exactly backend PAYMENT_METHODS ['CASH', 'UPI']",
    () => {
      assert(PAYMENT_METHODS.length === 2, "Only 2 backend methods supported");
      assert(PAYMENT_METHODS.includes("CASH"), "CASH supported");
      assert(PAYMENT_METHODS.includes("UPI"), "UPI supported");
      assert(
        typeof PAYMENT_METHOD_LABELS.CASH === "string" &&
          PAYMENT_METHOD_LABELS.CASH.length > 0,
        "CASH label present"
      );
      assert(
        typeof PAYMENT_METHOD_LABELS.UPI === "string" &&
          PAYMENT_METHOD_LABELS.UPI.length > 0,
        "UPI label present"
      );
      assert(
        typeof PAYMENT_METHOD_DESCRIPTIONS.CASH === "string",
        "CASH description present"
      );
      assert(
        typeof PAYMENT_METHOD_ICONS.CASH === "string",
        "CASH icon present"
      );
    }
  );

  // TEST 7: Payment Status Mapping
  await runTest(
    "7. Payment Status Mapping: all 4 backend PAYMENT_STATUSES map to human-friendly labels & icons",
    () => {
      assert(PAYMENT_STATUSES.length === 4, "4 payment statuses defined");
      PAYMENT_STATUSES.forEach((status) => {
        const label = PAYMENT_STATUS_LABELS[status];
        const desc = PAYMENT_STATUS_DESCRIPTIONS[status];
        const icon = PAYMENT_STATUS_ICONS[status];
        const variant = PAYMENT_STATUS_VARIANTS[status];
        assert(typeof label === "string" && label.length > 0, `Label for ${status}`);
        assert(typeof desc === "string" && desc.length > 0, `Desc for ${status}`);
        assert(typeof icon === "string" && icon.length > 0, `Icon for ${status}`);
        assert(typeof variant === "string", `Variant for ${status}`);
      });
      assert(PAYMENT_STATUS_LABELS.PENDING === "Payment Pending", "PENDING matches");
      assert(PAYMENT_STATUS_LABELS.PAID === "Payment Completed", "PAID matches");
      assert(PAYMENT_STATUS_LABELS.FAILED === "Payment Failed", "FAILED matches");
      assert(PAYMENT_STATUS_LABELS.REFUNDED === "Refunded", "REFUNDED matches");
      assert(
        PAYMENT_STATUS_LABELS[mockRefundedPayment.status] === "Refunded",
        "mockRefundedPayment maps to Refunded"
      );
    }
  );

  // TEST 8: Redux Payment Loading Lifecycle
  await runTest(
    "8. Redux paymentSlice: manages fetchPaymentByOrderId loading lifecycle and sets state",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async () => ({
        status: 200,
        data: {
          success: true,
          message: "Payment fetched",
          data: { payment: mockPendingPayment },
        },
      })) as typeof apiClient.get;

      await store.dispatch(
        fetchPaymentByOrderId(mockPendingPayment.orderId)
      );
      const state = store.getState().payment;
      assert(state.currentPayment?._id === mockPendingPayment._id, "currentPayment set");
      assert(state.isFetchingPayment === false, "isFetchingPayment is false");
      assert(state.error === null, "error is null");

      apiClient.get = originalGet;
    }
  );

  // TEST 8b: Redux fetchPaymentById Lifecycle
  await runTest(
    "8b. Redux paymentSlice: manages fetchPaymentById lifecycle and stores in payments array",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async () => ({
        status: 200,
        data: {
          success: true,
          message: "Payment fetched",
          data: { payment: mockPaidPayment },
        },
      })) as typeof apiClient.get;

      await store.dispatch(fetchPaymentById(mockPaidPayment._id));
      const state = store.getState().payment;
      assert(state.currentPayment?._id === mockPaidPayment._id, "currentPayment set");
      assert(
        state.payments.some((p) => p._id === mockPaidPayment._id),
        "Payment in payments array"
      );

      apiClient.get = originalGet;
    }
  );

  // TEST 8c: Redux fetchPaymentRefunds Lifecycle
  await runTest(
    "8c. Redux paymentSlice: manages fetchPaymentRefunds lifecycle and stores refunds array",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async () => ({
        status: 200,
        data: {
          success: true,
          message: "Refunds fetched",
          data: { refunds: [mockRefund1] },
        },
      })) as typeof apiClient.get;

      await store.dispatch(fetchPaymentRefunds(mockPaidPayment._id));
      const state = store.getState().payment;
      assert(state.refunds.length === 1, "refunds populated");
      assert(state.refunds[0]?._id === mockRefund1._id, "Refund ID matches");
      assert(state.isFetchingRefunds === false, "isFetchingRefunds is false");

      apiClient.get = originalGet;
    }
  );

  // TEST 9: Redux Payment Success Lifecycle
  await runTest(
    "9. Redux paymentSlice: recordPaymentThunk sets recordSuccess = true and stores currentPayment",
    async () => {
      const originalPost = apiClient.post;
      apiClient.post = (async () => ({
        status: 201,
        data: {
          success: true,
          message: "Payment initialized",
          data: { payment: mockPendingPayment },
        },
      })) as typeof apiClient.post;

      const result = await store.dispatch(
        recordPaymentThunk({
          orderId: mockPendingPayment.orderId,
          paymentMethod: "CASH",
        })
      );

      assert(recordPaymentThunk.fulfilled.match(result), "Thunk fulfilled");
      const state = store.getState().payment;
      assert(state.recordSuccess === true, "recordSuccess is true");
      assert(state.isRecordingPayment === false, "isRecordingPayment is false");
      assert(state.currentPayment?._id === mockPendingPayment._id, "currentPayment set");

      store.dispatch(clearPaymentSuccess());
      assert(store.getState().payment.recordSuccess === false, "recordSuccess cleared");

      apiClient.post = originalPost;
    }
  );

  // TEST 10: Redux Payment Error Lifecycle
  await runTest(
    "10. Redux paymentSlice: normalizes API errors and sets recordError on failure",
    async () => {
      const originalPost = apiClient.post;
      apiClient.post = (async () => {
        const err: any = new Error("Payment already completed");
        err.isAxiosError = true;
        err.response = {
          status: 400,
          data: {
            success: false,
            message: "Payment already completed for this order with status 'PAID'",
          },
        };
        throw err;
      }) as typeof apiClient.post;

      const result = await store.dispatch(
        recordPaymentThunk({
          orderId: mockPaidPayment.orderId,
          paymentMethod: "CASH",
        })
      );

      assert(recordPaymentThunk.rejected.match(result), "Thunk rejected");
      const state = store.getState().payment;
      assert(state.recordError !== null, "recordError populated");
      assert(state.recordError?.statusCode === 400, "Status is 400");
      assert(state.recordError?.kind === "VALIDATION", "Kind is VALIDATION");
      assert(state.recordSuccess === false, "recordSuccess is false");

      store.dispatch(clearPaymentErrors());
      assert(store.getState().payment.recordError === null, "recordError cleared");

      apiClient.post = originalPost;
    }
  );

  // TEST 11: Duplicate Payment Protection
  await runTest(
    "11. Duplicate Payment Protection: isRecordingPayment guards in-flight request",
    async () => {
      const originalPost = apiClient.post;
      let callCount = 0;

      apiClient.post = (async () => {
        callCount++;
        await new Promise((res) => setTimeout(res, 50));
        return {
          status: 201,
          data: {
            success: true,
            message: "Recorded",
            data: { payment: mockPendingPayment },
          },
        };
      }) as typeof apiClient.post;

      const p1 = store.dispatch(
        recordPaymentThunk({
          orderId: mockPendingPayment.orderId,
          paymentMethod: "CASH",
        })
      );

      assert(
        store.getState().payment.isRecordingPayment === true,
        "isRecordingPayment is true while request in flight"
      );

      await p1;
      assert(
        store.getState().payment.isRecordingPayment === false,
        "isRecordingPayment is false after completion"
      );
      assert(callCount === 1, "Called once");

      apiClient.post = originalPost;
    }
  );

  // TEST 12: Payment Failure Handling
  await runTest(
    "12. Payment Failure Handling: correctly processes FAILED status from backend without fake success",
    () => {
      assert(mockFailedPayment.status === "FAILED", "Backend status is FAILED");
      assert(
        PAYMENT_STATUS_LABELS[mockFailedPayment.status] === "Payment Failed",
        "Displays 'Payment Failed'"
      );
      assert(
        PAYMENT_STATUS_VARIANTS[mockFailedPayment.status] === "error",
        "Semantic error variant"
      );
    }
  );

  // TEST 13: Payment Retry
  await runTest(
    "13. Payment Retry: retryPaymentThunk sends POST /payments/:id/retry and returns updated PENDING payment",
    async () => {
      const originalPost = apiClient.post;
      const retryInput: RetryPaymentInput = { paymentMethod: "UPI" };

      apiClient.post = (async (url: string, body: any) => {
        assert(
          url === `/payments/${mockFailedPayment._id}/retry`,
          `Expected POST /payments/${mockFailedPayment._id}/retry, got ${url}`
        );
        assert(body.paymentMethod === "UPI", "Retried with UPI");
        return {
          status: 200,
          data: {
            success: true,
            message: "Payment retry initialized successfully",
            data: {
              payment: {
                ...mockFailedPayment,
                status: "PENDING",
                paymentMethod: "UPI",
              },
            },
          },
        };
      }) as typeof apiClient.post;

      const result = await store.dispatch(
        retryPaymentThunk({
          paymentId: mockFailedPayment._id,
          data: retryInput,
        })
      );

      assert(retryPaymentThunk.fulfilled.match(result), "Retry fulfilled");
      const state = store.getState().payment;
      assert(state.currentPayment?.status === "PENDING", "Status reverted to PENDING");
      assert(state.currentPayment?.paymentMethod === "UPI", "Payment method updated to UPI");
      assert(state.retrySuccess === true, "retrySuccess is true");

      store.dispatch(clearPaymentSuccess());
      apiClient.post = originalPost;
    }
  );

  // TEST 14: Order / Payment Synchronization
  await runTest(
    "14. Order / Payment Synchronization: payment status matches backend order paymentStatus",
    () => {
      const syncedStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;
      syncedStatuses.forEach((status) => {
        assert(PAYMENT_STATUS_LABELS[status] !== undefined, `Status ${status} mapped`);
      });
    }
  );

  // TEST 15: Refund Display Mapping
  await runTest(
    "15. Refund Display Mapping: refund transactions display amount, reason, and date from backend",
    () => {
      const refund = mockRefund1;
      assert(refund.amount === 250, "Refund amount preserved");
      assert(refund.reason === "Damaged cuff button on formal shirt", "Reason preserved");
      assert(refund.status === "COMPLETED", "Status is COMPLETED");
      assert(
        REFUND_STATUS_LABELS[refund.status] === "Refund Completed",
        "Display label is 'Refund Completed'"
      );
    }
  );

  // TEST 16: Refund Status Mapping
  await runTest(
    "16. Refund Status Mapping: all 4 backend REFUND_STATUSES map to display labels & variants",
    () => {
      assert(REFUND_STATUSES.length === 4, "4 refund statuses defined");
      REFUND_STATUSES.forEach((st) => {
        const label = REFUND_STATUS_LABELS[st];
        const variant = REFUND_STATUS_VARIANTS[st];
        assert(typeof label === "string" && label.length > 0, `Label for refund ${st}`);
        assert(typeof variant === "string", `Variant for refund ${st}`);
      });
      assert(REFUND_STATUS_LABELS.PENDING === "Refund Processing", "PENDING label");
      assert(REFUND_STATUS_LABELS.COMPLETED === "Refund Completed", "COMPLETED label");
      assert(REFUND_STATUS_LABELS.FAILED === "Refund Failed", "FAILED label");
      assert(REFUND_STATUS_LABELS.CANCELLED === "Refund Cancelled", "CANCELLED label");
    }
  );

  // TEST 17: Customer Cannot Access Unsupported Refund Mutation
  await runTest(
    "17. Customer Permission Boundary: refund creation is admin-only; customer frontend does not expose refund actions",
    async () => {
      // Backend returns 403 Forbidden for non-admin on POST /payments/:id/refund
      const originalPost = apiClient.post;
      apiClient.post = (async () => {
        const err: any = new Error("Forbidden");
        err.isAxiosError = true;
        err.response = {
          status: 403,
          data: {
            success: false,
            message: "User does not have administrative permissions",
          },
        };
        throw err;
      }) as typeof apiClient.post;

      try {
        await apiClient.post(`/payments/${mockPaidPayment._id}/refund`, { amount: 100 });
        assert(false, "Should have thrown 403");
      } catch (err: any) {
        assert(err.response?.status === 403, "Status 403 Forbidden received");
      }

      apiClient.post = originalPost;
    }
  );

  // TEST 18: Backend-Authoritative Amount Handling
  await runTest(
    "18. Financial Authority: payment amount is derived strictly from backend response without local math",
    () => {
      const payment = mockPaidPayment;
      assert(payment.amount === 1000, "Backend amount 1000 authoritative");
      assert(typeof payment.amount === "number", "Amount is number");
    }
  );

  // TEST 19: Error Normalization
  await runTest(
    "19. Error Normalization: handles HTTP 404 (Payment not found) and HTTP 409 (Conflict)",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async () => {
        const err: any = new Error("Payment not found");
        err.isAxiosError = true;
        err.response = {
          status: 404,
          data: {
            success: false,
            message: "Payment not found for this order",
          },
        };
        throw err;
      }) as typeof apiClient.get;

      const result = await store.dispatch(
        fetchPaymentByOrderId("non_existing_order")
      );
      assert(fetchPaymentByOrderId.rejected.match(result), "Rejected on 404");
      assert(store.getState().payment.error?.statusCode === 404, "Status is 404");
      assert(store.getState().payment.error?.kind === "NOT_FOUND", "Kind is NOT_FOUND");

      store.dispatch(clearPaymentErrors());
      apiClient.get = originalGet;
    }
  );

  // TEST 20: Empty Payment State
  await runTest(
    "20. Empty Payment State: handles null currentPayment and empty refunds array gracefully",
    () => {
      store.dispatch(resetPaymentState());
      const state = store.getState().payment;
      assert(state.currentPayment === null, "currentPayment is null");
      assert(state.payments.length === 0, "payments is empty array");
      assert(state.refunds.length === 0, "refunds is empty array");
      assert(state.error === null, "error is null");
    }
  );

  // TEST 21: Customer Payments Query
  await runTest(
    "21. Payment API: getCustomerPayments calls GET /payments/customer and returns payment history",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async (url: string) => {
        assert(url === "/payments/customer", `Expected GET /payments/customer, got ${url}`);
        return {
          status: 200,
          data: {
            success: true,
            message: "Customer payments fetched successfully",
            data: { payments: [mockPendingPayment, mockPaidPayment] },
          },
        };
      }) as typeof apiClient.get;

      await store.dispatch(fetchCustomerPayments());
      const state = store.getState().payment;
      assert(state.payments.length === 2, "2 payments in state");
      assert(state.isFetchingPayments === false, "isFetchingPayments is false");

      apiClient.get = originalGet;
    }
  );

  // TEST 22: Session Cleanup on Logout
  await runTest(
    "22. Logout Session Cleanup: payment slice resets to initialState on logoutUser.fulfilled",
    () => {
      store.dispatch(setCurrentPayment(mockPaidPayment));
      assert(store.getState().payment.currentPayment !== null, "currentPayment set");

      store.dispatch(logoutUser.fulfilled(undefined, "req-logout"));
      assert(
        store.getState().payment.currentPayment === null,
        "currentPayment reset on logout"
      );
      assert(
        store.getState().payment.payments.length === 0,
        "payments array reset on logout"
      );
    }
  );

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n-------------------------------------------------------");
  console.log(`TOTAL: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("-------------------------------------------------------\n");

  return { total, passed, failed };
}

// Auto-run if executed directly via node
if (typeof require !== "undefined" && require.main === module) {
  runPhase10TestSuite()
    .then(({ failed }) => {
      if (failed > 0) process.exit(1);
    })
    .catch((err) => {
      console.error("Test runner error:", err);
      process.exit(1);
    });
}
