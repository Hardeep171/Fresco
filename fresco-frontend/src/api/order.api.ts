import { apiClient } from "./client";
import {
  Order,
  CreateOrderInput,
  OrderFilters,
} from "../types/order.types";
import { ApiResponse } from "../types/api.types";

/**
 * Order API service strictly conforming to FRESCO backend Order endpoints.
 */
export const orderApi = {
  /**
   * Create a new order for the authenticated user from their active cart.
   * Backend endpoint: POST /api/v1/orders
   */
  async createOrder(data: CreateOrderInput): Promise<Order> {
    const response = await apiClient.post<ApiResponse<{ order: Order }>>(
      "/orders",
      data
    );
    return response.data.data.order;
  },

  /**
   * Retrieve all orders belonging to the authenticated user.
   * Backend endpoint: GET /api/v1/orders
   */
  async getUserOrders(filters?: OrderFilters): Promise<Order[]> {
    const response = await apiClient.get<ApiResponse<{ orders: Order[] }>>(
      "/orders",
      { params: filters }
    );
    return response.data.data.orders;
  },

  /**
   * Retrieve a single order by ID.
   * Backend endpoint: GET /api/v1/orders/:id
   */
  async getOrderById(id: string): Promise<Order> {
    const response = await apiClient.get<ApiResponse<{ order: Order }>>(
      `/orders/${id}`
    );
    return response.data.data.order;
  },

  /**
   * Cancel an order by ID for the authenticated user.
   * Backend endpoint: PATCH /api/v1/orders/:id/cancel
   */
  async cancelOrder(id: string): Promise<Order> {
    const response = await apiClient.patch<ApiResponse<{ order: Order }>>(
      `/orders/${id}/cancel`
    );
    return response.data.data.order;
  },
};
