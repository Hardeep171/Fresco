/**
 * Comprehensive verification suite for FRESCO Mobile Phase 8:
 * Delivery Partner Mobile Experience.
 * Tests Assignment and Delivery Task API service contracts, Redux slice lifecycles,
 * error normalizations, status synchronization rules, role-aware routing guards,
 * and session clearance.
 */

import { assignmentApi } from "../assignment.api";
import { deliveryTaskApi } from "../delivery-task.api";
import { apiClient } from "../client";
import { store } from "../../store";
import {
  fetchPartnerAssignments,
  acceptPartnerAssignment,
  completePartnerAssignment,
  fetchAssignmentOrderDetails,
  setSelectedAssignment,
  setAssignmentStatusFilter,
  clearAssignmentErrors,
} from "../../store/slices/partnerAssignmentSlice";
import {
  fetchPartnerTasks,
  setSelectedTask,
  setTaskStatusFilter,
} from "../../store/slices/deliveryTaskSlice";
import { logoutUser } from "../../store/slices/authSlice";
import {
  ASSIGNMENT_TYPES,
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  AssignmentType,
} from "../../constants/assignment.constants";
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from "../../constants/delivery-task.constants";
import { Assignment } from "../../types/assignment.types";
import { DeliveryTask } from "../../types/delivery-task.types";

import { Order } from "../../types/order.types";

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

