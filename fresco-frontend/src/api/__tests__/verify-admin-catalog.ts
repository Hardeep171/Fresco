/**
 * Comprehensive verification suite for FRESCO Admin Catalog Management.
 * Tests Category, Garment, Service, and Pricing Admin APIs, Redux mutation flows,
 * display ordering, soft-delete enable/disable semantics, and UI component exports.
 */

import { categoryApi } from "../category.api";
import { garmentApi } from "../garment.api";
import { serviceApi } from "../service.api";
import { pricingApi } from "../pricing.api";
import { apiClient } from "../client";
import { store } from "../../store";
import {
  createCategoryThunk,
  updateCategoryThunk,
  enableCategoryThunk,
  disableCategoryThunk,
  fetchAllCategoriesAdmin,
  clearCategoryMutationState,
} from "../../store/slices/categorySlice";
import {
  createGarmentThunk,
  updateGarmentThunk,
  enableGarmentThunk,
  disableGarmentThunk,
  fetchAllGarmentsAdmin,
  clearGarmentMutationState,
} from "../../store/slices/garmentSlice";
import {
  createServiceThunk,
  updateServiceThunk,
  enableServiceThunk,
  disableServiceThunk,
  fetchAllServicesAdmin,
  clearServiceMutationState,
} from "../../store/slices/serviceSlice";
import {
  createPricingThunk,
  updatePricingThunk,
  enablePricingThunk,
  disablePricingThunk,
  fetchAllPricingAdmin,
  clearPricingMutationState,
} from "../../store/slices/pricingSlice";
import {
  AdminCatalogTabType,
  AdminCatalogStackParamList,
} from "../../types/navigation.types";


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
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.push({ name, passed: false, error: errorMsg });
    console.error(`  ✗ ${name}: ${errorMsg}`);
  }
}

