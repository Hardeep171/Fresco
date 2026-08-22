/**
 * Comprehensive verification suite for FRESCO Mobile Phase 4:
 * User Profile & Address Book Management.
 * Tests API service contracts, Redux slices, state synchronizations, and error handling.
 */

import { userApi } from "../user.api";
import { addressApi } from "../address.api";
import { apiClient } from "../client";
import { store } from "../../store";
import {
  fetchUserProfile,
  updateUserProfile,
  changeUserPassword,
  clearUserError,
  clearUpdateSuccess,
} from "../../store/slices/userSlice";
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  clearAddressErrors,
} from "../../store/slices/addressSlice";
import { Address, CreateAddressInput } from "../../types/address.types";
import { User } from "../../types/auth.types";

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

export async function runPhase4TestSuite(): Promise<{ total: number; passed: number; failed: number }> {
  console.log("\n=======================================================");
  console.log("FRESCO FRONTEND — PHASE 4 PROFILE & ADDRESS TEST SUITE");
  console.log("=======================================================\n");

  const mockUser: User = {
    _id: "60d5ec49f1b2c8b1f8e4e1a1",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@example.com",
    phone: "9876543210",
    role: "CUSTOMER",
    status: "ACTIVE",
    isEmailVerified: true,
    isPhoneVerified: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  const mockAddress1: Address = {
    _id: "60d5ec49f1b2c8b1f8e4e2b1",
    userId: "60d5ec49f1b2c8b1f8e4e1a1",
    label: "HOME",
    fullName: "Priya Sharma",
    phone: "9876543210",
    addressLine1: "123 Indiranagar 100ft Road",
    addressLine2: "Apt 4B",
    landmark: "Near Metro",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560038",
    country: "India",
    isDefault: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  const mockAddress2: Address = {
    _id: "60d5ec49f1b2c8b1f8e4e2b2",
    userId: "60d5ec49f1b2c8b1f8e4e1a1",
    label: "OFFICE",
    fullName: "Priya Sharma",
    phone: "9876543210",
    addressLine1: "456 Tech Park, Whitefield",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560066",
    country: "India",
    isDefault: false,
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  };

  // TEST 1: userApi.getProfile unwraps backend { user: User }
  await runTest("1. User API: getProfile unwraps backend response data envelope", async () => {
    const originalGet = apiClient.get;
    apiClient.get = (async (url: string) => {
      assert(url === "/users/me", `Expected GET /users/me, got ${url}`);
      return {
        status: 200,
        data: {
          success: true,
          message: "User profile fetched successfully",
          data: { user: mockUser },
        },
      };
    }) as typeof apiClient.get;

    const profile = await userApi.getProfile();
    assert(profile._id === mockUser._id, "Profile ID matches mock");
    assert(profile.email === mockUser.email, "Profile email matches mock");

    apiClient.get = originalGet;
  });

  // TEST 2: userApi.updateProfile calls PATCH /users/profile and unwraps updated user
  await runTest("2. User API: updateProfile sends PATCH /users/profile and returns User", async () => {
    const originalPatch = apiClient.patch;
    const updatedUser = { ...mockUser, firstName: "Priyanka" };

    apiClient.patch = (async (url: string, body: unknown) => {
      assert(url === "/users/profile", `Expected PATCH /users/profile, got ${url}`);
      assert((body as { firstName: string }).firstName === "Priyanka", "Body contains updated firstName");
      return {
        status: 200,
        data: {
          success: true,
          message: "Profile updated successfully",
          data: { user: updatedUser },
        },
      };
    }) as typeof apiClient.patch;

    const result = await userApi.updateProfile({ firstName: "Priyanka" });
    assert(result.firstName === "Priyanka", "Updated firstName returned");

    apiClient.patch = originalPatch;
  });

  // TEST 3: userApi.changePassword calls PATCH /users/change-password
  await runTest("3. User API: changePassword sends PATCH /users/change-password and returns message", async () => {
    const originalPatch = apiClient.patch;
    apiClient.patch = (async (url: string, body: unknown) => {
      assert(url === "/users/change-password", `Expected PATCH /users/change-password, got ${url}`);
      const b = body as { currentPassword: string; newPassword: string };
      assert(b.currentPassword === "oldPass123!", "Current password passed in body");
      assert(b.newPassword === "newPass456!", "New password passed in body");
      return {
        status: 200,
        data: {
          success: true,
          message: "Password changed successfully. Please log in again.",
          data: undefined,
        },
      };
    }) as typeof apiClient.patch;

    const result = await userApi.changePassword({
      currentPassword: "oldPass123!",
      newPassword: "newPass456!",
    });
    assert(
      result.message === "Password changed successfully. Please log in again.",
      "Expected success message returned"
    );

    apiClient.patch = originalPatch;
  });

  // TEST 4: addressApi.getAddresses unwraps { addresses: Address[] }
  await runTest("4. Address API: getAddresses calls GET /addresses and returns Address[]", async () => {
    const originalGet = apiClient.get;
    apiClient.get = (async (url: string) => {
      assert(url === "/addresses", `Expected GET /addresses, got ${url}`);
      return {
        status: 200,
        data: {
          success: true,
          message: "Addresses fetched successfully",
          data: { addresses: [mockAddress1, mockAddress2] },
        },
      };
    }) as typeof apiClient.get;

    const addresses = await addressApi.getAddresses();
    assert(addresses.length === 2, "Returns 2 addresses");
    assert(addresses[0]?._id === mockAddress1._id, "First address matches");

    apiClient.get = originalGet;
  });

  // TEST 5: addressApi.createAddress calls POST /addresses
  await runTest("5. Address API: createAddress sends POST /addresses and returns Address", async () => {
    const originalPost = apiClient.post;
    const newAddressInput: CreateAddressInput = {
      label: "HOME",
      fullName: "Priya Sharma",
      phone: "9876543210",
      addressLine1: "123 Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      country: "India",
      isDefault: true,
    };

    apiClient.post = (async (url: string, body: unknown) => {
      assert(url === "/addresses", `Expected POST /addresses, got ${url}`);
      return {
        status: 201,
        data: {
          success: true,
          message: "Address created successfully",
          data: { address: { ...mockAddress1, ...(body as Record<string, unknown>) } },
        },
      };
    }) as typeof apiClient.post;

    const result = await addressApi.createAddress(newAddressInput);
    assert(result._id === mockAddress1._id, "Created address returned");
    assert(result.isDefault === true, "Address isDefault is true");

    apiClient.post = originalPost;
  });

  // TEST 6: addressApi.updateAddress calls PATCH /addresses/:id
  await runTest("6. Address API: updateAddress sends PATCH /addresses/:id and returns updated Address", async () => {
    const originalPatch = apiClient.patch;
    apiClient.patch = (async (url: string, body: unknown) => {
      assert(url === `/addresses/${mockAddress1._id}`, `Expected PATCH /addresses/:id, got ${url}`);
      return {
        status: 200,
        data: {
          success: true,
          message: "Address updated successfully",
          data: { address: { ...mockAddress1, ...(body as Record<string, unknown>) } },
        },
      };
    }) as typeof apiClient.patch;

    const result = await addressApi.updateAddress(mockAddress1._id, { landmark: "Opposite Metro" });
    assert(result.landmark === "Opposite Metro", "Updated landmark returned");

    apiClient.patch = originalPatch;
  });

  // TEST 7: addressApi.deleteAddress calls DELETE /addresses/:id
  await runTest("7. Address API: deleteAddress sends DELETE /addresses/:id and returns message", async () => {
    const originalDelete = apiClient.delete;
    apiClient.delete = (async (url: string) => {
      assert(url === `/addresses/${mockAddress2._id}`, `Expected DELETE /addresses/:id, got ${url}`);
      return {
        status: 200,
        data: {
          success: true,
          message: "Address deleted successfully",
          data: undefined,
        },
      };
    }) as typeof apiClient.delete;

    const result = await addressApi.deleteAddress(mockAddress2._id);
    assert(result.message === "Address deleted successfully", "Delete message returned");

    apiClient.delete = originalDelete;
  });

  // TEST 8: addressApi.setDefaultAddress calls PATCH /addresses/:id/default
  await runTest("8. Address API: setDefaultAddress sends PATCH /addresses/:id/default", async () => {
    const originalPatch = apiClient.patch;
    apiClient.patch = (async (url: string) => {
      assert(url === `/addresses/${mockAddress2._id}/default`, `Expected PATCH /addresses/:id/default, got ${url}`);
      return {
        status: 200,
        data: {
          success: true,
          message: "Default address updated successfully",
          data: { address: { ...mockAddress2, isDefault: true } },
        },
      };
    }) as typeof apiClient.patch;

    const result = await addressApi.setDefaultAddress(mockAddress2._id);
    assert(result.isDefault === true, "isDefault is true on returned address");

    apiClient.patch = originalPatch;
  });

  // TEST 9: Redux userSlice state transitions & thunks
  await runTest("9. Redux userSlice: manages profile, loading, update, and errors properly", async () => {
    const originalGet = apiClient.get;
    const originalPatch = apiClient.patch;

    apiClient.get = (async () => ({
      status: 200,
      data: {
        success: true,
        message: "User profile fetched successfully",
        data: { user: mockUser },
      },
    })) as typeof apiClient.get;

    await store.dispatch(fetchUserProfile());
    let state = store.getState().user;
    assert(state.profile?._id === mockUser._id, "userSlice.profile matches mockUser");
    assert(state.isLoading === false, "isLoading is false after fetch");
    assert(state.error === null, "error is null after success");

    apiClient.patch = (async () => ({
      status: 200,
      data: {
        success: true,
        message: "Profile updated successfully",
        data: { user: { ...mockUser, firstName: "Priyanka" } },
      },
    })) as typeof apiClient.patch;

    await store.dispatch(updateUserProfile({ firstName: "Priyanka" }));
    state = store.getState().user;
    assert(state.profile?.firstName === "Priyanka", "Profile firstName updated");
    assert(state.updateSuccess === true, "updateSuccess is true");

    apiClient.patch = (async () => ({
      status: 200,
      data: {
        success: true,
        message: "Password changed successfully. Please log in again.",
        data: undefined,
      },
    })) as typeof apiClient.patch;

    await store.dispatch(
      changeUserPassword({
        currentPassword: "oldPass123!",
        newPassword: "newPass456!",
      })
    );
    state = store.getState().user;
    assert(state.changePasswordSuccess === true, "changePasswordSuccess is true");

    store.dispatch(clearUserError());
    store.dispatch(clearUpdateSuccess());
    apiClient.get = originalGet;
    apiClient.patch = originalPatch;
  });

  // TEST 10: Redux addressSlice state synchronizations (default address mutability & delete cascade)
  await runTest("10. Redux addressSlice: maintains default uniqueness and updates list dynamically", async () => {
    const originalGet = apiClient.get;
    const originalPost = apiClient.post;
    const originalPatch = apiClient.patch;
    const originalDelete = apiClient.delete;

    // 1. Fetch addresses
    apiClient.get = (async () => ({
      status: 200,
      data: {
        success: true,
        message: "Addresses fetched",
        data: { addresses: [mockAddress1] },
      },
    })) as typeof apiClient.get;

    await store.dispatch(fetchAddresses());
    let state = store.getState().address;
    assert(state.addresses.length === 1, "Initial 1 address in state");
    assert(state.addresses[0]?.isDefault === true, "Address 1 is default");

    // 2. Create address with isDefault: true -> address 1 must become isDefault: false
    apiClient.post = (async () => ({
      status: 201,
      data: {
        success: true,
        message: "Address created",
        data: { address: { ...mockAddress2, isDefault: true } },
      },
    })) as typeof apiClient.post;

    await store.dispatch(createAddress({ ...mockAddress2, isDefault: true }));
    state = store.getState().address;
    assert(state.addresses.length === 2, "Now 2 addresses in state");
    const addr1 = state.addresses.find((a) => a._id === mockAddress1._id);
    const addr2 = state.addresses.find((a) => a._id === mockAddress2._id);
    assert(addr1?.isDefault === false, "Old address isDefault flipped to false");
    assert(addr2?.isDefault === true, "New address isDefault is true");

    // 3. Update address
    apiClient.patch = (async () => ({
      status: 200,
      data: {
        success: true,
        message: "Address updated",
        data: { address: { ...mockAddress1, landmark: "Landmark Updated" } },
      },
    })) as typeof apiClient.patch;

    await store.dispatch(
      updateAddress({
        id: mockAddress1._id,
        input: { landmark: "Landmark Updated" },
      })
    );
    state = store.getState().address;
    const updatedMockAddr1 = state.addresses.find((a) => a._id === mockAddress1._id);
    assert(updatedMockAddr1?.landmark === "Landmark Updated", "Address 1 landmark updated");

    // 4. Set address 1 as default
    apiClient.patch = (async () => ({
      status: 200,
      data: {
        success: true,
        message: "Default updated",
        data: { address: { ...mockAddress1, isDefault: true } },
      },
    })) as typeof apiClient.patch;

    await store.dispatch(setDefaultAddress(mockAddress1._id));
    state = store.getState().address;
    const updatedAddr1 = state.addresses.find((a) => a._id === mockAddress1._id);
    const updatedAddr2 = state.addresses.find((a) => a._id === mockAddress2._id);
    assert(updatedAddr1?.isDefault === true, "Address 1 set back to default");
    assert(updatedAddr2?.isDefault === false, "Address 2 isDefault is false");

    // 5. Delete address 2
    apiClient.delete = (async () => ({
      status: 200,
      data: {
        success: true,
        message: "Address deleted",
        data: undefined,
      },
    })) as typeof apiClient.delete;

    await store.dispatch(deleteAddress(mockAddress2._id));
    state = store.getState().address;
    assert(state.addresses.length === 1, "Address 2 removed from state");
    assert(state.addresses[0]?._id === mockAddress1._id, "Remaining address is Address 1");

    store.dispatch(clearAddressErrors());
    apiClient.get = originalGet;
    apiClient.post = originalPost;
    apiClient.patch = originalPatch;
    apiClient.delete = originalDelete;
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
  runPhase4TestSuite()
    .then(({ failed }) => {
      if (failed > 0) process.exit(1);
    })
    .catch((err) => {
      console.error("Test runner error:", err);
      process.exit(1);
    });
}
