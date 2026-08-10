import { StatusCodes } from "http-status-codes";
import { type QueryFilter as FilterQuery, Types } from "mongoose";

import { type InspectionStatus } from "../constants/inspection.constants.js";
import { DEFAULT_ORDER_TAX } from "../constants/order.constants.js";
import type { UserRole } from "../constants/user.constants.js";
import type { Inspection } from "../models/inspection.model.js";
import { garmentRepository } from "../repositories/garment.repository.js";
import { inspectionRepository } from "../repositories/inspection.repository.js";
import { pricingRepository } from "../repositories/pricing.repository.js";
import { serviceRepository } from "../repositories/service.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/api-error.js";
import type {
  CreateInspectionInput,
  UpdateInspectionInput,
} from "../validators/inspection.validator.js";
import { orderService } from "./order.service.js";

/** Filter options for querying inspections. */
export interface InspectionFilters {
  orderId?: string;
  inspectorId?: string;
  status?: InspectionStatus;
  isActive?: boolean;
}

/** Administrative roles permitted to perform order inspections. */
const ALLOWED_INSPECTOR_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "CITY_MANAGER",
  "BRANCH_MANAGER",
];

/** Allowed status transitions graph for an inspection. */
export const ALLOWED_INSPECTION_STATUS_TRANSITIONS: Record<
  InspectionStatus,
  InspectionStatus[]
> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["APPROVED", "REJECTED"],
  APPROVED: [],
  REJECTED: [],
  CANCELLED: [],
};

/**
 * Helper to validate inspection status transitions.
 *
 * @param currentStatus - Current status of the inspection.
 * @param nextStatus - Desired next status of the inspection.
 * @returns True if transition is valid.
 * @throws {ApiError} 400 Bad Request if status transition is invalid.
 */
export function validateInspectionStatusTransition(
  currentStatus: InspectionStatus,
  nextStatus: InspectionStatus,
) {
  if (currentStatus === nextStatus) {
    return true;
  }

  const allowedNextStatuses =
    ALLOWED_INSPECTION_STATUS_TRANSITIONS[currentStatus] || [];

  if (!allowedNextStatuses.includes(nextStatus)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Invalid status transition from '${currentStatus}' to '${nextStatus}'.`,
    );
  }

  return true;
}

/**
 * Helper to ensure an inspection exists by ID, throwing 404 if not found.
 *
 * @param id - Inspection ID to verify.
 * @returns Promise resolving to the inspection plain object.
 * @throws {ApiError} 404 Not Found if inspection does not exist.
 */
export async function ensureInspectionExists(id: string) {
  const inspection = await inspectionRepository.findInspectionById(id);

  if (!inspection) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Inspection not found");
  }

  return inspection;
}

/**
 * Helper to ensure an order exists and is eligible for inspection.
 * Inspection creation is allowed ONLY when order status is PICKED_UP or UNDER_INSPECTION.
 *
 * @param orderId - Order ID to verify.
 * @returns Promise resolving to the order plain object.
 * @throws {ApiError} 404 Not Found if order does not exist.
 * @throws {ApiError} 400 Bad Request if order status is not PICKED_UP or UNDER_INSPECTION.
 */
export async function ensureOrderEligible(orderId: string) {
  const order = await orderService.getOrderById(orderId);

  const allowedStatuses = ["PICKED_UP", "UNDER_INSPECTION"];

  const orderStatus = String(order.status);
  if (!allowedStatuses.includes(orderStatus)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Order with status '${orderStatus}' is not eligible for inspection. Order must be in PICKED_UP or UNDER_INSPECTION status.`,
    );
  }

  return order;
}

/**
 * Helper to ensure a user exists, is active, and possesses an inspector role.
 *
 * @param userId - User ID to verify.
 * @returns Promise resolving to the user plain object.
 * @throws {ApiError} 404 Not Found if user does not exist.
 * @throws {ApiError} 400 Bad Request if user account is inactive.
 * @throws {ApiError} 403 Forbidden if user lacks inspector permissions.
 */
export async function ensureInspector(userId: string) {
  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User account is inactive");
  }

  if (!ALLOWED_INSPECTOR_ROLES.includes(user.role as UserRole)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "User does not have administrative permissions for inspection",
    );
  }

  return user;
}

/**
 * Helper to calculate final pricing summary deterministically server-side.
 *
 * @param order - Order plain object.
 * @param items - Processed inspection items with server-calculated unit/total prices.
 * @param extraServices - Processed extra services with server-calculated prices.
 * @param adjustmentAmount - Client-provided financial adjustment amount.
 * @param adjustmentReason - Client-provided financial adjustment reason.
 * @returns Formatted inspection pricing summary object.
 */
