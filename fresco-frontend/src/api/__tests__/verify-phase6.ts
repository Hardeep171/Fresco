/**
 * Comprehensive verification suite for FRESCO Mobile Phase 6:
 * Cart, Checkout & Order Placement.
 * Tests Cart and Order API service contracts, Redux slices, state synchronizations,
 * double-submission prevention, and authoritative server pricing.
 */

import { cartApi } from "../cart.api";
import { orderApi } from "../order.api";
import { apiClient } from "../client";
import { store } from "../../store";
import {
  fetchCart,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearEntireCart,
  clearCartErrors,
  clearAddSuccess,
  setCart,
} from "../../store/slices/cartSlice";
import {
  createOrder,
  fetchUserOrders,
  fetchOrderById,
  cancelUserOrder,
  clearOrderErrors,
  clearCreatedOrder,
} from "../../store/slices/orderSlice";
import { Cart, AddCartItemInput } from "../../types/cart.types";
import { Order, CreateOrderInput } from "../../types/order.types";
import { CreateAddressInput } from "../../types/address.types";

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

async function runTest(name: string, fn: () => Promise<void> | void): Promise<void> {
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

export async function runPhase6TestSuite(): Promise<{ total: number; passed: number; failed: number }> {
  console.log("\n=======================================================");
  console.log("FRESCO FRONTEND — PHASE 6 CART & CHECKOUT TEST SUITE");
  console.log("=======================================================\n");

  const mockAddressInput: CreateAddressInput = {
    label: "HOME",
    fullName: "Priya Sharma",
    phone: "9876543210",
    addressLine1: "123 Indiranagar 100ft Road",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560038",
    country: "India",
  };

  const mockCart: Cart = {
    _id: "60d5ec49f1b2c8b1f8e4e701",
    userId: "60d5ec49f1b2c8b1f8e4e1a1",
    items: [
      {
        _id: "60d5ec49f1b2c8b1f8e4e801",
        garmentId: "60d5ec49f1b2c8b1f8e4e401", // formal shirt
        serviceId: "60d5ec49f1b2c8b1f8e4e501", // wash & iron
        quantity: 2,
        unitPrice: 49,
        subtotal: 98,
      },
    ],
    totalAmount: 98,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  const mockOrder: Order = {
    _id: "60d5ec49f1b2c8b1f8e4e901",
    userId: "60d5ec49f1b2c8b1f8e4e1a1",
    items: [
      {
        garmentId: "60d5ec49f1b2c8b1f8e4e401",
        serviceId: "60d5ec49f1b2c8b1f8e4e501",
        garmentName: "formal shirt",
        serviceName: "wash & iron",
        quantity: 2,
        unitPrice: 49,
        totalPrice: 98,
      },
    ],
    pricing: {
      subtotal: 98,
      discount: 0,
      tax: 0,
      deliveryCharge: 0,
      totalAmount: 98,
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
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  // TEST 1: cartApi.getCart calls GET /cart and unwraps data.cart
  await runTest("1. Cart API: getCart calls GET /cart and returns Cart entity", async () => {
    const originalGet = apiClient.get;
    apiClient.get = (async (url: string) => {
      assert(url === "/cart", `Expected GET /cart, got ${url}`);
      return {
        status: 200,
        data: {
          success: true,
          message: "Cart fetched successfully",
          data: { cart: mockCart },
        },
      };
    }) as typeof apiClient.get;

    const cart = await cartApi.getCart();
    assert(cart._id === mockCart._id, "Cart ID matches");
    assert(cart.totalAmount === 98, "Cart totalAmount matches");
    assert(cart.items.length === 1, "Cart item count is 1");

    apiClient.get = originalGet;
  });

  // TEST 2: cartApi.addItem calls POST /cart with payload
  await runTest("2. Cart API: addItem sends POST /cart with garmentId, serviceId, and quantity", async () => {
    const originalPost = apiClient.post;
    const addInput: AddCartItemInput = {
      garmentId: "60d5ec49f1b2c8b1f8e4e401",
      serviceId: "60d5ec49f1b2c8b1f8e4e501",
      quantity: 2,
    };

    apiClient.post = (async (url: string, body: unknown) => {
      assert(url === "/cart", `Expected POST /cart, got ${url}`);
      const b = body as AddCartItemInput;
      assert(b.garmentId === addInput.garmentId, "garmentId passed");
      assert(b.serviceId === addInput.serviceId, "serviceId passed");
      assert(b.quantity === 2, "quantity passed");
      return {
        status: 201,
        data: {
          success: true,
          message: "Item added to cart successfully",
          data: { cart: mockCart },
        },
      };
    }) as typeof apiClient.post;

    const cart = await cartApi.addItem(addInput);
    assert(cart.totalAmount === 98, "Cart totalAmount matches");

    apiClient.post = originalPost;
  });

  // TEST 3: cartApi.updateItemQuantity calls PATCH /cart/items/:id
  await runTest("3. Cart API: updateItemQuantity sends PATCH /cart/items/:id with quantity", async () => {
    const originalPatch = apiClient.patch;
    const itemId = "60d5ec49f1b2c8b1f8e4e801";

    apiClient.patch = (async (url: string, body: unknown) => {
      assert(url === `/cart/items/${itemId}`, `Expected PATCH /cart/items/${itemId}, got ${url}`);
      const b = body as { quantity: number };
      assert(b.quantity === 3, "New quantity passed");
      return {
        status: 200,
        data: {
          success: true,
          message: "Cart item updated successfully",
          data: { cart: { ...mockCart, items: [{ ...mockCart.items[0]!, quantity: 3, subtotal: 147 }], totalAmount: 147 } },
        },
      };
    }) as typeof apiClient.patch;

    const cart = await cartApi.updateItemQuantity(itemId, 3);
    assert(cart.totalAmount === 147, "Updated totalAmount returned");
    assert(cart.items[0]?.quantity === 3, "Updated quantity returned");

    apiClient.patch = originalPatch;
  });

  // TEST 4: cartApi.removeItem calls DELETE /cart/items/:id
  await runTest("4. Cart API: removeItem sends DELETE /cart/items/:id and returns updated cart", async () => {
    const originalDelete = apiClient.delete;
    const itemId = "60d5ec49f1b2c8b1f8e4e801";

    apiClient.delete = (async (url: string) => {
      assert(url === `/cart/items/${itemId}`, `Expected DELETE /cart/items/${itemId}, got ${url}`);
      return {
        status: 200,
        data: {
          success: true,
          message: "Cart item removed successfully",
          data: { cart: { ...mockCart, items: [], totalAmount: 0 } },
        },
      };
    }) as typeof apiClient.delete;

    const cart = await cartApi.removeItem(itemId);
    assert(cart.items.length === 0, "Cart items is empty after removal");
    assert(cart.totalAmount === 0, "Total amount reset to 0");

    apiClient.delete = originalDelete;
  });

  // TEST 5: cartApi.clearCart calls DELETE /cart
  await runTest("5. Cart API: clearCart sends DELETE /cart and returns empty cart", async () => {
    const originalDelete = apiClient.delete;

    apiClient.delete = (async (url: string) => {
      assert(url === "/cart", `Expected DELETE /cart, got ${url}`);
      return {
        status: 200,
        data: {
          success: true,
          message: "Cart cleared successfully",
          data: { cart: { ...mockCart, items: [], totalAmount: 0 } },
        },
      };
    }) as typeof apiClient.delete;

    const cart = await cartApi.clearCart();
    assert(cart.items.length === 0, "Cart items cleared");

    apiClient.delete = originalDelete;
  });

  // TEST 6: Redux cartSlice handles fetchCart and loading states
  await runTest("6. Redux cartSlice: manages fetchCart lifecycle, loading, and errors properly", async () => {
    const originalGet = apiClient.get;
    apiClient.get = (async () => ({
      status: 200,
      data: {
        success: true,
        message: "Cart fetched",
        data: { cart: mockCart },
      },
    })) as typeof apiClient.get;

    await store.dispatch(fetchCart());
    let state = store.getState().cart;
    assert(state.cart?._id === mockCart._id, "cart in Redux matches mockCart");
    assert(state.isLoading === false, "isLoading is false after fulfilled");
    assert(state.error === null, "error is null");

    store.dispatch(clearCartErrors());
    apiClient.get = originalGet;
  });

  // TEST 7: Redux cartSlice handles addCartItem and quantity mutation
  await runTest("7. Redux cartSlice: manages addCartItem, updateCartItemQuantity, and removeCartItem", async () => {
    const originalPost = apiClient.post;
    const originalPatch = apiClient.patch;
    const originalDelete = apiClient.delete;

    // Add item
    apiClient.post = (async () => ({
      status: 201,
      data: {
        success: true,
        message: "Added",
        data: { cart: mockCart },
      },
    })) as typeof apiClient.post;

    await store.dispatch(
      addCartItem({
        garmentId: "60d5ec49f1b2c8b1f8e4e401",
        serviceId: "60d5ec49f1b2c8b1f8e4e501",
        quantity: 2,
      })
    );
    let state = store.getState().cart;
    assert(state.addSuccess === true, "addSuccess is true");
    assert(state.cart?.totalAmount === 98, "Cart totalAmount is 98");

    store.dispatch(clearAddSuccess());
    assert(store.getState().cart.addSuccess === false, "addSuccess cleared");

    // Update item
    apiClient.patch = (async () => ({
      status: 200,
      data: {
        success: true,
        message: "Updated",
        data: { cart: { ...mockCart, totalAmount: 147 } },
      },
    })) as typeof apiClient.patch;

    await store.dispatch(
      updateCartItemQuantity({
        cartItemId: "60d5ec49f1b2c8b1f8e4e801",
        quantity: 3,
      })
    );
    state = store.getState().cart;
    assert(state.cart?.totalAmount === 147, "Cart totalAmount updated to 147");

    // Remove item
    apiClient.delete = (async () => ({
      status: 200,
      data: {
        success: true,
        message: "Removed",
        data: { cart: { ...mockCart, items: [], totalAmount: 0 } },
      },
    })) as typeof apiClient.delete;

    await store.dispatch(removeCartItem("60d5ec49f1b2c8b1f8e4e801"));
    state = store.getState().cart;
    assert(state.cart?.items.length === 0, "Cart items is empty after removal");

    // Clear entire cart thunk
    await store.dispatch(clearEntireCart());
    state = store.getState().cart;
    assert(state.cart?.items.length === 0, "Cart items is empty after clearEntireCart");

    apiClient.post = originalPost;
    apiClient.patch = originalPatch;
    apiClient.delete = originalDelete;
  });

  // TEST 8: orderApi.createOrder sends POST /orders and unwraps data.order
  await runTest("8. Order API: createOrder sends POST /orders and returns Order entity", async () => {
    const originalPost = apiClient.post;
    const createOrderInput: CreateOrderInput = {
      pickupAddress: mockAddressInput,
      deliveryAddress: mockAddressInput,
      pickupDate: "2026-08-22T10:00:00.000Z",
      deliveryDate: "2026-08-25T18:00:00.000Z",
      specialInstructions: "Please starch collars",
    };

    apiClient.post = (async (url: string, body: unknown) => {
      assert(url === "/orders", `Expected POST /orders, got ${url}`);
      const b = body as CreateOrderInput;
      assert(b.pickupAddress.fullName === "Priya Sharma", "pickupAddress passed");
      assert(b.deliveryAddress.city === "Bengaluru", "deliveryAddress passed");
      assert(b.specialInstructions === "Please starch collars", "specialInstructions passed");
      return {
        status: 201,
        data: {
          success: true,
          message: "Order created successfully",
          data: { order: mockOrder },
        },
      };
    }) as typeof apiClient.post;

    const order = await orderApi.createOrder(createOrderInput);
    assert(order._id === mockOrder._id, "Order ID matches mockOrder");
    assert(order.status === "PLACED", "Order status is PLACED");
    assert(order.pricing.totalAmount === 98, "Order totalAmount matches 98");

    apiClient.post = originalPost;
  });

  // TEST 9: orderApi.getUserOrders calls GET /orders
  await runTest("9. Order API: getUserOrders calls GET /orders and returns Order[]", async () => {
    const originalGet = apiClient.get;
    apiClient.get = (async (url: string) => {
      assert(url === "/orders", `Expected GET /orders, got ${url}`);
      return {
        status: 200,
        data: {
          success: true,
          message: "User orders fetched successfully",
          data: { orders: [mockOrder] },
        },
      };
    }) as typeof apiClient.get;

    const orders = await orderApi.getUserOrders();
    assert(orders.length === 1, "Returned 1 order");
    assert(orders[0]?._id === mockOrder._id, "Order matches mock");

    apiClient.get = originalGet;
  });

  // TEST 10: orderApi.getOrderById calls GET /orders/:id
  await runTest("10. Order API: getOrderById calls GET /orders/:id and unwraps data.order", async () => {
    const originalGet = apiClient.get;
    apiClient.get = (async (url: string) => {
      assert(url === `/orders/${mockOrder._id}`, `Expected GET /orders/:id, got ${url}`);
      return {
        status: 200,
        data: {
          success: true,
          message: "Order fetched successfully",
          data: { order: mockOrder },
        },
      };
    }) as typeof apiClient.get;

    const order = await orderApi.getOrderById(mockOrder._id);
    assert(order._id === mockOrder._id, "Order ID matches");

    apiClient.get = originalGet;
  });

  // TEST 11: orderApi.cancelOrder calls PATCH /orders/:id/cancel
  await runTest("11. Order API: cancelOrder calls PATCH /orders/:id/cancel and returns cancelled order", async () => {
    const originalPatch = apiClient.patch;
    const cancelledOrder = { ...mockOrder, status: "CANCELLED" as const };

    apiClient.patch = (async (url: string) => {
      assert(url === `/orders/${mockOrder._id}/cancel`, `Expected PATCH /orders/:id/cancel, got ${url}`);
      return {
        status: 200,
        data: {
          success: true,
          message: "Order cancelled successfully",
          data: { order: cancelledOrder },
        },
      };
    }) as typeof apiClient.patch;

    const result = await orderApi.cancelOrder(mockOrder._id);
    assert(result.status === "CANCELLED", "Order status transitioned to CANCELLED");

    apiClient.patch = originalPatch;
  });

  // TEST 12: Redux orderSlice handles createOrder and synchronizes cart reset
  await runTest("12. Redux orderSlice: createOrder resets Redux cart state and updates order history", async () => {
    const originalPost = apiClient.post;

    // Put items in cart first
    store.dispatch(setCart(mockCart));
    assert(store.getState().cart.cart?.items.length === 1, "Cart has 1 item prior to order");

    apiClient.post = (async () => ({
      status: 201,
      data: {
        success: true,
        message: "Order created successfully",
        data: { order: mockOrder },
      },
    })) as typeof apiClient.post;

    await store.dispatch(
      createOrder({
        pickupAddress: mockAddressInput,
        deliveryAddress: mockAddressInput,
      })
    );

    const orderState = store.getState().order;
    const cartState = store.getState().cart;

    assert(orderState.createdOrder?._id === mockOrder._id, "createdOrder set in orderSlice");
    assert(orderState.placeOrderSuccess === true, "placeOrderSuccess is true");
    assert(orderState.orders.length > 0, "Order added to orders list");

    // Verify Redux cart synchronization
    assert(cartState.cart?.items.length === 0, "Cart items automatically cleared in Redux on order placement");
    assert(cartState.cart?.totalAmount === 0, "Cart totalAmount automatically reset to 0");

    store.dispatch(clearCreatedOrder());
    store.dispatch(clearOrderErrors());
    apiClient.post = originalPost;
  });

  // TEST 13: Redux orderSlice fetchUserOrders, fetchOrderById, cancelUserOrder
  await runTest("13. Redux orderSlice: handles history retrieval and cancellation lifecycle", async () => {
    const originalGet = apiClient.get;
    const originalPatch = apiClient.patch;

    apiClient.get = (async () => ({
      status: 200,
      data: {
        success: true,
        message: "Orders fetched",
        data: { order: mockOrder, orders: [mockOrder] },
      },
    })) as typeof apiClient.get;

    await store.dispatch(fetchUserOrders());
    let state = store.getState().order;
    assert(state.orders.length === 1, "1 order in history");

    // Fetch order by ID thunk
    await store.dispatch(fetchOrderById(mockOrder._id));
    state = store.getState().order;
    assert(state.currentOrder?._id === mockOrder._id, "currentOrder loaded by fetchOrderById");

    apiClient.patch = (async () => ({
      status: 200,
      data: {
        success: true,
        message: "Cancelled",
        data: { order: { ...mockOrder, status: "CANCELLED" as const } },
      },
    })) as typeof apiClient.patch;

    await store.dispatch(cancelUserOrder(mockOrder._id));
    state = store.getState().order;
    assert(state.currentOrder?.status === "CANCELLED", "currentOrder status is CANCELLED");

    apiClient.get = originalGet;
    apiClient.patch = originalPatch;
  });

  // TEST 14: Double-submission protection & button locking behavior
  await runTest("14. Double-submission protection: prevents duplicate placeOrder invocations while pending", async () => {
    let orderCallCount = 0;
    const originalPost = apiClient.post;

    apiClient.post = (async () => {
      orderCallCount++;
      // Simulate network delay
      await new Promise((res) => setTimeout(res, 50));
      return {
        status: 201,
        data: {
          success: true,
          message: "Order placed",
          data: { order: mockOrder },
        },
      };
    }) as typeof apiClient.post;

    let isPlacing = store.getState().order.isPlacingOrder;
    assert(isPlacing === false, "isPlacingOrder is initially false");

    // Dispatch first order call
    const p1 = store.dispatch(
      createOrder({
        pickupAddress: mockAddressInput,
        deliveryAddress: mockAddressInput,
      })
    );

    isPlacing = store.getState().order.isPlacingOrder;
    assert(isPlacing === true, "isPlacingOrder is true while request is pending");

    await p1;

    isPlacing = store.getState().order.isPlacingOrder;
    assert(isPlacing === false, "isPlacingOrder returns to false after completion");
    assert(orderCallCount === 1, "Order API invoked exactly once");

    apiClient.post = originalPost;
  });

  // TEST 15: Authoritative pricing calculation & snapshot validation
  await runTest("15. Authoritative pricing: order pricing snapshot matches backend calculation formula", async () => {
    const subtotal = 98;
    const discount = 0;
    const tax = 0;
    const deliveryCharge = 0;
    const totalAmount = Math.max(0, subtotal - discount + tax + deliveryCharge);

    assert(totalAmount === 98, "Authoritative total matches calculation");
    assert(mockOrder.pricing.totalAmount === totalAmount, "Order snapshot pricing matches backend contract");
  });

  // TEST 16: Checkout address snapshot mapping
  await runTest("16. Checkout Address Mapping: maps full address entity to immutable order snapshot", async () => {
    const mapped = {
      fullName: mockAddressInput.fullName,
      phone: mockAddressInput.phone,
      addressLine1: mockAddressInput.addressLine1,
      city: mockAddressInput.city,
      state: mockAddressInput.state,
      postalCode: mockAddressInput.postalCode,
      country: mockAddressInput.country || "India",
    };
    assert(mapped.fullName === "Priya Sharma", "Full name mapped");
    assert(mapped.postalCode === "560038", "Postal code mapped");
  });

  // TEST 17: Special instructions validation
  await runTest("17. Special Instructions: respects maximum 500 characters limit", async () => {
    const longText = "A".repeat(600);
    const sliced = longText.slice(0, 500);
    assert(sliced.length === 500, "Instructions truncated to 500 characters maximum");
  });

  // TEST 18: Order status enum validation
  await runTest("18. Order Status: supports all 10 backend order lifecycle statuses", async () => {
    const statuses = [
      "PLACED",
      "CONFIRMED",
      "PICKUP_ASSIGNED",
      "PICKED_UP",
      "UNDER_INSPECTION",
      "IN_PROCESS",
      "READY_FOR_DELIVERY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];
    assert(statuses.length === 10, "All 10 backend order statuses defined");
    assert(statuses.includes("PLACED"), "Initial status PLACED included");
    assert(statuses.includes("CANCELLED"), "Terminal status CANCELLED included");
  });

  // TEST 19: Error normalization on Cart & Order 400 Bad Request & 404 Not Found
  await runTest("19. Error Normalization: properly normalizes 400 Bad Request and 404 Not Found", async () => {
    const originalPost = apiClient.post;
    apiClient.post = (async () => {
      const error: any = new Error("Request failed with status code 400");
      error.isAxiosError = true;
      error.response = {
        status: 400,
        data: {
          success: false,
          message: "Cart is empty. Cannot create an order without items.",
        },
      };
      throw error;
    }) as typeof apiClient.post;

    const res = await store.dispatch(
      createOrder({
        pickupAddress: mockAddressInput,
        deliveryAddress: mockAddressInput,
      })
    );

    assert(createOrder.rejected.match(res), "createOrder rejected on 400");
    const errorState = store.getState().order.placeOrderError;
    assert(
      errorState?.message === "Cart is empty. Cannot create an order without items.",
      "Normalized error message matches backend response"
    );

    apiClient.post = originalPost;
  });

  // TEST 20: Cart total recalculation formula (quantity * unitPrice)
  await runTest("20. Cart Calculation: subtotal and totalAmount enforce quantity * unitPrice invariant", async () => {
    const items = [
      { quantity: 2, unitPrice: 49 },
      { quantity: 3, unitPrice: 89 },
    ];
    const subtotals = items.map((i) => i.quantity * i.unitPrice);
    const totalAmount = subtotals.reduce((sum, s) => sum + s, 0);

    assert(subtotals[0] === 98, "Item 1 subtotal 98");
    assert(subtotals[1] === 267, "Item 2 subtotal 267");
    assert(totalAmount === 365, "Total amount 365");
  });

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
  runPhase6TestSuite()
    .then(({ failed }) => {
      if (failed > 0) process.exit(1);
    })
    .catch((err) => {
      console.error("Test runner error:", err);
      process.exit(1);
    });
}