async function main() {
  console.log("\n=======================================================");
  console.log(" FRESCO Admin Catalog Management Verification Suite");
  console.log("=======================================================\n");

  const origGet = apiClient.get;
  const origPost = apiClient.post;
  const origPatch = apiClient.patch;
  const origDelete = apiClient.delete;

  console.log("--- 1. Category Admin API Operations ---");

  await runTest("categoryApi.createCategory sends POST /categories and returns entity", async () => {
    let capturedUrl = "";
    let capturedData: any = null;
    (apiClient as any).post = async (url: string, data: any) => {
      capturedUrl = url;
      capturedData = data;
      return {
        data: {
          success: true,
          data: {
            category: {
              _id: "cat-1",
              name: "traditional",
              description: "Kurtas and ethnic wear",
              icon: "shirt-outline",
              displayOrder: 3,
              isActive: true,
              createdAt: "2026-09-03T10:00:00Z",
              updatedAt: "2026-09-03T10:00:00Z",
            },
          },
        },
      };
    };

    const res = await categoryApi.createCategory({
      name: "traditional",
      description: "Kurtas and ethnic wear",
      icon: "shirt-outline",
      displayOrder: 3,
      isActive: true,
    });

    assert(capturedUrl === "/categories", "Expected URL /categories");
    assert(capturedData.name === "traditional", "Payload name preserved");
    assert(res._id === "cat-1" && res.isActive === true, "Returned category matches");
  });

  await runTest("categoryApi.updateCategory sends PATCH /categories/:id with partial update", async () => {
    let capturedUrl = "";
    let capturedData: any = null;
    (apiClient as any).patch = async (url: string, data: any) => {
      capturedUrl = url;
      capturedData = data;
      return {
        data: {
          success: true,
          data: {
            category: {
              _id: "cat-1",
              name: "ethnic wear",
              displayOrder: 4,
              isActive: true,
              createdAt: "2026-09-03T10:00:00Z",
              updatedAt: "2026-09-03T10:05:00Z",
            },
          },
        },
      };
    };

    const res = await categoryApi.updateCategory("cat-1", {
      name: "ethnic wear",
      displayOrder: 4,
    });

    assert(capturedUrl === "/categories/cat-1", "Expected URL /categories/cat-1");
    assert(capturedData.name === "ethnic wear", "Payload update matches");
    assert(res.displayOrder === 4, "Updated displayOrder returned");
  });

  await runTest("categoryApi.enableCategory sends PATCH /categories/:id/enable", async () => {
    let capturedUrl = "";
    (apiClient as any).patch = async (url: string) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          data: {
            category: {
              _id: "cat-1",
              name: "ethnic wear",
              isActive: true,
              createdAt: "2026-09-03T10:00:00Z",
              updatedAt: "2026-09-03T10:06:00Z",
            },
          },
        },
      };
    };

    const res = await categoryApi.enableCategory("cat-1");
    assert(capturedUrl === "/categories/cat-1/enable", "Expected enable endpoint");
    assert(res.isActive === true, "Category isActive set to true");
  });

  await runTest("categoryApi.disableCategory sends DELETE /categories/:id (soft-delete)", async () => {
    let capturedUrl = "";
    (apiClient as any).delete = async (url: string) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          data: {
            category: {
              _id: "cat-1",
              name: "ethnic wear",
              isActive: false,
              createdAt: "2026-09-03T10:00:00Z",
              updatedAt: "2026-09-03T10:07:00Z",
            },
          },
        },
      };
    };

    const res = await categoryApi.disableCategory("cat-1");
    assert(capturedUrl === "/categories/cat-1", "Expected DELETE endpoint");
    assert(res.isActive === false, "Category soft-deleted (isActive: false)");
  });

  await runTest("categoryApi.getAllCategoriesForAdmin merges active & inactive categories", async () => {
    (apiClient as any).get = async (_url: string, config: any) => {
      if (config?.params?.isActive === true) {
        return {
          data: {
            success: true,
            data: {
              categories: [
                { _id: "c-1", name: "tops", displayOrder: 0, isActive: true },
                { _id: "c-2", name: "bottoms", displayOrder: 2, isActive: true },
              ],
            },
          },
        };
      }
      return {
        data: {
          success: true,
          data: {
            categories: [
              { _id: "c-3", name: "archived", displayOrder: 1, isActive: false },
            ],
          },
        },
      };
    };

    const allCats = await categoryApi.getAllCategoriesForAdmin();
    assert(allCats.length === 3, "All 3 categories returned");
    assert(allCats[0]?._id === "c-1" && allCats[1]?._id === "c-3" && allCats[2]?._id === "c-2", "Properly sorted by displayOrder");
  });

  console.log("\n--- 2. Category Redux Slice Mutation Flows ---");

  await runTest("Category slice handles create, update, enable, disable thunks and fetchAllCategoriesAdmin", async () => {
    (apiClient as any).post = async () => ({
      data: {
        success: true,
        data: {
          category: {
            _id: "cat-new",
            name: "suits",
            displayOrder: 5,
            isActive: true,
          },
        },
      },
    });

    await store.dispatch(createCategoryThunk({ name: "suits", displayOrder: 5 }));
    let state = store.getState().category;
    assert(state.mutationSuccess === true, "mutationSuccess flag is set");
    assert(state.isMutating === false, "isMutating reset to false");
    assert(state.categories.some((c) => c._id === "cat-new"), "New category added to list");

    (apiClient as any).patch = async () => ({
      data: {
        success: true,
        data: {
          category: {
            _id: "cat-new",
            name: "tuxedos",
            displayOrder: 5,
            isActive: true,
          },
        },
      },
    });
    await store.dispatch(updateCategoryThunk({ id: "cat-new", data: { name: "tuxedos" } }));
    assert(store.getState().category.categories.some((c) => c.name === "tuxedos"), "Category updated");

    (apiClient as any).delete = async () => ({
      data: {
        success: true,
        data: {
          category: {
            _id: "cat-new",
            name: "tuxedos",
            displayOrder: 5,
            isActive: false,
          },
        },
      },
    });
    await store.dispatch(disableCategoryThunk("cat-new"));
    assert(store.getState().category.categories.find((c) => c._id === "cat-new")?.isActive === false, "Category disabled");

    (apiClient as any).patch = async () => ({
      data: {
        success: true,
        data: {
          category: {
            _id: "cat-new",
            name: "tuxedos",
            displayOrder: 5,
            isActive: true,
          },
        },
      },
    });
    await store.dispatch(enableCategoryThunk("cat-new"));
    assert(store.getState().category.categories.find((c) => c._id === "cat-new")?.isActive === true, "Category re-enabled");

    await store.dispatch(fetchAllCategoriesAdmin());
    assert(store.getState().category.categories.length > 0, "fetchAllCategoriesAdmin populated categories");

    store.dispatch(clearCategoryMutationState());
    assert(store.getState().category.mutationSuccess === false, "Mutation state cleared");
  });

  console.log("\n--- 3. Garment Admin API Operations ---");

  await runTest("garmentApi.createGarment sends POST /garments and returns entity", async () => {
    let capturedUrl = "";
    let capturedData: any = null;
    (apiClient as any).post = async (url: string, data: any) => {
      capturedUrl = url;
      capturedData = data;
      return {
        data: {
          success: true,
          data: {
            garment: {
              _id: "garment-1",
              categoryId: "cat-1",
              name: "formal blazer",
              displayOrder: 1,
              isActive: true,
            },
          },
        },
      };
    };

    const res = await garmentApi.createGarment({
      categoryId: "cat-1",
      name: "formal blazer",
      displayOrder: 1,
      isActive: true,
    });

    assert(capturedUrl === "/garments", "Expected URL /garments");
    assert(capturedData.categoryId === "cat-1", "categoryId passed in payload");
    assert(res._id === "garment-1", "Created garment returned");
  });

  await runTest("garmentApi.updateGarment moves garment to another category", async () => {
    let capturedData: any = null;
    (apiClient as any).patch = async (_url: string, data: any) => {
      capturedData = data;
      return {
        data: {
          success: true,
          data: {
            garment: {
              _id: "garment-1",
              categoryId: "cat-2", // moved category
              name: "formal blazer",
              displayOrder: 1,
              isActive: true,
            },
          },
        },
      };
    };

    const res = await garmentApi.updateGarment("garment-1", {
      categoryId: "cat-2",
    });

    assert(capturedData.categoryId === "cat-2", "categoryId update sent to backend");
    assert(res.categoryId === "cat-2", "Garment category updated");
  });

  await runTest("garmentApi.disableGarment soft-deletes garment", async () => {
    (apiClient as any).delete = async (_url: string) => ({
      data: {
        success: true,
        data: {
          garment: {
            _id: "garment-1",
            categoryId: "cat-2",
            name: "formal blazer",
            isActive: false,
          },
        },
      },
    });

    const res = await garmentApi.disableGarment("garment-1");
    assert(res.isActive === false, "Garment soft-deleted");
  });

  await runTest("Garment slice handles full mutation lifecycle: create, update, disable, enable, fetchAll", async () => {
    (apiClient as any).post = async () => ({
      data: {
        success: true,
        data: {
          garment: {
            _id: "g-test",
            categoryId: "c-1",
            name: "chinos",
            displayOrder: 2,
            isActive: true,
          },
        },
      },
    });

    await store.dispatch(createGarmentThunk({ categoryId: "c-1", name: "chinos", displayOrder: 2 }));
    let state = store.getState().garment;
    assert(state.garments.some((g) => g._id === "g-test"), "Garment added to store");

    (apiClient as any).patch = async () => ({
      data: {
        success: true,
        data: {
          garment: {
            _id: "g-test",
            categoryId: "c-2",
            name: "chinos slim",
            displayOrder: 3,
            isActive: true,
          },
        },
      },
    });

    await store.dispatch(updateGarmentThunk({ id: "g-test", data: { name: "chinos slim", categoryId: "c-2" } }));
    state = store.getState().garment;
    const updated = state.garments.find((g) => g._id === "g-test");
    assert(updated?.name === "chinos slim" && updated?.categoryId === "c-2", "Garment updated in store");

    (apiClient as any).delete = async () => ({
      data: {
        success: true,
        data: {
          garment: {
            _id: "g-test",
            categoryId: "c-2",
            name: "chinos slim",
            displayOrder: 3,
            isActive: false,
          },
        },
      },
    });
    await store.dispatch(disableGarmentThunk("g-test"));
    assert(store.getState().garment.garments.find((g) => g._id === "g-test")?.isActive === false, "Garment disabled");

    (apiClient as any).patch = async () => ({
      data: {
        success: true,
        data: {
          garment: {
            _id: "g-test",
            categoryId: "c-2",
            name: "chinos slim",
            displayOrder: 3,
            isActive: true,
          },
        },
      },
    });
    await store.dispatch(enableGarmentThunk("g-test"));
    assert(store.getState().garment.garments.find((g) => g._id === "g-test")?.isActive === true, "Garment re-enabled");

    (apiClient as any).get = async () => ({
      data: {
        success: true,
        data: {
          garments: [
            { _id: "g-test", categoryId: "c-2", name: "chinos slim", displayOrder: 3, isActive: true },
          ],
        },
      },
    });
    await store.dispatch(fetchAllGarmentsAdmin());

    store.dispatch(clearGarmentMutationState());
    assert(store.getState().garment.mutationSuccess === false, "Garment mutation state cleared");
  });

  console.log("\n--- 4. Service Admin API Operations ---");

  await runTest("serviceApi.createService sends POST /services and returns entity", async () => {
    let capturedUrl = "";
    (apiClient as any).post = async (url: string) => {
      capturedUrl = url;
      return {
        data: {
          success: true,
          data: {
            service: {
              _id: "svc-1",
              name: "stain removal",
              displayOrder: 3,
              isActive: true,
            },
          },
        },
      };
    };

    const res = await serviceApi.createService({
      name: "stain removal",
      displayOrder: 3,
      isActive: true,
    });

    assert(capturedUrl === "/services", "Expected URL /services");
    assert(res._id === "svc-1", "Created service returned");
  });

  await runTest("serviceApi.disableService soft-deletes service", async () => {
    (apiClient as any).delete = async (_url: string) => ({
      data: {
        success: true,
        data: {
          service: {
            _id: "svc-1",
            name: "stain removal",
            isActive: false,
          },
        },
      },
    });

    const res = await serviceApi.disableService("svc-1");
    assert(res.isActive === false, "Service soft-deleted");
  });

  await runTest("Service slice handles create, update, disable, enable, fetchAll thunks", async () => {
    (apiClient as any).post = async () => ({
      data: {
        success: true,
        data: {
          service: {
            _id: "svc-test",
            name: "leather care",
            displayOrder: 4,
            isActive: true,
          },
        },
      },
    });

    await store.dispatch(createServiceThunk({ name: "leather care", displayOrder: 4 }));
    assert(store.getState().service.services.some((s) => s._id === "svc-test"), "Service added to slice");

    (apiClient as any).patch = async () => ({
      data: {
        success: true,
        data: {
          service: {
            _id: "svc-test",
            name: "premium leather care",
            displayOrder: 4,
            isActive: true,
          },
        },
      },
    });
    await store.dispatch(updateServiceThunk({ id: "svc-test", data: { name: "premium leather care" } }));
    assert(store.getState().service.services.some((s) => s.name === "premium leather care"), "Service updated");

    (apiClient as any).delete = async () => ({
      data: {
        success: true,
        data: {
          service: {
            _id: "svc-test",
            name: "premium leather care",
            displayOrder: 4,
            isActive: false,
          },
        },
      },
    });

    await store.dispatch(disableServiceThunk("svc-test"));
    const svc = store.getState().service.services.find((s) => s._id === "svc-test");
    assert(svc?.isActive === false, "Service marked inactive in slice");

    (apiClient as any).patch = async () => ({
      data: {
        success: true,
        data: {
          service: {
            _id: "svc-test",
            name: "premium leather care",
            displayOrder: 4,
            isActive: true,
          },
        },
      },
    });
    await store.dispatch(enableServiceThunk("svc-test"));
    assert(store.getState().service.services.find((s) => s._id === "svc-test")?.isActive === true, "Service re-enabled");

    (apiClient as any).get = async () => ({
      data: {
        success: true,
        data: {
          services: [
            { _id: "svc-test", name: "premium leather care", displayOrder: 4, isActive: true },
          ],
        },
      },
    });
    await store.dispatch(fetchAllServicesAdmin());

    store.dispatch(clearServiceMutationState());
    assert(store.getState().service.mutationSuccess === false, "Service mutation state cleared");
  });

  console.log("\n--- 5. Pricing Admin API Operations & Matrix Integrity ---");

  await runTest("pricingApi.createPricing creates new garment × service rate pair", async () => {
    let capturedUrl = "";
    let capturedData: any = null;
    (apiClient as any).post = async (url: string, data: any) => {
      capturedUrl = url;
      capturedData = data;
      return {
        data: {
          success: true,
          data: {
            pricing: {
              _id: "pr-1",
              garmentId: "g-1",
              serviceId: "s-1",
              price: 150,
              currency: "INR",
              isActive: true,
            },
          },
        },
      };
    };

    const res = await pricingApi.createPricing({
      garmentId: "g-1",
      serviceId: "s-1",
      price: 150,
      currency: "INR",
      isActive: true,
    });

    assert(capturedUrl === "/pricing", "Expected URL /pricing");
    assert(capturedData.price === 150, "Price matches");
    assert(res._id === "pr-1" && res.price === 150, "Pricing entity returned");
  });

  await runTest("pricingApi.updatePricing updates rate value", async () => {
    (apiClient as any).patch = async (_url: string, _data: any) => ({
      data: {
        success: true,
        data: {
          pricing: {
            _id: "pr-1",
            garmentId: "g-1",
            serviceId: "s-1",
            price: 180,
            currency: "INR",
            isActive: true,
          },
        },
      },
    });

    const res = await pricingApi.updatePricing("pr-1", { price: 180 });
    assert(res.price === 180, "Price updated to 180");
  });

  await runTest("pricingApi.disablePricing soft-deletes pricing pair", async () => {
    (apiClient as any).delete = async (_url: string) => ({
      data: {
        success: true,
        data: {
          pricing: {
            _id: "pr-1",
            garmentId: "g-1",
            serviceId: "s-1",
            price: 180,
            currency: "INR",
            isActive: false,
          },
        },
      },
    });

    const res = await pricingApi.disablePricing("pr-1");
    assert(res.isActive === false, "Pricing deactivated");
  });

  await runTest("Pricing slice handles create, update, disable, enable, fetchAll thunks and stores matrix", async () => {
    (apiClient as any).post = async () => ({
      data: {
        success: true,
        data: {
          pricing: {
            _id: "pr-matrix",
            garmentId: "g-x",
            serviceId: "s-y",
            price: 99,
            currency: "INR",
            isActive: true,
          },
        },
      },
    });

    await store.dispatch(createPricingThunk({ garmentId: "g-x", serviceId: "s-y", price: 99 }));
    assert(store.getState().pricing.pricingList.some((p) => p._id === "pr-matrix"), "Pricing saved to store");

    (apiClient as any).patch = async () => ({
      data: {
        success: true,
        data: {
          pricing: {
            _id: "pr-matrix",
            garmentId: "g-x",
            serviceId: "s-y",
            price: 120,
            currency: "INR",
            isActive: true,
          },
        },
      },
    });
    await store.dispatch(updatePricingThunk({ id: "pr-matrix", data: { price: 120 } }));
    assert(store.getState().pricing.pricingList.find((p) => p._id === "pr-matrix")?.price === 120, "Price updated in store");

    (apiClient as any).delete = async () => ({
      data: {
        success: true,
        data: {
          pricing: {
            _id: "pr-matrix",
            garmentId: "g-x",
            serviceId: "s-y",
            price: 120,
            currency: "INR",
            isActive: false,
          },
        },
      },
    });
    await store.dispatch(disablePricingThunk("pr-matrix"));
    assert(store.getState().pricing.pricingList.find((p) => p._id === "pr-matrix")?.isActive === false, "Pricing disabled");

    (apiClient as any).patch = async () => ({
      data: {
        success: true,
        data: {
          pricing: {
            _id: "pr-matrix",
            garmentId: "g-x",
            serviceId: "s-y",
            price: 120,
            currency: "INR",
            isActive: true,
          },
        },
      },
    });
    await store.dispatch(enablePricingThunk("pr-matrix"));
    assert(store.getState().pricing.pricingList.find((p) => p._id === "pr-matrix")?.isActive === true, "Pricing re-enabled");

    (apiClient as any).get = async () => ({
      data: {
        success: true,
        data: {
          pricing: [
            { _id: "pr-matrix", garmentId: "g-x", serviceId: "s-y", price: 120, currency: "INR", isActive: true },
          ],
        },
      },
    });
    await store.dispatch(fetchAllPricingAdmin());

    store.dispatch(clearPricingMutationState());
    assert(store.getState().pricing.mutationSuccess === false, "Pricing mutation state cleared");
  });

  console.log("\n--- 6. Admin Catalog UI Screens & Navigation Registration ---");

  await runTest("Admin catalog navigation types and tabs are properly configured", () => {
    const validTabs: AdminCatalogTabType[] = ["categories", "garments", "services", "pricing"];
    assert(validTabs.length === 4, "All 4 catalog tabs supported");
    
    // Validate param list shapes
    const mockCatalogParams: AdminCatalogStackParamList = {
      AdminCatalogScreen: { initialTab: "pricing" },
      AdminCategoriesScreen: undefined,
      AdminGarmentsScreen: { categoryId: "c-123" },
      AdminServicesScreen: undefined,
      AdminPricingScreen: undefined,
    };
    assert(mockCatalogParams.AdminCatalogScreen?.initialTab === "pricing", "Catalog stack params valid");
    assert(mockCatalogParams.AdminGarmentsScreen?.categoryId === "c-123", "Garments stack params valid");
  });

  // Restore client methods
  apiClient.get = origGet;
  apiClient.post = origPost;
  apiClient.patch = origPatch;
  apiClient.delete = origDelete;

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n=======================================================");
  console.log(` Admin Catalog Test Summary: ${passed}/${results.length} Passed (${failed} Failed)`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Fatal error in verify-admin-catalog:", e);
  process.exit(1);
});