function calculateFinalPricing(
  order: any,
  items: Array<{ totalPrice: number }>,
  extraServices: Array<{ price: number }>,
  adjustmentAmount = 0,
  adjustmentReason?: string,
) {
  const initialTotal =
    order.pricing?.totalAmount ??
    (Array.isArray(order.items)
      ? order.items.reduce(
          (sum: number, item: any) => sum + (item.totalPrice || 0),
          0,
        )
      : 0);

  const inspectedSubtotal = items.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );

  const extraServiceCharges = extraServices.reduce(
    (sum, extra) => sum + extra.price,
    0,
  );

  const finalTax = DEFAULT_ORDER_TAX;

  const calculatedTotal =
    inspectedSubtotal + extraServiceCharges + adjustmentAmount + finalTax;

  const finalTotalAmount = Math.max(0, calculatedTotal);

  return {
    initialTotal,
    inspectedSubtotal,
    extraServiceCharges,
    adjustmentAmount,
    ...(adjustmentReason && { adjustmentReason }),
    finalTax,
    finalTotalAmount,
  };
}

/**
 * Helper to process inspection items, resolving garment, service, and pricing entities server-side.
 *
 * @param items - Array of raw item inputs.
 * @returns Promise resolving to array of server-verified inspection item snapshots.
 * @throws {ApiError} 404 Not Found if garment, service, or pricing does not exist.
 * @throws {ApiError} 400 Bad Request if garment, service, or pricing is inactive.
 */
