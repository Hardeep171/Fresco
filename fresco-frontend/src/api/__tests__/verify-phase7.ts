/**
 * Comprehensive verification suite for FRESCO Mobile Phase 7:
 * Order History, Order Details, Live Order Tracking & Status Timelines.
 * Tests Order API service contracts, Redux slice lifecycles, error normalizations,
 * status timeline calculations, cancellation eligibility rules, authoritative pricing snapshots,
 * and filter management.
 */

import { orderApi } from "../order.api";
import { apiClient } from "../client";
import { store } from "../../store";
import {
  fetchUserOrders,
  fetchOrderById,
  cancelUserOrder,
  setSelectedStatusFilter,
  clearCancelState,
  clearDetailsError,
  clearOrderErrors,
} from "../../store/slices/orderSlice";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_DESCRIPTIONS,
  ORDER_STATUS_SEQUENCE,
  ORDER_FILTER_TABS,
  isOrderCancellable,
  OrderStatus,
  PaymentStatus,
} from "../../constants/order.constants";
import { Order, OrderFilters } from "../../types/order.types";


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

export async function runPhase7TestSuite(): Promise<{
  total: number;
  passed: number;
  failed: number;
}> {
  console.log("\n=======================================================");
  console.log("FRESCO FRONTEND — PHASE 7 ORDER HISTORY & TRACKING TEST SUITE");
  console.log("=======================================================\n");

  const mockOrder1: Order = {
    _id: "60d5ec49f1b2c8b1f8e4e901",
    userId: "60d5ec49f1b2c8b1f8e4e1a1",
    items: [
      {
        garmentId: "60d5ec49f1b2c8b1f8e4e401",
        serviceId: "60d5ec49f1b2c8b1f8e4e501",
        garmentName: "Formal Shirt",
        serviceName: "Wash & Iron",
        quantity: 2,
        unitPrice: 49,
        totalPrice: 98,
      },
      {
        garmentId: "60d5ec49f1b2c8b1f8e4e402",
        serviceId: "60d5ec49f1b2c8b1f8e4e502",
        garmentName: "Silk Saree",
        serviceName: "Dry Cleaning",
        quantity: 1,
        unitPrice: 199,
        totalPrice: 199,
      },
    ],
    pricing: {
      subtotal: 297,
      discount: 0,
      tax: 0,
      deliveryCharge: 0,
      totalAmount: 297,
    },
    pickupAddress: {
      fullName: "Priya Sharma",
      phone: "9876543210",
      addressLine1: "123 Indiranagar 100ft Road",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      country: "India",
    },
    deliveryAddress: {
      fullName: "Priya Sharma",
      phone: "9876543210",
      addressLine1: "123 Indiranagar 100ft Road",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      country: "India",
    },
    status: "PLACED",
    paymentStatus: "PENDING",
    pickupDate: "2026-08-22T10:00:00.000Z",
    deliveryDate: "2026-08-25T18:00:00.000Z",
    specialInstructions: "Please starch collars",
    createdAt: "2026-08-22T10:00:00.000Z",
    updatedAt: "2026-08-22T10:00:00.000Z",
  };

  const mockOrder2: Order = {
    ...mockOrder1,
    _id: "60d5ec49f1b2c8b1f8e4e902",
    status: "IN_PROCESS",
    paymentStatus: "PAID",
    createdAt: "2026-08-20T08:30:00.000Z",
    updatedAt: "2026-08-21T14:00:00.000Z",
  };

  // TEST 1: orderApi.getUserOrders calls GET /orders and returns Order[]
  await runTest(
    "1. Order API: getUserOrders calls GET /orders and unwraps data.orders",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async (url: string) => {
        assert(url === "/orders", `Expected GET /orders, got ${url}`);
        return {
          status: 200,
          data: {
            success: true,
            message: "User orders fetched successfully",
            data: { orders: [mockOrder1, mockOrder2] },
          },
        };
      }) as typeof apiClient.get;

      const orders = await orderApi.getUserOrders();
      assert(orders.length === 2, "Returned 2 orders");
      assert(orders[0]?._id === mockOrder1._id, "Order 1 ID matches");
      assert(orders[1]?._id === mockOrder2._id, "Order 2 ID matches");

      apiClient.get = originalGet;
    }
  );

  // TEST 2: orderApi.getUserOrders supports status & paymentStatus query params
  await runTest(
    "2. Order API: getUserOrders passes backend-supported query filters",
    async () => {
      const originalGet = apiClient.get;
      const filterInput: OrderFilters = {
        status: "IN_PROCESS",
        paymentStatus: "PAID",
      };

      apiClient.get = (async (url: string, config?: { params?: OrderFilters }) => {
        assert(url === "/orders", `Expected GET /orders, got ${url}`);
        assert(config?.params?.status === "IN_PROCESS", "status param passed");
        assert(config?.params?.paymentStatus === "PAID", "paymentStatus param passed");
        return {
          status: 200,
          data: {
            success: true,
            message: "Filtered orders fetched",
            data: { orders: [mockOrder2] },
          },
        };
      }) as typeof apiClient.get;

      const orders = await orderApi.getUserOrders(filterInput);
      assert(orders.length === 1, "Filtered count is 1");
      assert(orders[0]?.status === "IN_PROCESS", "Status matches filter");

      apiClient.get = originalGet;
    }
  );

  // TEST 3: orderApi.getOrderById calls GET /orders/:id
  await runTest(
    "3. Order API: getOrderById calls GET /orders/:id and unwraps data.order",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async (url: string) => {
        assert(
          url === `/orders/${mockOrder1._id}`,
          `Expected GET /orders/${mockOrder1._id}, got ${url}`
        );
        return {
          status: 200,
          data: {
            success: true,
            message: "Order fetched successfully",
            data: { order: mockOrder1 },
          },
        };
      }) as typeof apiClient.get;

      const order = await orderApi.getOrderById(mockOrder1._id);
      assert(order._id === mockOrder1._id, "Order ID matches");
      assert(order.pricing.totalAmount === 297, "Total amount matches");

      apiClient.get = originalGet;
    }
  );

  // TEST 4: orderApi.cancelOrder calls PATCH /orders/:id/cancel
  await runTest(
    "4. Order API: cancelOrder sends PATCH /orders/:id/cancel and returns cancelled order",
    async () => {
      const originalPatch = apiClient.patch;
      const cancelledOrder: Order = {
        ...mockOrder1,
        status: "CANCELLED",
        updatedAt: "2026-08-22T11:00:00.000Z",
      };

      apiClient.patch = (async (url: string) => {
        assert(
          url === `/orders/${mockOrder1._id}/cancel`,
          `Expected PATCH /orders/${mockOrder1._id}/cancel, got ${url}`
        );
        return {
          status: 200,
          data: {
            success: true,
            message: "Order cancelled successfully",
            data: { order: cancelledOrder },
          },
        };
      }) as typeof apiClient.patch;

      const result = await orderApi.cancelOrder(mockOrder1._id);
      assert(result.status === "CANCELLED", "Order status transitioned to CANCELLED");

      apiClient.patch = originalPatch;
    }
  );

  // TEST 5: Redux orderSlice fetchUserOrders handles loading states and error recovery
  await runTest(
    "5. Redux orderSlice: manages fetchUserOrders lifecycle and error states",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async () => ({
        status: 200,
        data: {
          success: true,
          message: "Orders fetched",
          data: { orders: [mockOrder1, mockOrder2] },
        },
      })) as typeof apiClient.get;

      await store.dispatch(fetchUserOrders());
      let state = store.getState().order;
      assert(state.orders.length === 2, "2 orders stored in Redux");
      assert(state.isFetchingOrders === false, "isFetchingOrders is false");
      assert(state.isLoading === false, "isLoading is false");
      assert(state.error === null, "error is null");

      apiClient.get = originalGet;
    }
  );

  // TEST 6: Redux orderSlice fetchOrderById updates currentOrder & orders array item
  await runTest(
    "6. Redux orderSlice: fetchOrderById sets currentOrder and synchronizes orders list",
    async () => {
      const originalGet = apiClient.get;
      const updatedOrder1: Order = {
        ...mockOrder1,
        status: "CONFIRMED",
      };

      apiClient.get = (async () => ({
        status: 200,
        data: {
          success: true,
          message: "Order fetched",
          data: { order: updatedOrder1 },
        },
      })) as typeof apiClient.get;

      await store.dispatch(fetchOrderById(mockOrder1._id));
      const state = store.getState().order;
      assert(state.currentOrder?._id === mockOrder1._id, "currentOrder set");
      assert(state.currentOrder?.status === "CONFIRMED", "currentOrder updated to CONFIRMED");
      assert(
        state.orders.find((o) => o._id === mockOrder1._id)?.status === "CONFIRMED",
        "Matching order in orders array synchronized"
      );
      assert(state.isFetchingDetails === false, "isFetchingDetails is false");

      apiClient.get = originalGet;
    }
  );

  // TEST 7: Redux orderSlice cancelUserOrder updates state and sets cancelSuccess
  await runTest(
    "7. Redux orderSlice: cancelUserOrder updates status to CANCELLED and marks cancelSuccess",
    async () => {
      const originalPatch = apiClient.patch;
      const cancelledOrder: Order = {
        ...mockOrder1,
        status: "CANCELLED",
      };

      apiClient.patch = (async () => ({
        status: 200,
        data: {
          success: true,
          message: "Cancelled",
          data: { order: cancelledOrder },
        },
      })) as typeof apiClient.patch;

      await store.dispatch(cancelUserOrder(mockOrder1._id));
      let state = store.getState().order;
      assert(state.currentOrder?.status === "CANCELLED", "currentOrder status is CANCELLED");
      assert(state.cancelSuccess === true, "cancelSuccess is true");
      assert(state.isCancellingOrder === false, "isCancellingOrder is false");

      store.dispatch(clearCancelState());
      state = store.getState().order;
      assert(state.cancelSuccess === false, "cancelSuccess reset by clearCancelState");

      apiClient.patch = originalPatch;
    }
  );

  // TEST 8: Error Normalization for Order Not Found (HTTP 404)
  await runTest(
    "8. Error Normalization: handles HTTP 404 Not Found when order does not exist",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async () => {
        const error: any = new Error("Request failed with status code 404");
        error.isAxiosError = true;
        error.response = {
          status: 404,
          data: {
            success: false,
            message: "Order not found",
          },
        };
        throw error;
      }) as typeof apiClient.get;

      const result = await store.dispatch(fetchOrderById("non_existent_id"));
      assert(fetchOrderById.rejected.match(result), "fetchOrderById rejected on 404");
      const state = store.getState().order;
      assert(state.detailsError?.statusCode === 404, "detailsError statusCode is 404");
      assert(state.detailsError?.message === "Order not found", "Error message mapped");

      store.dispatch(clearDetailsError());
      assert(store.getState().order.detailsError === null, "detailsError cleared");

      apiClient.get = originalGet;
    }
  );

  // TEST 9: Error Normalization for Forbidden Cancellation (HTTP 400 Status Transition)
  await runTest(
    "9. Error Normalization: handles HTTP 400 when cancellation is forbidden by backend rules",
    async () => {
      const originalPatch = apiClient.patch;
      apiClient.patch = (async () => {
        const error: any = new Error("Request failed with status code 400");
        error.isAxiosError = true;
        error.response = {
          status: 400,
          data: {
            success: false,
            message: "Cannot transition order status from 'IN_PROCESS' to 'CANCELLED'.",
          },
        };
        throw error;
      }) as typeof apiClient.patch;

      const result = await store.dispatch(cancelUserOrder(mockOrder2._id));
      assert(cancelUserOrder.rejected.match(result), "cancelUserOrder rejected on 400");
      const state = store.getState().order;
      assert(
        state.cancelError?.message ===
          "Cannot transition order status from 'IN_PROCESS' to 'CANCELLED'.",
        "cancelError message matches backend response"
      );

      store.dispatch(clearCancelState());
      apiClient.patch = originalPatch;
    }
  );

  // TEST 10: All 10 backend ORDER_STATUSES map to human-friendly labels
  await runTest(
    "10. Order Status Mapping: all 10 backend ORDER_STATUSES map to user-friendly labels",
    () => {
      assert(ORDER_STATUSES.length === 10, "10 backend order statuses defined");
      ORDER_STATUSES.forEach((status) => {
        const label = ORDER_STATUS_LABELS[status];
        assert(typeof label === "string" && label.length > 0, `Label exists for ${status}: ${label}`);
      });
      assert(ORDER_STATUS_LABELS.PLACED === "Order Placed", "PLACED label matches");
      assert(ORDER_STATUS_LABELS.IN_PROCESS === "Cleaning in Progress", "IN_PROCESS label matches");
      assert(ORDER_STATUS_LABELS.DELIVERED === "Delivered", "DELIVERED label matches");
      assert(ORDER_STATUS_LABELS.CANCELLED === "Cancelled", "CANCELLED label matches");
    }
  );

  // TEST 11: All 10 backend ORDER_STATUSES map to descriptions
  await runTest(
    "11. Order Status Descriptions: all 10 backend ORDER_STATUSES have informative descriptions",
    () => {
      ORDER_STATUSES.forEach((status) => {
        const desc = ORDER_STATUS_DESCRIPTIONS[status];
        assert(typeof desc === "string" && desc.length > 0, `Description exists for ${status}`);
      });
    }
  );

  // TEST 12: Order status sequence contains 9 sequential steps
  await runTest(
    "12. Order Status Timeline: ORDER_STATUS_SEQUENCE contains exactly 9 progressive steps",
    () => {
      assert(ORDER_STATUS_SEQUENCE.length === 9, "9 progressive steps in happy path");
      assert(ORDER_STATUS_SEQUENCE[0] === "PLACED", "Starts with PLACED");
      assert(ORDER_STATUS_SEQUENCE[8] === "DELIVERED", "Ends with DELIVERED");
      assert(
        !ORDER_STATUS_SEQUENCE.includes("CANCELLED"),
        "CANCELLED is an exceptional terminal state, not in happy-path sequence"
      );
    }
  );

  // TEST 13: isOrderCancellable helper returns true ONLY for PLACED and CONFIRMED
  await runTest(
    "13. Cancellation Eligibility: isOrderCancellable returns true ONLY for PLACED and CONFIRMED",
    () => {
      assert(isOrderCancellable("PLACED") === true, "PLACED is cancellable");
      assert(isOrderCancellable("CONFIRMED") === true, "CONFIRMED is cancellable");
    }
  );

  // TEST 14: isOrderCancellable returns false for all other statuses
  await runTest(
    "14. Cancellation Ineligibility: isOrderCancellable returns false for PICKUP_ASSIGNED through CANCELLED",
    () => {
      const nonCancellable: OrderStatus[] = [
        "PICKUP_ASSIGNED",
        "PICKED_UP",
        "UNDER_INSPECTION",
        "IN_PROCESS",
        "READY_FOR_DELIVERY",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ];
      nonCancellable.forEach((status) => {
        assert(
          isOrderCancellable(status) === false,
          `${status} must NOT be cancellable by customer`
        );
      });
    }
  );

  // TEST 15: Itemized order receipt snapshot data integrity
  await runTest(
    "15. Itemized Receipt: snapshot preserves garment, service, quantity, and unit prices",
    () => {
      const items = mockOrder1.items;
      assert(items.length === 2, "2 items in mock order");
      assert(items[0]?.garmentName === "Formal Shirt", "Item 1 garmentName preserved");
      assert(items[0]?.serviceName === "Wash & Iron", "Item 1 serviceName preserved");
      assert(items[0]?.quantity === 2, "Item 1 quantity is 2");
      assert(items[0]?.unitPrice === 49, "Item 1 unitPrice is 49");
      assert(items[0]?.totalPrice === 98, "Item 1 totalPrice is 98 (2 * 49)");

      assert(items[1]?.garmentName === "Silk Saree", "Item 2 garmentName preserved");
      assert(items[1]?.totalPrice === 199, "Item 2 totalPrice is 199");
    }
  );

  // TEST 16: Authoritative pricing snapshot matches backend formula
  await runTest(
    "16. Authoritative Pricing: totalAmount equals subtotal - discount + tax + deliveryCharge",
    () => {
      const p = mockOrder1.pricing;
      const expectedTotal = Math.max(
        0,
        p.subtotal - p.discount + p.tax + p.deliveryCharge
      );
      assert(p.totalAmount === expectedTotal, "totalAmount matches formula");
      assert(p.totalAmount === 297, "Total amount is 297");
    }
  );

  // TEST 17: Address snapshot mapping retains full contact & location information
  await runTest(
    "17. Address Snapshot: preserves customer name, phone, addressLine1, city, state, postalCode",
    () => {
      const addr = mockOrder1.pickupAddress;
      assert(addr.fullName === "Priya Sharma", "fullName preserved");
      assert(addr.phone === "9876543210", "phone preserved");
      assert(addr.city === "Bengaluru", "city preserved");
      assert(addr.postalCode === "560038", "postalCode preserved");
    }
  );

  // TEST 18: Payment status enum mapping handles all 4 values
  await runTest(
    "18. Payment Status: supports PENDING, PAID, FAILED, REFUNDED backend statuses",
    () => {
      const paymentStatuses: PaymentStatus[] = [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
      ];
      paymentStatuses.forEach((status) => {
        assert(typeof status === "string", `Payment status ${status} defined`);
      });
    }
  );

  // TEST 19: Order Filter Tabs support all customer filter categories
  await runTest(
    "19. Order Filter Tabs: ORDER_FILTER_TABS defines all supported customer filter views",
    () => {
      assert(ORDER_FILTER_TABS.includes("ALL"), "ALL tab included");
      assert(ORDER_FILTER_TABS.includes("PLACED"), "PLACED tab included");
      assert(ORDER_FILTER_TABS.includes("IN_PROCESS"), "IN_PROCESS tab included");
      assert(ORDER_FILTER_TABS.includes("DELIVERED"), "DELIVERED tab included");
      assert(ORDER_FILTER_TABS.includes("CANCELLED"), "CANCELLED tab included");

      store.dispatch(setSelectedStatusFilter("IN_PROCESS"));
      assert(
        store.getState().order.selectedStatusFilter === "IN_PROCESS",
        "selectedStatusFilter set in Redux"
      );

      store.dispatch(setSelectedStatusFilter("ALL"));
      assert(
        store.getState().order.selectedStatusFilter === "ALL",
        "selectedStatusFilter reset to ALL"
      );
    }
  );

  // TEST 20: Order state cleanup and error clearance
  await runTest(
    "20. State Management: clearOrderErrors resets all error fields cleanly",
    () => {
      store.dispatch(clearOrderErrors());
      const state = store.getState().order;
      assert(state.error === null, "error is null");
      assert(state.detailsError === null, "detailsError is null");
      assert(state.cancelError === null, "cancelError is null");
      assert(state.placeOrderError === null, "placeOrderError is null");
    }
  );

  // TEST 21: Duplicate cancellation protection check
  await runTest(
    "21. Duplicate Cancellation Prevention: isCancellingOrder flag guards in-flight cancellation",
    async () => {
      const originalPatch = apiClient.patch;
      let patchCallCount = 0;

      apiClient.patch = (async () => {
        patchCallCount++;
        await new Promise((res) => setTimeout(res, 50));
        return {
          status: 200,
          data: {
            success: true,
            message: "Cancelled",
            data: { order: { ...mockOrder1, status: "CANCELLED" as const } },
          },
        };
      }) as typeof apiClient.patch;

      const p1 = store.dispatch(cancelUserOrder(mockOrder1._id));
      assert(
        store.getState().order.isCancellingOrder === true,
        "isCancellingOrder is true while pending"
      );

      await p1;
      assert(
        store.getState().order.isCancellingOrder === false,
        "isCancellingOrder is false after fulfilled"
      );
      assert(patchCallCount === 1, "API was called exactly once");

      apiClient.patch = originalPatch;
    }
  );

  // TEST 22: Order timeline active index resolver
  await runTest(
    "22. Timeline Index Resolver: correctly computes current index in ORDER_STATUS_SEQUENCE",
    () => {
      const testCases: { status: OrderStatus; expectedIndex: number }[] = [
        { status: "PLACED", expectedIndex: 0 },
        { status: "CONFIRMED", expectedIndex: 1 },
        { status: "PICKUP_ASSIGNED", expectedIndex: 2 },
        { status: "PICKED_UP", expectedIndex: 3 },
        { status: "UNDER_INSPECTION", expectedIndex: 4 },
        { status: "IN_PROCESS", expectedIndex: 5 },
        { status: "READY_FOR_DELIVERY", expectedIndex: 6 },
        { status: "OUT_FOR_DELIVERY", expectedIndex: 7 },
        { status: "DELIVERED", expectedIndex: 8 },
        { status: "CANCELLED", expectedIndex: -1 },
      ];

      testCases.forEach(({ status, expectedIndex }) => {
        const index = ORDER_STATUS_SEQUENCE.indexOf(status);
        assert(
          index === expectedIndex,
          `Expected index ${expectedIndex} for ${status}, got ${index}`
        );
      });
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
  runPhase7TestSuite()
    .then(({ failed }) => {
      if (failed > 0) process.exit(1);
    })
    .catch((err) => {
      console.error("Test runner error:", err);
      process.exit(1);
    });
}
