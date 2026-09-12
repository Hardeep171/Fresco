import assert from "node:assert";
import { apiClient } from "../api/client";
import { authApi } from "../api/auth.api";
import { cartApi } from "../api/cart.api";
import { orderApi } from "../api/order.api";
import { userApi } from "../api/user.api";
import { addressApi } from "../api/address.api";
import { categoryApi } from "../api/category.api";
import { storageService } from "../services/storage.service";
import {
  setupInterceptors,
  setAuthCallbacks,
  isPublicAuthEndpoint,
  PUBLIC_AUTH_PATHS,
} from "../api/interceptors";
import { store } from "../store";
import { restoreUserSession, logoutUser } from "../store/slices/authSlice";

let passed = 0;
let failed = 0;

function recordPass(desc: string) {
  passed++;
  console.log(`  ✓ ${desc}`);
}

function recordFail(desc: string, err: any) {
  failed++;
  console.error(`  ✗ ${desc}:`, err?.message || err);
}

async function runAuthAuditSuite() {
  console.log("\n=================================================");
  console.log("FRESCO WEB — COMPREHENSIVE AUTHORIZATION AUDIT");
  console.log("=================================================\n");

  // -------------------------------------------------------------
  // SUITE 1: REQUEST INTERCEPTOR & HEADER INJECTION
  // -------------------------------------------------------------
  console.log("--- SUITE 1: REQUEST INTERCEPTOR & HEADER INJECTION ---");

  try {
    // 1.1 Verify public auth paths are recognized
    for (const path of PUBLIC_AUTH_PATHS) {
      assert(
        isPublicAuthEndpoint(path),
        `Path ${path} must be recognized as public auth endpoint`
      );
    }
    recordPass("1.1 All public auth endpoints identified correctly in filter");

    // 1.2 Verify Bearer token injection on protected paths
    const mockToken = "test_bearer_jwt_token_xyz987";
    storageService.saveTokens(mockToken, "test_mock_refresh");

    // Test request interceptor directly on apiClient config
    const interceptedProtected = (apiClient.interceptors.request as any).handlers[0].fulfilled({
      url: "/cart",
      headers: {},
    });
    assert.strictEqual(
      interceptedProtected.headers.Authorization,
      `Bearer ${mockToken}`,
      "Protected endpoint /cart must have Authorization Bearer header"
    );

    const interceptedOrders = (apiClient.interceptors.request as any).handlers[0].fulfilled({
      url: "/orders",
      headers: {},
    });
    assert.strictEqual(
      interceptedOrders.headers.Authorization,
      `Bearer ${mockToken}`,
      "Protected endpoint /orders must have Authorization Bearer header"
    );

    const interceptedProfile = (apiClient.interceptors.request as any).handlers[0].fulfilled({
      url: "/users/me",
      headers: {},
    });
    assert.strictEqual(
      interceptedProfile.headers.Authorization,
      `Bearer ${mockToken}`,
      "Protected endpoint /users/me must have Authorization Bearer header"
    );

    recordPass("1.2 Request interceptor injects 'Authorization: Bearer <token>' for /cart, /orders, /users/me");

    // 1.3 Verify public auth endpoints DO NOT receive Authorization header
    for (const publicPath of PUBLIC_AUTH_PATHS) {
      const interceptedPublic = (apiClient.interceptors.request as any).handlers[0].fulfilled({
        url: publicPath,
        headers: { Authorization: "OldStaleToken" },
      });
      assert.strictEqual(
        interceptedPublic.headers.Authorization,
        undefined,
        `Public auth endpoint ${publicPath} must NOT receive Authorization header`
      );
    }
    recordPass("1.3 Request interceptor strictly strips Authorization headers for public auth endpoints");
  } catch (err: any) {
    recordFail("1. Request interceptor verification", err);
  }

  // -------------------------------------------------------------
  // SUITE 2: PUBLIC APIS WITHOUT AUTHENTICATION
  // -------------------------------------------------------------
  console.log("\n--- SUITE 2: PUBLIC APIS (NO AUTH REQUIRED) ---");

  try {
    storageService.clearTokens();
    const categories = await categoryApi.getCategories();
    assert(Array.isArray(categories), "Public catalog must return categories array without token");
    recordPass(`2.1 Public GET /categories succeeds without token (returned ${categories.length} categories)`);
  } catch (err: any) {
    recordFail("2.1 Public categories", err);
  }

  // -------------------------------------------------------------
  // SUITE 3: PROTECTED APIS WITH LIVE AUTHENTICATION
  // -------------------------------------------------------------
  console.log("\n--- SUITE 3: PROTECTED APIS WITH LIVE AUTHENTICATION ---");

  let liveCustomerToken = "";
  let liveCustomerRefreshToken = "";

  try {
    // Authenticate with live backend
    const loginRes = await authApi.login({
      email: "customer@fresco.com",
      password: "Password@123",
    });

    assert(loginRes.accessToken && loginRes.refreshToken, "Login must return access and refresh tokens");
    liveCustomerToken = loginRes.accessToken;
    liveCustomerRefreshToken = loginRes.refreshToken;
    storageService.saveTokens(liveCustomerToken, liveCustomerRefreshToken);
    storageService.saveUser(loginRes.user);

    recordPass("3.1 Customer logged in successfully and tokens stored in storageService");

    // 3.2 GET /cart — Previously failing with 401
    const cart = await cartApi.getCart();
    assert(cart && cart._id !== undefined, "GET /cart must return valid cart with Authorization header");
    recordPass(`3.2 Protected GET /cart succeeded with 200 OK (Cart ID: ${cart._id})`);

    // 3.3 GET /orders — Previously failing with 401
    const orders = await orderApi.getUserOrders();
    assert(Array.isArray(orders), "GET /orders must return array of user orders with Authorization header");
    recordPass(`3.3 Protected GET /orders succeeded with 200 OK (${orders.length} orders found)`);

    // 3.4 GET /users/me
    const profile = await userApi.getProfile();
    assert.strictEqual(profile.email, "customer@fresco.com", "GET /users/me must return authenticated profile");
    recordPass("3.4 Protected GET /users/me succeeded with 200 OK");

    // 3.5 GET /addresses
    const addresses = await addressApi.getAddresses();
    assert(Array.isArray(addresses), "GET /addresses must return array of user addresses");
    recordPass(`3.5 Protected GET /addresses succeeded with 200 OK (${addresses.length} addresses found)`);
  } catch (err: any) {
    recordFail("3. Protected APIs with live auth", err);
  }

  // -------------------------------------------------------------
  // SUITE 4: JWT REFRESH MUTEX & CONCURRENCY
  // -------------------------------------------------------------
  console.log("\n--- SUITE 4: JWT REFRESH MUTEX & CONCURRENCY ---");

  if (liveCustomerRefreshToken) {
    try {
      let tokenRefreshedFired = false;
      setAuthCallbacks({
        onTokenRefreshed: (tokens) => {
          tokenRefreshedFired = true;
          assert(tokens.accessToken && tokens.refreshToken);
        },
      });

      // Deliberately set an expired/invalid access token while keeping valid refresh token
      storageService.saveTokens("expired_mock_jwt_access_token", liveCustomerRefreshToken);

      // Fire 3 simultaneous protected API calls
      const [cartResult, ordersResult, profileResult] = await Promise.all([
        cartApi.getCart(),
        orderApi.getUserOrders(),
        userApi.getProfile(),
      ]);

      assert(cartResult && cartResult._id, "Concurrent request 1 (getCart) must succeed after refresh");
      assert(Array.isArray(ordersResult), "Concurrent request 2 (getUserOrders) must succeed after refresh");
      assert(profileResult && profileResult.email === "customer@fresco.com", "Concurrent request 3 (getProfile) must succeed after refresh");
      assert(tokenRefreshedFired, "onTokenRefreshed callback must have been triggered");

      const newStoredAccess = storageService.getAccessToken();
      assert(
        newStoredAccess && newStoredAccess !== "expired_mock_jwt_access_token",
        "New valid access token must be saved to storageService"
      );

      recordPass("4.1 3 Concurrent requests on expired token resolved via single-flight refresh mutex");
      recordPass("4.2 onTokenRefreshed callback triggered and new access token saved to storage");
    } catch (err: any) {
      recordFail("4. JWT refresh mutex", err);
    }
  }

  // -------------------------------------------------------------
  // SUITE 5: REFRESH FAILURE & CLEAN SESSION INVALIDATION
  // -------------------------------------------------------------
  console.log("\n--- SUITE 5: REFRESH FAILURE & SESSION INVALIDATION ---");

  try {
    let authFailureFired = false;
    setAuthCallbacks({
      onAuthFailure: () => {
        authFailureFired = true;
      },
    });

    // Set invalid access token AND invalid refresh token
    storageService.saveTokens("invalid_access_token", "invalid_refresh_token");

    let errorCaught = false;
    try {
      await cartApi.getCart();
    } catch {
      errorCaught = true;
    }

    assert(errorCaught, "Request with invalid tokens must reject");
    assert(authFailureFired, "onAuthFailure callback must be triggered upon refresh failure");
    assert.strictEqual(storageService.getAccessToken(), null, "Access token must be cleared from storage");
    assert.strictEqual(storageService.getRefreshToken(), null, "Refresh token must be cleared from storage");

    recordPass("5.1 Refresh failure cleanly clears storageService tokens and triggers onAuthFailure");
  } catch (err: any) {
    recordFail("5. Refresh failure handling", err);
  }

  // -------------------------------------------------------------
  // SUITE 6: REDUX STORE SESSION HYDRATION & LOGOUT
  // -------------------------------------------------------------
  console.log("\n--- SUITE 6: REDUX HYDRATION & LOGOUT ---");

  try {
    // 6.1 Re-login to get fresh valid tokens
    const loginRes = await authApi.login({
      email: "customer@fresco.com",
      password: "Password@123",
    });

    storageService.saveTokens(loginRes.accessToken, loginRes.refreshToken);
    storageService.saveUser(loginRes.user);

    // Dispatch session restore
    await store.dispatch(restoreUserSession());

    const state = store.getState().auth;
    assert.strictEqual(state.isAuthenticated, true, "Redux must be authenticated after session restore");
    assert.strictEqual(state.user?.email, "customer@fresco.com", "Redux user must match restored user");
    recordPass("6.1 Redux store hydrated and validated session via restoreUserSession()");

    // 6.2 Logout
    await store.dispatch(logoutUser());
    const loggedOutState = store.getState().auth;
    assert.strictEqual(loggedOutState.isAuthenticated, false, "Redux must be unauthenticated after logout");
    assert.strictEqual(loggedOutState.user, null, "Redux user must be null after logout");
    assert.strictEqual(storageService.getAccessToken(), null, "Storage access token must be null after logout");
    recordPass("6.2 Logout cleanly purges tokens from storage and resets Redux auth state");
  } catch (err: any) {
    recordFail("6. Redux hydration & logout", err);
  }

  // Summary
  console.log("\n=================================================");
  console.log(`TOTAL AUDIT TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthAuditSuite().catch((err) => {
  console.error("FATAL AUDIT ERROR:", err);
  process.exit(1);
});
