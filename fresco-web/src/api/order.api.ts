import { apiClient } from "./client";
import {
  Order,
  CreateOrderInput,
  OrderFilters,
} from "../types/order.types";
import { ApiResponse } from "../types/api.types";

export const orderApi = {
  async createOrder(data: CreateOrderInput): Promise<Order> {
    const response = await apiClient.post<ApiResponse<{ order: Order }>>(
      "/orders",
      data
    );
    return response.data.data.order;
  },

  async getUserOrders(filters?: OrderFilters): Promise<Order[]> {
    const response = await apiClient.get<ApiResponse<{ orders: Order[] }>>(
      "/orders",
      { params: filters }
    );
    return response.data.data.orders;
  },

  async getAllOrders(filters?: OrderFilters): Promise<Order[]> {
    const response = await apiClient.get<ApiResponse<{ orders: Order[] }>>(
      "/orders/all",
      { params: filters }
    );
    return response.data.data.orders;
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await apiClient.get<ApiResponse<{ order: Order }>>(
      `/orders/${id}`
    );
    return response.data.data.order;
  },

  async cancelOrder(id: string): Promise<Order> {
    const response = await apiClient.patch<ApiResponse<{ order: Order }>>(
      `/orders/${id}/cancel`
    );
    return response.data.data.order;
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const response = await apiClient.patch<ApiResponse<{ order: Order }>>(
      `/orders/${id}/status`,
      { status }
    );
    return response.data.data.order;
  },

  async updatePaymentStatus(id: string, paymentStatus: string): Promise<Order> {
    const response = await apiClient.patch<ApiResponse<{ order: Order }>>(
      `/orders/${id}/payment-status`,
      { paymentStatus }
    );
    return response.data.data.order;
  },
};
