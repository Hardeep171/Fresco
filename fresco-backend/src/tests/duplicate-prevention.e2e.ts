import { webcrypto } from "node:crypto";
if (typeof globalThis.crypto === "undefined") {
  (globalThis as any).crypto = webcrypto;
}

import assert from "node:assert";
import http from "node:http";
import type { Server } from "node:http";

import app from "../app.js";
import { connectDatabase, disconnectDatabase } from "../lib/database.js";
import { authRepository } from "../repositories/auth.repository.js";
import { authService } from "../services/auth.service.js";
import { UserModel } from "../models/user.model.js";

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
  body?: any,
  token?: string,
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

async function runDuplicatePreventionTests() {
  console.log("\n=======================================================");
  console.log("FRESCO BACKEND — DUPLICATE ACCOUNT PREVENTION TEST SUITE");
  console.log("=======================================================\n");

  await connectDatabase();
  await new Promise<void>((resolve) => {
    server = http.createServer(app).listen(0, () => {
      const address = server.address() as any;
      baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
      resolve();
    });
  });

  // Clean up user collection before starting
  await UserModel.deleteMany({});

  // 1. Register with a new email + new phone -> success (HTTP 201)
  try {
    const res = await request("POST", "/auth/register", {
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      phone: "+919876543210",
      password: "Password@123",
    });

    assert.strictEqual(res.status, 201, `Expected status 201, got ${res.status}`);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.email, "johndoe@example.com");
    assert.strictEqual(res.body.data.user.phone, "+919876543210");
    assert.strictEqual(typeof res.body.data.accessToken, "string");
    assert.strictEqual(typeof res.body.data.refreshToken, "string");
    recordPass("1. Register with new email + new phone succeeds (HTTP 201)");
  } catch (err) {
    recordFail("1. Register with new email + new phone succeeds", err);
  }

  // 2. Password is never returned in registration response
  try {
    const res = await request("POST", "/auth/register", {
      firstName: "Jane",
      lastName: "Smith",
      email: "janesmith@example.com",
      phone: "+919876543211",
      password: "SecretPassword@123",
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.data.user.password, undefined, "Password must not be present on user object");
    assert.strictEqual(res.body.data.user.refreshToken, undefined, "Refresh token must not be in user object");
    assert.strictEqual(res.body.data.user.emailVerificationToken, undefined, "Verification token must not be in user object");
    assert.strictEqual(JSON.stringify(res.body.data.user).includes("SecretPassword"), false, "Password must never appear in payload");
    recordPass("2. Password and secrets are never returned in registration response");
  } catch (err) {
    recordFail("2. Password and secrets are never returned in registration response", err);
  }

  // 3. Register with existing email (different phone) -> rejected (HTTP 409)
  try {
    const res = await request("POST", "/auth/register", {
      firstName: "Duplicate",
      lastName: "EmailUser",
      email: "johndoe@example.com",
      phone: "+919876543299",
      password: "Password@123",
    });

    assert.strictEqual(res.status, 409, `Expected status 409, got ${res.status}`);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, "An account with this email already exists.");
    assert.strictEqual(Array.isArray(res.body.errors), true);
    assert.strictEqual(res.body.errors[0]?.field, "email");
    assert.strictEqual(res.body.errors[0]?.message, "An account with this email already exists.");
    recordPass("3. Register with existing email is rejected (HTTP 409 with field error)");
  } catch (err) {
    recordFail("3. Register with existing email is rejected", err);
  }

  // 4. Register with existing phone (different email) -> rejected (HTTP 409)
  try {
    const res = await request("POST", "/auth/register", {
      firstName: "Duplicate",
      lastName: "PhoneUser",
      email: "brandnewemail@example.com",
      phone: "+919876543210",
      password: "Password@123",
    });

    assert.strictEqual(res.status, 409, `Expected status 409, got ${res.status}`);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, "An account with this phone number already exists.");
    assert.strictEqual(Array.isArray(res.body.errors), true);
    assert.strictEqual(res.body.errors[0]?.field, "phone");
    assert.strictEqual(res.body.errors[0]?.message, "An account with this phone number already exists.");
    recordPass("4. Register with existing phone is rejected (HTTP 409 with field error)");
  } catch (err) {
    recordFail("4. Register with existing phone is rejected", err);
  }

  // 5. Register with email containing uppercase characters matching existing email -> rejected (HTTP 409)
  try {
    const res = await request("POST", "/auth/register", {
      firstName: "Upper",
      lastName: "CaseUser",
      email: "JOHNDOE@EXAMPLE.COM",
      phone: "+919876543288",
      password: "Password@123",
    });

    assert.strictEqual(res.status, 409, `Expected status 409, got ${res.status}`);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, "An account with this email already exists.");
    assert.strictEqual(res.body.errors[0]?.field, "email");
    recordPass("5. Register with uppercase email matching existing email is rejected (HTTP 409)");
  } catch (err) {
    recordFail("5. Register with uppercase email matching existing email is rejected", err);
  }

  // 6. Register with leading/trailing email whitespace matching existing email -> rejected (HTTP 409)
  try {
    const res = await request("POST", "/auth/register", {
      firstName: "Whitespace",
      lastName: "User",
      email: "   johndoe@example.com   ",
      phone: "+919876543277",
      password: "Password@123",
    });

    assert.strictEqual(res.status, 409, `Expected status 409, got ${res.status}`);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, "An account with this email already exists.");
    assert.strictEqual(res.body.errors[0]?.field, "email");
    recordPass("6. Register with leading/trailing whitespace email matching existing email is rejected (HTTP 409)");
  } catch (err) {
    recordFail("6. Register with leading/trailing whitespace email matching existing email is rejected", err);
  }

  // 7. Register with both existing email and existing phone -> rejected with both field errors (HTTP 409)
  try {
    const res = await request("POST", "/auth/register", {
      firstName: "Both",
      lastName: "Duplicate",
      email: "johndoe@example.com",
      phone: "+919876543210",
      password: "Password@123",
    });

    assert.strictEqual(res.status, 409, `Expected status 409, got ${res.status}`);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, "An account with this email or phone number already exists.");
    assert.strictEqual(res.body.errors.length, 2);
    const emailErr = res.body.errors.find((e: any) => e.field === "email");
    const phoneErr = res.body.errors.find((e: any) => e.field === "phone");
    assert(emailErr !== undefined, "email field error must be present");
    assert(phoneErr !== undefined, "phone field error must be present");
    recordPass("7. Register with both existing email and phone returns both field errors (HTTP 409)");
  } catch (err) {
    recordFail("7. Register with both existing email and phone returns both field errors", err);
  }

  // 8. Duplicate-key race-condition path handled gracefully via Mongo duplicate key error
  try {
    // Directly bypass pre-check and simulate duplicate key error on createUser
    const originalFind = authRepository.findExistingUsersByEmailOrPhone;
    (authRepository as any).findExistingUsersByEmailOrPhone = async () => [];

    let caughtError: any = null;
    try {
      await authService.register({
        firstName: "Race",
        lastName: "Condition",
        email: "johndoe@example.com",
        phone: "+919876543200",
        password: "Password@123",
      });
    } catch (err) {
      caughtError = err;
    } finally {
      authRepository.findExistingUsersByEmailOrPhone = originalFind;
    }

    assert(caughtError !== null, "Must catch duplicate-key error");
    assert.strictEqual(caughtError.statusCode, 409);
    assert.strictEqual(caughtError.message, "An account with this email already exists.");
    assert.strictEqual(caughtError.errors[0]?.field, "email");
    recordPass("8. Duplicate-key race condition converts to friendly 409 ApiError with field detail");
  } catch (err) {
    recordFail("8. Duplicate-key race condition converts to friendly 409 ApiError", err);
  }

  // 9. Error response does not expose MongoDB internals
  try {
    const res = await request("POST", "/auth/register", {
      firstName: "Test",
      lastName: "Internal",
      email: "johndoe@example.com",
      phone: "+919876543299",
      password: "Password@123",
    });

    const rawJson = JSON.stringify(res.body);
    assert(!rawJson.includes("E11000"), "Must not expose E11000 error code");
    assert(!rawJson.includes("dup key"), "Must not expose dup key internal MongoDB text");
    assert(!rawJson.includes("MongoServerError"), "Must not expose MongoServerError class name");
    assert(!rawJson.includes("stack"), "Must not expose stack traces");
    recordPass("9. Error response does not expose MongoDB internals");
  } catch (err) {
    recordFail("9. Error response does not expose MongoDB internals", err);
  }

  // 10. Existing login still works normally
  try {
    const res = await request("POST", "/auth/login", {
      email: "johndoe@example.com",
      password: "Password@123",
    });

    assert.strictEqual(res.status, 200, `Expected status 200, got ${res.status}`);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.email, "johndoe@example.com");
    assert.strictEqual(typeof res.body.data.accessToken, "string");
    recordPass("10. Existing login works normally (HTTP 200)");
  } catch (err) {
    recordFail("10. Existing login works normally", err);
  }

  // 11. Login with uppercase and trimmed email works normally
  try {
    const res = await request("POST", "/auth/login", {
      email: "  JOHNDOE@EXAMPLE.COM  ",
      password: "Password@123",
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.email, "johndoe@example.com");
    recordPass("11. Login with uppercase / trimmed email works normally");
  } catch (err) {
    recordFail("11. Login with uppercase / trimmed email works normally", err);
  }

  // 12. Database level uniqueness: Direct insert of duplicate phone/email throws MongoServerError E11000
  try {
    let duplicateEmailThrown = false;
    try {
      await UserModel.create({
        firstName: "Direct",
        lastName: "DuplicateEmail",
        email: "johndoe@example.com",
        phone: "+919876543999",
        password: "Password@123",
        role: "CUSTOMER",
      });
    } catch (err: any) {
      if (err.code === 11000) {
        duplicateEmailThrown = true;
      }
    }
    assert.strictEqual(duplicateEmailThrown, true, "Database unique index must reject duplicate email with 11000");

    let duplicatePhoneThrown = false;
    try {
      await UserModel.create({
        firstName: "Direct",
        lastName: "DuplicatePhone",
        email: "directphone@example.com",
        phone: "+919876543210",
        password: "Password@123",
        role: "CUSTOMER",
      });
    } catch (err: any) {
      if (err.code === 11000) {
        duplicatePhoneThrown = true;
      }
    }
    assert.strictEqual(duplicatePhoneThrown, true, "Database unique index must reject duplicate phone with 11000");

    recordPass("12. Database unique indexes strictly enforce uniqueness on email and phone");
  } catch (err) {
    recordFail("12. Database unique indexes strictly enforce uniqueness on email and phone", err);
  }

  // Cleanup & Summary
  server.close();
  await disconnectDatabase();

  console.log("\n-------------------------------------------------------");
  console.log(`TOTAL: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log("-------------------------------------------------------\n");

  if (failCount > 0) {
    process.exit(1);
  }
}

void runDuplicatePreventionTests();
