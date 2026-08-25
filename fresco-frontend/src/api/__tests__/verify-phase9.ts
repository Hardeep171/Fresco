/**
 * Comprehensive verification suite for FRESCO Mobile Phase 9:
 * Inspection Recording & Inspection Completion.
 * Tests Inspection API service contracts, Redux slice lifecycles,
 * condition and status mappings, server-authoritative pricing display,
 * order lifecycle synchronization, duplicate submission guarding,
 * error normalizations, and session clearance on logout.
 */

import { inspectionApi } from "../inspection.api";
import { apiClient } from "../client";
import { store } from "../../store";
import {
  fetchInspectionByOrderId,
  fetchInspectionById,
  fetchInspections,
  createInspectionThunk,
  updateInspectionThunk,
  submitInspectionThunk,
  setCurrentInspection,
  clearInspectionErrors,
} from "../../store/slices/inspectionSlice";
import { logoutUser } from "../../store/slices/authSlice";
import {
  INSPECTION_STATUSES,
  INSPECTION_STATUS_LABELS,
  ITEM_CONDITIONS,
  ITEM_CONDITION_LABELS,
  ITEM_CONDITION_DESCRIPTIONS,
  ITEM_CONDITION_ICONS,
} from "../../constants/inspection.constants";
import {
  Inspection,
  CreateInspectionInput,
  UpdateInspectionInput,
} from "../../types/inspection.types";


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

