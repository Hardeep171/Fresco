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
import { GarmentModel } from "../models/garment.model.js";
import { InspectionModel } from "../models/inspection.model.js";
import { OrderModel } from "../models/order.model.js";
import { PaymentModel } from "../models/payment.model.js";
import { PricingModel } from "../models/pricing.model.js";
import { ServiceModel } from "../models/service.model.js";
import { UserModel } from "../models/user.model.js";
import { orderService } from "../services/order.service.js";
import { generateAccessToken } from "../utils/jwt.js";

let server: Server;
let baseUrl: string;

const nonExistingId = new mongoose.Types.ObjectId().toString();

// Test Entity References
let customerUser: any;
let otherCustomerUser: any;
let deliveryPartnerA: any;
let deliveryPartnerB: any;
let inactivePartnerUser: any;
let superAdminUser: any;
let adminUser: any;
let cityManagerUser: any;
let branchManagerUser: any;
let inactiveAdminUser: any;

let customerToken: string;
let otherCustomerToken: string;
let partnerAToken: string;
let partnerBToken: string;
let inactivePartnerToken: string;
let superAdminToken: string;
let adminToken: string;
let cityManagerToken: string;
let branchManagerToken: string;
let inactiveAdminToken: string;

let activeGarment: any;
let activeService: any;

let passCount = 0;
let failCount = 0;
const failures: string[] = [];

function recordPass(testName: string) {
  passCount++;
  // console.log(`[PASS] ${testName}`);
}

