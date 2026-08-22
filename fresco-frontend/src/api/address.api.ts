import { apiClient } from "./client";
import {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
} from "../types/address.types";
import { ApiResponse } from "../types/api.types";

/**
 * Address API service strictly conforming to FRESCO backend Address contracts.
 */
export const addressApi = {
  /**
   * Retrieve all saved addresses for the authenticated user.
   * Backend endpoint: GET /api/v1/addresses
   */
  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.get<ApiResponse<{ addresses: Address[] }>>(
      "/addresses"
    );
    return response.data.data.addresses;
  },

  /**
   * Retrieve a single address by ID.
   * Backend endpoint: GET /api/v1/addresses/:id
   */
  async getAddressById(id: string): Promise<Address> {
    const response = await apiClient.get<ApiResponse<{ address: Address }>>(
      `/addresses/${id}`
    );
    return response.data.data.address;
  },

  /**
   * Create a new address for the authenticated user.
   * Backend endpoint: POST /api/v1/addresses
   */
  async createAddress(input: CreateAddressInput): Promise<Address> {
    const response = await apiClient.post<ApiResponse<{ address: Address }>>(
      "/addresses",
      input
    );
    return response.data.data.address;
  },

  /**
   * Update an existing address by ID.
   * Backend endpoint: PATCH /api/v1/addresses/:id
   */
  async updateAddress(
    id: string,
    input: UpdateAddressInput
  ): Promise<Address> {
    const response = await apiClient.patch<ApiResponse<{ address: Address }>>(
      `/addresses/${id}`,
      input
    );
    return response.data.data.address;
  },

  /**
   * Delete an address by ID.
   * Backend endpoint: DELETE /api/v1/addresses/:id
   */
  async deleteAddress(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/addresses/${id}`
    );
    return { message: response.data.message };
  },

  /**
   * Set an address as the default address.
   * Backend endpoint: PATCH /api/v1/addresses/:id/default
   */
  async setDefaultAddress(id: string): Promise<Address> {
    const response = await apiClient.patch<ApiResponse<{ address: Address }>>(
      `/addresses/${id}/default`
    );
    return response.data.data.address;
  },
};
