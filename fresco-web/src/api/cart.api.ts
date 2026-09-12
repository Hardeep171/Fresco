import { apiClient } from "./client";
import {
  Cart,
  AddCartItemInput,
  UpdateCartItemInput,
} from "../types/cart.types";
import { ApiResponse } from "../types/api.types";

export const cartApi = {
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<ApiResponse<{ cart: Cart }>>("/cart");
    return response.data.data.cart;
  },

  async addItem(data: AddCartItemInput): Promise<Cart> {
    const response = await apiClient.post<ApiResponse<{ cart: Cart }>>(
      "/cart",
      data
    );
    return response.data.data.cart;
  },

  async updateItemQuantity(
    cartItemId: string,
    quantityOrInput: number | UpdateCartItemInput
  ): Promise<Cart> {
    const payload: UpdateCartItemInput =
      typeof quantityOrInput === "number"
        ? { quantity: quantityOrInput }
        : quantityOrInput;
    const response = await apiClient.patch<ApiResponse<{ cart: Cart }>>(
      `/cart/items/${cartItemId}`,
      payload
    );
    return response.data.data.cart;
  },

  async updateItem(
    cartItemId: string,
    quantityOrInput: number | UpdateCartItemInput
  ): Promise<Cart> {
    return this.updateItemQuantity(cartItemId, quantityOrInput);
  },

  async removeItem(cartItemId: string): Promise<Cart> {
    const response = await apiClient.delete<ApiResponse<{ cart: Cart }>>(
      `/cart/items/${cartItemId}`
    );
    return response.data.data.cart;
  },

  async clearCart(): Promise<Cart> {
    const response = await apiClient.delete<ApiResponse<{ cart: Cart }>>(
      "/cart"
    );
    return response.data.data.cart;
  },
};
