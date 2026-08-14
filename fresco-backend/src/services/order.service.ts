import { StatusCodes } from "http-status-codes";
import { type QueryFilter as FilterQuery, Types } from "mongoose";

import {
  DEFAULT_ORDER_DELIVERY_CHARGE,
  DEFAULT_ORDER_DISCOUNT,
  DEFAULT_ORDER_STATUS,
  DEFAULT_ORDER_TAX,
  DEFAULT_PAYMENT_STATUS,
  type OrderStatus,
  type PaymentStatus,
} from "../constants/order.constants.js";
import { ADMIN_ROLES, type UserRole } from "../constants/user.constants.js";
import { type Order } from "../models/order.model.js";
import { assignmentRepository } from "../repositories/assignment.repository.js";
import { cartRepository } from "../repositories/cart.repository.js";
import { garmentRepository } from "../repositories/garment.repository.js";
import { orderRepository } from "../repositories/order.repository.js";
import { pricingRepository } from "../repositories/pricing.repository.js";
import { serviceRepository } from "../repositories/service.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/api-error.js";
import type { CreateOrderInput } from "../validators/order.validator.js";

/** Filter options for querying orders. */
export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  userId?: string;
}

/** Allowed status transitions graph for an order. */
const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PICKUP_ASSIGNED", "CANCELLED"],
  PICKUP_ASSIGNED: ["PICKED_UP"],
  PICKED_UP: ["UNDER_INSPECTION"],
  UNDER_INSPECTION: ["IN_PROCESS"],
  IN_PROCESS: ["READY_FOR_DELIVERY"],
  READY_FOR_DELIVERY: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

/**
 * Helper to ensure an order exists by ID, throwing 404 if not found.
 *
 * @param orderId - Order ID to verify.
 * @returns Promise resolving to the order plain object.
 * @throws {ApiError} 404 Not Found if order does not exist.
 */
async function ensureOrderExists(orderId: string) {
  const order = await orderRepository.findOrderById(orderId);

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }

  return order;
}

/**
 * Helper to ensure a user exists by ID and is active.
 *
 * @param userId - User ID to verify.
 * @returns Promise resolving to the user plain object.
 * @throws {ApiError} 404 Not Found if user does not exist.
 * @throws {ApiError} 400 Bad Request if user account is inactive.
 */
async function ensureActiveUser(userId: string) {
  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User account is inactive");
  }

  return user;
}

/**
 * Helper to ensure a cart exists for a user and contains at least one item.
 *
 * @param userId - User ID to check cart for.
 * @returns Promise resolving to the cart plain object.
 * @throws {ApiError} 404 Not Found if cart does not exist.
 * @throws {ApiError} 400 Bad Request if cart contains no items.
 */
async function ensureCartExists(userId: string) {
  const cart = await cartRepository.findCartByUser(userId);

  if (!cart) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Cart not found");
  }

  if (!cart.items || cart.items.length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Cart is empty. Cannot create an order without items.",
    );
  }

  return cart;
}

/**
 * Helper to validate order status transitions.
 *
 * @param currentStatus - Current status of the order.
 * @param nextStatus - Desired next status of the order.
 * @returns True if transition is valid.
 * @throws {ApiError} 400 Bad Request if status transition is forbidden.
 */
