import { apiClient } from "./client";
import {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
} from "../types/address.types";
import { ApiResponse } from "../types/api.types";

export const addressApi = {
  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.get<ApiResponse<{ addresses: Address[] }>>(
      "/addresses"
    );
    return response.data.data.addresses;
  },

  async getAddressById(id: string): Promise<Address> {
    const response = await apiClient.get<ApiResponse<{ address: Address }>>(
      `/addresses/${id}`
    );
    return response.data.data.address;
  },

  async createAddress(input: CreateAddressInput): Promise<Address> {
    const response = await apiClient.post<ApiResponse<{ address: Address }>>(
      "/addresses",
      input
    );
    return response.data.data.address;
  },

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

  async deleteAddress(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/addresses/${id}`
    );
    return { message: response.data.message };
  },

  async setDefaultAddress(id: string): Promise<Address> {
    const response = await apiClient.patch<ApiResponse<{ address: Address }>>(
      `/addresses/${id}/default`
    );
    return response.data.data.address;
  },
};
