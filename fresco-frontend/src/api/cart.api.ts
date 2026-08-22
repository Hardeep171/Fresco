import { apiClient } from "./client";
import {
  Cart,
  AddCartItemInput,
  UpdateCartItemInput,
} from "../types/cart.types";
import { ApiResponse } from "../types/api.types";

/**
 * Cart API service strictly conforming to FRESCO backend Cart endpoints.
 */
export const cartApi = {
  /**
   * Retrieve the authenticated user's active cart.
   * Backend endpoint: GET /api/v1/cart
   */
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<ApiResponse<{ cart: Cart }>>("/cart");
    return response.data.data.cart;
  },

  /**
   * Add an item to the authenticated user's cart.
   * Backend endpoint: POST /api/v1/cart
   */
  async addItem(data: AddCartItemInput): Promise<Cart> {
    const response = await apiClient.post<ApiResponse<{ cart: Cart }>>(
      "/cart",
      data
    );
    return response.data.data.cart;
  },

  /**
   * Update quantity of a specific item in the authenticated user's cart.
   * Backend endpoint: PATCH /api/v1/cart/items/:id
   */
  async updateItemQuantity(
    cartItemId: string,
    quantity: number
  ): Promise<Cart> {
    const payload: UpdateCartItemInput = { quantity };
    const response = await apiClient.patch<ApiResponse<{ cart: Cart }>>(
      `/cart/items/${cartItemId}`,
      payload
    );
    return response.data.data.cart;
  },

  /**
   * Remove a specific item from the authenticated user's cart.
   * Backend endpoint: DELETE /api/v1/cart/items/:id
   */
  async removeItem(cartItemId: string): Promise<Cart> {
    const response = await apiClient.delete<ApiResponse<{ cart: Cart }>>(
      `/cart/items/${cartItemId}`
    );
    return response.data.data.cart;
  },

  /**
   * Clear all items from the authenticated user's cart.
   * Backend endpoint: DELETE /api/v1/cart
   */
  async clearCart(): Promise<Cart> {
    const response = await apiClient.delete<ApiResponse<{ cart: Cart }>>(
      "/cart"
    );
    return response.data.data.cart;
  },
};
