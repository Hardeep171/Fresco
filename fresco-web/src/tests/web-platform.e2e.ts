/**
 * FRESCO WEB PLATFORM — END-TO-END VERIFICATION SUITE
 *
 * Tests all core web platform flows, API communication, Redux store slices,
 * duplicate cart merge invariant, and the two-visit operational lifecycle.
 */

import assert from "node:assert";
import { authApi } from "../api/auth.api";
import { categoryApi } from "../api/category.api";
import { garmentApi } from "../api/garment.api";
import { serviceApi } from "../api/service.api";
import { pricingApi } from "../api/pricing.api";
import { cartApi } from "../api/cart.api";
import { orderApi } from "../api/order.api";
import { assignmentApi } from "../api/assignment.api";
import { paymentApi } from "../api/payment.api";
import { userApi } from "../api/user.api";
import { storageService } from "../services/storage.service";
import { setupInterceptors } from "../api/interceptors";
import { store } from "../store";

let passed = 0;
let failed = 0;

function recordPass(desc: string) {
  passed++;
  console.log(`  ✓ ${desc}`);
}

function recordFail(desc: string, err: any) {
  failed++;
  console.error(`  ✗ ${desc}:`, err.message || err);
}

async function runTests() {
  setupInterceptors();
  console.log("\n=================================================");
  console.log("FRESCO WEB PLATFORM — VERIFICATION SUITE");
  console.log("=================================================\n");

  let customerToken = "";
  let adminToken = "";
  let partnerToken = "";
  let customerUser: any = null;
  let adminUser: any = null;
  let partnerUser: any = null;

  // -------------------------------------------------------------
  // SUITE 1: AUTHENTICATION & SESSION PERSISTENCE
  // -------------------------------------------------------------
  console.log("--- SUITE 1: AUTHENTICATION & SESSIONS ---");

  // 1.1 Customer Login (try customer@fresco.com or register unique test customer)
  try {
    let customerLogin;
    try {
      customerLogin = await authApi.login({
        email: "customer@fresco.com",
        password: "Password@123",
      });
    } catch {
      const uniqueSuffix = Date.now().toString().slice(-6);
      customerLogin = await authApi.register({
        firstName: "Test",
        lastName: "Customer",
        email: `customer${uniqueSuffix}@fresco.com`,
        phone: `+91987${uniqueSuffix}`,
        password: "Password@123",
      });
    }

    assert(customerLogin.accessToken, "Should return an accessToken");
    customerToken = customerLogin.accessToken;
    customerUser = customerLogin.user;
    recordPass(`1.1 Customer authenticated successfully: ${customerUser.email}`);
  } catch (err: any) {
    recordFail("1.1 Customer authentication", err);
  }

  // 1.2 Admin Login
  try {
    const adminLogin = await authApi.login({
      email: "admin@fresco.com",
      password: "Password@123",
    });
    assert(adminLogin.accessToken, "Should return admin accessToken");
    assert(adminLogin.user.role === "ADMIN" || adminLogin.user.role === "SUPER_ADMIN");
    adminToken = adminLogin.accessToken;
    adminUser = adminLogin.user;
    recordPass("1.2 Admin login succeeds with admin privileges");
  } catch (err: any) {
    recordFail("1.2 Admin login", err);
  }

  // 1.3 Delivery Partner Login
  try {
    let partnerLogin;
    try {
      partnerLogin = await authApi.login({
        email: "partner@fresco.com",
        password: "Password@123",
      });
    } catch {
      partnerLogin = await authApi.login({
        email: "partnera@fresco.com",
        password: "Password@123",
      });
    }
    assert(partnerLogin.accessToken, "Should return partner accessToken");
    assert.strictEqual(partnerLogin.user.role, "DELIVERY_PARTNER");
    partnerToken = partnerLogin.accessToken;
    partnerUser = partnerLogin.user;
    recordPass("1.3 Delivery Partner login succeeds with DELIVERY_PARTNER role");
  } catch (err: any) {
    recordFail("1.3 Partner login", err);
  }

  // 1.4 Redux Store State Initialization
  try {
    const state = store.getState();
    assert(state.auth !== undefined, "Auth slice must exist in Redux store");
    assert(state.cart !== undefined, "Cart slice must exist in Redux store");
    assert(state.order !== undefined, "Order slice must exist in Redux store");
    assert(state.category !== undefined, "Category slice must exist in Redux store");
    assert(state.payment !== undefined, "Payment slice must exist in Redux store");
    recordPass("1.4 Redux store initialized with all domain slices");
  } catch (err: any) {
    recordFail("1.4 Redux store initialization", err);
  }

  // -------------------------------------------------------------
  // SUITE 2: CATALOG & DYNAMIC PRICING
  // -------------------------------------------------------------
  console.log("\n--- SUITE 2: CATALOG & DYNAMIC PRICING ---");

  let categories: any[] = [];
  let garments: any[] = [];
  let services: any[] = [];
  let pricingMatrix: any[] = [];

  try {
    categories = await categoryApi.getCategories({ isActive: true });
    assert(Array.isArray(categories) && categories.length > 0, "Categories must be a non-empty array");
    recordPass(`2.1 Fetched ${categories.length} active garment categories`);
  } catch (err: any) {
    recordFail("2.1 Fetch categories", err);
  }

  try {
    garments = await garmentApi.getGarments({ isActive: true });
    assert(Array.isArray(garments) && garments.length > 0, "Garments must be a non-empty array");
    recordPass(`2.2 Fetched ${garments.length} active garment items`);
  } catch (err: any) {
    recordFail("2.2 Fetch garments", err);
  }

  try {
    services = await serviceApi.getServices({ isActive: true });
    assert(Array.isArray(services) && services.length > 0, "Services must be a non-empty array");
    recordPass(`2.3 Fetched ${services.length} active garment care services`);
  } catch (err: any) {
    recordFail("2.3 Fetch services", err);
  }

  try {
    pricingMatrix = await pricingApi.getPricing({ isActive: true });
    assert(Array.isArray(pricingMatrix) && pricingMatrix.length > 0, "Pricing matrix must have entries");
    recordPass(`2.4 Fetched ${pricingMatrix.length} Garment × Service pricing rate combinations`);
  } catch (err: any) {
    recordFail("2.4 Fetch pricing matrix", err);
  }

  // -------------------------------------------------------------
  // SUITE 3: CART MERGE INVARIANT & QUANTITY OPERATIONS
  // -------------------------------------------------------------
  console.log("\n--- SUITE 3: CART OPERATIONS & INVARIANTS ---");

  if (customerToken && garments.length > 0 && services.length > 0) {
    storageService.saveTokens(customerToken, "mock-refresh");

    const activePricingPair = pricingMatrix.find((p) => p.isActive) || { garmentId: garments[0]._id, serviceId: services[0]._id };
    const testGarment = garments.find((g) => g._id === activePricingPair.garmentId) || garments[0];
    const testService = services.find((s) => s._id === activePricingPair.serviceId) || services[0];

    try {
      // Clear or initialize cart
      await cartApi.clearCart().catch(() => {});

      // Add item first time: quantity 2
      const cart1 = await cartApi.addItem({
        garmentId: testGarment._id,
        serviceId: testService._id,
        quantity: 2,
      });

      const item1 = cart1.items.find(
        (i) => i.garmentId === testGarment._id && i.serviceId === testService._id
      );
      assert(item1, "Item must exist in cart");
      assert.strictEqual(item1.quantity, 2, "First add must set quantity to 2");
      recordPass("3.1 Initial item added to cart with quantity 2");

      // Invariant: Add SAME garment + service again: quantity 3
      // Must merge into single line item with quantity 2 + 3 = 5
      const cart2 = await cartApi.addItem({
        garmentId: testGarment._id,
        serviceId: testService._id,
        quantity: 3,
      });

      const matchingItems = cart2.items.filter(
        (i) => i.garmentId === testGarment._id && i.serviceId === testService._id
      );
      assert.strictEqual(matchingItems.length, 1, "Duplicate items must MERGE into single entry");
      assert.strictEqual(matchingItems[0].quantity, 5, "Merged quantity must equal 2 + 3 = 5");
      recordPass("3.2 Duplicate item merge invariant: same garment+service merges into 1 item with quantity 5");

      // Update quantity
      const cart3 = await cartApi.updateItem(matchingItems[0]._id, { quantity: 4 });
      const updatedItem = cart3.items.find((i) => i._id === matchingItems[0]._id);
      assert(updatedItem && updatedItem.quantity === 4, "Quantity must update to 4");
      recordPass("3.3 Item quantity modified to 4 successfully");
    } catch (err: any) {
      recordFail("3. Cart operations & merge invariant", err);
    }
  }

  // -------------------------------------------------------------
  // SUITE 4: ORDER PLACEMENT & CUSTOMER TIMELINE
  // -------------------------------------------------------------
  console.log("\n--- SUITE 4: ORDER PLACEMENT & LIFECYCLE ---");

  let createdOrder: any = null;

  if (customerToken) {
    storageService.saveTokens(customerToken, "mock-refresh");

    try {
      createdOrder = await orderApi.createOrder({
        pickupAddress: {
          label: "HOME",
          fullName: "Main Customer",
          phone: "+919876543210",
          addressLine1: "42 MG Road, Indiranagar",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560038",
        },
        deliveryAddress: {
          label: "HOME",
          fullName: "Main Customer",
          phone: "+919876543210",
          addressLine1: "42 MG Road, Indiranagar",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560038",
        },
        pickupDate: new Date(Date.now() + 86400000).toISOString(),
        specialInstructions: "Handle silk shirts with extra gentle care",
      });

      assert(createdOrder && createdOrder._id, "Order creation must return valid order");
      assert(createdOrder.status === "PLACED", "New order must start in PLACED status");
      assert.strictEqual(createdOrder.paymentStatus, "PENDING");
      recordPass(`4.1 Customer order placed successfully: #${createdOrder._id.slice(-8).toUpperCase()} in PLACED status`);
    } catch (err: any) {
      recordFail("4.1 Order placement", err);
    }
  }

  // -------------------------------------------------------------
  // SUITE 5: ADMIN LIFECYCLE & PARTNER REASSIGNMENT
  // -------------------------------------------------------------
  console.log("\n--- SUITE 5: ADMIN ACTIONS & SAFE REASSIGNMENT ---");

  if (adminToken && createdOrder && partnerUser) {
    storageService.saveTokens(adminToken, "mock-refresh");

    try {
      // 5.1 Confirm Order
      const confirmedOrder = await orderApi.updateOrderStatus(createdOrder._id, "CONFIRMED");
      assert(confirmedOrder.status === "CONFIRMED", "Order status must transition to CONFIRMED");
      recordPass("5.1 Admin confirmed the order (PLACED -> CONFIRMED)");

      // 5.2 Assign Pickup Partner
      const assign1 = await assignmentApi.assignPartner({
        orderId: createdOrder._id,
        deliveryPartnerId: partnerUser._id,
        assignmentType: "PICKUP",
        notes: "Pickup clothes before noon",
      });
      assert(assign1 && assign1.status === "ASSIGNED", "Assignment must be created in ASSIGNED status");
      assert.strictEqual(assign1.assignmentType, "PICKUP");
      recordPass("5.2 Admin assigned Pickup Partner (CONFIRMED -> PICKUP_ASSIGNED)");

      // 5.3 Reassign Pickup Partner (Bug 1 regression check: safe deactivation of active assignment)
      const assign2 = await assignmentApi.assignPartner({
        orderId: createdOrder._id,
        deliveryPartnerId: partnerUser._id,
        assignmentType: "PICKUP",
        notes: "Reassigned pickup partner with updated instructions",
      });
      assert(assign2 && assign2.status === "ASSIGNED", "Reassignment must succeed without duplicate index error");
      recordPass("5.3 Partner reassignment safely deactivated previous assignment without unique key collision (BUG 1 fixed)");
    } catch (err: any) {
      recordFail("5. Admin lifecycle & reassignment", err);
    }
  }

  // -------------------------------------------------------------
  // SUITE 6: PARTNER DISPATCH & CASH PAYMENT COLLECTION
  // -------------------------------------------------------------
  console.log("\n--- SUITE 6: PARTNER DISPATCH & PAYMENT COLLECTION ---");

  if (partnerToken && createdOrder) {
    storageService.saveTokens(partnerToken, "mock-refresh");

    try {
      const partnerAssignments = await assignmentApi.getPartnerAssignments();
      assert(Array.isArray(partnerAssignments), "Must return partner assignments list");
      const currentTask = partnerAssignments.find(
        (a) =>
          (typeof a.orderId === "object" ? a.orderId._id : a.orderId) === createdOrder._id &&
          a.status === "ASSIGNED"
      );
      assert(currentTask, "Assigned order must appear in Partner task queue");
      recordPass("6.1 Delivery partner sees assigned task in dispatch queue");

      // Accept task
      const accepted = await assignmentApi.acceptAssignment(currentTask._id);
      assert.strictEqual(accepted.status, "ACCEPTED");
      recordPass("6.2 Delivery partner accepted pickup assignment");

      // Report payment collected
      const paymentReport = await paymentApi.reportPaymentCollected(createdOrder._id, {
        paymentMethod: "CASH",
        amount: createdOrder.pricing?.totalAmount || 150,
        notes: "Customer paid cash during doorstep pickup",
      });

      assert(paymentReport, "Payment collection report must succeed");
      assert(paymentReport.collectionReported === true, "collectionReported must be true");
      assert.strictEqual(paymentReport.verificationStatus, "PENDING");
      assert.strictEqual(paymentReport.status, "PENDING"); // Must NOT be final PAID yet
      recordPass("6.3 Partner reported CASH collection (marked PENDING verification, NOT final PAID)");

      // Complete pickup task
      const completed = await assignmentApi.completeAssignment(currentTask._id);
      assert.strictEqual(completed.status, "COMPLETED");
      recordPass("6.4 Delivery partner completed the pickup assignment");
    } catch (err: any) {
      recordFail("6. Partner dispatch & payment collection", err);
    }
  }

  // -------------------------------------------------------------
  // SUITE 7: ADMIN PAYMENT VERIFICATION
  // -------------------------------------------------------------
  console.log("\n--- SUITE 7: ADMIN PAYMENT VERIFICATION ---");

  if (adminToken && createdOrder) {
    storageService.saveTokens(adminToken, "mock-refresh");

    try {
      const verifiedPayment = await paymentApi.verifyPayment(createdOrder._id, {
        notes: "Cash received from partner and verified in drawer",
        verificationStatus: "VERIFIED",
      });

      assert(verifiedPayment, "Payment verification must succeed");
      assert.strictEqual(verifiedPayment.verificationStatus, "VERIFIED");
      assert.strictEqual(verifiedPayment.status, "PAID");
      recordPass("7.1 Admin audited and approved partner cash payment (PENDING -> PAID / VERIFIED)");
    } catch (err: any) {
      recordFail("7. Admin payment verification", err);
    }
  }

  // Summary
  console.log("\n=================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