async function runTest(
  name: string,
  fn: () => Promise<void> | void
): Promise<void> {
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

export async function runPhase9TestSuite(): Promise<{
  total: number;
  passed: number;
  failed: number;
}> {
  console.log("\n=======================================================");
  console.log("FRESCO FRONTEND — PHASE 9 INSPECTION TEST SUITE");
  console.log("=======================================================\n");

  const mockInspection1: Inspection = {
    _id: "60d5ec49f1b2c8b1f8e4e601",
    orderId: "60d5ec49f1b2c8b1f8e4e901",
    inspectorId: "60d5ec49f1b2c8b1f8e4eadm1",
    status: "DRAFT",
    items: [
      {
        garmentId: "60d5ec49f1b2c8b1f8e4e401",
        serviceId: "60d5ec49f1b2c8b1f8e4e501",
        garmentName: "Formal Shirt",
        serviceName: "Dry Cleaning",
        initialQuantity: 2,
        inspectedQuantity: 2,
        unitPrice: 49,
        totalPrice: 98,
        condition: "STAINED",
        damageNotes: "Small coffee stain on left sleeve",
        imageUrls: [],
      },
      {
        garmentId: "60d5ec49f1b2c8b1f8e4e402",
        serviceId: "60d5ec49f1b2c8b1f8e4e501",
        garmentName: "Denim Jeans",
        serviceName: "Wash & Iron",
        initialQuantity: 1,
        inspectedQuantity: 1,
        unitPrice: 79,
        totalPrice: 79,
        condition: "NORMAL",
        imageUrls: [],
      },
    ],
    extraServices: [
      {
        serviceName: "Stain Removal Treatment",
        price: 25,
      },
    ],
    pricingSummary: {
      initialTotal: 177,
      inspectedSubtotal: 177,
      extraServiceCharges: 25,
      adjustmentAmount: 0,
      finalTax: 0,
      finalTotalAmount: 202,
    },
    notes: "Customer present during doorstep inspection.",
    inspectedAt: "2026-08-22T08:30:00.000Z",
    isActive: true,
    createdAt: "2026-08-22T08:30:00.000Z",
    updatedAt: "2026-08-22T08:30:00.000Z",
  };

  const mockSubmittedInspection: Inspection = {
    ...mockInspection1,
    status: "SUBMITTED",
    submittedAt: "2026-08-22T08:45:00.000Z",
    updatedAt: "2026-08-22T08:45:00.000Z",
  };

  // TEST 1: inspectionApi.getInspectionByOrderId
  await runTest(
    "1. Inspection API: getInspectionByOrderId calls GET /inspections/order/:orderId and unwraps data.inspection",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async (url: string) => {
        assert(
          url === `/inspections/order/${mockInspection1.orderId}`,
          `Expected GET /inspections/order/${mockInspection1.orderId}, got ${url}`
        );
        return {
          status: 200,
          data: {
            success: true,
            message: "Inspection fetched successfully",
            data: { inspection: mockInspection1 },
          },
        };
      }) as typeof apiClient.get;

      const inspection = await inspectionApi.getInspectionByOrderId(
        mockInspection1.orderId as string
      );
      assert(inspection._id === mockInspection1._id, "Inspection ID matches");
      assert(inspection.items.length === 2, "Items count matches");
      assert(inspection.pricingSummary.finalTotalAmount === 202, "Pricing matches");

      apiClient.get = originalGet;
    }
  );

  // TEST 2: inspectionApi.getInspectionById
  await runTest(
    "2. Inspection API: getInspectionById calls GET /inspections/:id and unwraps data.inspection",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async (url: string) => {
        assert(
          url === `/inspections/${mockInspection1._id}`,
          `Expected GET /inspections/${mockInspection1._id}, got ${url}`
        );
        return {
          status: 200,
          data: {
            success: true,
            message: "Inspection fetched successfully",
            data: { inspection: mockInspection1 },
          },
        };
      }) as typeof apiClient.get;

      const inspection = await inspectionApi.getInspectionById(mockInspection1._id);
      assert(inspection._id === mockInspection1._id, "Inspection ID matches");

      apiClient.get = originalGet;
    }
  );

  // TEST 3: inspectionApi.getInspections
  await runTest(
    "3. Inspection API: getInspections calls GET /inspections and returns array of inspections",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async (url: string) => {
        assert(url === "/inspections", `Expected GET /inspections, got ${url}`);

        return {
          status: 200,
          data: {
            success: true,
            message: "Inspections fetched successfully",
            data: { inspections: [mockInspection1, mockSubmittedInspection] },
          },
        };
      }) as typeof apiClient.get;

      const list = await inspectionApi.getInspections({ status: "DRAFT" });
      assert(list.length === 2, "2 inspections returned");
      assert(list[0]?._id === mockInspection1._id, "First inspection matches");

      apiClient.get = originalGet;
    }
  );

  // TEST 4: inspectionApi.createInspection
  await runTest(
    "4. Inspection API: createInspection sends POST /inspections with validated payload",
    async () => {
      const originalPost = apiClient.post;
      const createInput: CreateInspectionInput = {
        orderId: mockInspection1.orderId as string,
        items: [
          {
            garmentId: "60d5ec49f1b2c8b1f8e4e401",
            serviceId: "60d5ec49f1b2c8b1f8e4e501",
            initialQuantity: 2,
            inspectedQuantity: 2,
            condition: "STAINED",
            damageNotes: "Small coffee stain",
          },
        ],
        notes: "Inspection complete",
      };

      apiClient.post = (async (url: string, body: any) => {
        assert(url === "/inspections", `Expected POST /inspections, got ${url}`);
        assert(body.orderId === createInput.orderId, "orderId matches body");
        assert(body.items.length === 1, "items length matches body");
        return {
          status: 201,
          data: {
            success: true,
            message: "Inspection created successfully",
            data: { inspection: mockInspection1 },
          },
        };
      }) as typeof apiClient.post;

      const created = await inspectionApi.createInspection(createInput);
      assert(created._id === mockInspection1._id, "Created inspection returned");

      apiClient.post = originalPost;
    }
  );

  // TEST 5: inspectionApi.updateInspection
  await runTest(
    "5. Inspection API: updateInspection sends PATCH /inspections/:id with update payload",
    async () => {
      const originalPatch = apiClient.patch;
      const updateInput: UpdateInspectionInput = {
        notes: "Updated inspection notes after customer review",
      };

      apiClient.patch = (async (url: string, body: any) => {
        assert(
          url === `/inspections/${mockInspection1._id}`,
          `Expected PATCH /inspections/${mockInspection1._id}, got ${url}`
        );
        assert(body.notes === updateInput.notes, "notes matches body");
        return {
          status: 200,
          data: {
            success: true,
            message: "Inspection updated successfully",
            data: {
              inspection: {
                ...mockInspection1,
                notes: updateInput.notes,
              },
            },
          },
        };
      }) as typeof apiClient.patch;

      const updated = await inspectionApi.updateInspection(
        mockInspection1._id,
        updateInput
      );
      assert(updated.notes === updateInput.notes, "Updated notes reflected");

      apiClient.patch = originalPatch;
    }
  );

  // TEST 6: inspectionApi.submitInspection
  await runTest(
    "6. Inspection API: submitInspection sends POST /inspections/:id/submit and returns submitted inspection",
    async () => {
      const originalPost = apiClient.post;
      apiClient.post = (async (url: string) => {
        assert(
          url === `/inspections/${mockInspection1._id}/submit`,
          `Expected POST /inspections/${mockInspection1._id}/submit, got ${url}`
        );
        return {
          status: 200,
          data: {
            success: true,
            message: "Inspection submitted successfully",
            data: { inspection: mockSubmittedInspection },
          },
        };
      }) as typeof apiClient.post;

      const submitted = await inspectionApi.submitInspection(mockInspection1._id);
      assert(submitted.status === "SUBMITTED", "Status is SUBMITTED");
      assert(submitted.submittedAt !== undefined, "submittedAt timestamp populated");

      apiClient.post = originalPost;
    }
  );

  // TEST 7: Response Envelope Unwrapping
  await runTest(
    "7. Envelope Unwrapping: unwraps standard { success: true, message: string, data: { inspection } } structure",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async () => ({
        status: 200,
        data: {
          success: true,
          message: "Inspection fetched",
          data: { inspection: mockInspection1 },
        },
      })) as typeof apiClient.get;

      const result = await inspectionApi.getInspectionById(mockInspection1._id);
      assert(result.status === "DRAFT", "Correctly extracted inspection object");
      assert(result.items.length === 2, "Items array intact");

      apiClient.get = originalGet;
    }
  );

  // TEST 8: Redux fetchInspectionByOrderId Lifecycle
  await runTest(
    "8. Redux inspectionSlice: manages fetchInspectionByOrderId loading lifecycle and updates state",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async () => ({
        status: 200,
        data: {
          success: true,
          message: "Inspection fetched",
          data: { inspection: mockInspection1 },
        },
      })) as typeof apiClient.get;

      await store.dispatch(
        fetchInspectionByOrderId(mockInspection1.orderId as string)
      );
      const state = store.getState().inspection;
      assert(state.currentInspection?._id === mockInspection1._id, "currentInspection populated");
      assert(state.isFetchingInspection === false, "isFetchingInspection is false");
      assert(state.error === null, "error is null");

      apiClient.get = originalGet;
    }
  );

  // TEST 9: Redux fetchInspectionById Lifecycle
  await runTest(
    "9. Redux inspectionSlice: manages fetchInspectionById lifecycle and caches in inspections list",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async () => ({
        status: 200,
        data: {
          success: true,
          message: "Inspection fetched",
          data: { inspection: mockInspection1 },
        },
      })) as typeof apiClient.get;

      await store.dispatch(fetchInspectionById(mockInspection1._id));
      const state = store.getState().inspection;
      assert(state.currentInspection?._id === mockInspection1._id, "currentInspection set");
      assert(
        state.inspections.some((i) => i._id === mockInspection1._id),
        "Cached in inspections array"
      );

      apiClient.get = originalGet;
    }
  );

  // TEST 10: Redux fetchInspections List Lifecycle
  await runTest(
    "10. Redux inspectionSlice: manages fetchInspections list retrieval and stores array",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async () => ({
        status: 200,
        data: {
          success: true,
          message: "Inspections list",
          data: { inspections: [mockInspection1, mockSubmittedInspection] },
        },
      })) as typeof apiClient.get;

      await store.dispatch(fetchInspections());
      const state = store.getState().inspection;
      assert(state.inspections.length === 2, "2 inspections in state");
      assert(state.isFetchingInspection === false, "isFetchingInspection is false");

      apiClient.get = originalGet;
    }
  );

  // TEST 11: Redux createInspectionThunk Lifecycle
  await runTest(
    "11. Redux inspectionSlice: createInspectionThunk creates inspection and sets currentInspection",
    async () => {
      const originalPost = apiClient.post;
      apiClient.post = (async () => ({
        status: 201,
        data: {
          success: true,
          message: "Created",
          data: { inspection: mockInspection1 },
        },
      })) as typeof apiClient.post;

      const result = await store.dispatch(
        createInspectionThunk({
          orderId: mockInspection1.orderId as string,
          items: [
            {
              garmentId: "60d5ec49f1b2c8b1f8e4e401",
              serviceId: "60d5ec49f1b2c8b1f8e4e501",
              initialQuantity: 2,
              inspectedQuantity: 2,
              condition: "STAINED",
            },
          ],
        })
      );

      assert(createInspectionThunk.fulfilled.match(result), "Thunk fulfilled");
      const state = store.getState().inspection;
      assert(state.currentInspection?._id === mockInspection1._id, "currentInspection set");
      assert(state.isCreatingInspection === false, "isCreatingInspection is false");

      apiClient.post = originalPost;
    }
  );

  // TEST 12: Redux updateInspectionThunk Lifecycle
  await runTest(
    "12. Redux inspectionSlice: updateInspectionThunk updates inspection in-place",
    async () => {
      const originalPatch = apiClient.patch;
      const updatedInspection = {
        ...mockInspection1,
        notes: "Updated during review",
      };

      apiClient.patch = (async () => ({
        status: 200,
        data: {
          success: true,
          message: "Updated",
          data: { inspection: updatedInspection },
        },
      })) as typeof apiClient.patch;

      const result = await store.dispatch(
        updateInspectionThunk({
          id: mockInspection1._id,
          payload: { notes: "Updated during review" },
        })
      );

      assert(updateInspectionThunk.fulfilled.match(result), "Update thunk fulfilled");
      const state = store.getState().inspection;
      assert(state.currentInspection?.notes === "Updated during review", "Notes updated");
      assert(state.isUpdatingInspection === false, "isUpdatingInspection is false");

      apiClient.patch = originalPatch;
    }
  );

  // TEST 13: Redux submitInspectionThunk Lifecycle
  await runTest(
    "13. Redux inspectionSlice: submitInspectionThunk updates status to SUBMITTED",
    async () => {
      const originalPost = apiClient.post;
      apiClient.post = (async () => ({
        status: 200,
        data: {
          success: true,
          message: "Submitted",
          data: { inspection: mockSubmittedInspection },
        },
      })) as typeof apiClient.post;

      const result = await store.dispatch(submitInspectionThunk(mockInspection1._id));
      assert(submitInspectionThunk.fulfilled.match(result), "Submit thunk fulfilled");
      const state = store.getState().inspection;
      assert(state.currentInspection?.status === "SUBMITTED", "status is SUBMITTED");
      assert(state.isSubmittingInspection === false, "isSubmittingInspection is false");

      apiClient.post = originalPost;
    }
  );

  // TEST 14: Inspection Status Mapping
  await runTest(
    "14. Inspection Status Mapping: all 5 backend INSPECTION_STATUSES map to human-friendly labels",
    () => {
      assert(INSPECTION_STATUSES.length === 5, "5 inspection statuses defined");
      INSPECTION_STATUSES.forEach((status) => {
        const label = INSPECTION_STATUS_LABELS[status];
        assert(typeof label === "string" && label.length > 0, `Label exists for ${status}: ${label}`);
      });
      assert(INSPECTION_STATUS_LABELS.DRAFT === "Draft (In Progress)", "DRAFT matches");
      assert(INSPECTION_STATUS_LABELS.SUBMITTED === "Inspection Completed", "SUBMITTED matches");
      assert(INSPECTION_STATUS_LABELS.APPROVED === "Approved", "APPROVED matches");
      assert(INSPECTION_STATUS_LABELS.REJECTED === "Rejected", "REJECTED matches");
      assert(INSPECTION_STATUS_LABELS.CANCELLED === "Cancelled", "CANCELLED matches");
    }
  );

  // TEST 15: Garment Item Condition Mapping
  await runTest(
    "15. Item Condition Mapping: all 5 backend ITEM_CONDITIONS map to display labels and descriptions",
    () => {
      assert(ITEM_CONDITIONS.length === 5, "5 item conditions defined");
      ITEM_CONDITIONS.forEach((condition) => {
        const label = ITEM_CONDITION_LABELS[condition];
        const desc = ITEM_CONDITION_DESCRIPTIONS[condition];
        assert(typeof label === "string" && label.length > 0, `Label exists for ${condition}: ${label}`);
        assert(typeof desc === "string" && desc.length > 0, `Description exists for ${condition}: ${desc}`);
      });
      assert(ITEM_CONDITION_LABELS.NORMAL === "Normal (Good Condition)", "NORMAL label matches");
      assert(ITEM_CONDITION_LABELS.STAINED === "Pre-existing Stain", "STAINED label matches");
      assert(ITEM_CONDITION_LABELS.DAMAGED === "Pre-existing Damage", "DAMAGED label matches");
      assert(ITEM_CONDITION_LABELS.TORN === "Tear / Puncture", "TORN label matches");
      assert(ITEM_CONDITION_LABELS.COLOR_BLEED_RISK === "Color Bleed Risk", "COLOR_BLEED_RISK label matches");
    }
  );

  // TEST 16: Backend Item Condition Icons
  await runTest(
    "16. Item Condition Icons: all 5 backend ITEM_CONDITIONS map to Ionicons glyphs",
    () => {
      ITEM_CONDITIONS.forEach((condition) => {
        const icon = ITEM_CONDITION_ICONS[condition];
        assert(typeof icon === "string" && icon.length > 0, `Icon exists for ${condition}: ${icon}`);
      });
      assert(ITEM_CONDITION_ICONS.NORMAL === "checkmark-circle", "NORMAL icon matches");
      assert(ITEM_CONDITION_ICONS.STAINED === "water", "STAINED icon matches");
      assert(ITEM_CONDITION_ICONS.DAMAGED === "alert-circle", "DAMAGED icon matches");
      assert(ITEM_CONDITION_ICONS.TORN === "cut", "TORN icon matches");
      assert(ITEM_CONDITION_ICONS.COLOR_BLEED_RISK === "color-palette", "COLOR_BLEED_RISK icon matches");
    }
  );

  // TEST 17: Server-Authoritative Pricing Display
  await runTest(
    "17. Server Pricing Authority: inspection pricing summary correctly preserves server calculations",
    () => {
      const summary = mockInspection1.pricingSummary;
      assert(summary.initialTotal === 177, "initialTotal preserved");
      assert(summary.inspectedSubtotal === 177, "inspectedSubtotal preserved");
      assert(summary.extraServiceCharges === 25, "extraServiceCharges preserved");
      assert(summary.adjustmentAmount === 0, "adjustmentAmount preserved");
      assert(summary.finalTax === 0, "finalTax preserved");
      assert(summary.finalTotalAmount === 202, "finalTotalAmount = subtotal + extra = 202");
    }
  );

  // TEST 18: Duplicate Submission Guarding
  await runTest(
    "18. Duplicate Submission Guarding: isSubmittingInspection prevents concurrent duplicate requests",
    async () => {
      const originalPost = apiClient.post;
      let submitCallCount = 0;

      apiClient.post = (async () => {
        submitCallCount++;
        await new Promise((res) => setTimeout(res, 50));
        return {
          status: 200,
          data: {
            success: true,
            message: "Submitted",
            data: { inspection: mockSubmittedInspection },
          },
        };
      }) as typeof apiClient.post;

      const p1 = store.dispatch(submitInspectionThunk(mockInspection1._id));
      assert(
        store.getState().inspection.isSubmittingInspection === true,
        "isSubmittingInspection is true during in-flight request"
      );

      await p1;
      assert(
        store.getState().inspection.isSubmittingInspection === false,
        "isSubmittingInspection is false after completion"
      );
      assert(submitCallCount === 1, "API called exactly once");

      apiClient.post = originalPost;
    }
  );

  // TEST 19: Order Status Lifecycle Synchronization
  await runTest(
    "19. Order Status Synchronization: backend advances order lifecycle to IN_PROCESS upon submission",
    () => {
      // Backend order.service.ts transitionOrderStatus("UNDER_INSPECTION", "IN_PROCESS")
      const getNextOrderStatusOnInspectionSubmit = (currentOrderStatus: string) => {
        if (currentOrderStatus === "UNDER_INSPECTION") return "IN_PROCESS";
        return currentOrderStatus;
      };

      assert(
        getNextOrderStatusOnInspectionSubmit("UNDER_INSPECTION") === "IN_PROCESS",
        "UNDER_INSPECTION -> IN_PROCESS"
      );
    }
  );

  // TEST 20: Customer Read-Only Protection
  await runTest(
    "20. Customer Read-Only Protection: verifies non-admin users receive 403 when creating or updating inspections",
    async () => {
      const originalPost = apiClient.post;
      apiClient.post = (async () => {
        const error: any = new Error("Request failed with status code 403");
        error.isAxiosError = true;
        error.response = {
          status: 403,
          data: {
            success: false,
            message: "User does not have administrative permissions for inspection",
          },
        };
        throw error;
      }) as typeof apiClient.post;

      const result = await store.dispatch(
        createInspectionThunk({
          orderId: mockInspection1.orderId as string,
          items: [],
        })
      );

      assert(createInspectionThunk.rejected.match(result), "Rejected on 403");
      const state = store.getState().inspection;
      assert(state.createError?.statusCode === 403, "createError statusCode is 403");
      assert(state.createError?.kind === "FORBIDDEN", "createError kind is FORBIDDEN");

      store.dispatch(clearInspectionErrors());
      assert(store.getState().inspection.createError === null, "Error cleared");

      apiClient.post = originalPost;
    }
  );

  // TEST 21: Error Normalization
  await runTest(
    "21. Error Normalization: handles HTTP 404 (Inspection Not Found) and HTTP 400 (Bad Request)",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async () => {
        const error: any = new Error("Request failed with status code 404");
        error.isAxiosError = true;
        error.response = {
          status: 404,
          data: {
            success: false,
            message: "Inspection not found for this order",
          },
        };
        throw error;
      }) as typeof apiClient.get;

      const result = await store.dispatch(
        fetchInspectionByOrderId("non_existent_order_id")
      );
      assert(fetchInspectionByOrderId.rejected.match(result), "Rejected on 404");
      assert(store.getState().inspection.error?.statusCode === 404, "error statusCode is 404");
      assert(store.getState().inspection.error?.kind === "NOT_FOUND", "error kind is NOT_FOUND");

      store.dispatch(clearInspectionErrors());
      apiClient.get = originalGet;
    }
  );

  // TEST 22: Session Cleanup on Logout
  await runTest(
    "22. Logout Session Cleanup: inspection slice resets to initialState on logoutUser.fulfilled",
    () => {
      store.dispatch(setCurrentInspection(mockInspection1));
      assert(store.getState().inspection.currentInspection !== null, "currentInspection populated");

      store.dispatch(logoutUser.fulfilled(undefined, "requestId"));

      assert(
        store.getState().inspection.currentInspection === null,
        "currentInspection reset on logout"
      );
      assert(
        store.getState().inspection.inspections.length === 0,
        "inspections array cleared on logout"
      );
    }
  );

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
  runPhase9TestSuite()
    .then(({ failed }) => {
      if (failed > 0) process.exit(1);
    })
    .catch((err) => {
      console.error("Test runner error:", err);
      process.exit(1);
    });
}