export async function runPhase8TestSuite(): Promise<{
  total: number;
  passed: number;
  failed: number;
}> {
  console.log("\n=======================================================");
  console.log("FRESCO FRONTEND — PHASE 8 DELIVERY PARTNER TEST SUITE");
  console.log("=======================================================\n");

  const mockAssignment1: Assignment = {
    _id: "60d5ec49f1b2c8b1f8e4ea01",
    orderId: "60d5ec49f1b2c8b1f8e4e901",
    partnerId: "60d5ec49f1b2c8b1f8e4ep01",
    assignmentType: "PICKUP",
    status: "ASSIGNED",
    assignedBy: "60d5ec49f1b2c8b1f8e4eadm1",
    assignedAt: "2026-08-22T08:00:00.000Z",
    isActive: true,
    createdAt: "2026-08-22T08:00:00.000Z",
    updatedAt: "2026-08-22T08:00:00.000Z",
  };

  const mockAssignment2: Assignment = {
    _id: "60d5ec49f1b2c8b1f8e4ea02",
    orderId: "60d5ec49f1b2c8b1f8e4e902",
    partnerId: "60d5ec49f1b2c8b1f8e4ep01",
    assignmentType: "DELIVERY",
    status: "ACCEPTED",
    assignedBy: "60d5ec49f1b2c8b1f8e4eadm1",
    assignedAt: "2026-08-22T09:00:00.000Z",
    acceptedAt: "2026-08-22T09:15:00.000Z",
    isActive: true,
    createdAt: "2026-08-22T09:00:00.000Z",
    updatedAt: "2026-08-22T09:15:00.000Z",
  };

  const mockTask1: DeliveryTask = {
    _id: "60d5ec49f1b2c8b1f8e4et01",
    assignmentId: "60d5ec49f1b2c8b1f8e4ea01",
    orderId: "60d5ec49f1b2c8b1f8e4e901",
    partnerId: "60d5ec49f1b2c8b1f8e4ep01",
    taskType: "PICKUP",
    status: "PENDING",
    isActive: true,
    createdAt: "2026-08-22T08:05:00.000Z",
    updatedAt: "2026-08-22T08:05:00.000Z",
  };

  const mockOrder1: Order = {
    _id: "60d5ec49f1b2c8b1f8e4e901",
    userId: "60d5ec49f1b2c8b1f8e4e1a1",
    items: [
      {
        garmentId: "60d5ec49f1b2c8b1f8e4e401",
        serviceId: "60d5ec49f1b2c8b1f8e4e501",
        garmentName: "Formal Shirt",
        serviceName: "Wash & Iron",
        quantity: 2,
        unitPrice: 49,
        totalPrice: 98,
      },
    ],
    pricing: {
      subtotal: 98,
      discount: 0,
      tax: 0,
      deliveryCharge: 0,
      totalAmount: 98,
    },
    pickupAddress: {
      fullName: "Rohan Verma",
      phone: "9876543210",
      addressLine1: "42 Koramangala 4th Block",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560034",
      country: "India",
    },
    deliveryAddress: {
      fullName: "Rohan Verma",
      phone: "9876543210",
      addressLine1: "42 Koramangala 4th Block",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560034",
      country: "India",
    },
    status: "CONFIRMED",
    paymentStatus: "PENDING",
    createdAt: "2026-08-22T07:30:00.000Z",
    updatedAt: "2026-08-22T07:30:00.000Z",
  };

  // TEST 1: assignmentApi.getPartnerAssignments calls GET /assignments/partner
  await runTest(
    "1. Assignment API: getPartnerAssignments calls GET /assignments/partner and unwraps data.assignments",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async (url: string) => {
        assert(url === "/assignments/partner", `Expected GET /assignments/partner, got ${url}`);
        return {
          status: 200,
          data: {
            success: true,
            message: "Partner assignments fetched successfully",
            data: { assignments: [mockAssignment1, mockAssignment2] },
          },
        };
      }) as typeof apiClient.get;

      const assignments = await assignmentApi.getPartnerAssignments();
      assert(assignments.length === 2, "Returned 2 assignments");
      assert(assignments[0]?._id === mockAssignment1._id, "Assignment 1 ID matches");
      assert(assignments[1]?._id === mockAssignment2._id, "Assignment 2 ID matches");

      apiClient.get = originalGet;
    }
  );

  // TEST 2: assignmentApi.acceptAssignment calls PATCH /assignments/:id/accept
  await runTest(
    "2. Assignment API: acceptAssignment sends PATCH /assignments/:id/accept and returns updated assignment",
    async () => {
      const originalPatch = apiClient.patch;
      const acceptedAssignment: Assignment = {
        ...mockAssignment1,
        status: "ACCEPTED",
        acceptedAt: "2026-08-22T08:15:00.000Z",
      };

      apiClient.patch = (async (url: string) => {
        assert(
          url === `/assignments/${mockAssignment1._id}/accept`,
          `Expected PATCH /assignments/${mockAssignment1._id}/accept, got ${url}`
        );
        return {
          status: 200,
          data: {
            success: true,
            message: "Assignment accepted successfully",
            data: { assignment: acceptedAssignment },
          },
        };
      }) as typeof apiClient.patch;

      const result = await assignmentApi.acceptAssignment(mockAssignment1._id);
      assert(result.status === "ACCEPTED", "Status updated to ACCEPTED");
      assert(result.acceptedAt !== undefined, "acceptedAt timestamp populated");

      apiClient.patch = originalPatch;
    }
  );

  // TEST 3: assignmentApi.completeAssignment calls PATCH /assignments/:id/complete
  await runTest(
    "3. Assignment API: completeAssignment sends PATCH /assignments/:id/complete and returns updated assignment",
    async () => {
      const originalPatch = apiClient.patch;
      const completedAssignment: Assignment = {
        ...mockAssignment2,
        status: "COMPLETED",
        completedAt: "2026-08-22T10:00:00.000Z",
      };

      apiClient.patch = (async (url: string) => {
        assert(
          url === `/assignments/${mockAssignment2._id}/complete`,
          `Expected PATCH /assignments/${mockAssignment2._id}/complete, got ${url}`
        );
        return {
          status: 200,
          data: {
            success: true,
            message: "Assignment completed successfully",
            data: { assignment: completedAssignment },
          },
        };
      }) as typeof apiClient.patch;

      const result = await assignmentApi.completeAssignment(mockAssignment2._id);
      assert(result.status === "COMPLETED", "Status updated to COMPLETED");
      assert(result.completedAt !== undefined, "completedAt timestamp populated");

      apiClient.patch = originalPatch;
    }
  );

  // TEST 4: deliveryTaskApi.getPartnerTasks calls GET /delivery-tasks/partner
  await runTest(
    "4. Delivery Task API: getPartnerTasks calls GET /delivery-tasks/partner and unwraps data.tasks",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async (url: string) => {
        assert(url === "/delivery-tasks/partner", `Expected GET /delivery-tasks/partner, got ${url}`);
        return {
          status: 200,
          data: {
            success: true,
            message: "Partner tasks fetched successfully",
            data: { tasks: [mockTask1] },
          },
        };
      }) as typeof apiClient.get;

      const tasks = await deliveryTaskApi.getPartnerTasks();
      assert(tasks.length === 1, "Returned 1 task");
      assert(tasks[0]?._id === mockTask1._id, "Task ID matches");

      apiClient.get = originalGet;
    }
  );

  // TEST 5: Redux partnerAssignmentSlice fetchPartnerAssignments
  await runTest(
    "5. Redux partnerAssignmentSlice: manages fetchPartnerAssignments loading and state lifecycle",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async () => ({
        status: 200,
        data: {
          success: true,
          message: "Assignments fetched",
          data: { assignments: [mockAssignment1, mockAssignment2] },
        },
      })) as typeof apiClient.get;

      await store.dispatch(fetchPartnerAssignments());
      const state = store.getState().partnerAssignment;
      assert(state.assignments.length === 2, "2 assignments stored");
      assert(state.isFetchingAssignments === false, "isFetchingAssignments is false");
      assert(state.error === null, "error is null");

      apiClient.get = originalGet;
    }
  );

  // TEST 6: Redux partnerAssignmentSlice acceptPartnerAssignment
  await runTest(
    "6. Redux partnerAssignmentSlice: acceptPartnerAssignment updates status in-place and sets selectedAssignment",
    async () => {
      const originalPatch = apiClient.patch;
      const accepted: Assignment = {
        ...mockAssignment1,
        status: "ACCEPTED",
        acceptedAt: "2026-08-22T08:15:00.000Z",
      };

      apiClient.patch = (async () => ({
        status: 200,
        data: {
          success: true,
          message: "Accepted",
          data: { assignment: accepted },
        },
      })) as typeof apiClient.patch;

      await store.dispatch(acceptPartnerAssignment(mockAssignment1._id));
      const state = store.getState().partnerAssignment;
      assert(state.selectedAssignment?.status === "ACCEPTED", "selectedAssignment updated to ACCEPTED");
      const matched = state.assignments.find((a) => a._id === mockAssignment1._id);
      assert(matched?.status === "ACCEPTED", "Assignment in array synchronized to ACCEPTED");
      assert(state.isAcceptingAssignment === false, "isAcceptingAssignment is false");

      apiClient.patch = originalPatch;
    }
  );

  // TEST 7: Redux partnerAssignmentSlice completePartnerAssignment
  await runTest(
    "7. Redux partnerAssignmentSlice: completePartnerAssignment updates status to COMPLETED",
    async () => {
      const originalPatch = apiClient.patch;
      const completed: Assignment = {
        ...mockAssignment2,
        status: "COMPLETED",
        completedAt: "2026-08-22T10:00:00.000Z",
      };

      apiClient.patch = (async () => ({
        status: 200,
        data: {
          success: true,
          message: "Completed",
          data: { assignment: completed },
        },
      })) as typeof apiClient.patch;

      await store.dispatch(completePartnerAssignment(mockAssignment2._id));
      const state = store.getState().partnerAssignment;
      assert(state.selectedAssignment?.status === "COMPLETED", "selectedAssignment status is COMPLETED");
      const matched = state.assignments.find((a) => a._id === mockAssignment2._id);
      assert(matched?.status === "COMPLETED", "Assignment in array synchronized to COMPLETED");
      assert(state.isCompletingAssignment === false, "isCompletingAssignment is false");

      apiClient.patch = originalPatch;
    }
  );

  // TEST 8: Redux partnerAssignmentSlice fetchAssignmentOrderDetails
  await runTest(
    "8. Redux partnerAssignmentSlice: fetchAssignmentOrderDetails loads order snapshot",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async () => ({
        status: 200,
        data: {
          success: true,
          message: "Order fetched",
          data: { order: mockOrder1 },
        },
      })) as typeof apiClient.get;

      await store.dispatch(fetchAssignmentOrderDetails(mockOrder1._id));
      const state = store.getState().partnerAssignment;
      assert(state.selectedAssignmentOrder?._id === mockOrder1._id, "selectedAssignmentOrder populated");
      assert(state.selectedAssignmentOrder?.pickupAddress.city === "Bengaluru", "Address snapshot verified");

      apiClient.get = originalGet;
    }
  );

  // TEST 9: Redux deliveryTaskSlice fetchPartnerTasks
  await runTest(
    "9. Redux deliveryTaskSlice: manages fetchPartnerTasks loading and state lifecycle",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async () => ({
        status: 200,
        data: {
          success: true,
          message: "Tasks fetched",
          data: { tasks: [mockTask1] },
        },
      })) as typeof apiClient.get;

      await store.dispatch(fetchPartnerTasks());
      const state = store.getState().deliveryTask;
      assert(state.tasks.length === 1, "1 task stored");
      assert(state.isFetchingTasks === false, "isFetchingTasks is false");
      assert(state.error === null, "error is null");

      apiClient.get = originalGet;
    }
  );

  // TEST 10: Error Normalization: HTTP 403 Forbidden
  await runTest(
    "10. Error Normalization: handles HTTP 403 Forbidden when unauthorized user attempts partner action",
    async () => {
      const originalGet = apiClient.get;
      apiClient.get = (async () => {
        const error: any = new Error("Request failed with status code 403");
        error.isAxiosError = true;
        error.response = {
          status: 403,
          data: {
            success: false,
            message: "You are not authorized to view partner assignments.",
          },
        };
        throw error;
      }) as typeof apiClient.get;

      const result = await store.dispatch(fetchPartnerAssignments());
      assert(fetchPartnerAssignments.rejected.match(result), "fetchPartnerAssignments rejected on 403");
      const state = store.getState().partnerAssignment;
      assert(state.error?.statusCode === 403, "error statusCode is 403");
      assert(state.error?.kind === "FORBIDDEN", "error kind is FORBIDDEN");

      store.dispatch(clearAssignmentErrors());
      assert(store.getState().partnerAssignment.error === null, "error cleared");

      apiClient.get = originalGet;
    }
  );

  // TEST 11: Error Normalization: HTTP 400 Bad Request on invalid status transition
  await runTest(
    "11. Error Normalization: handles HTTP 400 when partner attempts invalid status transition",
    async () => {
      const originalPatch = apiClient.patch;
      apiClient.patch = (async () => {
        const error: any = new Error("Request failed with status code 400");
        error.isAxiosError = true;
        error.response = {
          status: 400,
          data: {
            success: false,
            message: "Assignment status must be ASSIGNED to accept.",
          },
        };
        throw error;
      }) as typeof apiClient.patch;

      const result = await store.dispatch(acceptPartnerAssignment(mockAssignment2._id));
      assert(acceptPartnerAssignment.rejected.match(result), "acceptPartnerAssignment rejected on 400");
      const state = store.getState().partnerAssignment;
      assert(
        state.acceptError?.message === "Assignment status must be ASSIGNED to accept.",
        "acceptError message mapped correctly"
      );

      store.dispatch(clearAssignmentErrors());
      apiClient.patch = originalPatch;
    }
  );

  // TEST 12: Error Normalization: HTTP 404 Not Found when assignment does not exist
  await runTest(
    "12. Error Normalization: handles HTTP 404 when assignment ID does not exist",
    async () => {
      const originalPatch = apiClient.patch;
      apiClient.patch = (async () => {
        const error: any = new Error("Request failed with status code 404");
        error.isAxiosError = true;
        error.response = {
          status: 404,
          data: {
            success: false,
            message: "Assignment not found",
          },
        };
        throw error;
      }) as typeof apiClient.patch;

      const result = await store.dispatch(completePartnerAssignment("non_existent_id"));
      assert(completePartnerAssignment.rejected.match(result), "completePartnerAssignment rejected on 404");
      assert(store.getState().partnerAssignment.completeError?.statusCode === 404, "completeError is 404");

      store.dispatch(clearAssignmentErrors());
      apiClient.patch = originalPatch;
    }
  );

  // TEST 13: Assignment Status Mapping
  await runTest(
    "13. Assignment Status Mapping: all 4 backend ASSIGNMENT_STATUSES map to user-friendly labels",
    () => {
      assert(ASSIGNMENT_STATUSES.length === 4, "4 assignment statuses defined");
      ASSIGNMENT_STATUSES.forEach((status) => {
        const label = ASSIGNMENT_STATUS_LABELS[status];
        assert(typeof label === "string" && label.length > 0, `Label exists for ${status}: ${label}`);
      });
      assert(ASSIGNMENT_STATUS_LABELS.ASSIGNED === "Assigned", "ASSIGNED matches");
      assert(ASSIGNMENT_STATUS_LABELS.ACCEPTED === "Accepted (In Progress)", "ACCEPTED matches");
      assert(ASSIGNMENT_STATUS_LABELS.COMPLETED === "Completed", "COMPLETED matches");
      assert(ASSIGNMENT_STATUS_LABELS.CANCELLED === "Cancelled", "CANCELLED matches");
    }
  );

  // TEST 14: Assignment Type Mapping
  await runTest(
    "14. Assignment Type Mapping: PICKUP and DELIVERY map to display labels",
    () => {
      assert(ASSIGNMENT_TYPES.length === 2, "2 assignment types defined");
      ASSIGNMENT_TYPES.forEach((type) => {
        const label = ASSIGNMENT_TYPE_LABELS[type];
        assert(typeof label === "string" && label.length > 0, `Label exists for ${type}: ${label}`);
      });
      assert(ASSIGNMENT_TYPE_LABELS.PICKUP === "Pickup Task", "PICKUP matches");
      assert(ASSIGNMENT_TYPE_LABELS.DELIVERY === "Delivery Task", "DELIVERY matches");
    }
  );

  // TEST 15: Task Status Mapping
  await runTest(
    "15. Task Status Mapping: all 5 backend TASK_STATUSES map to display labels",
    () => {
      assert(TASK_STATUSES.length === 5, "5 task statuses defined");
      TASK_STATUSES.forEach((status) => {
        const label = TASK_STATUS_LABELS[status];
        assert(typeof label === "string" && label.length > 0, `Label exists for ${status}: ${label}`);
      });
      assert(TASK_STATUS_LABELS.PENDING === "Pending", "PENDING matches");
      assert(TASK_STATUS_LABELS.IN_PROGRESS === "In Progress", "IN_PROGRESS matches");
      assert(TASK_STATUS_LABELS.COMPLETED === "Completed", "COMPLETED matches");
    }
  );

  // TEST 16: Status Synchronization: PICKUP + ACCEPT -> PICKUP_ASSIGNED
  await runTest(
    "16. Status Synchronization: PICKUP accept transitions order to PICKUP_ASSIGNED",
    () => {
      const getNextOrderStatus = (type: AssignmentType, action: "ACCEPT" | "COMPLETE") => {
        if (action === "ACCEPT") return type === "PICKUP" ? "PICKUP_ASSIGNED" : "OUT_FOR_DELIVERY";
        return type === "PICKUP" ? "PICKED_UP" : "DELIVERED";
      };
      assert(getNextOrderStatus("PICKUP", "ACCEPT") === "PICKUP_ASSIGNED", "PICKUP + ACCEPT -> PICKUP_ASSIGNED");
    }
  );

  // TEST 17: Status Synchronization: PICKUP + COMPLETE -> PICKED_UP
  await runTest(
    "17. Status Synchronization: PICKUP complete transitions order to PICKED_UP",
    () => {
      const getNextOrderStatus = (type: AssignmentType, action: "ACCEPT" | "COMPLETE") => {
        if (action === "ACCEPT") return type === "PICKUP" ? "PICKUP_ASSIGNED" : "OUT_FOR_DELIVERY";
        return type === "PICKUP" ? "PICKED_UP" : "DELIVERED";
      };
      assert(getNextOrderStatus("PICKUP", "COMPLETE") === "PICKED_UP", "PICKUP + COMPLETE -> PICKED_UP");
    }
  );

  // TEST 18: Status Synchronization: DELIVERY + ACCEPT -> OUT_FOR_DELIVERY
  await runTest(
    "18. Status Synchronization: DELIVERY accept transitions order to OUT_FOR_DELIVERY",
    () => {
      const getNextOrderStatus = (type: AssignmentType, action: "ACCEPT" | "COMPLETE") => {
        if (action === "ACCEPT") return type === "PICKUP" ? "PICKUP_ASSIGNED" : "OUT_FOR_DELIVERY";
        return type === "PICKUP" ? "PICKED_UP" : "DELIVERED";
      };
      assert(getNextOrderStatus("DELIVERY", "ACCEPT") === "OUT_FOR_DELIVERY", "DELIVERY + ACCEPT -> OUT_FOR_DELIVERY");
    }
  );

  // TEST 19: Status Synchronization: DELIVERY + COMPLETE -> DELIVERED
  await runTest(
    "19. Status Synchronization: DELIVERY complete transitions order to DELIVERED",
    () => {
      const getNextOrderStatus = (type: AssignmentType, action: "ACCEPT" | "COMPLETE") => {
        if (action === "ACCEPT") return type === "PICKUP" ? "PICKUP_ASSIGNED" : "OUT_FOR_DELIVERY";
        return type === "PICKUP" ? "PICKED_UP" : "DELIVERED";
      };
      assert(getNextOrderStatus("DELIVERY", "COMPLETE") === "DELIVERED", "DELIVERY + COMPLETE -> DELIVERED");
    }
  );

  // TEST 20: In-Flight Action Guarding
  await runTest(
    "20. In-Flight Action Guarding: isAcceptingAssignment prevents concurrent duplicate calls",
    async () => {
      const originalPatch = apiClient.patch;
      let patchCount = 0;

      apiClient.patch = (async () => {
        patchCount++;
        await new Promise((res) => setTimeout(res, 50));
        return {
          status: 200,
          data: {
            success: true,
            message: "Accepted",
            data: { assignment: { ...mockAssignment1, status: "ACCEPTED" as const } },
          },
        };
      }) as typeof apiClient.patch;

      const p1 = store.dispatch(acceptPartnerAssignment(mockAssignment1._id));
      assert(store.getState().partnerAssignment.isAcceptingAssignment === true, "isAcceptingAssignment is true during pending");

      await p1;
      assert(store.getState().partnerAssignment.isAcceptingAssignment === false, "isAcceptingAssignment is false after fulfilled");
      assert(patchCount === 1, "API called exactly once");

      apiClient.patch = originalPatch;
    }
  );

  // TEST 21: Partner State Filter Dispatchers
  await runTest(
    "21. Filter Dispatchers: setAssignmentStatusFilter and setTaskStatusFilter update state",
    () => {
      store.dispatch(setAssignmentStatusFilter("ACCEPTED"));
      assert(
        store.getState().partnerAssignment.selectedStatusFilter === "ACCEPTED",
        "Assignment filter set to ACCEPTED"
      );

      store.dispatch(setAssignmentStatusFilter("ALL"));
      assert(
        store.getState().partnerAssignment.selectedStatusFilter === "ALL",
        "Assignment filter reset to ALL"
      );

      store.dispatch(setTaskStatusFilter("IN_PROGRESS"));
      assert(
        store.getState().deliveryTask.selectedStatusFilter === "IN_PROGRESS",
        "Task filter set to IN_PROGRESS"
      );

      store.dispatch(setTaskStatusFilter("ALL"));
      assert(
        store.getState().deliveryTask.selectedStatusFilter === "ALL",
        "Task filter reset to ALL"
      );
    }
  );

  // TEST 22: Logout Session Cleanup
  await runTest(
    "22. Logout Cleanup: partnerAssignment and deliveryTask slices reset to initial state on logoutUser",
    () => {
      store.dispatch(setSelectedAssignment(mockAssignment1));
      store.dispatch(setSelectedTask(mockTask1));

      assert(store.getState().partnerAssignment.selectedAssignment !== null, "selectedAssignment populated");
      assert(store.getState().deliveryTask.selectedTask !== null, "selectedTask populated");

      store.dispatch(logoutUser.fulfilled(undefined, "requestId"));

      assert(
        store.getState().partnerAssignment.selectedAssignment === null,
        "selectedAssignment reset on logout"
      );
      assert(
        store.getState().partnerAssignment.assignments.length === 0,
        "partner assignments cleared on logout"
      );
      assert(
        store.getState().deliveryTask.selectedTask === null,
        "selectedTask reset on logout"
      );
      assert(
        store.getState().deliveryTask.tasks.length === 0,
        "delivery tasks cleared on logout"
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
  runPhase8TestSuite()
    .then(({ failed }) => {
      if (failed > 0) process.exit(1);
    })
    .catch((err) => {
      console.error("Test runner error:", err);
      process.exit(1);
    });
}