async function processInspectionItems(
  items: CreateInspectionInput["items"],
) {
  return Promise.all(
    items.map(async (item) => {
      const garment = await garmentRepository.findGarmentById(item.garmentId);
      if (!garment) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `Garment with ID '${item.garmentId}' not found`,
        );
      }
      if (!garment.isActive) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Garment '${garment.name}' is inactive`,
        );
      }

      const service = await serviceRepository.findServiceById(item.serviceId);
      if (!service) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `Service with ID '${item.serviceId}' not found`,
        );
      }
      if (!service.isActive) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Service '${service.name}' is inactive`,
        );
      }

      const pricing = await pricingRepository.findPricingByGarmentAndService(
        item.garmentId,
        item.serviceId,
      );
      if (!pricing) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `Pricing for garment '${garment.name}' and service '${service.name}' not found`,
        );
      }
      if (!pricing.isActive) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Pricing for garment '${garment.name}' and service '${service.name}' is inactive`,
        );
      }

      const unitPrice = Number(pricing.price);
      const totalPrice = item.inspectedQuantity * unitPrice;

      return {
        garmentId: new Types.ObjectId(item.garmentId),
        serviceId: new Types.ObjectId(item.serviceId),
        garmentName: garment.name,
        serviceName: service.name,
        initialQuantity: item.initialQuantity,
        inspectedQuantity: item.inspectedQuantity,
        unitPrice,
        totalPrice,
        condition: item.condition,
        ...(item.damageNotes && { damageNotes: item.damageNotes }),
        ...(item.imageUrls && { imageUrls: item.imageUrls }),
      };
    }),
  );
}

/**
 * Helper to process extra services, resolving service and pricing entities server-side.
 *
 * @param extraServices - Array of raw extra service inputs.
 * @returns Promise resolving to array of server-verified extra service snapshots.
 * @throws {ApiError} 404 Not Found if service or pricing does not exist.
 * @throws {ApiError} 400 Bad Request if service or pricing is inactive.
 */
async function processExtraServices(
  extraServices?: Array<{ serviceId: string; quantity: number }>,
) {
  if (!extraServices || extraServices.length === 0) {
    return [];
  }

  return Promise.all(
    extraServices.map(async (extra) => {
      const service = await serviceRepository.findServiceById(extra.serviceId);
      if (!service) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `Service with ID '${extra.serviceId}' not found`,
        );
      }
      if (!service.isActive) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Service '${service.name}' is inactive`,
        );
      }

      const pricings = await pricingRepository.findPricing({
        serviceId: extra.serviceId,
      });

      if (!pricings || pricings.length === 0) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `Pricing for service '${service.name}' not found`,
        );
      }

      const activePricing = pricings.find((p) => p.isActive);
      if (!activePricing) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Pricing for service '${service.name}' is inactive`,
        );
      }

      const unitPrice = Number(activePricing.price);
      const charge = extra.quantity * unitPrice;

      return {
        serviceName: service.name,
        price: charge,
      };
    }),
  );
}

/** Service providing business logic for Inspection module. */
export const inspectionService = {
  /**
   * Creates a new inspection for an order after validating admin authorization, order eligibility, active inspection uniqueness, and server-side pricing.
   * If the order is currently in PICKED_UP status, transitions the order to UNDER_INSPECTION.
   *
   * @param adminId - ID of administrative user performing inspection.
   * @param data - Validated inspection creation input data.
   * @returns Promise resolving to created inspection plain object.
   * @throws {ApiError} 404 Not Found if admin, order, garment, service, or pricing does not exist.
   * @throws {ApiError} 400 Bad Request if user/order/garment/service/pricing is inactive or order is ineligible.
   * @throws {ApiError} 403 Forbidden if user lacks inspector role.
   * @throws {ApiError} 409 Conflict if active inspection already exists for order.
   */
  async createInspection(adminId: string, data: CreateInspectionInput) {
    // 1. Validate inspector/admin privileges
    await ensureInspector(adminId);

    // 2. Validate target order exists and is eligible for inspection (PICKED_UP or UNDER_INSPECTION)
    const order = await ensureOrderEligible(data.orderId);

    // 3. Check active inspection uniqueness for order
    const existingInspection =
      await inspectionRepository.findInspectionByOrder(data.orderId);

    if (existingInspection && existingInspection.isActive) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "An active inspection already exists for this order",
      );
    }

    // 4. Resolve items and calculate item snapshots server-side
    const processedItems = await processInspectionItems(data.items);

    // 5. Resolve extra services and calculate charges server-side
    const processedExtraServices = await processExtraServices(
      data.extraServices,
    );

    // 6. Calculate deterministic final pricing summary
    const pricingSummary = calculateFinalPricing(
      order,
      processedItems,
      processedExtraServices,
      data.adjustmentAmount ?? 0,
      data.adjustmentReason,
    );

    // 7. Transition order status from PICKED_UP to UNDER_INSPECTION if currently PICKED_UP
    // (Performed after item/service validation to prevent premature state mutation on failure)
    if (String(order.status) === "PICKED_UP") {
      await orderService.transitionOrderStatus(
        data.orderId,
        "UNDER_INSPECTION",
      );
    }

    // 8. Persist inspection document with status DRAFT
    const inspectionData = {
      orderId: new Types.ObjectId(data.orderId),
      inspectorId: new Types.ObjectId(adminId),
      status: "DRAFT" as const,
      items: processedItems,
      extraServices: processedExtraServices,
      pricingSummary,
      ...(data.notes && { notes: data.notes }),
      inspectedAt: new Date(),
      isActive: true,
    };

    return inspectionRepository.createInspection(inspectionData);
  },

  /**
   * Retrieves inspections matching filter options, defaulting to active inspections.
   *
   * @param filters - Inspection query filter options.
   * @returns Promise resolving to matching inspection plain objects.
   */
  async getInspections(filters: InspectionFilters = {}) {
    const { orderId, inspectorId, status, isActive = true } = filters;

    const queryFilters: FilterQuery<Inspection> = {
      ...(isActive !== undefined && { isActive }),
      ...(orderId !== undefined && { orderId: new Types.ObjectId(orderId) }),
      ...(inspectorId !== undefined && {
        inspectorId: new Types.ObjectId(inspectorId),
      }),
      ...(status !== undefined && { status }),
    };

    return inspectionRepository.findInspections(queryFilters);
  },

  /**
   * Retrieves a single inspection by its ID.
   *
   * @param id - Inspection ID to retrieve.
   * @returns Promise resolving to matching inspection plain object.
   * @throws {ApiError} 404 Not Found if inspection does not exist.
   */
  async getInspectionById(id: string) {
    return ensureInspectionExists(id);
  },

  /**
   * Retrieves inspection associated with a specific order ID after verifying order existence.
   *
   * @param orderId - Target order ID.
   * @returns Promise resolving to matching inspection plain object.
   * @throws {ApiError} 404 Not Found if order or inspection does not exist.
   */
  async getInspectionByOrderId(orderId: string) {
    await orderService.getOrderById(orderId);

    const inspection =
      await inspectionRepository.findInspectionByOrder(orderId);

    if (!inspection) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Inspection not found for this order",
      );
    }

    return inspection;
  },

  /**
   * Submits a DRAFT inspection, transitioning its status to SUBMITTED and triggering the order lifecycle transition from UNDER_INSPECTION to IN_PROCESS.
   *
   * @param inspectionId - Inspection ID to submit.
   * @param adminId - ID of administrative user submitting inspection.
   * @returns Promise resolving to updated inspection plain object.
   * @throws {ApiError} 404 Not Found if inspection or order does not exist.
   * @throws {ApiError} 400 Bad Request if inspection is inactive, status is not DRAFT, order is not UNDER_INSPECTION, or pricing summary is missing.
   * @throws {ApiError} 403 Forbidden if user lacks inspector role.
   */
  async submitInspection(inspectionId: string, adminId: string) {
    // 1. Validate inspector authorization
    await ensureInspector(adminId);

    // 2. Ensure inspection exists and is active
    const inspection = await ensureInspectionExists(inspectionId);

    if (!inspection.isActive) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Inspection is not active");
    }

    // 3. Ensure inspection status is DRAFT
    if (inspection.status !== "DRAFT") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Only DRAFT inspections can be submitted",
      );
    }

    // 4. Validate items presence
    if (!inspection.items || inspection.items.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Inspection must contain at least one item",
      );
    }

    // 5. Validate pricingSummary presence
    if (
      !inspection.pricingSummary ||
      inspection.pricingSummary.finalTotalAmount === undefined
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Inspection pricing summary has not been calculated",
      );
    }

    // 6. Ensure related Order is currently UNDER_INSPECTION before submission
    const orderIdStr = String(inspection.orderId);
    const order = await orderService.getOrderById(orderIdStr);

    if (String(order.status) !== "UNDER_INSPECTION") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Order must be in 'UNDER_INSPECTION' status to submit an inspection. Current order status is '${order.status}'.`,
      );
    }

    // 7. Validate inspection status transition graph (DRAFT -> SUBMITTED)
    validateInspectionStatusTransition(
      inspection.status as InspectionStatus,
      "SUBMITTED",
    );

    // 8. Update inspection status to SUBMITTED
    const updatedInspection = await inspectionRepository.updateInspection(
      inspectionId,
      {
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    );

    if (!updatedInspection) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Inspection not found");
    }

    // 9. Transition order lifecycle: UNDER_INSPECTION -> IN_PROCESS via orderService
    await orderService.transitionOrderStatus(orderIdStr, "IN_PROCESS");

    return updatedInspection;
  },

  /**
   * Updates a DRAFT inspection, recalculating all server-side pricing and snapshots.
   *
   * @param inspectionId - Inspection ID to update.
   * @param adminId - ID of administrative user updating inspection.
   * @param data - Validated inspection update input data.
   * @returns Promise resolving to updated inspection plain object.
   * @throws {ApiError} 404 Not Found if inspection, order, garment, service, or pricing does not exist.
   * @throws {ApiError} 400 Bad Request if inspection is inactive, status is not DRAFT, or entity is inactive.
   * @throws {ApiError} 403 Forbidden if user lacks inspector role.
   */
  async updateInspection(
    inspectionId: string,
    adminId: string,
    data: UpdateInspectionInput,
  ) {
    await ensureInspector(adminId);

    const inspection = await ensureInspectionExists(inspectionId);

    if (!inspection.isActive) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Inspection is not active");
    }

    if (inspection.status !== "DRAFT") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Only DRAFT inspections can be updated",
      );
    }

    const processedItems = data.items
      ? await processInspectionItems(data.items)
      : (inspection.items as any);

    const processedExtraServices =
      data.extraServices !== undefined
        ? await processExtraServices(data.extraServices)
        : (inspection.extraServices as any);

    const adjAmount: number =
      data.adjustmentAmount !== undefined
        ? data.adjustmentAmount
        : Number(inspection.pricingSummary?.adjustmentAmount ?? 0);

    const adjReason: string | undefined =
      typeof data.adjustmentReason === "string"
        ? data.adjustmentReason
        : typeof inspection.pricingSummary?.adjustmentReason === "string"
          ? inspection.pricingSummary.adjustmentReason
          : undefined;

    const order = await orderService.getOrderById(String(inspection.orderId));

    const pricingSummary = calculateFinalPricing(
      order,
      processedItems,
      processedExtraServices,
      adjAmount,
      adjReason,
    );

    const updatePayload: Partial<Inspection> = {
      items: processedItems,
      extraServices: processedExtraServices,
      pricingSummary,
      ...(data.notes !== undefined && { notes: data.notes }),
      inspectedAt: new Date(),
    };

    const updatedInspection = await inspectionRepository.updateInspection(
      inspectionId,
      updatePayload,
    );

    if (!updatedInspection) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Inspection not found");
    }

    return updatedInspection;
  },

  /**
   * Soft deletes an inspection by setting isActive to false.
   * Prevents disabling submitted or approved inspections.
   *
   * @param id - Inspection ID to disable.
   * @returns Promise resolving to updated disabled inspection plain object.
   * @throws {ApiError} 404 Not Found if inspection does not exist.
   * @throws {ApiError} 400 Bad Request if inspection status is SUBMITTED or APPROVED.
   */
  async disableInspection(id: string) {
    const inspection = await ensureInspectionExists(id);

    if (
      inspection.status === "SUBMITTED" ||
      inspection.status === "APPROVED"
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Cannot disable an inspection with status '${inspection.status}'`,
      );
    }

    const disabledInspection =
      await inspectionRepository.disableInspection(id);

    if (!disabledInspection) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Inspection not found");
    }

    return disabledInspection;
  },
};