function recordFail(testName: string, error: any) {
  failCount++;
  const msg = `${testName}: ${error?.message || error}`;
  failures.push(msg);
  console.error(`[FAIL] ${msg}`);
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

const sampleAddress = {
  fullName: "Jane Doe",
  phone: "+12345678999",
  addressLine1: "456 Market St",
  city: "Metro City",
  state: "CA",
  postalCode: "90001",
  country: "USA",
};

async function createTestOrder(
  userId: any,
  totalAmount: number = 1000,
  status: string = "CONFIRMED",
  paymentStatus: string = "PENDING",
) {
  const samplePricing = {
    subtotal: totalAmount,
    discount: 0,
    tax: 0,
    deliveryCharge: 0,
    totalAmount,
  };

  const sampleItems = [
    {
      garmentId: activeGarment._id,
      serviceId: activeService._id,
      garmentName: activeGarment.name,
      serviceName: activeService.name,
      quantity: 1,
      unitPrice: totalAmount,
      totalPrice: totalAmount,
    },
  ];

  return OrderModel.create({
    userId: userId._id || userId,
    items: sampleItems,
    pricing: samplePricing,
    pickupAddress: sampleAddress,
    deliveryAddress: sampleAddress,
    status,
    paymentStatus,
  });
}

async function createDeliveryAssignment(orderId: any, partnerId: any) {
  return AssignmentModel.create({
    orderId: orderId._id || orderId,
    partnerId: partnerId._id || partnerId,
    assignmentType: "DELIVERY",
    status: "ASSIGNED",
    assignedBy: adminUser._id,
    isActive: true,
  });
}

async function setupFixtures() {
  // Clear database collections
  await UserModel.deleteMany({});
  await GarmentModel.deleteMany({});
  await ServiceModel.deleteMany({});
  await PricingModel.deleteMany({});
  await OrderModel.deleteMany({});
  await AssignmentModel.deleteMany({});
  await PaymentModel.deleteMany({});
  await InspectionModel.deleteMany({});

  // Seed Users
  customerUser = await UserModel.create({
    firstName: "Main",
    lastName: "Customer",
    email: "customer@fresco.com",
    phone: "+19999999901",
    password: "hashedpassword123",
    role: "CUSTOMER",
    status: "ACTIVE",
  });
  customerToken = await generateAccessToken({
    userId: customerUser._id.toString(),
    role: customerUser.role,
  });

  otherCustomerUser = await UserModel.create({
    firstName: "Other",
    lastName: "Customer",
    email: "othercustomer@fresco.com",
    phone: "+19999999902",
    password: "hashedpassword123",
    role: "CUSTOMER",
    status: "ACTIVE",
  });
  otherCustomerToken = await generateAccessToken({
    userId: otherCustomerUser._id.toString(),
    role: otherCustomerUser.role,
  });

  deliveryPartnerA = await UserModel.create({
    firstName: "Partner",
    lastName: "A",
    email: "partnera@fresco.com",
    phone: "+19999999903",
    password: "hashedpassword123",
    role: "DELIVERY_PARTNER",
    status: "ACTIVE",
  });
  partnerAToken = await generateAccessToken({
    userId: deliveryPartnerA._id.toString(),
    role: deliveryPartnerA.role,
  });

  deliveryPartnerB = await UserModel.create({
    firstName: "Partner",
    lastName: "B",
    email: "partnerb@fresco.com",
    phone: "+19999999904",
    password: "hashedpassword123",
    role: "DELIVERY_PARTNER",
    status: "ACTIVE",
  });
  partnerBToken = await generateAccessToken({
    userId: deliveryPartnerB._id.toString(),
    role: deliveryPartnerB.role,
  });

  inactivePartnerUser = await UserModel.create({
    firstName: "Inactive",
    lastName: "Partner",
    email: "inactivepartner@fresco.com",
    phone: "+19999999905",
    password: "hashedpassword123",
    role: "DELIVERY_PARTNER",
    status: "INACTIVE",
  });
  inactivePartnerToken = await generateAccessToken({
    userId: inactivePartnerUser._id.toString(),
    role: inactivePartnerUser.role,
  });

  superAdminUser = await UserModel.create({
    firstName: "Super",
    lastName: "Admin",
    email: "superadmin@fresco.com",
    phone: "+19999999906",
    password: "hashedpassword123",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
  });
  superAdminToken = await generateAccessToken({
    userId: superAdminUser._id.toString(),
    role: superAdminUser.role,
  });

  adminUser = await UserModel.create({
    firstName: "Standard",
    lastName: "Admin",
    email: "admin@fresco.com",
    phone: "+19999999907",
    password: "hashedpassword123",
    role: "ADMIN",
    status: "ACTIVE",
  });
  adminToken = await generateAccessToken({
    userId: adminUser._id.toString(),
    role: adminUser.role,
  });

  cityManagerUser = await UserModel.create({
    firstName: "City",
    lastName: "Manager",
    email: "citymanager@fresco.com",
    phone: "+19999999908",
    password: "hashedpassword123",
    role: "CITY_MANAGER",
    status: "ACTIVE",
  });
  cityManagerToken = await generateAccessToken({
    userId: cityManagerUser._id.toString(),
    role: cityManagerUser.role,
  });

  branchManagerUser = await UserModel.create({
    firstName: "Branch",
    lastName: "Manager",
    email: "branchmanager@fresco.com",
    phone: "+19999999909",
    password: "hashedpassword123",
    role: "BRANCH_MANAGER",
    status: "ACTIVE",
  });
  branchManagerToken = await generateAccessToken({
    userId: branchManagerUser._id.toString(),
    role: branchManagerUser.role,
  });

  inactiveAdminUser = await UserModel.create({
    firstName: "Inactive",
    lastName: "Admin",
    email: "inactiveadmin@fresco.com",
    phone: "+19999999910",
    password: "hashedpassword123",
    role: "ADMIN",
    status: "INACTIVE",
  });
  inactiveAdminToken = await generateAccessToken({
    userId: inactiveAdminUser._id.toString(),
    role: inactiveAdminUser.role,
  });

  // Seed Catalog
  const categoryId = new mongoose.Types.ObjectId();
  activeGarment = await GarmentModel.create({
    categoryId,
    name: "Suit Jacket",
    description: "Wool Suit Jacket",
    isActive: true,
  });

  activeService = await ServiceModel.create({
    name: "Dry Clean Premium",
    description: "Premium Eco Dry Clean",
    isActive: true,
  });

  await PricingModel.create({
    garmentId: activeGarment._id,
    serviceId: activeService._id,
    price: 1000.0,
    currency: "INR",
    isActive: true,
  });
}

async function runTests() {
  await connectDatabase();

  server = app.listen(0, () => {
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    baseUrl = `http://localhost:${port}/api/v1`;
  });

  await setupFixtures();

  console.log("\n==================================================");
  console.log("CATEGORY 1 — PAYMENT INITIALIZATION");
  console.log("==================================================");

  try {
    const order1 = await createTestOrder(customerUser, 1000);

    // Test 1.1 & 1.2: Authenticated customer initializes payment for eligible order (HTTP 201)
    let res = await request("POST", "/payments", customerToken, {
      orderId: order1._id.toString(),
      paymentMethod: "CASH",
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.message, "Payment initialized successfully");
    const payment1 = res.body.data.payment;
    assert.strictEqual(payment1.orderId, order1._id.toString());
    assert.strictEqual(payment1.customerId, customerUser._id.toString());
    assert.strictEqual(payment1.amount, 1000);
    assert.strictEqual(payment1.paymentMethod, "CASH");
    assert.strictEqual(payment1.status, "PENDING");
    assert.strictEqual(payment1.receivedByPartnerId, undefined);
    assert.strictEqual(payment1.receivedAt, undefined);
    assert.deepStrictEqual(payment1.refunds, []);
    recordPass("1.1 & 1.2: Authenticated customer initializes payment with server-derived values (HTTP 201)");

    // Test 1.3 & 1.4: Client cannot tamper with amount, status, receivedByPartnerId, refunds
    const orderTampered = await createTestOrder(customerUser, 750);
    res = await request("POST", "/payments", customerToken, {
      orderId: orderTampered._id.toString(),
      paymentMethod: "CASH",
      amount: 1, // Tampered
      status: "PAID", // Tampered
      receivedByPartnerId: nonExistingId, // Tampered
      refunds: [{ amount: 500 }], // Tampered
    });
    assert.strictEqual(res.status, 201);
    const tamperedPayment = res.body.data.payment;
    assert.strictEqual(tamperedPayment.amount, 750); // Derived from order pricing
    assert.strictEqual(tamperedPayment.status, "PENDING"); // Must be default PENDING
    assert.strictEqual(tamperedPayment.receivedByPartnerId, undefined);
    assert.deepStrictEqual(tamperedPayment.refunds, []);
    recordPass("1.3 & 1.4: Server ignores client tampering on amount, status, and system fields");

    // Test 1.5: Support both CASH and UPI
    const orderUpi = await createTestOrder(customerUser, 500);
    res = await request("POST", "/payments", customerToken, {
      orderId: orderUpi._id.toString(),
      paymentMethod: "UPI",
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.data.payment.paymentMethod, "UPI");
    recordPass("1.5: Both CASH and UPI payment methods supported");

    // Test 1.6: Invalid payment method rejected with HTTP 400
    res = await request("POST", "/payments", customerToken, {
      orderId: order1._id.toString(),
      paymentMethod: "BITCOIN",
    });
    assert.strictEqual(res.status, 400);
    recordPass("1.6: Invalid payment method rejected with HTTP 400");

    // Test 1.7: Invalid orderId format rejected with HTTP 400
    res = await request("POST", "/payments", customerToken, {
      orderId: "invalid-order-id",
      paymentMethod: "CASH",
    });
    assert.strictEqual(res.status, 400);
    recordPass("1.7: Invalid orderId format rejected with HTTP 400");

    // Test 1.8: Non-existing orderId returns HTTP 404
    res = await request("POST", "/payments", customerToken, {
      orderId: nonExistingId,
      paymentMethod: "CASH",
    });
    assert.strictEqual(res.status, 404);
    recordPass("1.8: Non-existing order returns HTTP 404");

    // Test 1.9: Customer cannot initialize payment for another customer's order (HTTP 403)
    res = await request("POST", "/payments", otherCustomerToken, {
      orderId: order1._id.toString(),
      paymentMethod: "CASH",
    });
    assert.strictEqual(res.status, 403);
    recordPass("1.9: Customer cannot initialize payment for another customer's order (HTTP 403)");

    // Test 1.10: Unauthenticated request returns HTTP 401
    res = await request("POST", "/payments", undefined, {
      orderId: order1._id.toString(),
      paymentMethod: "CASH",
    });
    assert.strictEqual(res.status, 401);
    recordPass("1.10: Unauthenticated request returns HTTP 401");
  } catch (err) {
    recordFail("CATEGORY 1 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 2 — ONE ORDER = ONE PAYMENT");
  console.log("==================================================");

  try {
    const orderCat2 = await createTestOrder(customerUser, 1200);

    // Test 2.1: Initialize payment
    let res = await request("POST", "/payments", customerToken, {
      orderId: orderCat2._id.toString(),
      paymentMethod: "CASH",
    });
    assert.strictEqual(res.status, 201);
    const initialPaymentId = res.body.data.payment._id;

    // Test 2.2: Re-initialize payment for same order (e.g. changing method to UPI)
    res = await request("POST", "/payments", customerToken, {
      orderId: orderCat2._id.toString(),
      paymentMethod: "UPI",
    });
    assert.strictEqual(res.status, 201);
    const reinitializedPayment = res.body.data.payment;

    // Test 2.3 & 2.4: Verify SAME payment document reused, no second document created
    assert.strictEqual(reinitializedPayment._id, initialPaymentId);
    assert.strictEqual(reinitializedPayment.paymentMethod, "UPI");
    const countInDb = await PaymentModel.countDocuments({
      orderId: orderCat2._id,
    });
    assert.strictEqual(countInDb, 1);
    recordPass("2.1 - 2.4: Re-initializing payment updates existing document and maintains 1:1 relationship");

    // Test 2.5: Verify MongoDB unique index on orderId
    const indexes = await PaymentModel.schema.indexes();
    const hasUniqueOrderIdIndex = indexes.some(
      (idx: any) => idx[0].orderId === 1 && idx[1]?.unique === true,
    );
    assert.strictEqual(hasUniqueOrderIdIndex, true);
    recordPass("2.5: MongoDB unique constraint on orderId is present and active");

    // Test 2.6 & 2.7: Concurrent payment initialization attempts do not create duplicate documents
    const orderConcurrent = await createTestOrder(customerUser, 1500);
    const concurrentReqs = Array.from({ length: 5 }).map(() =>
      request("POST", "/payments", customerToken, {
        orderId: orderConcurrent._id.toString(),
        paymentMethod: "CASH",
      }),
    );
    const results = await Promise.all(concurrentReqs);
    results.forEach((r) => {
      assert([201, 409].includes(r.status));
    });
    const concurrentCount = await PaymentModel.countDocuments({
      orderId: orderConcurrent._id,
    });
    assert.strictEqual(concurrentCount, 1);
    recordPass("2.6 & 2.7: Concurrent payment creation requests guarantee exactly 1 Payment document");
  } catch (err) {
    recordFail("CATEGORY 2 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 3 — DELIVERY PARTNER AUTHORIZATION");
  console.log("==================================================");

  try {
    const orderCat3 = await createTestOrder(customerUser, 2000);
    await createDeliveryAssignment(orderCat3, deliveryPartnerA);

    // Create payment
    let res = await request("POST", "/payments", customerToken, {
      orderId: orderCat3._id.toString(),
      paymentMethod: "CASH",
    });
    assert.strictEqual(res.status, 201);
    const paymentId = res.body.data.payment._id;

    // Test 3.2: Partner B cannot receive payment (HTTP 403)
    res = await request("POST", `/payments/${paymentId}/receive`, partnerBToken);
    assert.strictEqual(res.status, 403);
    recordPass("3.2: Unassigned Delivery Partner B cannot receive payment (HTTP 403)");

    // Test 3.3: Partner B cannot mark payment as FAILED (HTTP 403)
    res = await request("POST", `/payments/${paymentId}/fail`, partnerBToken);
    assert.strictEqual(res.status, 403);
    recordPass("3.3: Unassigned Delivery Partner B cannot mark payment as FAILED (HTTP 403)");

    // Test 3.4: Customer cannot receive payment (HTTP 400 "User is not a delivery partner")
    res = await request("POST", `/payments/${paymentId}/receive`, customerToken);
    assert.strictEqual(res.status, 400);
    recordPass("3.4: Customer calling receive payment is rejected (HTTP 400)");

    // Test 3.5: Admin cannot bypass delivery-partner authorization for receivePayment (HTTP 400)
    res = await request("POST", `/payments/${paymentId}/receive`, adminToken);
    assert.strictEqual(res.status, 400);
    recordPass("3.5: Admin cannot bypass delivery-partner role requirement for receivePayment (HTTP 400)");

    // Test 3.6: Unauthenticated request returns HTTP 401
    res = await request("POST", `/payments/${paymentId}/receive`, undefined);
    assert.strictEqual(res.status, 401);
    recordPass("3.6: Unauthenticated request returns HTTP 401");

    // Test 3.7: Inactive delivery partner rejected (HTTP 400)
    res = await request(
      "POST",
      `/payments/${paymentId}/receive`,
      inactivePartnerToken,
    );
    assert.strictEqual(res.status, 400);
    recordPass("3.7: Inactive delivery partner is rejected (HTTP 400)");

    // Test 3.8: Delivery partner without active assignment rejected (HTTP 403)
    const unassignedOrder = await createTestOrder(customerUser, 800);
    const unassignedPaymentRes = await request("POST", "/payments", customerToken, {
      orderId: unassignedOrder._id.toString(),
      paymentMethod: "CASH",
    });
    const unassignedPaymentId = unassignedPaymentRes.body.data.payment._id;
    res = await request(
      "POST",
      `/payments/${unassignedPaymentId}/receive`,
      partnerAToken,
    );
    assert.strictEqual(res.status, 403);
    recordPass("3.8: Delivery partner without active DELIVERY assignment is rejected (HTTP 403)");

    // Test 3.1: Partner A (authorized) CAN receive payment
    res = await request("POST", `/payments/${paymentId}/receive`, partnerAToken);
    assert.strictEqual(res.status, 200);
    recordPass("3.1: Authorized Delivery Partner A can successfully receive payment (HTTP 200)");
  } catch (err) {
    recordFail("CATEGORY 3 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 4 — PAYMENT PENDING → PAID");
  console.log("==================================================");

  try {
    const orderCat4 = await createTestOrder(customerUser, 1600);
    await createDeliveryAssignment(orderCat4, deliveryPartnerA);

    const payRes = await request("POST", "/payments", customerToken, {
      orderId: orderCat4._id.toString(),
      paymentMethod: "CASH",
    });
    const paymentId = payRes.body.data.payment._id;

    // Test 4.2 & 4.3: Authorized delivery partner marks payment as received
    const res = await request(
      "POST",
      `/payments/${paymentId}/receive`,
      partnerAToken,
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.message, "Payment received successfully");

    // Test 4.4: Verify Payment object in response and DB
    const updatedPayment = res.body.data.payment;
    assert.strictEqual(updatedPayment.status, "PAID");
    assert.strictEqual(
      updatedPayment.receivedByPartnerId,
      deliveryPartnerA._id.toString(),
    );
    assert(updatedPayment.receivedAt !== undefined);
    assert.strictEqual(updatedPayment.paymentMethod, "CASH");

    // Test 4.5 & 4.6: Verify Order.paymentStatus = PAID and synchronized
    const updatedOrder = await OrderModel.findById(orderCat4._id);
    assert.strictEqual(updatedOrder?.paymentStatus, "PAID");
    recordPass("4.1 - 4.6: Payment PENDING -> PAID transition updates Payment & Order status in sync");

    // Test 4.7: Second receive attempt rejected (PAID -> PAID forbidden or status no longer PENDING conflict)
    const secondReceive = await request(
      "POST",
      `/payments/${paymentId}/receive`,
      partnerAToken,
    );
    assert([400, 409].includes(secondReceive.status));
    recordPass("4.7: Duplicate receive request on PAID payment rejected (HTTP 409/400)");

    // Test 4.8: Customer cannot mark payment as received
    const custReceive = await request(
      "POST",
      `/payments/${paymentId}/receive`,
      customerToken,
    );
    assert.strictEqual(custReceive.status, 400);
    recordPass("4.8: Customer cannot mark payment as received");
  } catch (err) {
    recordFail("CATEGORY 4 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 5 — PAYMENT FAILURE");
  console.log("==================================================");

  try {
    const orderCat5 = await createTestOrder(customerUser, 900);
    await createDeliveryAssignment(orderCat5, deliveryPartnerA);

    const payRes = await request("POST", "/payments", customerToken, {
      orderId: orderCat5._id.toString(),
      paymentMethod: "CASH",
    });
    const paymentId = payRes.body.data.payment._id;

    // Test 5.2 & 5.3: Authorized delivery partner marks payment as failed
    const res = await request("POST", `/payments/${paymentId}/fail`, partnerAToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.message, "Payment marked as failed successfully");

    // Test 5.4, 5.5, 5.7: Verify Payment & Order status FAILED, receivedByPartnerId absent
    const updatedPayment = res.body.data.payment;
    assert.strictEqual(updatedPayment.status, "FAILED");
    assert.strictEqual(updatedPayment.receivedByPartnerId, undefined);
    assert.strictEqual(updatedPayment.receivedAt, undefined);

    const updatedOrder = await OrderModel.findById(orderCat5._id);
    assert.strictEqual(updatedOrder?.paymentStatus, "FAILED");

    // Test 5.6: No duplicate Payment document
    const countInDb = await PaymentModel.countDocuments({
      orderId: orderCat5._id,
    });
    assert.strictEqual(countInDb, 1);
    recordPass("5.1 - 5.7: Payment marked as FAILED updates Payment & Order without duplicate document");

    // Test 5.8: Invalid status transition (cannot directly receive a FAILED payment)
    const directReceive = await request(
      "POST",
      `/payments/${paymentId}/receive`,
      partnerAToken,
    );
    assert.strictEqual(directReceive.status, 400);
    recordPass("5.8: Invalid status transition directly from FAILED to PAID is rejected (HTTP 400)");
  } catch (err) {
    recordFail("CATEGORY 5 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 6 — FAILED PAYMENT RETRY");
  console.log("==================================================");

  try {
    const orderCat6 = await createTestOrder(customerUser, 1100);
    await createDeliveryAssignment(orderCat6, deliveryPartnerA);

    const payRes = await request("POST", "/payments", customerToken, {
      orderId: orderCat6._id.toString(),
      paymentMethod: "CASH",
    });
    const paymentId = payRes.body.data.payment._id;

    // Mark failed
    await request("POST", `/payments/${paymentId}/fail`, partnerAToken);

    // Test 6.3 & 6.4: Customer retries failed payment with UPI
    const res = await request("POST", `/payments/${paymentId}/retry`, customerToken, {
      paymentMethod: "UPI",
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.message, "Payment retry initialized successfully");

    // Test 6.5 - 6.10: Verify SAME Payment document reused, status PENDING, method UPI
    const retriedPayment = res.body.data.payment;
    assert.strictEqual(retriedPayment._id, paymentId);
    assert.strictEqual(retriedPayment.orderId, orderCat6._id.toString());
    assert.strictEqual(retriedPayment.status, "PENDING");
    assert.strictEqual(retriedPayment.paymentMethod, "UPI");

    const updatedOrder = await OrderModel.findById(orderCat6._id);
    assert.strictEqual(updatedOrder?.paymentStatus, "PENDING");

    // Test 6.11: Count remains 1
    const countInDb = await PaymentModel.countDocuments({
      orderId: orderCat6._id,
    });
    assert.strictEqual(countInDb, 1);
    recordPass("6.1 - 6.11: Customer retries failed payment, reusing document and returning to PENDING");

    // Test 6.12: Another customer cannot retry the payment (HTTP 403)
    // First fail it again
    await request("POST", `/payments/${paymentId}/fail`, partnerAToken);
    const otherRetry = await request(
      "POST",
      `/payments/${paymentId}/retry`,
      otherCustomerToken,
      { paymentMethod: "CASH" },
    );
    assert.strictEqual(otherRetry.status, 403);
    recordPass("6.12: Un-authorized customer cannot retry payment (HTTP 403)");

    // Customer retries to restore PENDING -> Partner A receives it to make it PAID
    await request("POST", `/payments/${paymentId}/retry`, customerToken, {
      paymentMethod: "CASH",
    });
    await request("POST", `/payments/${paymentId}/receive`, partnerAToken);

    // Test 6.13: Retrying a PAID payment is rejected (HTTP 400)
    const paidRetry = await request(
      "POST",
      `/payments/${paymentId}/retry`,
      customerToken,
      { paymentMethod: "UPI" },
    );
    assert.strictEqual(paidRetry.status, 400);
    recordPass("6.13: Retrying a PAID payment is rejected (HTTP 400)");

    // Make it REFUNDED via full refund
    await request("POST", `/payments/${paymentId}/refund`, adminToken, {
      amount: 1100,
    });

    // Test 6.14: Retrying a REFUNDED payment is rejected (HTTP 400)
    const refundedRetry = await request(
      "POST",
      `/payments/${paymentId}/retry`,
      customerToken,
      { paymentMethod: "CASH" },
    );
    assert.strictEqual(refundedRetry.status, 400);
    recordPass("6.14: Retrying a REFUNDED payment is rejected (HTTP 400)");
  } catch (err) {
    recordFail("CATEGORY 6 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 7 — PAYMENT METHOD SUPPORT");
  console.log("==================================================");

  try {
    // CASH Flow: PENDING -> PAID
    const orderCash = await createTestOrder(customerUser, 400);
    await createDeliveryAssignment(orderCash, deliveryPartnerA);
    let payRes = await request("POST", "/payments", customerToken, {
      orderId: orderCash._id.toString(),
      paymentMethod: "CASH",
    });
    let payId = payRes.body.data.payment._id;
    let recRes = await request("POST", `/payments/${payId}/receive`, partnerAToken);
    assert.strictEqual(recRes.status, 200);
    assert.strictEqual(recRes.body.data.payment.paymentMethod, "CASH");
    assert.strictEqual(recRes.body.data.payment.status, "PAID");
    recordPass("7.1: Full CASH payment flow (PENDING -> PAID) verified");

    // UPI Flow: PENDING -> PAID
    const orderUpi = await createTestOrder(customerUser, 600);
    await createDeliveryAssignment(orderUpi, deliveryPartnerA);
    payRes = await request("POST", "/payments", customerToken, {
      orderId: orderUpi._id.toString(),
      paymentMethod: "UPI",
    });
    payId = payRes.body.data.payment._id;
    recRes = await request("POST", `/payments/${payId}/receive`, partnerAToken);
    assert.strictEqual(recRes.status, 200);
    assert.strictEqual(recRes.body.data.payment.paymentMethod, "UPI");
    assert.strictEqual(recRes.body.data.payment.status, "PAID");
    recordPass("7.2: Full UPI payment flow (PENDING -> PAID) verified");

    // Zod validation rejection for unsupported method
    const invalidRes = await request("POST", "/payments", customerToken, {
      orderId: orderCash._id.toString(),
      paymentMethod: "CREDIT_CARD",
    });
    assert.strictEqual(invalidRes.status, 400);
    recordPass("7.3: Invalid payment method rejected by Zod schema (HTTP 400)");
  } catch (err) {
    recordFail("CATEGORY 7 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 8 — REFUND AUTHORIZATION");
  console.log("==================================================");

  try {
    const createPaidPaymentForRefundTest = async () => {
      const order = await createTestOrder(customerUser, 1000);
      await createDeliveryAssignment(order, deliveryPartnerA);
      const pRes = await request("POST", "/payments", customerToken, {
        orderId: order._id.toString(),
        paymentMethod: "CASH",
      });
      const pid = pRes.body.data.payment._id;
      await request("POST", `/payments/${pid}/receive`, partnerAToken);
      return pid;
    };

    const ref1 = await createPaidPaymentForRefundTest();
    const ref2 = await createPaidPaymentForRefundTest();
    const ref3 = await createPaidPaymentForRefundTest();
    const ref4 = await createPaidPaymentForRefundTest();
    const refCustomer = await createPaidPaymentForRefundTest();

    // Test 8.2: SUPER_ADMIN can refund
    let res = await request("POST", `/payments/${ref1}/refund`, superAdminToken, {
      amount: 100,
    });
    assert.strictEqual(res.status, 200);
    recordPass("8.2: SUPER_ADMIN can create refund (HTTP 200)");

    // Test 8.3: ADMIN can refund
    res = await request("POST", `/payments/${ref2}/refund`, adminToken, {
      amount: 100,
    });
    assert.strictEqual(res.status, 200);
    recordPass("8.3: ADMIN can create refund (HTTP 200)");

    // Test 8.4: CITY_MANAGER can refund
    res = await request("POST", `/payments/${ref3}/refund`, cityManagerToken, {
      amount: 100,
    });
    assert.strictEqual(res.status, 200);
    recordPass("8.4: CITY_MANAGER can create refund (HTTP 200)");

    // Test 8.5: BRANCH_MANAGER can refund
    res = await request("POST", `/payments/${ref4}/refund`, branchManagerToken, {
      amount: 100,
    });
    assert.strictEqual(res.status, 200);
    recordPass("8.5: BRANCH_MANAGER can create refund (HTTP 200)");

    // Test 8.6: CUSTOMER cannot refund (HTTP 403)
    res = await request("POST", `/payments/${refCustomer}/refund`, customerToken, {
      amount: 100,
    });
    assert.strictEqual(res.status, 403);
    recordPass("8.6: CUSTOMER cannot issue refund (HTTP 403)");

    // Test 8.7: DELIVERY_PARTNER cannot refund (HTTP 403)
    res = await request("POST", `/payments/${refCustomer}/refund`, partnerAToken, {
      amount: 100,
    });
    assert.strictEqual(res.status, 403);
    recordPass("8.7: DELIVERY_PARTNER cannot issue refund (HTTP 403)");

    // Test 8.8: Inactive admin cannot refund (HTTP 400)
    res = await request(
      "POST",
      `/payments/${refCustomer}/refund`,
      inactiveAdminToken,
      { amount: 100 },
    );
    assert.strictEqual(res.status, 400);
    recordPass("8.8: Inactive admin/staff cannot issue refund (HTTP 400)");

    // Test 8.9: Unauthenticated user receives HTTP 401
    res = await request("POST", `/payments/${refCustomer}/refund`, undefined, {
      amount: 100,
    });
    assert.strictEqual(res.status, 401);
    recordPass("8.9: Unauthenticated request for refund returns HTTP 401");
  } catch (err) {
    recordFail("CATEGORY 8 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 9 — PARTIAL REFUND");
  console.log("==================================================");

  try {
    const orderCat9 = await createTestOrder(customerUser, 1000);
    await createDeliveryAssignment(orderCat9, deliveryPartnerA);

    const payRes = await request("POST", "/payments", customerToken, {
      orderId: orderCat9._id.toString(),
      paymentMethod: "CASH",
    });
    const paymentId = payRes.body.data.payment._id;
    await request("POST", `/payments/${paymentId}/receive`, partnerAToken);

    // Test 9.1 - 9.8: Partial refund of 200 on 1000
    let res = await request("POST", `/payments/${paymentId}/refund`, adminToken, {
      amount: 200,
      reason: "Damaged shirt item",
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.message, "Refund processed successfully");

    const paymentAfterPartial1 = res.body.data.payment;
    assert.strictEqual(paymentAfterPartial1.status, "PAID"); // Remains PAID
    assert.strictEqual(paymentAfterPartial1.refunds.length, 1);

    const ref1 = paymentAfterPartial1.refunds[0];
    assert.strictEqual(ref1.amount, 200);
    assert.strictEqual(ref1.status, "COMPLETED");
    assert.strictEqual(ref1.processedBy, adminUser._id.toString());
    assert(ref1.processedAt !== undefined);
    assert.strictEqual(ref1.reason, "Damaged shirt item");

    const orderAfterPartial1 = await OrderModel.findById(orderCat9._id);
    assert.strictEqual(orderAfterPartial1?.paymentStatus, "PAID");
    recordPass("9.1 - 9.8: Partial refund of 200 recorded with server fields, Payment & Order remain PAID");

    // Test 9.10 & 9.11: Second partial refund of 300
    res = await request("POST", `/payments/${paymentId}/refund`, adminToken, {
      amount: 300,
      reason: "Customer goodwill discount",
    });
    assert.strictEqual(res.status, 200);
    const paymentAfterPartial2 = res.body.data.payment;
    assert.strictEqual(paymentAfterPartial2.status, "PAID"); // Cumulative 500/1000, still PAID
    assert.strictEqual(paymentAfterPartial2.refunds.length, 2);
    assert.strictEqual(paymentAfterPartial2.refunds[1].amount, 300);
    recordPass("9.10 & 9.11: Second partial refund appends transaction, cumulative 500/1000, payment remains PAID");
  } catch (err) {
    recordFail("CATEGORY 9 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 10 — FULL REFUND");
  console.log("==================================================");

  try {
    const orderCat10 = await createTestOrder(customerUser, 1000);
    await createDeliveryAssignment(orderCat10, deliveryPartnerA);

    const payRes = await request("POST", "/payments", customerToken, {
      orderId: orderCat10._id.toString(),
      paymentMethod: "CASH",
    });
    const paymentId = payRes.body.data.payment._id;
    await request("POST", `/payments/${paymentId}/receive`, partnerAToken);

    // Refund 400
    let res = await request("POST", `/payments/${paymentId}/refund`, adminToken, {
      amount: 400,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.payment.status, "PAID");

    // Refund 600 (completing 1000)
    res = await request("POST", `/payments/${paymentId}/refund`, adminToken, {
      amount: 600,
    });
    assert.strictEqual(res.status, 200);

    // Test 10.1 - 10.5: Cumulative 1000 refunded -> Payment & Order status become REFUNDED
    const paymentFullRefund = res.body.data.payment;
    assert.strictEqual(paymentFullRefund.status, "REFUNDED");
    assert.strictEqual(paymentFullRefund.refunds.length, 2);

    const orderFullRefund = await OrderModel.findById(orderCat10._id);
    assert.strictEqual(orderFullRefund?.paymentStatus, "REFUNDED");
    recordPass("10.1 - 10.5: Full refund (400 + 600) updates Payment & Order status to REFUNDED in sync");

    // Test 10.6: No further refund allowed after full refund (HTTP 400)
    const overRefundAttempt = await request(
      "POST",
      `/payments/${paymentId}/refund`,
      adminToken,
      { amount: 50 },
    );
    assert.strictEqual(overRefundAttempt.status, 400);
    recordPass("10.6: Further refund request on REFUNDED payment is rejected (HTTP 400)");

    // Test 10.7: No further PAID-only operation (e.g. receive) allowed
    const receiveAttempt = await request(
      "POST",
      `/payments/${paymentId}/receive`,
      partnerAToken,
    );
    assert.strictEqual(receiveAttempt.status, 400);
    recordPass("10.7: Receive payment attempt on REFUNDED payment is rejected (HTTP 400)");
  } catch (err) {
    recordFail("CATEGORY 10 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 11 — OVER-REFUND PROTECTION");
  console.log("==================================================");

  try {
    const orderCat11 = await createTestOrder(customerUser, 1000);
    await createDeliveryAssignment(orderCat11, deliveryPartnerA);

    const payRes = await request("POST", "/payments", customerToken, {
      orderId: orderCat11._id.toString(),
      paymentMethod: "CASH",
    });
    const paymentId = payRes.body.data.payment._id;
    await request("POST", `/payments/${paymentId}/receive`, partnerAToken);

    // Test 11.1: Refund 1001 on 1000 -> HTTP 400
    let res = await request("POST", `/payments/${paymentId}/refund`, adminToken, {
      amount: 1001,
    });
    assert.strictEqual(res.status, 400);
    recordPass("11.1: Single refund exceeding total payment amount (1001 on 1000) rejected (HTTP 400)");

    // Test 11.2: Refund 1000.01 -> HTTP 400
    res = await request("POST", `/payments/${paymentId}/refund`, adminToken, {
      amount: 1000.01,
    });
    assert.strictEqual(res.status, 400);
    recordPass("11.2: Single refund with slight excess (1000.01 on 1000) rejected (HTTP 400)");

    // Test 11.3: Refund 700 then 301 -> HTTP 400
    await request("POST", `/payments/${paymentId}/refund`, adminToken, {
      amount: 700,
    });
    res = await request("POST", `/payments/${paymentId}/refund`, adminToken, {
      amount: 301,
    });
    assert.strictEqual(res.status, 400);
    recordPass("11.3: Sequential refund exceeding remaining balance (700 + 301 on 1000) rejected (HTTP 400)");

    // Test 11.4 & 11.5: 500 then 500 allowed, then 500.01 rejected
    const order500 = await createTestOrder(customerUser, 1000);
    await createDeliveryAssignment(order500, deliveryPartnerA);
    const p500Res = await request("POST", "/payments", customerToken, {
      orderId: order500._id.toString(),
      paymentMethod: "CASH",
    });
    const p500Id = p500Res.body.data.payment._id;
    await request("POST", `/payments/${p500Id}/receive`, partnerAToken);

    await request("POST", `/payments/${p500Id}/refund`, adminToken, { amount: 500 });
    res = await request("POST", `/payments/${p500Id}/refund`, adminToken, {
      amount: 500,
    });
    assert.strictEqual(res.status, 200);

    res = await request("POST", `/payments/${p500Id}/refund`, adminToken, {
      amount: 0.01,
    });
    assert.strictEqual(res.status, 400);
    recordPass("11.4 & 11.5: Exact full refund (500+500) allowed, subsequent 0.01 rejected");

    // Test 11.6: Verify database total never exceeds payment amount
    const dbPayment = await PaymentModel.findById(paymentId);
    const dbRefundSum = dbPayment?.refunds.reduce((sum, r) => sum + r.amount, 0) || 0;
    assert(dbRefundSum <= 1000);
    recordPass("11.6: Database cumulative refund sum strictly <= payment amount");
  } catch (err) {
    recordFail("CATEGORY 11 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 12 — FLOATING-POINT CURRENCY SAFETY");
  console.log("==================================================");

  try {
    // Payment = 100.30, Refunds: 50.10, 50.20
    const orderFloat1 = await createTestOrder(customerUser, 100.3);
    await createDeliveryAssignment(orderFloat1, deliveryPartnerA);

    const payRes1 = await request("POST", "/payments", customerToken, {
      orderId: orderFloat1._id.toString(),
      paymentMethod: "CASH",
    });
    const paymentId1 = payRes1.body.data.payment._id;
    await request("POST", `/payments/${paymentId1}/receive`, partnerAToken);

    let res = await request("POST", `/payments/${paymentId1}/refund`, adminToken, {
      amount: 50.1,
    });
    assert.strictEqual(res.status, 200);

    res = await request("POST", `/payments/${paymentId1}/refund`, adminToken, {
      amount: 50.2,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.payment.status, "REFUNDED");
    recordPass("12.1: Floating point values (100.30 = 50.10 + 50.20) complete accurately to REFUNDED");

    // Payment = 100.30, Refunds: 100.29, then 0.01
    const orderFloat2 = await createTestOrder(customerUser, 100.3);
    await createDeliveryAssignment(orderFloat2, deliveryPartnerA);

    const payRes2 = await request("POST", "/payments", customerToken, {
      orderId: orderFloat2._id.toString(),
      paymentMethod: "UPI",
    });
    const paymentId2 = payRes2.body.data.payment._id;
    await request("POST", `/payments/${paymentId2}/receive`, partnerAToken);

    res = await request("POST", `/payments/${paymentId2}/refund`, adminToken, {
      amount: 100.29,
    });
    assert.strictEqual(res.status, 200);

    res = await request("POST", `/payments/${paymentId2}/refund`, adminToken, {
      amount: 0.01,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.payment.status, "REFUNDED");
    recordPass("12.2: Floating point precision (100.29 + 0.01 = 100.30) avoids IEEE-754 errors");
  } catch (err) {
    recordFail("CATEGORY 12 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 13 — REFUND HISTORY");
  console.log("==================================================");

  try {
    const orderCat13 = await createTestOrder(customerUser, 800);
    await createDeliveryAssignment(orderCat13, deliveryPartnerA);

    const payRes = await request("POST", "/payments", customerToken, {
      orderId: orderCat13._id.toString(),
      paymentMethod: "CASH",
    });
    const paymentId = payRes.body.data.payment._id;
    await request("POST", `/payments/${paymentId}/receive`, partnerAToken);

    await request("POST", `/payments/${paymentId}/refund`, adminToken, {
      amount: 300,
      reason: "Item returned",
    });
    await request("POST", `/payments/${paymentId}/refund`, adminToken, {
      amount: 500,
      reason: "Final settlement",
    });

    // Test 13.1 - 13.5: GET /payments/:id/refunds
    const res = await request("GET", `/payments/${paymentId}/refunds`, customerToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.message, "Payment refunds fetched successfully");

    const refunds = res.body.data.refunds;
    assert.strictEqual(refunds.length, 2);

    assert.strictEqual(refunds[0].amount, 300);
    assert.strictEqual(refunds[0].reason, "Item returned");
    assert(refunds[0]._id !== undefined);
    assert.strictEqual(refunds[0].status, "COMPLETED");

    assert.strictEqual(refunds[1].amount, 500);
    assert.strictEqual(refunds[1].reason, "Final settlement");

    recordPass("13.1 - 13.5: Refund history retained, ordered, accessible after full refund");
  } catch (err) {
    recordFail("CATEGORY 13 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 14 — PAYMENT QUERY APIs");
  console.log("==================================================");

  try {
    const orderCat14 = await createTestOrder(customerUser, 1500);
    await createDeliveryAssignment(orderCat14, deliveryPartnerA);

    const payRes = await request("POST", "/payments", customerToken, {
      orderId: orderCat14._id.toString(),
      paymentMethod: "UPI",
    });
    const paymentId = payRes.body.data.payment._id;
    await request("POST", `/payments/${paymentId}/receive`, partnerAToken);

    // Test 14.1 & 14.2: GET /payments/:id
    let res = await request("GET", `/payments/${paymentId}`, customerToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.payment._id, paymentId);
    recordPass("14.1 & 14.2: GET /payments/:id returns correct payment document");

    // Test 14.3: GET /payments/order/:orderId
    res = await request("GET", `/payments/order/${orderCat14._id}`, customerToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.payment.orderId, orderCat14._id.toString());
    recordPass("14.3: GET /payments/order/:orderId returns matching payment");

    // Test 14.4: GET /payments/customer
    res = await request("GET", "/payments/customer", customerToken);
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.body.data.payments));
    assert(res.body.data.payments.length > 0);
    res.body.data.payments.forEach((p: any) => {
      assert.strictEqual(p.customerId, customerUser._id.toString());
    });
    recordPass("14.4: GET /payments/customer returns only customer-owned payments");

    // Test 14.5: Query filters (status, paymentMethod, customerId, orderId, receivedByPartnerId)
    res = await request(
      "GET",
      `/payments?status=PAID&paymentMethod=UPI&customerId=${customerUser._id}&orderId=${orderCat14._id}&receivedByPartnerId=${deliveryPartnerA._id}`,
      adminToken,
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.payments.length, 1);
    recordPass("14.5: Query filters (status, paymentMethod, customerId, orderId, receivedByPartnerId) work");

    // Test 14.6: Invalid ID format rejected with HTTP 400
    res = await request("GET", "/payments/invalid-id-format", customerToken);
    assert.strictEqual(res.status, 400);
    recordPass("14.6: Invalid ID format rejected with HTTP 400");

    // Test 14.7: Empty filter results return [] with HTTP 200
    res = await request(
      "GET",
      `/payments?customerId=${nonExistingId}`,
      adminToken,
    );
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body.data.payments, []);
    recordPass("14.7: Empty query filter results return HTTP 200 with empty array []");
  } catch (err) {
    recordFail("CATEGORY 14 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 15 — ROUTE ORDERING");
  console.log("==================================================");

  try {
    // Verify GET /payments/customer does not get captured by GET /payments/:id
    let res = await request("GET", "/payments/customer", customerToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.message, "Customer payments fetched successfully");
    recordPass("15.1: GET /payments/customer resolves correctly before /:id");

    // Verify GET /payments/order/:orderId does not get captured by GET /payments/:id
    const orderCat15 = await createTestOrder(customerUser, 500);
    await request("POST", "/payments", customerToken, {
      orderId: orderCat15._id.toString(),
      paymentMethod: "CASH",
    });
    res = await request("GET", `/payments/order/${orderCat15._id}`, customerToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.message, "Payment fetched successfully");
    recordPass("15.2: GET /payments/order/:orderId resolves correctly before /:id");

    // Verify sub-routes resolve to correct controllers
    const pRes = await request("POST", "/payments", customerToken, {
      orderId: (await createTestOrder(customerUser, 500))._id.toString(),
      paymentMethod: "CASH",
    });
    const pid = pRes.body.data.payment._id;

    const refRes = await request("GET", `/payments/${pid}/refunds`, customerToken);
    assert.strictEqual(refRes.status, 200);
    assert.strictEqual(refRes.body.message, "Payment refunds fetched successfully");
    recordPass("15.3: Action sub-routes (/:id/refunds, etc.) resolve to correct controller handlers");
  } catch (err) {
    recordFail("CATEGORY 15 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 16 — PAYMENT ↔ ORDER SYNCHRONIZATION");
  console.log("==================================================");

  try {
    const orderSync = await createTestOrder(customerUser, 1000);
    await createDeliveryAssignment(orderSync, deliveryPartnerA);

    // Initialized -> PENDING
    const payRes = await request("POST", "/payments", customerToken, {
      orderId: orderSync._id.toString(),
      paymentMethod: "CASH",
    });
    const pid = payRes.body.data.payment._id;
    let ord = await OrderModel.findById(orderSync._id);
    assert.strictEqual(payRes.body.data.payment.status, "PENDING");
    assert.strictEqual(ord?.paymentStatus, "PENDING");

    // Failed -> FAILED
    await request("POST", `/payments/${pid}/fail`, partnerAToken);
    ord = await OrderModel.findById(orderSync._id);
    assert.strictEqual(ord?.paymentStatus, "FAILED");

    // Retry -> PENDING
    await request("POST", `/payments/${pid}/retry`, customerToken, { paymentMethod: "UPI" });
    ord = await OrderModel.findById(orderSync._id);
    assert.strictEqual(ord?.paymentStatus, "PENDING");

    // Receive -> PAID
    await request("POST", `/payments/${pid}/receive`, partnerAToken);
    ord = await OrderModel.findById(orderSync._id);
    assert.strictEqual(ord?.paymentStatus, "PAID");

    // Full Refund -> REFUNDED
    await request("POST", `/payments/${pid}/refund`, adminToken, { amount: 1000 });
    ord = await OrderModel.findById(orderSync._id);
    assert.strictEqual(ord?.paymentStatus, "REFUNDED");

    recordPass("16.1: Payment ↔ Order paymentStatus verified in sync across PENDING, FAILED, PENDING, PAID, REFUNDED");
  } catch (err) {
    recordFail("CATEGORY 16 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 17 — ROLLBACK / FAILURE SAFETY");
  console.log("==================================================");

  try {
    const origUpdatePaymentStatus = orderService.updatePaymentStatus;

    // Test 17.1: receivePayment rollback when Order sync fails
    const orderRoll1 = await createTestOrder(customerUser, 1000);
    await createDeliveryAssignment(orderRoll1, deliveryPartnerA);
    const pRes1 = await request("POST", "/payments", customerToken, {
      orderId: orderRoll1._id.toString(),
      paymentMethod: "CASH",
    });
    const pid1 = pRes1.body.data.payment._id;

    // Monkey-patch order update to throw error
    orderService.updatePaymentStatus = async () => {
      throw new Error("Simulated Order Sync Failure");
    };

    let res = await request("POST", `/payments/${pid1}/receive`, partnerAToken);
    assert.strictEqual(res.status, 500);

    // Verify Payment rolled back to PENDING & partner un-set
    let payInDb = await PaymentModel.findById(pid1);
    assert.strictEqual(payInDb?.status, "PENDING");
    assert.strictEqual(payInDb?.receivedByPartnerId, undefined);
    assert.strictEqual(payInDb?.receivedAt, undefined);
    recordPass("17.1: receivePayment failure rolls back Payment status to PENDING and unsets partner fields");

    // Test 17.2: markPaymentFailed rollback when Order sync fails
    res = await request("POST", `/payments/${pid1}/fail`, partnerAToken);
    assert.strictEqual(res.status, 500);
    payInDb = await PaymentModel.findById(pid1);
    assert.strictEqual(payInDb?.status, "PENDING");
    recordPass("17.2: markPaymentFailed failure rolls back Payment status to PENDING");

    // Restore updatePaymentStatus temporarily to fail the payment normally
    orderService.updatePaymentStatus = origUpdatePaymentStatus;
    await request("POST", `/payments/${pid1}/fail`, partnerAToken);

    // Test 17.3: retryPayment rollback when Order sync fails
    orderService.updatePaymentStatus = async () => {
      throw new Error("Simulated Order Sync Failure");
    };
    res = await request("POST", `/payments/${pid1}/retry`, customerToken, {
      paymentMethod: "UPI",
    });
    assert.strictEqual(res.status, 500);
    payInDb = await PaymentModel.findById(pid1);
    assert.strictEqual(payInDb?.status, "FAILED");
    recordPass("17.3: retryPayment failure rolls back Payment status to FAILED");

    // Test 17.5: createRefund rollback when Order sync fails
    orderService.updatePaymentStatus = origUpdatePaymentStatus;
    await request("POST", `/payments/${pid1}/retry`, customerToken, { paymentMethod: "UPI" });
    await request("POST", `/payments/${pid1}/receive`, partnerAToken);

    orderService.updatePaymentStatus = async () => {
      throw new Error("Simulated Order Sync Failure");
    };
    res = await request("POST", `/payments/${pid1}/refund`, adminToken, {
      amount: 1000,
    });
    assert.strictEqual(res.status, 500);

    payInDb = await PaymentModel.findById(pid1);
    assert.strictEqual(payInDb?.status, "PAID");
    assert.strictEqual(payInDb?.refunds.length, 0); // Transaction pulled back
    recordPass("17.5: createRefund failure rolls back Payment status to PAID and pulls refund transaction");

    // Restore original method
    orderService.updatePaymentStatus = origUpdatePaymentStatus;
  } catch (err) {
    recordFail("CATEGORY 17 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 18 — REFUND CONCURRENCY / RACE CONDITION");
  console.log("==================================================");

  try {
    const orderRace = await createTestOrder(customerUser, 1000);
    await createDeliveryAssignment(orderRace, deliveryPartnerA);
    const pRes = await request("POST", "/payments", customerToken, {
      orderId: orderRace._id.toString(),
      paymentMethod: "CASH",
    });
    const pid = pRes.body.data.payment._id;
    await request("POST", `/payments/${pid}/receive`, partnerAToken);

    // Fire 2 concurrent refund requests for 600 each (total 1200 > 1000)
    const refundReqs = [
      request("POST", `/payments/${pid}/refund`, adminToken, { amount: 600 }),
      request("POST", `/payments/${pid}/refund`, adminToken, { amount: 600 }),
    ];

    const results = await Promise.all(refundReqs);
    const statuses = results.map((r) => r.status);

    // At least one request must fail (400 or 409)
    assert(statuses.includes(400) || statuses.includes(409));

    const finalPayment = await PaymentModel.findById(pid);
    const refundTotal = finalPayment?.refunds.reduce((sum, r) => sum + r.amount, 0) || 0;
    assert(refundTotal <= 1000);
    recordPass("18.1 - 18.5: Concurrent over-refund attempts rejected, total refund balance strictly <= 1000");
  } catch (err) {
    recordFail("CATEGORY 18 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 19 — CLIENT TAMPERING / SECURITY");
  console.log("==================================================");

  try {
    const orderTamp = await createTestOrder(customerUser, 2500);
    await createDeliveryAssignment(orderTamp, deliveryPartnerA);

    // 19.1: Client tampering on POST /payments
    let res = await request("POST", "/payments", customerToken, {
      orderId: orderTamp._id.toString(),
      paymentMethod: "CASH",
      amount: 1, // Tampered
      status: "PAID", // Tampered
      customerId: otherCustomerUser._id.toString(), // Tampered
    });
    assert.strictEqual(res.status, 201);
    const createdPay = res.body.data.payment;
    assert.strictEqual(createdPay.amount, 2500);
    assert.strictEqual(createdPay.status, "PENDING");
    assert.strictEqual(createdPay.customerId, customerUser._id.toString());
    recordPass("19.1: Server authoritative values override client tampering on POST /payments");

    // 19.2: Client tampering on receivePayment
    res = await request("POST", `/payments/${createdPay._id}/receive`, partnerAToken, {
      paymentMethod: "UPI",
      amount: 1, // Tampered
      status: "FAILED", // Tampered
      receivedByPartnerId: deliveryPartnerB._id.toString(), // Tampered
    });
    assert.strictEqual(res.status, 200);
    const recPay = res.body.data.payment;
    assert.strictEqual(recPay.amount, 2500);
    assert.strictEqual(recPay.status, "PAID");
    assert.strictEqual(recPay.receivedByPartnerId, deliveryPartnerA._id.toString());
    recordPass("19.2: Server authoritative values override client tampering on POST /payments/:id/receive");

    // 19.3: Client tampering on refund
    res = await request("POST", `/payments/${createdPay._id}/refund`, adminToken, {
      amount: 500,
      status: "PENDING", // Tampered
      processedBy: customerUser._id.toString(), // Tampered
    });
    assert.strictEqual(res.status, 200);
    const refItem = res.body.data.payment.refunds[0];
    assert.strictEqual(refItem.status, "COMPLETED");
    assert.strictEqual(refItem.processedBy, adminUser._id.toString());
    recordPass("19.3: Server authoritative values override client tampering on POST /payments/:id/refund");
  } catch (err) {
    recordFail("CATEGORY 19 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 20 — DATABASE INTEGRITY");
  console.log("==================================================");

  try {
    const allPayments = await PaymentModel.find({}).lean().exec();
    const orderIds = allPayments.map((p) => String(p.orderId));
    const uniqueOrderIds = new Set(orderIds);

    // 1. Exactly 1 Payment per Order
    assert.strictEqual(orderIds.length, uniqueOrderIds.size);
    recordPass("20.1 & 20.2: Database integrity check confirms 1:1 unique Payment per Order across all test documents");

    // 2. All refund totals <= payment amount
    allPayments.forEach((p) => {
      const refundSum = (p.refunds || []).reduce((sum, r: any) => sum + Number(r.amount), 0);
      assert(refundSum <= Number(p.amount) + 0.001);
    });
    recordPass("20.10: Database integrity check confirms refund totals never exceed payment amount");
  } catch (err) {
    recordFail("CATEGORY 20 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 21 — FULL REAL-WORLD LIFECYCLE");
  console.log("==================================================");

  try {
    // 1. Full Happy Path Lifecycle
    const orderHappy = await createTestOrder(customerUser, 3000);
    await createDeliveryAssignment(orderHappy, deliveryPartnerA);

    // Initialize
    let res = await request("POST", "/payments", customerToken, {
      orderId: orderHappy._id.toString(),
      paymentMethod: "CASH",
    });
    assert.strictEqual(res.status, 201);
    const pid = res.body.data.payment._id;

    // Receive
    res = await request("POST", `/payments/${pid}/receive`, partnerAToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.payment.status, "PAID");

    // Partial refund
    res = await request("POST", `/payments/${pid}/refund`, adminToken, {
      amount: 1000,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.payment.status, "PAID");

    // Final full refund
    res = await request("POST", `/payments/${pid}/refund`, adminToken, {
      amount: 2000,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.payment.status, "REFUNDED");
    recordPass("21.1: Complete real-world happy path lifecycle verified end-to-end");

    // 2. Full Failure & Retry Lifecycle
    const orderRetryPath = await createTestOrder(customerUser, 1800);
    await createDeliveryAssignment(orderRetryPath, deliveryPartnerA);

    // Initialize -> PENDING
    res = await request("POST", "/payments", customerToken, {
      orderId: orderRetryPath._id.toString(),
      paymentMethod: "CASH",
    });
    const pid2 = res.body.data.payment._id;

    // Delivery Partner fails payment -> FAILED
    res = await request("POST", `/payments/${pid2}/fail`, partnerAToken);
    assert.strictEqual(res.status, 200);

    // Customer retries -> PENDING
    res = await request("POST", `/payments/${pid2}/retry`, customerToken, {
      paymentMethod: "UPI",
    });
    assert.strictEqual(res.status, 200);

    // Delivery Partner receives payment -> PAID
    res = await request("POST", `/payments/${pid2}/receive`, partnerAToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.payment.status, "PAID");
    recordPass("21.2: Complete real-world failure and retry lifecycle verified end-to-end");
  } catch (err) {
    recordFail("CATEGORY 21 Execution", err);
  }

  console.log("\n==================================================");
  console.log("CATEGORY 22 — REGRESSION TESTING");
  console.log("==================================================");

  try {
    // 22.1: Verify Order model and status transitions work as expected
    const regOrder = await createTestOrder(customerUser, 500, "PLACED");
    assert.strictEqual(regOrder.status, "PLACED");
    assert.strictEqual(regOrder.paymentStatus, "PENDING");
    recordPass("22.1: Existing Order model and paymentStatus default behavior preserved");

    // 22.2: Verify Assignment model lookups remain functional
    const regAssign = await createDeliveryAssignment(regOrder, deliveryPartnerA);
    assert.strictEqual(regAssign.isActive, true);
    recordPass("22.2: Existing Assignment model and active status lookups preserved");

    // 22.3: Verify Inspection workflow remains functional
    const insp = await InspectionModel.create({
      orderId: regOrder._id,
      inspectorId: adminUser._id,
      status: "DRAFT",
      items: [],
      pricingSummary: {
        initialTotal: 500,
        inspectedSubtotal: 500,
        garmentsSubtotal: 500,
        extraServicesSubtotal: 0,
        adjustmentAmount: 0,
        finalTotalAmount: 500,
      },
      isActive: true,
    });
    assert.strictEqual(insp.status, "DRAFT");
    recordPass("22.3: Inspection model and schema remain functional");
  } catch (err) {
    recordFail("CATEGORY 22 Execution", err);
  }

  console.log("\n==================================================");
  console.log(`SUMMARY: Total Executed: ${passCount + failCount} | Passed: ${passCount} | Failed: ${failCount}`);
  console.log("==================================================");

  if (failures.length > 0) {
    console.error("FAILURES:\n" + failures.join("\n"));
  }

  server.close();
  await disconnectDatabase();
  process.exit(failCount === 0 ? 0 : 1);
}

runTests().catch((err) => {
  console.error("Fatal Test Error:", err);
  process.exit(1);
});
