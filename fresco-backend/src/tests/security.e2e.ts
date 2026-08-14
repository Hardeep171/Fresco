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
import { CategoryModel } from "../models/category.model.js";
import { DeliveryTaskModel } from "../models/delivery-task.model.js";
import { GarmentModel } from "../models/garment.model.js";
import { OrderModel } from "../models/order.model.js";
import { PricingModel } from "../models/pricing.model.js";
import { ServiceModel } from "../models/service.model.js";
import { UserModel } from "../models/user.model.js";
import { generateAccessToken } from "../utils/jwt.js";

let server: Server;
let baseUrl: string;

let customerA: any;
let customerB: any;
let partnerA: any;
let partnerB: any;
let adminUser: any;

let customerAToken: string;
let customerBToken: string;
let partnerAToken: string;
let partnerBToken: string;
let adminToken: string;

let testCategory: any;
let testGarment: any;
let testService: any;
let testPricing: any;
let orderA: any;
let orderB: any;

let passCount = 0;
let failCount = 0;

function recordPass(testName: string) {
  passCount++;
  console.log(`[PASS] ${testName}`);
}

function recordFail(testName: string, error: unknown) {
  failCount++;
  console.error(`[FAIL] ${testName}:`, error);
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

async function setupTestData() {
  await UserModel.deleteMany({});
  await CategoryModel.deleteMany({});
  await GarmentModel.deleteMany({});
  await ServiceModel.deleteMany({});
  await PricingModel.deleteMany({});
  await OrderModel.deleteMany({});
  await AssignmentModel.deleteMany({});
  await DeliveryTaskModel.deleteMany({});

  customerA = await UserModel.create({
    firstName: "Customer",
    lastName: "Alice",
    email: "alice@example.com",
    password: "hashedpassword123",
    phone: "+919876543210",
    role: "CUSTOMER",
    status: "ACTIVE",
  });

  customerB = await UserModel.create({
    firstName: "Customer",
    lastName: "Bob",
    email: "bob@example.com",
    password: "hashedpassword123",
    phone: "+919876543211",
    role: "CUSTOMER",
    status: "ACTIVE",
  });

  partnerA = await UserModel.create({
    firstName: "Partner",
    lastName: "Charlie",
    email: "charlie@example.com",
    password: "hashedpassword123",
    phone: "+919876543212",
    role: "DELIVERY_PARTNER",
    status: "ACTIVE",
  });

  partnerB = await UserModel.create({
    firstName: "Partner",
    lastName: "David",
    email: "david@example.com",
    password: "hashedpassword123",
    phone: "+919876543213",
    role: "DELIVERY_PARTNER",
    status: "ACTIVE",
  });

  adminUser = await UserModel.create({
    firstName: "Admin",
    lastName: "Eva",
    email: "eva@example.com",
    password: "hashedpassword123",
    phone: "+919876543214",
    role: "ADMIN",
    status: "ACTIVE",
  });

  customerAToken = await generateAccessToken({
    userId: customerA._id.toString(),
    role: customerA.role,
  });

  customerBToken = await generateAccessToken({
    userId: customerB._id.toString(),
    role: customerB.role,
  });

  partnerAToken = await generateAccessToken({
    userId: partnerA._id.toString(),
    role: partnerA.role,
  });

  partnerBToken = await generateAccessToken({
    userId: partnerB._id.toString(),
    role: partnerB.role,
  });

  adminToken = await generateAccessToken({
    userId: adminUser._id.toString(),
    role: adminUser.role,
  });

  testCategory = await CategoryModel.create({
    name: "Tops",
    description: "Shirts and Tops",
    isActive: true,
  });

  testGarment = await GarmentModel.create({
    name: "Shirt",
    categoryId: testCategory._id,
    isActive: true,
  });

  testService = await ServiceModel.create({
    name: "Dry Clean",
    description: "Dry cleaning service",
    isActive: true,
  });

  testPricing = await PricingModel.create({
    garmentId: testGarment._id,
    serviceId: testService._id,
    price: 150,
    isActive: true,
  });

  orderA = await OrderModel.create({
    userId: customerA._id,
    items: [
      {
        garmentId: testGarment._id,
        serviceId: testService._id,
        garmentName: "Shirt",
        serviceName: "Dry Clean",
        quantity: 2,
        unitPrice: 150,
        totalPrice: 300,
      },
    ],
    pricing: {
      subtotal: 300,
      discount: 0,
      tax: 0,
      deliveryCharge: 0,
      totalAmount: 300,
    },
    pickupAddress: {
      fullName: "Customer Alice",
      phone: "9876543210",
      addressLine1: "123 Main St",
      city: "Metropolis",
      state: "State",
      postalCode: "110001",
      country: "India",
    },
    deliveryAddress: {
      fullName: "Customer Alice",
      phone: "9876543210",
      addressLine1: "123 Main St",
      city: "Metropolis",
      state: "State",
      postalCode: "110001",
      country: "India",
    },
    status: "CONFIRMED",
    paymentStatus: "PENDING",
  });

  orderB = await OrderModel.create({
    userId: customerB._id,
    items: [
      {
        garmentId: testGarment._id,
        serviceId: testService._id,
        garmentName: "Shirt",
        serviceName: "Dry Clean",
        quantity: 1,
        unitPrice: 150,
        totalPrice: 150,
      },
    ],
    pricing: {
      subtotal: 150,
      discount: 0,
      tax: 0,
      deliveryCharge: 0,
      totalAmount: 150,
    },
    pickupAddress: {
      fullName: "Customer Bob",
      phone: "9876543211",
      addressLine1: "456 Side St",
      city: "Metropolis",
      state: "State",
      postalCode: "110001",
      country: "India",
    },
    deliveryAddress: {
      fullName: "Customer Bob",
      phone: "9876543211",
      addressLine1: "456 Side St",
      city: "Metropolis",
      state: "State",
      postalCode: "110001",
      country: "India",
    },
    status: "CONFIRMED",
    paymentStatus: "PENDING",
  });

  // Assign Partner A to Order A
  await AssignmentModel.create({
    orderId: orderA._id,
    partnerId: partnerA._id,
    assignmentType: "PICKUP",
    assignedBy: adminUser._id,
    assignedAt: new Date(),
    status: "ASSIGNED",
    isActive: true,
  });
}

async function runSecurityTests() {
  console.log("\n==================================================");
  console.log("STARTING P0 SECURITY & AUTHORIZATION VERIFICATION");
  console.log("==================================================\n");

  await connectDatabase();
  await new Promise<void>((resolve) => {
    server = http.createServer(app).listen(0, () => {
      const address = server.address() as any;
      baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
      resolve();
    });
  });

  await setupTestData();

  // Test 1: Customer can retrieve own order
  try {
    const res = await request("GET", `/orders/${orderA._id}`, customerAToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.order._id.toString(), orderA._id.toString());
    recordPass("1. Customer can retrieve own order (HTTP 200)");
  } catch (err) {
    recordFail("1. Customer can retrieve own order", err);
  }

  // Test 2: Customer cannot retrieve another customer's order
  try {
    const res = await request("GET", `/orders/${orderB._id}`, customerAToken);
    assert.strictEqual(res.status, 403);
    recordPass("2. Customer cannot retrieve another customer's order (HTTP 403)");
  } catch (err) {
    recordFail("2. Customer cannot retrieve another customer's order", err);
  }

  // Test 3: Admin can retrieve authorized administrative order data
  try {
    const res = await request("GET", `/orders/${orderA._id}`, adminToken);
    assert.strictEqual(res.status, 200);
    recordPass("3. Admin can retrieve authorized administrative order data (HTTP 200)");
  } catch (err) {
    recordFail("3. Admin can retrieve authorized administrative order data", err);
  }

  // Test 4: Delivery partner cannot retrieve unrelated customer's order
  try {
    const resUnrelated = await request("GET", `/orders/${orderB._id}`, partnerAToken);
    assert.strictEqual(resUnrelated.status, 403);
    
    // Partner A IS assigned to Order A -> should be allowed
    const resAssigned = await request("GET", `/orders/${orderA._id}`, partnerAToken);
    assert.strictEqual(resAssigned.status, 200);

    recordPass("4. Delivery partner cannot retrieve unrelated customer's order (HTTP 403), but can access assigned order (HTTP 200)");
  } catch (err) {
    recordFail("4. Delivery partner order access test", err);
  }

  // Test 5: Customer cannot create category
  try {
    const res = await request("POST", "/categories", customerAToken, { name: "Bottoms" });
    assert.strictEqual(res.status, 403);
    recordPass("5. Customer cannot create category (HTTP 403)");
  } catch (err) {
    recordFail("5. Customer cannot create category", err);
  }

  // Test 6: Customer cannot modify category
  try {
    const res = await request("PATCH", `/categories/${testCategory._id}`, customerAToken, { name: "New Name" });
    assert.strictEqual(res.status, 403);
    recordPass("6. Customer cannot modify category (HTTP 403)");
  } catch (err) {
    recordFail("6. Customer cannot modify category", err);
  }

  // Test 7: Delivery partner cannot modify category
  try {
    const res = await request("PATCH", `/categories/${testCategory._id}`, partnerAToken, { name: "Partner Name" });
    assert.strictEqual(res.status, 403);
    recordPass("7. Delivery partner cannot modify category (HTTP 403)");
  } catch (err) {
    recordFail("7. Delivery partner cannot modify category", err);
  }

  // Test 8: Customer cannot create garment
  try {
    const res = await request("POST", "/garments", customerAToken, { name: "Pants", categoryId: testCategory._id });
    assert.strictEqual(res.status, 403);
    recordPass("8. Customer cannot create garment (HTTP 403)");
  } catch (err) {
    recordFail("8. Customer cannot create garment", err);
  }

  // Test 9: Customer cannot modify garment
  try {
    const res = await request("PATCH", `/garments/${testGarment._id}`, customerAToken, { name: "Pants" });
    assert.strictEqual(res.status, 403);
    recordPass("9. Customer cannot modify garment (HTTP 403)");
  } catch (err) {
    recordFail("9. Customer cannot modify garment", err);
  }

  // Test 10: Customer cannot create service
  try {
    const res = await request("POST", "/services", customerAToken, { name: "Ironing" });
    assert.strictEqual(res.status, 403);
    recordPass("10. Customer cannot create service (HTTP 403)");
  } catch (err) {
    recordFail("10. Customer cannot create service", err);
  }

  // Test 11: Customer cannot modify service
  try {
    const res = await request("PATCH", `/services/${testService._id}`, customerAToken, { name: "Steam Iron" });
    assert.strictEqual(res.status, 403);
    recordPass("11. Customer cannot modify service (HTTP 403)");
  } catch (err) {
    recordFail("11. Customer cannot modify service", err);
  }

  // Test 12: Customer cannot create pricing
  try {
    const res = await request("POST", "/pricing", customerAToken, { garmentId: testGarment._id, serviceId: testService._id, price: 200 });
    assert.strictEqual(res.status, 403);
    recordPass("12. Customer cannot create pricing (HTTP 403)");
  } catch (err) {
    recordFail("12. Customer cannot create pricing", err);
  }

  // Test 13: Customer cannot modify pricing
  try {
    const res = await request("PATCH", `/pricing/${testPricing._id}`, customerAToken, { price: 250 });
    assert.strictEqual(res.status, 403);
    recordPass("13. Customer cannot modify pricing (HTTP 403)");
  } catch (err) {
    recordFail("13. Customer cannot modify pricing", err);
  }

  // Test 14: Customer cannot access GET /orders/all
  try {
    const res = await request("GET", "/orders/all", customerAToken);
    assert.strictEqual(res.status, 403);
    recordPass("14. Customer cannot access GET /orders/all (HTTP 403)");
  } catch (err) {
    recordFail("14. Customer cannot access GET /orders/all", err);
  }

  // Test 15: Customer cannot modify order status
  try {
    const res = await request("PATCH", `/orders/${orderA._id}/status`, customerAToken, { status: "DELIVERED" });
    assert.strictEqual(res.status, 403);
    recordPass("15. Customer cannot modify order status (HTTP 403)");
  } catch (err) {
    recordFail("15. Customer cannot modify order status", err);
  }

  // Test 16: Customer cannot modify payment status
  try {
    const res = await request("PATCH", `/orders/${orderA._id}/payment-status`, customerAToken, { paymentStatus: "PAID" });
    assert.strictEqual(res.status, 403);
    recordPass("16. Customer cannot modify payment status (HTTP 403)");
  } catch (err) {
    recordFail("16. Customer cannot modify payment status", err);
  }

  // Test 17: Customer cannot access admin assignment listing
  try {
    const res = await request("GET", "/assignments", customerAToken);
    assert.strictEqual(res.status, 403);
    recordPass("17. Customer cannot access admin assignment listing (HTTP 403)");
  } catch (err) {
    recordFail("17. Customer cannot access admin assignment listing", err);
  }

  // Test 18: Customer cannot modify assignment status
  try {
    const res = await request("PATCH", `/assignments/${orderA._id}/status`, customerAToken, { status: "COMPLETED" });
    assert.strictEqual(res.status, 403);
    recordPass("18. Customer cannot modify assignment status (HTTP 403)");
  } catch (err) {
    recordFail("18. Customer cannot modify assignment status", err);
  }

  // Test 19: Customer cannot access admin delivery-task listing
  try {
    const res = await request("GET", "/delivery-tasks", customerAToken);
    assert.strictEqual(res.status, 403);
    recordPass("19. Customer cannot access admin delivery-task listing (HTTP 403)");
  } catch (err) {
    recordFail("19. Customer cannot access admin delivery-task listing", err);
  }

  // Test 20: Customer cannot modify delivery-task status
  try {
    const res = await request("PATCH", `/delivery-tasks/${orderA._id}/status`, customerAToken, { status: "COMPLETED" });
    assert.strictEqual(res.status, 403);
    recordPass("20. Customer cannot modify delivery-task status (HTTP 403)");
  } catch (err) {
    recordFail("20. Customer cannot modify delivery-task status", err);
  }

  // Test 21: Allowed administrative roles can access their permitted endpoints
  try {
    const resCategories = await request("POST", "/categories", adminToken, { name: "Bottoms" });
    assert.strictEqual(resCategories.status, 201);
    
    const resOrders = await request("GET", "/orders/all", adminToken);
    assert.strictEqual(resOrders.status, 200);

    recordPass("21. Allowed administrative roles can access their permitted endpoints (HTTP 200/201)");
  } catch (err) {
    recordFail("21. Allowed administrative roles access test", err);
  }

  // Test 22: Existing delivery-partner-specific endpoints still work
  try {
    const resPartnerAssignments = await request("GET", "/assignments/partner", partnerAToken);
    assert.strictEqual(resPartnerAssignments.status, 200);

    const resPartnerTasks = await request("GET", "/delivery-tasks/partner", partnerAToken);
    assert.strictEqual(resPartnerTasks.status, 200);

    recordPass("22. Existing delivery-partner-specific endpoints still work (HTTP 200)");
  } catch (err) {
    recordFail("22. Existing delivery-partner-specific endpoints test", err);
  }

  // Test 23: Invalid boolean query parameter returns HTTP 400 Bad Request
  try {
    const res = await request("GET", "/garments?isActive=invalid");
    assert.strictEqual(res.status, 400);
    recordPass("23. Invalid boolean query parameter returns HTTP 400 Bad Request");
  } catch (err) {
    recordFail("23. Invalid boolean query parameter returns HTTP 400 Bad Request", err);
  }

  // Test 24: Invalid ObjectId query parameter returns HTTP 400 Bad Request
  try {
    const res = await request("GET", "/garments?categoryId=invalid-id");
    assert.strictEqual(res.status, 400);
    recordPass("24. Invalid ObjectId query parameter returns HTTP 400 Bad Request");
  } catch (err) {
    recordFail("24. Invalid ObjectId query parameter returns HTTP 400 Bad Request", err);
  }

  // Test 25: Invalid enum query parameter returns HTTP 400 Bad Request
  try {
    const res = await request("GET", "/orders/all?status=INVALID", adminToken);
    assert.strictEqual(res.status, 400);
    recordPass("25. Invalid enum query parameter returns HTTP 400 Bad Request");
  } catch (err) {
    recordFail("25. Invalid enum query parameter returns HTTP 400 Bad Request", err);
  }

  // Test 26: Valid boolean query parameters return HTTP 200 OK
  try {
    const resTrue = await request("GET", "/garments?isActive=true");
    assert.strictEqual(resTrue.status, 200);

    const resFalse = await request("GET", "/garments?isActive=false");
    assert.strictEqual(resFalse.status, 200);

    recordPass("26. Valid boolean query parameters return HTTP 200 OK");
  } catch (err) {
    recordFail("26. Valid boolean query parameters return HTTP 200 OK", err);
  }

  // Test 27: Strict invalid boolean query parameters ("1", "0", "hello") return HTTP 400 Bad Request
  try {
    const resOne = await request("GET", "/garments?isActive=1");
    assert.strictEqual(resOne.status, 400);

    const resZero = await request("GET", "/garments?isActive=0");
    assert.strictEqual(resZero.status, 400);

    const resHello = await request("GET", "/garments?isActive=hello");
    assert.strictEqual(resHello.status, 400);

    recordPass("27. Strict invalid boolean query parameters return HTTP 400 Bad Request");
  } catch (err) {
    recordFail("27. Strict invalid boolean query parameters return HTTP 400 Bad Request", err);
  }

  // Test 28: Multiple invalid ObjectId query parameters return HTTP 400 Bad Request
  try {
    const resUser = await request("GET", "/orders/all?userId=invalid", adminToken);
    assert.strictEqual(resUser.status, 400);

    const resCustomer = await request("GET", "/payments?customerId=invalid", adminToken);
    assert.strictEqual(resCustomer.status, 400);

    const resPartner = await request("GET", "/assignments?partnerId=invalid", adminToken);
    assert.strictEqual(resPartner.status, 400);

    recordPass("28. Multiple invalid ObjectId query parameters return HTTP 400 Bad Request");
  } catch (err) {
    recordFail("28. Multiple invalid ObjectId query parameters return HTTP 400 Bad Request", err);
  }

  // Test 29: Multiple invalid enum query parameters return HTTP 400 Bad Request
  try {
    const resPaymentStatus = await request("GET", "/payments?status=INVALID", adminToken);
    assert.strictEqual(resPaymentStatus.status, 400);

    const resAssignType = await request("GET", "/assignments?assignmentType=INVALID", adminToken);
    assert.strictEqual(resAssignType.status, 400);

    const resTaskType = await request("GET", "/delivery-tasks?taskType=INVALID", adminToken);
    assert.strictEqual(resTaskType.status, 400);

    recordPass("29. Multiple invalid enum query parameters return HTTP 400 Bad Request");
  } catch (err) {
    recordFail("29. Multiple invalid enum query parameters return HTTP 400 Bad Request", err);
  }

  // Test 30: Valid query filters return HTTP 200 OK
  try {
    const resValidOrder = await request("GET", "/orders/all?status=PLACED", adminToken);
    assert.strictEqual(resValidOrder.status, 200);

    const resValidGarment = await request("GET", "/garments?isActive=true");
    assert.strictEqual(resValidGarment.status, 200);

    recordPass("30. Valid query filters return HTTP 200 OK");
  } catch (err) {
    recordFail("30. Valid query filters return HTTP 200 OK", err);
  }

  // Test 31: Unauthenticated requests reject with HTTP 401 Unauthorized
  try {
    const resNoHeader = await request("GET", "/orders/all");
    assert.strictEqual(resNoHeader.status, 401);

    const resMalformedHeader = await request("GET", "/orders/all", "malformed_token_string");
    assert.strictEqual(resMalformedHeader.status, 401);

    recordPass("31. Unauthenticated requests reject with HTTP 401 Unauthorized");
  } catch (err) {
    recordFail("31. Unauthenticated requests reject with HTTP 401 Unauthorized", err);
  }

  // Test 32: Full Admin CRUD & Soft-Delete Lifecycle for Category
  try {
    const resCreate = await request("POST", "/categories", adminToken, { name: "Jackets & Outerwear", description: "Winter jackets" });
    assert.strictEqual(resCreate.status, 201);
    assert.strictEqual(resCreate.body.success, true);
    const catId = resCreate.body.data.category._id;

    const resGetList = await request("GET", "/categories");
    assert.strictEqual(resGetList.status, 200);

    const resGetId = await request("GET", `/categories/${catId}`);
    assert.strictEqual(resGetId.status, 200);

    const resUpdate = await request("PATCH", `/categories/${catId}`, adminToken, { description: "Updated Outerwear" });
    assert.strictEqual(resUpdate.status, 200);

    const resDisable = await request("DELETE", `/categories/${catId}`, adminToken);
    assert.strictEqual(resDisable.status, 200);
    assert.strictEqual(resDisable.body.data.category.isActive, false);

    const resEnable = await request("PATCH", `/categories/${catId}/enable`, adminToken);
    assert.strictEqual(resEnable.status, 200);
    assert.strictEqual(resEnable.body.data.category.isActive, true);

    recordPass("32. Full Admin CRUD & Soft-Delete Lifecycle for Category");
  } catch (err) {
    recordFail("32. Full Admin CRUD & Soft-Delete Lifecycle for Category", err);
  }

  // Test 33: Full Admin CRUD & Soft-Delete Lifecycle for Garment
  try {
    const resCreate = await request("POST", "/garments", adminToken, { name: "Denim Jacket", categoryId: testCategory._id });
    assert.strictEqual(resCreate.status, 201);
    const garmId = resCreate.body.data.garment._id;

    const resGetList = await request("GET", "/garments");
    assert.strictEqual(resGetList.status, 200);

    const resGetId = await request("GET", `/garments/${garmId}`);
    assert.strictEqual(resGetId.status, 200);

    const resUpdate = await request("PATCH", `/garments/${garmId}`, adminToken, { name: "Fleece Jacket" });
    assert.strictEqual(resUpdate.status, 200);

    const resDisable = await request("DELETE", `/garments/${garmId}`, adminToken);
    assert.strictEqual(resDisable.status, 200);
    assert.strictEqual(resDisable.body.data.garment.isActive, false);

    const resEnable = await request("PATCH", `/garments/${garmId}/enable`, adminToken);
    assert.strictEqual(resEnable.status, 200);
    assert.strictEqual(resEnable.body.data.garment.isActive, true);

    recordPass("33. Full Admin CRUD & Soft-Delete Lifecycle for Garment");
  } catch (err) {
    recordFail("33. Full Admin CRUD & Soft-Delete Lifecycle for Garment", err);
  }

  // Test 34: Full Admin CRUD & Soft-Delete Lifecycle for Service
  try {
    const resCreate = await request("POST", "/services", adminToken, { name: "Stain Removal", description: "Special stain cleaning" });
    assert.strictEqual(resCreate.status, 201);
    const servId = resCreate.body.data.service._id;

    const resGetList = await request("GET", "/services");
    assert.strictEqual(resGetList.status, 200);

    const resGetId = await request("GET", `/services/${servId}`);
    assert.strictEqual(resGetId.status, 200);

    const resUpdate = await request("PATCH", `/services/${servId}`, adminToken, { description: "Deep stain treatment" });
    assert.strictEqual(resUpdate.status, 200);

    const resDisable = await request("DELETE", `/services/${servId}`, adminToken);
    assert.strictEqual(resDisable.status, 200);
    assert.strictEqual(resDisable.body.data.service.isActive, false);

    const resEnable = await request("PATCH", `/services/${servId}/enable`, adminToken);
    assert.strictEqual(resEnable.status, 200);
    assert.strictEqual(resEnable.body.data.service.isActive, true);

    recordPass("34. Full Admin CRUD & Soft-Delete Lifecycle for Service");
  } catch (err) {
    recordFail("34. Full Admin CRUD & Soft-Delete Lifecycle for Service", err);
  }

  // Test 35: Full Admin CRUD & Soft-Delete Lifecycle for Pricing
  try {
    const resGarment = await request("POST", "/garments", adminToken, { name: "Pricing Test Coat", categoryId: testCategory._id });
    assert.strictEqual(resGarment.status, 201);
    const newGarmentId = resGarment.body.data.garment._id;

    const resCreate = await request("POST", "/pricing", adminToken, { garmentId: newGarmentId, serviceId: testService._id, price: 180 });
    assert.strictEqual(resCreate.status, 201);
    const prcId = resCreate.body.data.pricing._id;

    const resGetList = await request("GET", "/pricing");
    assert.strictEqual(resGetList.status, 200);

    const resGetId = await request("GET", `/pricing/${prcId}`);
    assert.strictEqual(resGetId.status, 200);

    const resUpdate = await request("PATCH", `/pricing/${prcId}`, adminToken, { price: 200 });
    assert.strictEqual(resUpdate.status, 200);

    const resDisable = await request("DELETE", `/pricing/${prcId}`, adminToken);
    assert.strictEqual(resDisable.status, 200);
    assert.strictEqual(resDisable.body.data.pricing.isActive, false);

    const resEnable = await request("PATCH", `/pricing/${prcId}/enable`, adminToken);
    assert.strictEqual(resEnable.status, 200);
    assert.strictEqual(resEnable.body.data.pricing.isActive, true);

    recordPass("35. Full Admin CRUD & Soft-Delete Lifecycle for Pricing");
  } catch (err) {
    recordFail("35. Full Admin CRUD & Soft-Delete Lifecycle for Pricing", err);
  }

  // Test 36: Standard API Success Response Contract Verification
  try {
    const res = await request("GET", "/categories");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(typeof res.body.success, "boolean");
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(typeof res.body.message, "string");
    assert.strictEqual(typeof res.body.data, "object");

    recordPass("36. Standard API Success Response Contract Verification");
  } catch (err) {
    recordFail("36. Standard API Success Response Contract Verification", err);
  }

  // Cleanup & Summary
  server.close();
  await disconnectDatabase();

  console.log("\n==================================================");
  console.log(`SUMMARY: Total Passed: ${passCount} | Total Failed: ${failCount}`);
  console.log("==================================================\n");

  if (failCount > 0) {
    process.exit(1);
  }
}

void runSecurityTests();
