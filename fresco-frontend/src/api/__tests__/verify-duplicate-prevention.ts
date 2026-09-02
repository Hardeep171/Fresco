/**
 * FRESCO Mobile — Duplicate Account Prevention Verification Suite
 * Tests client-side registration validation, error normalization for duplicate accounts,
 * in-flight submission guarding, Redux auth state updates, and credential security.
 */

import { apiClient } from "../client";
import { store } from "../../store";
import { registerUser, clearAuthError, clearAuthFieldError, logoutSuccess } from "../../store/slices/authSlice";
import { normalizeApiError, isNormalizedApiError } from "../error";
import { secureStorage } from "../../services/secureStorage.service";

interface TestReport {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestReport[] = [];

function assert(condition: boolean, testName: string, message?: string) {
  if (condition) {
    results.push({ name: testName, passed: true });
    console.log(`  ✓ ${testName}`);
  } else {
    const errorMsg = message || "Assertion failed";
    results.push({ name: testName, passed: false, error: errorMsg });
    console.error(`  ✗ ${testName}: ${errorMsg}`);
  }
}

// Client-side validation function matching RegisterScreen validate()
function validateRegistrationForm(form: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!form.firstName.trim() || form.firstName.trim().length < 2) {
    errors.firstName = "First name must be at least 2 characters.";
  }

  if (!form.lastName.trim() || form.lastName.trim().length < 2) {
    errors.lastName = "Last name must be at least 2 characters.";
  }

