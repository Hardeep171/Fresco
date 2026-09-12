import { webcrypto } from "node:crypto";
if (typeof globalThis.crypto === "undefined") {
  (globalThis as any).crypto = webcrypto;
}

import assert from "node:assert";
import http from "node:http";
import type { Server } from "node:http";
import mongoose from "mongoose";

import app from "../app.js";
import { connectDatabase, disconnectDatabase } from "../lib/database.js";
import { AssignmentModel } from "../models/assignment.model.js";
import { OrderModel } from "../models/order.model.js";
import { PaymentModel } from "../models/payment.model.js";
import { UserModel } from "../models/user.model.js";
import { generateAccessToken } from "../utils/jwt.js";
import { hashPassword } from "../utils/password.js";

let server: Server;
let baseUrl: string;

let passCount = 0;
let failCount = 0;

function recordPass(testName: string) {
  passCount++;
  console.log(`  ✓ ${testName}`);
}

function recordFail(testName: string, error: unknown) {
  failCount++;
  console.error(`  ✗ ${testName}:`, error);
}

function request(
  method: string,
  path: string,
  token?: string,
  body?: any,
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(`${baseUrl}${path}`);
    const postData = body !== undefined ? JSON.stringify(body) : "";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData).toString(),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          let json = {};
          try {
            json = JSON.parse(data);
          } catch {
            json = { text: data };
          }
          resolve({ status: res.statusCode || 500, body: json });
        });
      },
    );

    req.on("error", (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Fixture Users
let adminUser: any;
let adminToken: string;
let partner1User: any;
let partner1Token: string;
let partner2User: any;
let partner2Token: string;
let unassignedPartner: any;
let unassignedPartnerToken: string;
let customerUser: any;
let customerToken: string;

const samplePricing = {
  subtotal: 500,
  tax: 25,
  deliveryFee: 50,
  discount: 0,
  totalAmount: 575,
};

const sampleAddress = {
  fullName: "Priya Patel",
  phone: "+919876543205",
  addressLine1: "123 Indiranagar 100ft Rd",
  city: "Bengaluru",
  state: "Karnataka",
  postalCode: "560038",
  country: "India",
};

async function setupFixtures() {
  await UserModel.deleteMany({});
  await OrderModel.deleteMany({});
  await AssignmentModel.deleteMany({});
  await PaymentModel.deleteMany({});

  const defaultHashedPassword = await hashPassword("Password@123");

  adminUser = await UserModel.create({
    firstName: "Admin",
    lastName: "Manager",
    email: "admin.manager@fresco.com",
    phone: "+919876543201",
    password: defaultHashedPassword,
    role: "ADMIN",
    status: "ACTIVE",
  });
  adminToken = await generateAccessToken({
    userId: adminUser._id.toString(),
    role: adminUser.role,
  });

  partner1User = await UserModel.create({
    firstName: "Rahul",
    lastName: "Sharma",
    email: "rahul.partner@fresco.com",
    phone: "+919876543202",
    password: defaultHashedPassword,
    role: "DELIVERY_PARTNER",
    status: "ACTIVE",
  });
  partner1Token = await generateAccessToken({
    userId: partner1User._id.toString(),
    role: partner1User.role,
  });

  partner2User = await UserModel.create({
    firstName: "Amit",
    lastName: "Verma",
    email: "amit.partner@fresco.com",
    phone: "+919876543203",
    password: defaultHashedPassword,
    role: "DELIVERY_PARTNER",
    status: "ACTIVE",
  });
  partner2Token = await generateAccessToken({
    userId: partner2User._id.toString(),
    role: partner2User.role,
  });

  unassignedPartner = await UserModel.create({
    firstName: "Vijay",
    lastName: "Kumar",
    email: "vijay.partner@fresco.com",
    phone: "+919876543204",
    password: defaultHashedPassword,
    role: "DELIVERY_PARTNER",
    status: "ACTIVE",
  });
  unassignedPartnerToken = await generateAccessToken({
    userId: unassignedPartner._id.toString(),
    role: unassignedPartner.role,
  });

  customerUser = await UserModel.create({
    firstName: "Priya",
    lastName: "Patel",
    email: "priya.customer@fresco.com",
    phone: "+919876543205",
    password: defaultHashedPassword,
    role: "CUSTOMER",
    status: "ACTIVE",
  });
  customerToken = await generateAccessToken({
    userId: customerUser._id.toString(),
    role: customerUser.role,
  });
}

async function createTestOrder(status = "PLACED", paymentStatus = "PENDING") {
  return OrderModel.create({
    userId: customerUser._id,
    items: [
      {
        garmentId: new mongoose.Types.ObjectId(),
        garmentName: "Shirt",
        serviceId: new mongoose.Types.ObjectId(),
        serviceName: "Dry Clean",
        quantity: 2,
        unitPrice: 250,
        totalPrice: 500,
      },
    ],
    pricing: samplePricing,
    pickupAddress: sampleAddress,
    deliveryAddress: sampleAddress,
    status,
    paymentStatus,
  });
}

async function runOperationalLifecycleTests() {
  console.log("\n=================================================================");
  console.log("FRESCO BACKEND — COMPREHENSIVE OPERATIONAL LIFECYCLE E2E TEST SUITE");
  console.log("=================================================================\n");

  await connectDatabase();
  await new Promise<void>((resolve) => {
    server = http.createServer(app).listen(0, () => {
      const address = server.address() as any;
      baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
      resolve();
    });
  });

  await setupFixtures();

  // =========================================================================
  // SUITE 1: COMPLETE TWO-VISIT OPERATIONAL LIFECYCLE
  // =========================================================================
  console.log("--- SUITE 1: COMPLETE TWO-VISIT OPERATIONAL LIFECYCLE ---");

  let order1: any;
  let pickupAsg1: any;
  let deliveryAsg1: any;

  // 1.1 Customer creates order -> PLACED
  try {
    order1 = await createTestOrder("PLACED", "PENDING");
    assert.strictEqual(order1.status, "PLACED");
    assert.strictEqual(order1.paymentStatus, "PENDING");
    recordPass("1.1 Order created in PLACED status");
  } catch (err) {
    recordFail("1.1 Order created in PLACED status", err);
  }

  // 1.2 Admin confirms order -> CONFIRMED
  try {
    const res = await request(
      "PATCH",
      `/orders/${order1._id}/status`,
      adminToken,
      { status: "CONFIRMED" },
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.order.status, "CONFIRMED");
    recordPass("1.2 Admin confirms order -> CONFIRMED");
  } catch (err) {
    recordFail("1.2 Admin confirms order -> CONFIRMED", err);
  }

  // 1.3 Admin assigns Partner 1 for Visit 1 (PICKUP) -> PICKUP_ASSIGNED
  try {
    const res = await request("POST", "/assignments", adminToken, {
      orderId: order1._id.toString(),
      partnerId: partner1User._id.toString(),
      assignmentType: "PICKUP",
    });
    assert.strictEqual(res.status, 201);
    pickupAsg1 = res.body.data.assignment;
    assert.strictEqual(pickupAsg1.assignmentType, "PICKUP");
    assert.strictEqual(pickupAsg1.status, "ASSIGNED");
    assert.strictEqual(pickupAsg1.isActive, true);
    recordPass("1.3 Admin assigns pickup partner -> assignment created in ASSIGNED status");
  } catch (err) {
    recordFail("1.3 Admin assigns pickup partner -> assignment created in ASSIGNED status", err);
  }

  // 1.4 Partner 1 accepts Visit 1 (PICKUP) assignment -> Order transitions to PICKUP_ASSIGNED
  try {
    const res = await request(
      "PATCH",
      `/assignments/${pickupAsg1._id}/accept`,
      partner1Token,
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.assignment.status, "ACCEPTED");

    const updatedOrder = await OrderModel.findById(order1._id);
    assert.strictEqual(updatedOrder?.status, "PICKUP_ASSIGNED");
    recordPass("1.4 Partner accepts pickup assignment -> order transitions to PICKUP_ASSIGNED");
  } catch (err) {
    recordFail("1.4 Partner accepts pickup assignment -> order transitions to PICKUP_ASSIGNED", err);
  }

  // 1.5 Partner 1 completes Visit 1 pickup -> Order becomes PICKED_UP
  try {
    const res = await request(
      "PATCH",
      `/assignments/${pickupAsg1._id}/complete`,
      partner1Token,
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.assignment.status, "COMPLETED");

    const updatedOrder = await OrderModel.findById(order1._id);
    assert.strictEqual(updatedOrder?.status, "PICKED_UP");
    recordPass("1.5 Partner completes pickup -> Order auto-transitions to PICKED_UP");
  } catch (err) {
    recordFail("1.5 Partner completes pickup -> Order auto-transitions to PICKED_UP", err);
  }

  // 1.6 Admin moves order to UNDER_INSPECTION
  try {
    const res = await request(
      "PATCH",
      `/orders/${order1._id}/status`,
      adminToken,
      { status: "UNDER_INSPECTION" },
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.order.status, "UNDER_INSPECTION");
    recordPass("1.6 Admin transitions order: PICKED_UP -> UNDER_INSPECTION");
  } catch (err) {
    recordFail("1.6 Admin transitions order: PICKED_UP -> UNDER_INSPECTION", err);
  }

  // 1.7 Admin drops garments for cleaning -> IN_PROCESS
  try {
    const res = await request(
      "PATCH",
      `/orders/${order1._id}/status`,
      adminToken,
      { status: "IN_PROCESS" },
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.order.status, "IN_PROCESS");
    recordPass("1.7 Admin transitions order: UNDER_INSPECTION -> IN_PROCESS (Cleaning)");
  } catch (err) {
    recordFail("1.7 Admin transitions order: UNDER_INSPECTION -> IN_PROCESS (Cleaning)", err);
  }

  // 1.8 Cleaning complete -> READY_FOR_DELIVERY
  try {
    const res = await request(
      "PATCH",
      `/orders/${order1._id}/status`,
      adminToken,
      { status: "READY_FOR_DELIVERY" },
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.order.status, "READY_FOR_DELIVERY");
    recordPass("1.8 Admin transitions order: IN_PROCESS -> READY_FOR_DELIVERY");
  } catch (err) {
    recordFail("1.8 Admin transitions order: IN_PROCESS -> READY_FOR_DELIVERY", err);
  }

  // 1.9 Admin assigns Visit 2 (DELIVERY) to Partner 2 first -> OUT_FOR_DELIVERY
  try {
    const res = await request("POST", "/assignments", adminToken, {
      orderId: order1._id.toString(),
      partnerId: partner2User._id.toString(),
      assignmentType: "DELIVERY",
    });
    assert.strictEqual(res.status, 201);
    deliveryAsg1 = res.body.data.assignment;
    assert.strictEqual(deliveryAsg1.assignmentType, "DELIVERY");
    assert.strictEqual(deliveryAsg1.status, "ASSIGNED");
    recordPass("1.9 Admin assigns delivery partner -> assignment created in ASSIGNED status");
  } catch (err) {
    recordFail("1.9 Admin assigns delivery partner -> assignment created in ASSIGNED status", err);
  }

  // 1.10 Reassignment: Admin reassigns Visit 2 (DELIVERY) to Partner 1 (prefer same partner)
  try {
    const res = await request("POST", "/assignments", adminToken, {
      orderId: order1._id.toString(),
      partnerId: partner1User._id.toString(),
      assignmentType: "DELIVERY",
    });
    assert.strictEqual(res.status, 201);
    const newDelAsg = res.body.data.assignment;
    assert.strictEqual(newDelAsg.assignmentType, "DELIVERY");
    assert.strictEqual(newDelAsg.partnerId.toString(), partner1User._id.toString());
    assert.strictEqual(newDelAsg.isActive, true);

    // Verify old delivery assignment for partner 2 was deactivated
    const oldAsg = await AssignmentModel.findById(deliveryAsg1._id);
    assert.strictEqual(oldAsg?.isActive, false);
    assert.strictEqual(oldAsg?.status, "CANCELLED");

    deliveryAsg1 = newDelAsg;
    recordPass("1.10 Admin reassigns delivery partner without duplicate active assignment conflict");
  } catch (err) {
    recordFail("1.10 Admin reassigns delivery partner without duplicate active assignment conflict", err);
  }

  // 1.11 Partner 1 accepts Visit 2 (DELIVERY) -> Order transitions to OUT_FOR_DELIVERY
  try {
    const res = await request(
      "PATCH",
      `/assignments/${deliveryAsg1._id}/accept`,
      partner1Token,
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.assignment.status, "ACCEPTED");

    const updatedOrder = await OrderModel.findById(order1._id);
    assert.strictEqual(updatedOrder?.status, "OUT_FOR_DELIVERY");
    recordPass("1.11 Partner accepts delivery assignment -> order transitions to OUT_FOR_DELIVERY");
  } catch (err) {
    recordFail("1.11 Partner accepts delivery assignment -> order transitions to OUT_FOR_DELIVERY", err);
  }

  // 1.12 Partner 1 completes Visit 2 (DELIVERY) -> Order becomes DELIVERED
  try {
    const res = await request(
      "PATCH",
      `/assignments/${deliveryAsg1._id}/complete`,
      partner1Token,
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.assignment.status, "COMPLETED");

    const updatedOrder = await OrderModel.findById(order1._id);
    assert.strictEqual(updatedOrder?.status, "DELIVERED");
    recordPass("1.12 Partner completes delivery -> Order auto-transitions to DELIVERED");
  } catch (err) {
    recordFail("1.12 Partner completes delivery -> Order auto-transitions to DELIVERED", err);
  }

  // 1.13 Verify all assignments retrieved by admin (both PICKUP and DELIVERY)
  try {
    const res = await request(
      "GET",
      `/assignments?orderId=${order1._id}`,
      adminToken,
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.assignments.length, 3); // pickup (completed), old delivery (cancelled), new delivery (completed)
    recordPass("1.13 Admin retrieves full operational assignment history for order");
  } catch (err) {
    recordFail("1.13 Admin retrieves full operational assignment history for order", err);
  }

  // =========================================================================
  // SUITE 2: PAYMENT SCENARIO A — PAYMENT COLLECTED AT VISIT 1 (PICKUP)
  // =========================================================================
  console.log("\n--- SUITE 2: PAYMENT SCENARIO A — PAYMENT COLLECTED AT VISIT 1 (PICKUP) ---");

  let order2: any;
  let payment2: any;

  try {
    order2 = await createTestOrder("CONFIRMED", "PENDING");

    // Initialize payment record
    const pRes = await request("POST", "/payments", customerToken, {
      orderId: order2._id.toString(),
      paymentMethod: "CASH",
    });
    assert.strictEqual(pRes.status, 201);
    payment2 = pRes.body.data.payment;

    // Assign Partner 1 for pickup
    await request("POST", "/assignments", adminToken, {
      orderId: order2._id.toString(),
      partnerId: partner1User._id.toString(),
      assignmentType: "PICKUP",
    });

    recordPass("2.1 Order confirmed and pickup partner assigned");
  } catch (err) {
    recordFail("2.1 Order confirmed and pickup partner assigned", err);
  }

  // 2.2 Partner 1 reports cash payment collected at pickup
  try {
    const res = await request(
      "POST",
      `/payments/${payment2._id}/report-collected`,
      partner1Token,
      {
        amount: 575,
        paymentMethod: "CASH",
        notes: "Collected cash at pickup visit",
      },
    );
    assert.strictEqual(res.status, 200);
    const pRecord = res.body.data.payment;
    assert.strictEqual(pRecord.collectionReported, true);
    assert.strictEqual(pRecord.verificationStatus, "PENDING");
    assert.strictEqual(pRecord.status, "PENDING");
    assert.strictEqual(pRecord.collectedByPartnerId.toString(), partner1User._id.toString());
    assert.ok(pRecord.collectedAt);

    // Verify order paymentStatus is STILL PENDING (not yet final approved)
    const freshOrder = await OrderModel.findById(order2._id);
    assert.strictEqual(freshOrder?.paymentStatus, "PENDING");
    recordPass("2.2 Partner reports payment -> verificationStatus is PENDING, order is NOT yet PAID");
  } catch (err) {
    recordFail("2.2 Partner reports payment -> verificationStatus is PENDING, order is NOT yet PAID", err);
  }

  // 2.3 Admin verifies and approves payment
  try {
    const res = await request(
      "POST",
      `/payments/${payment2._id}/verify`,
      adminToken,
      {
        notes: "Verified cash deposited at collection center",
      },
    );
    assert.strictEqual(res.status, 200);
    const pRecord = res.body.data.payment;
    assert.strictEqual(pRecord.verificationStatus, "VERIFIED");
    assert.strictEqual(pRecord.status, "PAID");
    assert.strictEqual(pRecord.verifiedByAdminId.toString(), adminUser._id.toString());
    assert.ok(pRecord.verifiedAt);

    // Verify order paymentStatus is NOW PAID
    const freshOrder = await OrderModel.findById(order2._id);
    assert.strictEqual(freshOrder?.paymentStatus, "PAID");
    recordPass("2.3 Admin verifies payment -> payment becomes PAID, order transitions to PAID");
  } catch (err) {
    recordFail("2.3 Admin verifies payment -> payment becomes PAID, order transitions to PAID", err);
  }

  // =========================================================================
  // SUITE 3: PAYMENT SCENARIO B — PAYMENT COLLECTED AT VISIT 2 (DELIVERY)
  // =========================================================================
  console.log("\n--- SUITE 3: PAYMENT SCENARIO B — PAYMENT COLLECTED AT VISIT 2 (DELIVERY) ---");

  let order3: any;
  let payment3: any;

  try {
    order3 = await createTestOrder("READY_FOR_DELIVERY", "PENDING");

    // Initialize payment record
    const pRes = await request("POST", "/payments", customerToken, {
      orderId: order3._id.toString(),
      paymentMethod: "UPI",
    });
    assert.strictEqual(pRes.status, 201);
    payment3 = pRes.body.data.payment;

    // Assign Partner 2 for delivery
    await request("POST", "/assignments", adminToken, {
      orderId: order3._id.toString(),
      partnerId: partner2User._id.toString(),
      assignmentType: "DELIVERY",
    });

    recordPass("3.1 Order ready for delivery and delivery partner assigned");
  } catch (err) {
    recordFail("3.1 Order ready for delivery and delivery partner assigned", err);
  }

  // 3.2 Partner 2 reports UPI payment collected via QR code at delivery
  try {
    const res = await request(
      "POST",
      `/payments/report-collected`,
      partner2Token,
      {
        orderId: order3._id.toString(),
        amount: 575,
        paymentMethod: "UPI",
        transactionReference: "UPI-ICICI-1234567890",
        notes: "Customer scanned QR and completed UPI payment",
      },
    );
    assert.strictEqual(res.status, 200);
    const pRecord = res.body.data.payment;
    assert.strictEqual(pRecord.collectionReported, true);
    assert.strictEqual(pRecord.verificationStatus, "PENDING");
    assert.strictEqual(pRecord.paymentMethod, "UPI");
    assert.strictEqual(pRecord.collectedByPartnerId.toString(), partner2User._id.toString());
    recordPass("3.2 Partner reports UPI payment at delivery using orderId route");
  } catch (err) {
    recordFail("3.2 Partner reports UPI payment at delivery using orderId route", err);
  }

  // 3.3 Admin verifies and approves payment using orderId route
  try {
    const res = await request(
      "POST",
      `/payments/verify`,
      adminToken,
      {
        orderId: order3._id.toString(),
        notes: "Verified ICICI bank settlement for UPI-ICICI-1234567890",
      },
    );
    assert.strictEqual(res.status, 200);
    const pRecord = res.body.data.payment;
    assert.strictEqual(pRecord.verificationStatus, "VERIFIED");
    assert.strictEqual(pRecord.status, "PAID");

    const freshOrder = await OrderModel.findById(order3._id);
    assert.strictEqual(freshOrder?.paymentStatus, "PAID");
    recordPass("3.3 Admin verifies payment via /payments/verify orderId route -> order transitions to PAID");
  } catch (err) {
    recordFail("3.3 Admin verifies payment via /payments/verify orderId route -> order transitions to PAID", err);
  }

  // =========================================================================
  // SUITE 4: SECURITY BOUNDARIES & ROLE AUTHORIZATION
  // =========================================================================
  console.log("\n--- SUITE 4: SECURITY BOUNDARIES & ROLE AUTHORIZATION ---");

  let order4: any;
  let payment4: any;

  try {
    order4 = await createTestOrder("CONFIRMED", "PENDING");
    const pRes = await request("POST", "/payments", customerToken, {
      orderId: order4._id.toString(),
      paymentMethod: "CASH",
    });
    payment4 = pRes.body.data.payment;

    await request("POST", "/assignments", adminToken, {
      orderId: order4._id.toString(),
      partnerId: partner1User._id.toString(),
      assignmentType: "PICKUP",
    });
  } catch (err) {
    console.error("Setup error for Suite 4:", err);
  }

  // 4.1 Partner CANNOT verify payment (must be 403 Forbidden)
  try {
    const res = await request(
      "POST",
      `/payments/${payment4._id}/verify`,
      partner1Token,
      { notes: "Partner attempting self-verification" },
    );
    assert.strictEqual(res.status, 403);
    recordPass("4.1 Delivery partner is FORBIDDEN from verifying payments (403)");
  } catch (err) {
    recordFail("4.1 Delivery partner is FORBIDDEN from verifying payments (403)", err);
  }

  // 4.2 Customer CANNOT verify payment (must be 403 Forbidden)
  try {
    const res = await request(
      "POST",
      `/payments/${payment4._id}/verify`,
      customerToken,
      { notes: "Customer attempting self-verification" },
    );
    assert.strictEqual(res.status, 403);
    recordPass("4.2 Customer is FORBIDDEN from verifying payments (403)");
  } catch (err) {
    recordFail("4.2 Customer is FORBIDDEN from verifying payments (403)", err);
  }

  // 4.3 Customer CANNOT report payment collected (must be rejected with 400 Bad Request - not delivery partner)
  try {
    const res = await request(
      "POST",
      `/payments/${payment4._id}/report-collected`,
      customerToken,
      { amount: 575, paymentMethod: "CASH" },
    );
    assert.strictEqual(res.status, 400);
    recordPass("4.3 Customer is REJECTED from reporting payment collected (400 - not delivery partner)");
  } catch (err) {
    recordFail("4.3 Customer is REJECTED from reporting payment collected (400 - not delivery partner)", err);
  }

  // 4.4 Unassigned partner CANNOT report payment collected for this order (must be 403 Forbidden)
  try {
    const res = await request(
      "POST",
      `/payments/${payment4._id}/report-collected`,
      unassignedPartnerToken,
      { amount: 575, paymentMethod: "CASH" },
    );
    assert.strictEqual(res.status, 403);
    recordPass("4.4 Unassigned delivery partner is FORBIDDEN from reporting payment for this order (403)");
  } catch (err) {
    recordFail("4.4 Unassigned delivery partner is FORBIDDEN from reporting payment for this order (403)", err);
  }

  // 4.5 Unauthenticated requests are rejected (must be 401 Unauthorized)
  try {
    const resReport = await request(
      "POST",
      `/payments/${payment4._id}/report-collected`,
      undefined,
      { amount: 575, paymentMethod: "CASH" },
    );
    assert.strictEqual(resReport.status, 401);

    const resVerify = await request(
      "POST",
      `/payments/${payment4._id}/verify`,
      undefined,
      { notes: "No token" },
    );
    assert.strictEqual(resVerify.status, 401);

    recordPass("4.5 Unauthenticated requests are strictly rejected with 401 Unauthorized");
  } catch (err) {
    recordFail("4.5 Unauthenticated requests are strictly rejected with 401 Unauthorized", err);
  }

  // =========================================================================
  // SUITE 5: ASSIGNMENT REASSIGNMENT & IDEMPOTENCY
  // =========================================================================
  console.log("\n--- SUITE 5: ASSIGNMENT REASSIGNMENT & IDEMPOTENCY ---");

  let order5: any;

  try {
    order5 = await createTestOrder("CONFIRMED", "PENDING");

    // Assign partner 1 for pickup
    const asg1Res = await request("POST", "/assignments", adminToken, {
      orderId: order5._id.toString(),
      partnerId: partner1User._id.toString(),
      assignmentType: "PICKUP",
    });
    assert.strictEqual(asg1Res.status, 201);
    const asg1Id = asg1Res.body.data.assignment._id;

    // Reassign pickup to partner 2
    const asg2Res = await request("POST", "/assignments", adminToken, {
      orderId: order5._id.toString(),
      partnerId: partner2User._id.toString(),
      assignmentType: "PICKUP",
    });
    assert.strictEqual(asg2Res.status, 201);
    const asg2Id = asg2Res.body.data.assignment._id;
    assert.notStrictEqual(asg1Id, asg2Id);

    // Re-assigning partner 2 creates new active assignment and cancels previous
    const asg2SameRes = await request("POST", "/assignments", adminToken, {
      orderId: order5._id.toString(),
      partnerId: partner2User._id.toString(),
      assignmentType: "PICKUP",
    });
    assert.strictEqual(asg2SameRes.status, 201);
    assert.strictEqual(
      asg2SameRes.body.data.assignment.partnerId.toString(),
      partner2User._id.toString(),
    );

    // Check that there is only ONE active pickup assignment in the DB
    const activePickups = await AssignmentModel.find({
      orderId: order5._id,
      assignmentType: "PICKUP",
      isActive: true,
    });
    assert.strictEqual(activePickups.length, 1);
    assert.strictEqual(String(activePickups[0]?.partnerId), partner2User._id.toString());

    recordPass("5.1 Partner reassignment safely deactivates previous assignment with idempotent reassignment");
  } catch (err) {
    recordFail("5.1 Partner reassignment safely deactivates previous assignment with idempotent reassignment", err);
  }

  // 5.2 Independent active assignments for PICKUP and DELIVERY on the same order
  try {
    const delAsgRes = await request("POST", "/assignments", adminToken, {
      orderId: order5._id.toString(),
      partnerId: partner1User._id.toString(),
      assignmentType: "DELIVERY",
    });
    assert.strictEqual(delAsgRes.status, 201);

    // Now order5 has 1 active PICKUP (partner 2) and 1 active DELIVERY (partner 1)
    const activeAssignments = await AssignmentModel.find({
      orderId: order5._id,
      isActive: true,
    });
    assert.strictEqual(activeAssignments.length, 2);

    const types = activeAssignments.map((a) => a.assignmentType).sort();
    assert.deepStrictEqual(types, ["DELIVERY", "PICKUP"]);
    recordPass("5.2 Independent active assignments for PICKUP and DELIVERY coexist on same order without collision");
  } catch (err) {
    recordFail("5.2 Independent active assignments for PICKUP and DELIVERY coexist on same order without collision", err);
  }

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log("\n=================================================================");
  console.log(`LIFECYCLE TEST SUMMARY: ${passCount} Passed | ${failCount} Failed`);
  console.log("=================================================================\n");

  await disconnectDatabase();
  await new Promise<void>((resolve) => server.close(() => resolve()));

  if (failCount > 0) {
    process.exit(1);
  }
}

runOperationalLifecycleTests().catch((err) => {
  console.error("Test suite fatal error:", err);
  process.exit(1);
});
