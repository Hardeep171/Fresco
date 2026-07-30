import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";

import { addressRepository } from "../repositories/address.repository.js";
import { ApiError } from "../utils/api-error.js";
import type {
  CreateAddressInput,
  UpdateAddressInput,
} from "../validators/address.validator.js";

/**
 * Ensures an address exists for the given user, throwing 404 if not found.
 *
 * @param userId - User ID owning the address.
 * @param addressId - Address ID to verify.
 * @returns Promise resolving to the address document.
 * @throws {ApiError} 404 Not Found if address does not exist.
 */
async function ensureAddressExists(userId: string, addressId: string) {
  const address = await addressRepository.findUserAddressById(addressId, userId);

  if (!address) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Address not found");
  }

  return address;
}

/**
 * Unsets any existing default address for a user and sets the target address as default.
 *
 * @param userId - User ID owning the address.
 * @param addressId - Address ID to set as default.
 * @returns Promise resolving to the updated address document.
 * @throws {ApiError} 404 Not Found if address does not exist.
 */
async function makeAddressDefault(userId: string, addressId: string) {
  await addressRepository.unsetDefaultAddress(userId);
  const updatedAddress = await addressRepository.setDefaultAddress(addressId);

  if (!updatedAddress) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Address not found");
  }

  return updatedAddress;
}

/**
 * Finds the oldest remaining address for a user and sets it as the default address.
 *
 * @param userId - User ID.
 */
async function assignNextDefaultAddress(userId: string) {
  const firstAddress = await addressRepository.findFirstAddress(userId);

  if (firstAddress) {
    await addressRepository.setDefaultAddress(firstAddress._id.toString());
  }
}

/** Service providing business logic for Address module. */
export const addressService = {
  /**
   * Creates a new address for a user following default address business rules.
   *
   * @param userId - User ID creating the address.
   * @param data - Address creation input properties.
   * @returns Promise resolving to the created address document.
   */
  async createAddress(userId: string, data: CreateAddressInput) {
    const addressCount = await addressRepository.countAddressesByUser(userId);

    let isDefault = data.isDefault ?? false;

    if (addressCount === 0) {
      isDefault = true;
    } else if (isDefault) {
      await addressRepository.unsetDefaultAddress(userId);
    }

    return addressRepository.createAddress({
      ...data,
      userId: new Types.ObjectId(userId),
      isDefault,
    });
  },

  /**
   * Retrieves all address documents for a specific user.
   *
   * @param userId - User ID to retrieve addresses for.
   * @returns Promise resolving to an array of address documents.
   */
  async getAddresses(userId: string) {
    return addressRepository.findAddressesByUser(userId);
  },

  /**
   * Retrieves a single address document by ID for a specific user.
   *
   * @param userId - User ID owning the address.
   * @param addressId - Address ID to retrieve.
   * @returns Promise resolving to the matching address document.
   * @throws {ApiError} 404 Not Found if address does not exist.
   */
  async getAddressById(userId: string, addressId: string) {
    return ensureAddressExists(userId, addressId);
  },

  /**
   * Updates an existing address document for a user.
   *
   * @param userId - User ID owning the address.
   * @param addressId - Address ID to update.
   * @param data - Validated address update properties.
   * @returns Promise resolving to the updated address document.
   * @throws {ApiError} 404 Not Found if address does not exist.
   */
  async updateAddress(
    userId: string,
    addressId: string,
    data: UpdateAddressInput,
  ) {
    const existingAddress = await ensureAddressExists(userId, addressId);

    if (data.isDefault === true && !existingAddress.isDefault) {
      await addressRepository.unsetDefaultAddress(userId);
    }

    const updatedAddress = await addressRepository.updateAddress(addressId, data);

    if (!updatedAddress) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Address not found");
    }

    return updatedAddress;
  },

  /**
   * Deletes an address document for a user, reassigning default status if needed.
   *
   * @param userId - User ID owning the address.
   * @param addressId - Address ID to delete.
   * @returns Promise resolving to a success message.
   * @throws {ApiError} 404 Not Found if address does not exist.
   */
  async deleteAddress(userId: string, addressId: string) {
    const existingAddress = await ensureAddressExists(userId, addressId);

    await addressRepository.deleteAddress(addressId);

    if (existingAddress.isDefault) {
      await assignNextDefaultAddress(userId);
    }

    return { message: "Address deleted successfully" };
  },

  /**
   * Sets a specific address as default for a user.
   *
   * @param userId - User ID owning the address.
   * @param addressId - Address ID to set as default.
   * @returns Promise resolving to the updated address document.
   * @throws {ApiError} 404 Not Found if address does not exist.
   */
  async setDefaultAddress(userId: string, addressId: string) {
    const existingAddress = await ensureAddressExists(userId, addressId);

    if (existingAddress.isDefault) {
      return existingAddress;
    }

    return makeAddressDefault(userId, addressId);
  },
};