function validateOrderStatusTransition(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
) {
  if (currentStatus === nextStatus) {
    return true;
  }

  const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

  if (!allowedNextStatuses.includes(nextStatus)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Cannot transition order status from '${currentStatus}' to '${nextStatus}'.`,
    );
  }

  return true;
}

/**
 * Internal helper to execute an order status transition after validating state lifecycle rules.
 *
 * @param orderId - Order ID to transition.
 * @param nextStatus - Target OrderStatus value.
 * @returns Promise resolving to the updated order plain object.
 * @throws {ApiError} 404 Not Found if order does not exist.
 * @throws {ApiError} 400 Bad Request if status transition is invalid.
 */
async function transitionOrderStatus(
  orderId: string,
  nextStatus: OrderStatus,
) {
  const existingOrder = await ensureOrderExists(orderId);

  validateOrderStatusTransition(
    existingOrder.status as OrderStatus,
    nextStatus,
  );

  const updatedOrder = await orderRepository.updateOrder(orderId, {
    status: nextStatus,
  });

  if (!updatedOrder) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }

  return updatedOrder;
}

/** Service providing business logic for Order module. */
export const orderService = {
  /**
   * Creates a new customer order from the active user's cart snapshot.
   * Resolves and verifies active garment, service, and pricing entities from repositories without fallback placeholders.
   * Copies item details, verified server prices, address snapshots, and clears the user's cart upon success.
   *
   * @param userId - Authenticated user ID creating the order.
   * @param data - Validated order creation input properties.
   * @returns Promise resolving to the created order plain object.
   * @throws {ApiError} 404 Not Found if user, cart, garment, service, or pricing does not exist.
   * @throws {ApiError} 400 Bad Request if user, cart, garment, service, or pricing is inactive/empty.
   */
  async createOrder(userId: string, data: CreateOrderInput) {
    // 1. Verify user exists and is active
    await ensureActiveUser(userId);

    // 2. Verify cart exists and contains at least one item
    const cart = await ensureCartExists(userId);

    // 3. Build item snapshots from cart, strictly verifying active entities
    const orderItems = await Promise.all(
      cart.items.map(async (item: any) => {
        const garmentIdStr = item.garmentId.toString();
        const serviceIdStr = item.serviceId.toString();

        const garment = await garmentRepository.findGarmentById(garmentIdStr);
        if (!garment) {
          throw new ApiError(
            StatusCodes.NOT_FOUND,
            `Garment with ID '${garmentIdStr}' not found`,
          );
        }
        if (!garment.isActive) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `Garment '${garment.name}' is inactive`,
          );
        }

        const service = await serviceRepository.findServiceById(serviceIdStr);
        if (!service) {
          throw new ApiError(
            StatusCodes.NOT_FOUND,
            `Service with ID '${serviceIdStr}' not found`,
          );
        }
        if (!service.isActive) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `Service '${service.name}' is inactive`,
          );
        }

        const pricing = await pricingRepository.findPricingByGarmentAndService(
          garmentIdStr,
          serviceIdStr,
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
        const quantity = Number(item.quantity);
        const totalPrice = quantity * unitPrice;

        return {
          garmentId: new Types.ObjectId(garmentIdStr),
          serviceId: new Types.ObjectId(serviceIdStr),
          garmentName: garment.name,
          serviceName: service.name,
          quantity,
          unitPrice,
          totalPrice,
        };
      }),
    );

    // 4. Calculate subtotal & pricing snapshot
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = DEFAULT_ORDER_DISCOUNT;
    const tax = DEFAULT_ORDER_TAX;
    const deliveryCharge = DEFAULT_ORDER_DELIVERY_CHARGE;
    const totalAmount = Math.max(
      0,
      subtotal - discount + tax + deliveryCharge,
    );

    const pricingSnapshot = {
      subtotal,
      discount,
      tax,
      deliveryCharge,
      totalAmount,
    };

    // 5. Create order in repository
    const orderData = {
      userId: new Types.ObjectId(userId),
      items: orderItems,
      pricing: pricingSnapshot,
      pickupAddress: data.pickupAddress,
      deliveryAddress: data.deliveryAddress,
      status: DEFAULT_ORDER_STATUS,
      paymentStatus: DEFAULT_PAYMENT_STATUS,
      ...(data.pickupDate && { pickupDate: new Date(data.pickupDate) }),
      ...(data.deliveryDate && { deliveryDate: new Date(data.deliveryDate) }),
      ...(data.specialInstructions && {
        specialInstructions: data.specialInstructions,
      }),
    };

    const createdOrder = await orderRepository.createOrder(orderData);

    // 6. Automatically clear user's cart after successful order creation
    await cartRepository.updateCart(cart._id.toString(), {
      items: [],
      totalAmount: 0,
    });

    return createdOrder;
  },

  /**
   * Retrieves orders based on query filter criteria.
   *
   * @param filters - Optional order filter criteria.
   * @returns Promise resolving to an array of matching order plain objects.
   */
  async getOrders(filters: OrderFilters = {}) {
    const { status, paymentStatus, userId } = filters;

    const queryFilters: FilterQuery<Order> = {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
      ...(userId && { userId: new Types.ObjectId(userId) }),
    };

    return orderRepository.findOrders(queryFilters);
  },

  /**
   * Retrieves a single order by its unique identifier, validating user authorization if user context is provided.
   *
   * @param orderId - Order ID to retrieve.
   * @param user - Optional requesting user context containing userId and role.
   * @returns Promise resolving to the matching order plain object.
   * @throws {ApiError} 404 Not Found if order does not exist.
   * @throws {ApiError} 403 Forbidden if requesting user is not authorized to view this order.
   */
  async getOrderById(
    orderId: string,
    user?: { userId: string; role: string },
  ) {
    const order = await ensureOrderExists(orderId);

    if (user) {
      const role = user.role as UserRole;
      if (ADMIN_ROLES.includes(role)) {
        return order;
      }

      if (role === "CUSTOMER") {
        if (String(order.userId) !== user.userId) {
          throw new ApiError(
            StatusCodes.FORBIDDEN,
            "You are not authorized to view this order",
          );
        }
        return order;
      }

      if (role === "DELIVERY_PARTNER") {
        const assignments = await assignmentRepository.findAssignments({
          orderId: new Types.ObjectId(orderId),
          partnerId: new Types.ObjectId(user.userId),
          isActive: true,
        });

        if (!assignments || assignments.length === 0) {
          throw new ApiError(
            StatusCodes.FORBIDDEN,
            "You are not authorized to view this order",
          );
        }
        return order;
      }

      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "You are not authorized to view this order",
      );
    }

    return order;
  },

  /**
   * Retrieves all orders belonging to a specific user.
   *
   * @param userId - User ID to query orders for.
   * @returns Promise resolving to an array of user order plain objects.
   * @throws {ApiError} 404 Not Found if user does not exist.
   * @throws {ApiError} 400 Bad Request if user account is inactive.
   */
  async getUserOrders(userId: string) {
    await ensureActiveUser(userId);
    return orderRepository.findOrdersByUser(userId);
  },
  /**
   * Internal service method for executing order status transitions for system or module workflows.
   *
   * @param orderId - Order ID to transition.
   * @param nextStatus - Target OrderStatus value.
   * @returns Promise resolving to the updated order plain object.
   * @throws {ApiError} 404 Not Found if order does not exist.
   * @throws {ApiError} 400 Bad Request if status transition is invalid.
   */
  async transitionOrderStatus(orderId: string, nextStatus: OrderStatus) {
    return transitionOrderStatus(orderId, nextStatus);
  },

  /**
   * Updates an order's lifecycle status after validating allowed status transitions.
   *
   * @param orderId - Order ID to update.
   * @param status - Target OrderStatus value.
   * @returns Promise resolving to the updated order plain object.
   * @throws {ApiError} 404 Not Found if order does not exist.
   * @throws {ApiError} 400 Bad Request if status transition is invalid.
   */
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    return transitionOrderStatus(orderId, status);
  },

  /**
   * Updates an order's payment status.
   *
   * @param orderId - Order ID to update.
   * @param paymentStatus - Target PaymentStatus value.
   * @returns Promise resolving to the updated order plain object.
   * @throws {ApiError} 404 Not Found if order does not exist.
   */
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
  ) {
    await ensureOrderExists(orderId);

    const updatedOrder = await orderRepository.updateOrder(orderId, {
      paymentStatus,
    });

    if (!updatedOrder) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
    }

    return updatedOrder;
  },

  /**
   * Cancels an order for a user if allowed by status transition rules (e.g. PLACED or CONFIRMED).
   * Rejects cancellation once order reaches PICKUP_ASSIGNED or any later status.
   *
   * @param orderId - Order ID to cancel.
   * @param userId - ID of the user requesting cancellation.
   * @returns Promise resolving to the updated cancelled order plain object.
   * @throws {ApiError} 404 Not Found if order does not exist.
   * @throws {ApiError} 403 Forbidden if user does not own the order.
   * @throws {ApiError} 400 Bad Request if status transition to CANCELLED is forbidden.
   */
  async cancelOrder(orderId: string, userId: string) {
    const existingOrder = await ensureOrderExists(orderId);

    if (String(existingOrder.userId) !== userId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "You are not authorized to cancel this order",
      );
    }

    return transitionOrderStatus(orderId, "CANCELLED");
  },
};
