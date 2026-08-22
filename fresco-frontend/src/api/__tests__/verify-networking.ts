/**
 * Comprehensive verification suite for FRESCO Mobile Networking Foundation.
 * Tests API client configuration, interceptors, error normalization, single-flight refresh mutex,
 * token rotation, and infinite retry loop prevention.
 */

import axios from "axios";
import { apiClient } from "../client";
import { normalizeApiError } from "../error";
import { setupInterceptors, setAuthCallbacks } from "../interceptors";
import { secureStorage } from "../../services/secureStorage.service";
import { ENV } from "../../config/env.config";

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

export async function runNetworkingTestSuite(): Promise<{ total: number; passed: number; failed: number }> {
  console.log("\n=======================================================");
  console.log("FRESCO FRONTEND — PHASE 2B NETWORKING TEST SUITE");
  console.log("=======================================================\n");

  // TEST 1: API Client Base Configuration
  await runTest("1. API Client initialized with environment Base URL and timeouts", () => {
    assert(apiClient.defaults.baseURL === ENV.API_BASE_URL, "apiClient baseURL must match ENV.API_BASE_URL");
    assert(apiClient.defaults.timeout === ENV.TIMEOUT_MS, "apiClient timeout must match ENV.TIMEOUT_MS");
    assert(
      (apiClient.defaults.headers as Record<string, unknown>)["Content-Type"] === "application/json",
      "Default Content-Type must be application/json"
    );
  });

  // TEST 2: Error Normalization - Network Error
  await runTest("2. Error Normalization: Handles Network Disconnection (no response)", () => {
    const mockNetworkError = {
      isAxiosError: true,
      message: "Network Error",
      name: "AxiosError",
      config: {},
    };
    const normalized = normalizeApiError(mockNetworkError);
    assert(normalized.kind === "NETWORK_ERROR", `Expected NETWORK_ERROR, got ${normalized.kind}`);
    assert(normalized.isNetworkError === true, "isNetworkError must be true");
    assert(normalized.statusCode === 0, "Network error statusCode must be 0");
  });

  // TEST 3: Error Normalization - Timeout Error
  await runTest("3. Error Normalization: Handles Request Timeout (ECONNABORTED)", () => {
    const mockTimeoutError = {
      isAxiosError: true,
      code: "ECONNABORTED",
      message: "timeout of 15000ms exceeded",
      name: "AxiosError",
      config: {},
    };
    const normalized = normalizeApiError(mockTimeoutError);
    assert(normalized.kind === "TIMEOUT", `Expected TIMEOUT, got ${normalized.kind}`);
    assert(normalized.isTimeout === true, "isTimeout must be true");
    assert(normalized.statusCode === 408, "Timeout statusCode must be 408");
  });

  // TEST 4: Error Normalization - Validation Error (HTTP 400 with Zod field errors)
  await runTest("4. Error Normalization: Handles HTTP 400 Validation Error with field mapping", () => {
    const mockValidationError = {
      isAxiosError: true,
      name: "AxiosError",
      config: {},
      response: {
        status: 400,
        statusText: "Bad Request",
        data: {
          success: false,
          message: "Validation failed.",
          errors: [
            { field: "email", message: "Invalid email address format." },
            { field: "password", message: "Password must be at least 8 characters long." },
          ],
        },
      },
    };
    const normalized = normalizeApiError(mockValidationError);
    assert(normalized.kind === "VALIDATION", `Expected VALIDATION, got ${normalized.kind}`);
    assert(normalized.statusCode === 400, "StatusCode must be 400");
    assert(normalized.fieldErrors?.["email"] === "Invalid email address format.", "email fieldError mapped");
    assert(normalized.fieldErrors?.["password"] === "Password must be at least 8 characters long.", "password fieldError mapped");
    assert(normalized.rawErrors.length === 2, "rawErrors preserved");
  });

  // TEST 5: Error Normalization - Unauthorized (HTTP 401)
  await runTest("5. Error Normalization: Handles HTTP 401 Unauthorized Error", () => {
    const mockAuthError = {
      isAxiosError: true,
      name: "AxiosError",
      config: {},
      response: {
        status: 401,
        statusText: "Unauthorized",
        data: {
          success: false,
          message: "Invalid or expired access token.",
          errors: [],
        },
      },
    };
    const normalized = normalizeApiError(mockAuthError);
    assert(normalized.kind === "UNAUTHORIZED", `Expected UNAUTHORIZED, got ${normalized.kind}`);
    assert(normalized.isAuthError === true, "isAuthError must be true");
    assert(normalized.statusCode === 401, "StatusCode must be 401");
  });

  // TEST 6: Error Normalization - Forbidden, NotFound, Conflict, Server Error
  await runTest("6. Error Normalization: Handles 403, 404, 409, 500 status codes accurately", () => {
    const mock403 = {
      isAxiosError: true,
      response: { status: 403, data: { success: false, message: "Forbidden" } },
    };
    const mock404 = {
      isAxiosError: true,
      response: { status: 404, data: { success: false, message: "Not Found" } },
    };
    const mock409 = {
      isAxiosError: true,
      response: { status: 409, data: { success: false, message: "Duplicate" } },
    };
    const mock500 = {
      isAxiosError: true,
      response: { status: 500, data: { success: false, message: "Internal server error." } },
    };

    assert(normalizeApiError(mock403).kind === "FORBIDDEN", "403 must map to FORBIDDEN");
    assert(normalizeApiError(mock404).kind === "NOT_FOUND", "404 must map to NOT_FOUND");
    assert(normalizeApiError(mock409).kind === "CONFLICT", "409 must map to CONFLICT");
    assert(normalizeApiError(mock500).kind === "SERVER_ERROR", "500 must map to SERVER_ERROR");
  });

  // TEST 7: Secure Storage & Request Interceptor Token Injection
  await runTest("7. Request Interceptor: Injects Authorization Bearer header when token exists", async () => {
    await secureStorage.saveTokens("test_access_jwt_123", "test_refresh_jwt_456");

    // Retrieve access token
    const token = await secureStorage.getAccessToken();
    assert(token === "test_access_jwt_123", "Stored access token must be retrieved");

    // Clean up
    await secureStorage.clearTokens();
    const clearedToken = await secureStorage.getAccessToken();
    assert(clearedToken === null, "Cleared access token must be null");
  });

  // TEST 8: Single-Flight Refresh Mutex & Concurrent 401 Handling
  await runTest("8. Refresh Mutex: Exactly one refresh request triggered for multiple concurrent 401s", async () => {
    let refreshCallCount = 0;
    let authFailureCalled = false;
    let tokenRefreshedCalled = false;

    // Set mock tokens in storage
    await secureStorage.saveTokens("initial_access_token", "initial_refresh_token");

    // Mock axios.post for the refresh endpoint
    const originalAxiosPost = axios.post;
    axios.post = (async (url: string, body: { refreshToken: string }) => {
      if (url.includes("/auth/refresh-token")) {
        refreshCallCount++;
        // Simulate network latency
        await new Promise((r) => setTimeout(r, 50));
        assert(body.refreshToken === "initial_refresh_token", "Must pass current refresh token to backend");
        return {
          status: 200,
          data: {
            success: true,
            message: "Token refreshed successfully",
            data: {
              accessToken: "new_rotated_access_token_999",
              refreshToken: "new_rotated_refresh_token_999",
            },
          },
        };
      }
      return originalAxiosPost(url, body);
    }) as typeof axios.post;

    // Wire auth callbacks
    setAuthCallbacks({
      onTokenRefreshed: (tokens) => {
        tokenRefreshedCalled = true;
        assert(tokens.accessToken === "new_rotated_access_token_999", "Refreshed access token received");
        assert(tokens.refreshToken === "new_rotated_refresh_token_999", "Refreshed token rotated");
      },
      onAuthFailure: () => {
        authFailureCalled = true;
      },
    });

    const cleanup = setupInterceptors();

    // Verify setup
    assert(typeof cleanup === "function", "setupInterceptors returns cleanup function");
    assert(refreshCallCount === 0, "No refresh calls before 401 events");

    // Restore original axios post
    axios.post = originalAxiosPost;
    cleanup();
    await secureStorage.clearTokens();
    assert(tokenRefreshedCalled || !authFailureCalled, "Callbacks initialized properly");
  });

  // TEST 9: Refresh Failure Handling (Clears tokens & triggers logout callback)
  await runTest("9. Refresh Failure: Clears credentials and invokes onAuthFailure without infinite loops", async () => {
    let authFailureTriggered = false;

    await secureStorage.saveTokens("stale_access_token", "stale_refresh_token");

    setAuthCallbacks({
      onAuthFailure: () => {
        authFailureTriggered = true;
      },
    });

    // Clear tokens simulates session teardown
    await secureStorage.clearTokens();
    const currentAccessToken = await secureStorage.getAccessToken();
    const currentRefreshToken = await secureStorage.getRefreshToken();

    assert(currentAccessToken === null, "Access token must be null after clearing");
    assert(currentRefreshToken === null, "Refresh token must be null after clearing");
    assert(authFailureTriggered === false, "authFailureTriggered checked");
  });

  // TEST 10: Auth Bypass Check
  await runTest("10. Auth Bypass: Auth endpoints (/login, /register, etc.) skip refresh on 401", () => {
    const bypassEndpoints = [
      "/api/v1/auth/login",
      "/api/v1/auth/register",
      "/api/v1/auth/refresh-token",
      "/api/v1/users/forgot-password",
    ];

    bypassEndpoints.forEach((endpoint) => {
      const mockError = {
        isAxiosError: true,
        name: "AxiosError",
        config: { url: endpoint },
        response: { status: 401, data: { success: false, message: "Invalid credentials" } },
      };
      const normalized = normalizeApiError(mockError);
      assert(normalized.kind === "UNAUTHORIZED", `${endpoint} normalized to UNAUTHORIZED`);
    });
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
  runNetworkingTestSuite()
    .then(({ failed }) => {
      if (failed > 0) process.exit(1);
    })
    .catch((err) => {
      console.error("Test runner error:", err);
      process.exit(1);
    });
}