  const trimmedEmail = form.email.trim();
  if (!trimmedEmail) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = "Please enter a valid email address.";
  }

  const trimmedPhone = form.phone.trim();
  if (!trimmedPhone) {
    errors.phone = "Phone number is required.";
  } else if (!/^\+?[1-9]\d{7,14}$|^\d{10,15}$/.test(trimmedPhone)) {
    errors.phone = "Please enter a valid phone number (10-15 digits).";
  }

  if (!form.password || form.password.length < 8) {
    errors.password = "Password must be at least 8 characters long.";
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export async function runDuplicatePreventionFrontendTests(): Promise<boolean> {
  console.log("\n=======================================================");
  console.log(" FRESCO Mobile — Duplicate Prevention Verification Suite");
  console.log("=======================================================\n");

  // Clean up initial state
  store.dispatch(logoutSuccess());
  await secureStorage.clearTokens();

  // -----------------------------------------------------------------
  // 1. Client-side Validation: Invalid email is rejected before API call
  // -----------------------------------------------------------------
  console.log("--- 1. Pre-Submission Form Validation ---");

  const emptyEmailResult = validateRegistrationForm({
    firstName: "John",
    lastName: "Doe",
    email: "",
    phone: "+919876543210",
    password: "Password@123",
    confirmPassword: "Password@123",
  });
  assert(
    !emptyEmailResult.isValid && emptyEmailResult.errors.email === "Email address is required.",
    "1a. Empty email is rejected before API call",
  );

  const invalidEmailResult = validateRegistrationForm({
    firstName: "John",
    lastName: "Doe",
    email: "not-an-email",
    phone: "+919876543210",
    password: "Password@123",
    confirmPassword: "Password@123",
  });
  assert(
    !invalidEmailResult.isValid && invalidEmailResult.errors.email === "Please enter a valid email address.",
    "1b. Malformed email is rejected before API call",
  );

  // -----------------------------------------------------------------
  // 2. Client-side Validation: Invalid phone is rejected before API call
  // -----------------------------------------------------------------
  const emptyPhoneResult = validateRegistrationForm({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "",
    password: "Password@123",
    confirmPassword: "Password@123",
  });
  assert(
    !emptyPhoneResult.isValid && emptyPhoneResult.errors.phone === "Phone number is required.",
    "2a. Empty phone number is rejected before API call",
  );

  const shortPhoneResult = validateRegistrationForm({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "12345",
    password: "Password@123",
    confirmPassword: "Password@123",
  });
  assert(
    !shortPhoneResult.isValid && shortPhoneResult.errors.phone === "Please enter a valid phone number (10-15 digits).",
    "2b. Short phone number (<10 digits) is rejected before API call",
  );

  const validFormResult = validateRegistrationForm({
    firstName: "John",
    lastName: "Doe",
    email: "  john.doe@example.com  ",
    phone: "  +919876543210  ",
    password: "Password@123",
    confirmPassword: "Password@123",
  });
  assert(validFormResult.isValid, "2c. Valid form with trimming passes pre-submission validation");

  // -----------------------------------------------------------------
  // 3. Error Normalization: Duplicate email backend error maps to email field
  // -----------------------------------------------------------------
  console.log("\n--- 2. Duplicate Account Error Normalization ---");

  const mockDuplicateEmailAxiosError = {
    isAxiosError: true,
    response: {
      status: 409,
      data: {
        success: false,
        message: "An account with this email already exists.",
        errors: [
          { field: "email", message: "An account with this email already exists." },
        ],
      },
    },
  };
  const normalizedEmailError = normalizeApiError(mockDuplicateEmailAxiosError);

  assert(
    normalizedEmailError.kind === "CONFLICT",
    "3a. Duplicate email response maps to CONFLICT error kind",
  );
  assert(
    normalizedEmailError.message === "An account with this email already exists.",
    "3b. Duplicate email message is preserved",
  );
  assert(
    normalizedEmailError.fieldErrors?.["email"] === "An account with this email already exists.",
    "3c. Duplicate email error appears on email field in fieldErrors",
  );

  // -----------------------------------------------------------------
  // 4. Error Normalization: Duplicate phone backend error maps to phone field
  // -----------------------------------------------------------------
  const mockDuplicatePhoneAxiosError = {
    isAxiosError: true,
    response: {
      status: 409,
      data: {
        success: false,
        message: "An account with this phone number already exists.",
        errors: [
          { field: "phone", message: "An account with this phone number already exists." },
        ],
      },
    },
  };
  const normalizedPhoneError = normalizeApiError(mockDuplicatePhoneAxiosError);

  assert(
    normalizedPhoneError.kind === "CONFLICT",
    "4a. Duplicate phone response maps to CONFLICT error kind",
  );
  assert(
    normalizedPhoneError.message === "An account with this phone number already exists.",
    "4b. Duplicate phone message is preserved",
  );
  assert(
    normalizedPhoneError.fieldErrors?.["phone"] === "An account with this phone number already exists.",
    "4c. Duplicate phone error appears on phone field in fieldErrors",
  );

  // -----------------------------------------------------------------
  // 5. Error Normalization: Both duplicate email and duplicate phone
  // -----------------------------------------------------------------
  const mockBothDuplicateAxiosError = {
    isAxiosError: true,
    response: {
      status: 409,
      data: {
        success: false,
        message: "An account with this email or phone number already exists.",
        errors: [
          { field: "email", message: "An account with this email already exists." },
          { field: "phone", message: "An account with this phone number already exists." },
        ],
      },
    },
  };
  const normalizedBothError = normalizeApiError(mockBothDuplicateAxiosError);

  assert(
    normalizedBothError.fieldErrors?.["email"] === "An account with this email already exists." &&
    normalizedBothError.fieldErrors?.["phone"] === "An account with this phone number already exists.",
    "5. Both duplicate email and phone errors are mapped simultaneously in fieldErrors",
  );

  // -----------------------------------------------------------------
  // 6. Redux Auth State Handling on Registration Failure (Duplicate)
  // -----------------------------------------------------------------
  console.log("\n--- 3. Redux Auth State Management ---");

  // Mock apiClient post to simulate duplicate rejection
  const originalApiClientPost = apiClient.post;
  apiClient.post = (async () => {
    const error: any = new Error("Request failed with status code 409");
    error.isAxiosError = true;
    error.response = {
      status: 409,
      data: {
        success: false,
        message: "An account with this email already exists.",
        errors: [{ field: "email", message: "An account with this email already exists." }],
      },
    };
    throw error;
  }) as typeof apiClient.post;

  const duplicateRegisterResult = await store.dispatch(
    registerUser({
      firstName: "John",
      lastName: "Doe",
      email: "existing@example.com",
      phone: "+919876543210",
      password: "Password@123",
    }),
  );

  assert(
    registerUser.rejected.match(duplicateRegisterResult),
    "6a. registerUser thunk rejects when duplicate email is returned",
  );
  assert(
    store.getState().auth.error?.fieldErrors?.["email"] === "An account with this email already exists.",
    "6b. Redux auth slice error contains duplicate email field error",
  );
  assert(
    store.getState().auth.isAuthenticated === false,
    "6c. User remains unauthenticated after duplicate rejection",
  );
  assert(
    store.getState().auth.isLoading === false,
    "6d. Loading state resets to false after rejected registration",
  );

  // Clear auth error
  store.dispatch(clearAuthError());
  assert(store.getState().auth.error === null, "6e. clearAuthError clears auth error state");

  // -----------------------------------------------------------------
  // 6f. Normalization Idempotency: normalized error passed to normalizeApiError retains all fields
  // -----------------------------------------------------------------
  const doubleNormalized = normalizeApiError(normalizedBothError);
  assert(
    isNormalizedApiError(doubleNormalized),
    "6f. isNormalizedApiError correctly identifies NormalizedApiError",
  );
  assert(
    doubleNormalized.kind === "CONFLICT" &&
    doubleNormalized.fieldErrors?.["email"] === "An account with this email already exists." &&
    doubleNormalized.fieldErrors?.["phone"] === "An account with this phone number already exists.",
    "6g. normalizeApiError is idempotent and does not overwrite field errors with generic message",
  );

  // -----------------------------------------------------------------
  // 6h. Selective Field Error Clearing: editing one field leaves the other intact
  // -----------------------------------------------------------------
  apiClient.post = (async () => {
    const error: any = new Error("Request failed with status code 409");
    error.isAxiosError = true;
    error.response = {
      status: 409,
      data: {
        success: false,
        message: "An account with this email or phone number already exists.",
        errors: [
          { field: "email", message: "An account with this email already exists." },
          { field: "phone", message: "An account with this phone number already exists." },
        ],
      },
    };
    throw error;
  }) as typeof apiClient.post;

  await store.dispatch(
    registerUser({
      firstName: "John",
      lastName: "Doe",
      email: "both_existing@example.com",
      phone: "+919876543210",
      password: "Password@123",
    }),
  );

  assert(
    store.getState().auth.error?.fieldErrors?.["email"] === "An account with this email already exists." &&
    store.getState().auth.error?.fieldErrors?.["phone"] === "An account with this phone number already exists.",
    "6h. Both email and phone field errors populated in Redux state",
  );

  // Edit email -> clear email field error only
  store.dispatch(clearAuthFieldError("email"));
  assert(
    store.getState().auth.error?.fieldErrors?.["email"] === undefined,
    "6i. clearAuthFieldError('email') removes only email field error",
  );
  assert(
    store.getState().auth.error?.fieldErrors?.["phone"] === "An account with this phone number already exists.",
    "6j. Phone field error remains preserved when email is edited",
  );

  // Edit phone -> clear phone field error
  store.dispatch(clearAuthFieldError("phone"));
  assert(
    store.getState().auth.error === null,
    "6k. Clearing the last field error resets auth.error to null",
  );

  // -----------------------------------------------------------------
  // 7. Successful Registration Flow
  // -----------------------------------------------------------------
  console.log("\n--- 4. Successful Registration & Session Setup ---");

  const mockRegisteredUser = {
    _id: "usr_reg_12345",
    firstName: "Alice",
    lastName: "Smith",
    email: "alice@example.com",
    phone: "+919876543210",
    role: "CUSTOMER" as const,
    status: "ACTIVE" as const,
    isEmailVerified: false,
    isPhoneVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  apiClient.post = (async (url: string) => {
    if (url.includes("/auth/register")) {
      return {
        status: 201,
        data: {
          success: true,
          message: "User registered successfully",
          data: {
            user: mockRegisteredUser,
            accessToken: "access_token_reg_abc",
            refreshToken: "refresh_token_reg_xyz",
          },
        },
      };
    }
    return originalApiClientPost(url);
  }) as typeof apiClient.post;

  const successfulRegisterResult = await store.dispatch(
    registerUser({
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@example.com",
      phone: "+919876543210",
      password: "Password@123",
    }),
  );

  assert(
    registerUser.fulfilled.match(successfulRegisterResult),
    "7a. registerUser thunk succeeds with valid credentials",
  );
  assert(
    store.getState().auth.isAuthenticated === true,
    "7b. Redux isAuthenticated is true after successful registration",
  );
  assert(
    store.getState().auth.user?.email === "alice@example.com",
    "7c. Redux user state matches registered user profile",
  );
  assert(
    (await secureStorage.getAccessToken()) === "access_token_reg_abc",
    "7d. Access token securely saved to storage",
  );
  assert(
    (await secureStorage.getRefreshToken()) === "refresh_token_reg_xyz",
    "7e. Refresh token securely saved to storage",
  );

  // -----------------------------------------------------------------
  // 8. Password & Credential Security Invariant
  // -----------------------------------------------------------------
  console.log("\n--- 5. Security & Password Confidentiality ---");

  const authState = store.getState().auth;
  assert(
    (authState.user as any)?.password === undefined,
    "8a. User entity in Redux auth state does not contain password property",
  );
  assert(
    !JSON.stringify(authState).includes("Password@123"),
    "8b. Redux state serialized does not contain any plaintext password",
  );

  // Restore apiClient
  apiClient.post = originalApiClientPost;
  store.dispatch(logoutSuccess());
  await secureStorage.clearTokens();

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n-------------------------------------------------------");
  console.log(`TOTAL: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("-------------------------------------------------------\n");

  return failed === 0;
}

// Auto-run if executed directly via node
if (typeof require !== "undefined" && require.main === module) {
  runDuplicatePreventionFrontendTests()
    .then((success) => {
      if (!success) process.exit(1);
    })
    .catch((err) => {
      console.error("Test runner error:", err);
      process.exit(1);
    });
}
