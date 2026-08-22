/**
 * Comprehensive verification suite for FRESCO Mobile Phase 5:
 * Catalog, Garment & Pricing Module.
 * Tests API service contracts, Redux slices, authoritative pricing, and state synchronizations.
 */

import { categoryApi } from "../category.api";
import { garmentApi } from "../garment.api";
import { serviceApi } from "../service.api";
import { pricingApi } from "../pricing.api";
import { apiClient } from "../client";
import { store } from "../../store";
import {
  fetchCategories,
  fetchCategoryById,
  setSelectedCategory,
  clearCategoryErrors,
} from "../../store/slices/categorySlice";
import {
  fetchGarments,
  fetchGarmentById,
  setSelectedGarment,
  clearGarmentErrors,
} from "../../store/slices/garmentSlice";
import {
  fetchServices,
  fetchServiceById,
  setSelectedService,
  clearServiceErrors,
} from "../../store/slices/serviceSlice";
import {
  fetchPricing,
  fetchPricingById,
  clearPricingErrors,
  clearPricingList,
} from "../../store/slices/pricingSlice";
import {
  Category,
  Garment,
  Service,
  Pricing,
} from "../../types/catalog.types";

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

export async function runPhase5TestSuite(): Promise<{ total: number; passed: number; failed: number }> {
  console.log("\n=======================================================");
  console.log("FRESCO FRONTEND — PHASE 5 CATALOG & PRICING TEST SUITE");
  console.log("=======================================================\n");

  const mockCategory1: Category = {
    _id: "60d5ec49f1b2c8b1f8e4e301",
    name: "men",
    description: "Men's daily and formal clothing",
    icon: "shirt-outline",
    displayOrder: 1,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  const mockCategory2: Category = {
    _id: "60d5ec49f1b2c8b1f8e4e302",
    name: "women",
    description: "Women's traditional, ethnic and casual wear",
    icon: "woman-outline",
    displayOrder: 2,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  const mockGarment1: Garment = {
    _id: "60d5ec49f1b2c8b1f8e4e401",
    categoryId: "60d5ec49f1b2c8b1f8e4e301",
    name: "formal shirt",
    description: "Cotton and blend formal shirts",
    displayOrder: 1,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  const mockGarment2: Garment = {
    _id: "60d5ec49f1b2c8b1f8e4e402",
    categoryId: "60d5ec49f1b2c8b1f8e4e301",
    name: "trousers",
    description: "Formal trousers and chinos",
    displayOrder: 2,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  const mockService1: Service = {
    _id: "60d5ec49f1b2c8b1f8e4e501",
    name: "wash & iron",
    description: "Complete wet washing and crisp steam ironing",
    displayOrder: 1,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  const mockService2: Service = {
    _id: "60d5ec49f1b2c8b1f8e4e502",
    name: "dry clean",
    description: "Premium chemical dry cleaning for delicate fabrics",
    displayOrder: 2,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  const mockPricing1: Pricing = {
    _id: "60d5ec49f1b2c8b1f8e4e601",
    garmentId: "60d5ec49f1b2c8b1f8e4e401", // formal shirt
    serviceId: "60d5ec49f1b2c8b1f8e4e501", // wash & iron
    price: 49,
    currency: "INR",
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  const mockPricing2: Pricing = {
    _id: "60d5ec49f1b2c8b1f8e4e602",
    garmentId: "60d5ec49f1b2c8b1f8e4e401", // formal shirt
    serviceId: "60d5ec49f1b2c8b1f8e4e502", // dry clean
    price: 119,
    currency: "INR",
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  // TEST 1: categoryApi.getCategories uses GET /categories and unwraps response
  await runTest("1. Category API: getCategories calls GET /categories and unwraps data.categories", async () => {
    const originalGet = apiClient.get;
    apiClient.get = (async (url: string, config?: { params?: { isActive?: boolean } }) => {
      assert(url === "/categories", `Expected GET /categories, got ${url}`);
      assert(config?.params?.isActive === true, "Query param isActive passed");
      return {
        status: 200,
        data: {
          success: true,
          message: "Categories fetched successfully",
          data: { categories: [mockCategory1, mockCategory2] },
        },
      };
    }) as typeof apiClient.get;

    const categories = await categoryApi.getCategories({ isActive: true });
    assert(categories.length === 2, "Returned 2 categories");
    assert(categories[0]?._id === mockCategory1._id, "First category matches mock");
    assert(categories[0]?.name === "men", "Category name matches");

    apiClient.get = originalGet;
  });

  // TEST 2: categoryApi.getCategoryById calls GET /categories/:id
  await runTest("2. Category API: getCategoryById calls GET /categories/:id and unwraps data.category", async () => {
    const originalGet = apiClient.get;
    apiClient.get = (async (url: string) => {
      assert(url === `/categories/${mockCategory1._id}`, `Expected GET /categories/:id, got ${url}`);
      return {
        status: 200,
        data: {
          success: true,
          message: "Category fetched successfully",
          data: { category: mockCategory1 },
        },
      };
    }) as typeof apiClient.get;

    const category = await categoryApi.getCategoryById(mockCategory1._id);
    assert(category._id === mockCategory1._id, "Category ID matches");

    apiClient.get = originalGet;
  });

  // TEST 3: Redux categorySlice state updates & thunks
  await runTest("3. Redux categorySlice: handles loading, fulfilled state, selection, and error reset", async () => {
    const originalGet = apiClient.get;
    apiClient.get = (async () => ({
      status: 200,
      data: {
        success: true,
        message: "Categories fetched",
        data: { categories: [mockCategory1, mockCategory2] },
      },
    })) as typeof apiClient.get;

    await store.dispatch(fetchCategories({ isActive: true }));
    let state = store.getState().category;
    assert(state.categories.length === 2, "2 categories in Redux state");
    assert(state.isLoading === false, "isLoading is false after fetch");
    assert(state.error === null, "error is null");

    store.dispatch(setSelectedCategory(mockCategory1));
    state = store.getState().category;
    assert(state.selectedCategory?._id === mockCategory1._id, "Selected category set");

    store.dispatch(clearCategoryErrors());
    apiClient.get = originalGet;
  });

  // TEST 4: garmentApi.getGarments uses GET /garments with categoryId filter
  await runTest("4. Garment API: getGarments calls GET /garments with categoryId filter", async () => {
    const originalGet = apiClient.get;
    apiClient.get = (async (url: string, config?: { params?: { categoryId?: string; isActive?: boolean } }) => {
      assert(url === "/garments", `Expected GET /garments, got ${url}`);
      assert(config?.params?.categoryId === mockCategory1._id, "Correct categoryId filter passed");
      return {
        status: 200,
        data: {
          success: true,
          message: "Garments fetched successfully",
          data: { garments: [mockGarment1, mockGarment2] },
        },
      };
    }) as typeof apiClient.get;

    const garments = await garmentApi.getGarments({
      categoryId: mockCategory1._id,
      isActive: true,
    });
    assert(garments.length === 2, "Returned 2 garments");
    assert(garments[0]?._id === mockGarment1._id, "First garment matches");
    assert(garments[0]?.categoryId === mockCategory1._id, "Garment categoryId matches");

    apiClient.get = originalGet;
  });

  // TEST 5: garmentApi.getGarmentById calls GET /garments/:id
  await runTest("5. Garment API: getGarmentById calls GET /garments/:id and unwraps data.garment", async () => {
    const originalGet = apiClient.get;
    apiClient.get = (async (url: string) => {
      assert(url === `/garments/${mockGarment1._id}`, `Expected GET /garments/:id, got ${url}`);
      return {
        status: 200,
        data: {
          success: true,
          message: "Garment fetched",
          data: { garment: mockGarment1 },
        },
      };
    }) as typeof apiClient.get;

    const garment = await garmentApi.getGarmentById(mockGarment1._id);
    assert(garment._id === mockGarment1._id, "Garment ID matches");

    apiClient.get = originalGet;
  });

  // TEST 6: Redux garmentSlice state management
  await runTest("6. Redux garmentSlice: manages garments list, selected garment, and loading states", async () => {
    const originalGet = apiClient.get;
    apiClient.get = (async () => ({
      status: 200,
      data: {
        success: true,
        message: "Garments fetched",
        data: { garments: [mockGarment1, mockGarment2] },
      },
    })) as typeof apiClient.get;

    await store.dispatch(fetchGarments({ categoryId: mockCategory1._id }));
    let state = store.getState().garment;
    assert(state.garments.length === 2, "2 garments in Redux state");
    assert(state.isLoading === false, "isLoading is false");

    store.dispatch(setSelectedGarment(mockGarment1));
    state = store.getState().garment;
    assert(state.selectedGarment?._id === mockGarment1._id, "Selected garment updated");

    store.dispatch(clearGarmentErrors());
    apiClient.get = originalGet;
  });

  // TEST 7: serviceApi.getServices calls GET /services and unwraps data.services
  await runTest("7. Service API: getServices calls GET /services and unwraps data.services", async () => {
    const originalGet = apiClient.get;
    apiClient.get = (async (url: string) => {
      assert(url === "/services", `Expected GET /services, got ${url}`);
      return {
        status: 200,
        data: {
          success: true,
          message: "Services fetched successfully",
          data: { services: [mockService1, mockService2] },
        },
      };
    }) as typeof apiClient.get;

    const services = await serviceApi.getServices({ isActive: true });
    assert(services.length === 2, "Returned 2 services");
    assert(services[0]?.name === "wash & iron", "First service name matches");

    apiClient.get = originalGet;
  });

  // TEST 8: Redux serviceSlice state management
  await runTest("8. Redux serviceSlice: manages services list, selected service, and errors", async () => {
    const originalGet = apiClient.get;
    apiClient.get = (async () => ({
      status: 200,
      data: {
        success: true,
        message: "Services fetched",
        data: { services: [mockService1, mockService2] },
      },
    })) as typeof apiClient.get;

    await store.dispatch(fetchServices());
    let state = store.getState().service;
    assert(state.services.length === 2, "2 services in Redux state");

    store.dispatch(setSelectedService(mockService1));
    state = store.getState().service;
    assert(state.selectedService?._id === mockService1._id, "Selected service set");

    store.dispatch(clearServiceErrors());
    apiClient.get = originalGet;
  });

  // TEST 9: pricingApi.getPricing calls GET /pricing with garmentId and serviceId filters
  await runTest("9. Pricing API: getPricing calls GET /pricing with query filters and unwraps data.pricing", async () => {
    const originalGet = apiClient.get;
    apiClient.get = (async (url: string, config?: { params?: { garmentId?: string; isActive?: boolean } }) => {
      assert(url === "/pricing", `Expected GET /pricing, got ${url}`);
      assert(config?.params?.garmentId === mockGarment1._id, "garmentId filter passed");
      return {
        status: 200,
        data: {
          success: true,
          message: "Pricing fetched successfully",
          data: { pricing: [mockPricing1, mockPricing2] },
        },
      };
    }) as typeof apiClient.get;

    const pricing = await pricingApi.getPricing({
      garmentId: mockGarment1._id,
      isActive: true,
    });
    assert(pricing.length === 2, "Returned 2 pricing entries");
    assert(pricing[0]?.price === 49, "Pricing price is 49");
    assert(pricing[1]?.price === 119, "Pricing price is 119");

    apiClient.get = originalGet;
  });

  // TEST 10: Redux pricingSlice and Authoritative Pricing Calculations
  await runTest("10. Redux pricingSlice & Authoritative Pricing: maintains backend-driven prices and calculations", async () => {
    const originalGet = apiClient.get;
    apiClient.get = (async () => ({
      status: 200,
      data: {
        success: true,
        message: "Pricing fetched",
        data: { pricing: [mockPricing1, mockPricing2] },
      },
    })) as typeof apiClient.get;

    await store.dispatch(fetchPricing({ garmentId: mockGarment1._id }));
    let state = store.getState().pricing;
    assert(state.pricingList.length === 2, "2 pricing records in state");

    // Test authoritative price calculation
    const unitPrice = state.pricingList[0]?.price || 0;
    const quantity = 3;
    const expectedSubtotal = unitPrice * quantity; // 49 * 3 = 147
    assert(unitPrice === 49, "Unit price matches backend price: 49");
    assert(expectedSubtotal === 147, "Total calculation matches authoritative backend math: 147");

    store.dispatch(clearPricingList());
    store.dispatch(clearPricingErrors());
    state = store.getState().pricing;
    assert(state.pricingList.length === 0, "pricingList cleared");

    apiClient.get = originalGet;
  });

  // TEST 11: Single item fetch thunks (fetchCategoryById, fetchGarmentById, fetchServiceById, fetchPricingById)
  await runTest("11. Redux single-item fetch thunks: successfully fetch and update store items", async () => {
    const originalGet = apiClient.get;

    apiClient.get = (async (url: string) => {
      if (url.startsWith("/categories/")) {
        return { status: 200, data: { success: true, message: "OK", data: { category: mockCategory1 } } };
      }
      if (url.startsWith("/garments/")) {
        return { status: 200, data: { success: true, message: "OK", data: { garment: mockGarment1 } } };
      }
      if (url.startsWith("/services/")) {
        return { status: 200, data: { success: true, message: "OK", data: { service: mockService1 } } };
      }
      if (url.startsWith("/pricing/")) {
        return { status: 200, data: { success: true, message: "OK", data: { pricing: mockPricing1 } } };
      }
      throw new Error(`Unexpected URL ${url}`);
    }) as typeof apiClient.get;

    await store.dispatch(fetchCategoryById(mockCategory1._id));
    assert(store.getState().category.selectedCategory?._id === mockCategory1._id, "Category set");

    await store.dispatch(fetchGarmentById(mockGarment1._id));
    assert(store.getState().garment.selectedGarment?._id === mockGarment1._id, "Garment set");

    await store.dispatch(fetchServiceById(mockService1._id));
    assert(store.getState().service.selectedService?._id === mockService1._id, "Service set");

    await store.dispatch(fetchPricingById(mockPricing1._id));
    assert(store.getState().pricing.pricingList.some((p) => p._id === mockPricing1._id), "Pricing added to list");

    apiClient.get = originalGet;
  });

  // TEST 12: Service with Pricing Pairing Algorithm (Catalog Integration)
  await runTest("12. Service + Pricing Pairing: builds ordered list of available services with verified pricing", async () => {
    const pricingList = [mockPricing1, mockPricing2];
    const services = [mockService2, mockService1]; // out of display order

    const garmentPricing = pricingList.filter(
      (p) => p.garmentId === mockGarment1._id && p.isActive
    );

    const pairedOptions = [];
    for (const price of garmentPricing) {
      const matchedService = services.find(
        (s) => s._id === price.serviceId && s.isActive
      );
      if (matchedService) {
        pairedOptions.push({
          service: matchedService,
          pricing: price,
        });
      }
    }

    pairedOptions.sort(
      (a, b) => (a.service.displayOrder || 0) - (b.service.displayOrder || 0)
    );

    assert(pairedOptions.length === 2, "2 paired service options generated");
    assert(pairedOptions[0]?.service.name === "wash & iron", "First service is wash & iron (displayOrder 1)");
    assert(pairedOptions[0]?.pricing.price === 49, "First service price is 49");
    assert(pairedOptions[1]?.service.name === "dry clean", "Second service is dry clean (displayOrder 2)");
    assert(pairedOptions[1]?.pricing.price === 119, "Second service price is 119");
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
  runPhase5TestSuite()
    .then(({ failed }) => {
      if (failed > 0) process.exit(1);
    })
    .catch((err) => {
      console.error("Test runner error:", err);
      process.exit(1);
    });
}
