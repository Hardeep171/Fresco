import { AddressModel, type Address } from "../models/address.model.js";

/** Repository handling database operations for Address module. */
export const addressRepository = {
  /**
   * Creates a new address document in the database.
   *
   * @param addressData - Address creation properties.
   * @returns Promise resolving to the created address document.
   */
  async createAddress(addressData: Partial<Address>) {
    return AddressModel.create(addressData);
  },

  /**
   * Finds all address documents for a specific user, sorted by default status descending and creation date descending.
   *
   * @param userId - The user's unique identifier.
   * @returns Promise resolving to an array of address documents.
   */
  async findAddressesByUser(userId: string) {
    return AddressModel.find({ userId })
      .sort({ isDefault: -1, createdAt: -1 })
      .exec();
  },

  /**
   * Finds a single address document by ID and user ID for authorization.
   *
   * @param addressId - The address's unique identifier.
   * @param userId - The user's unique identifier.
   * @returns Promise resolving to the matching address document if found, or null.
   */
  async findUserAddressById(addressId: string, userId: string) {
    return AddressModel.findOne({ _id: addressId, userId }).exec();
  },

  /**
   * Updates an address document by ID.
   *
   * @param addressId - The address's unique identifier.
   * @param updateData - Address fields to update.
   * @returns Promise resolving to the updated address document if found, or null.
   */
  async updateAddress(addressId: string, updateData: Partial<Address>) {
    return AddressModel.findByIdAndUpdate(addressId, updateData, {
      returnDocument: "after",
      runValidators: true,
    }).exec();
  },

  /**
   * Deletes an address document by ID.
   *
   * @param addressId - The address's unique identifier.
   * @returns Promise resolving to the deleted address document if found, or null.
   */
  async deleteAddress(addressId: string) {
    return AddressModel.findByIdAndDelete(addressId).exec();
  },

  /**
   * Unsets default status for all addresses belonging to a specific user.
   *
   * @param userId - The user's unique identifier.
   * @returns Promise resolving to the Mongoose update result.
   */
  async unsetDefaultAddress(userId: string) {
    return AddressModel.updateMany({ userId }, { isDefault: false }).exec();
  },

  /**
   * Sets default status to true for a specific address.
   *
   * @param addressId - The address's unique identifier.
   * @returns Promise resolving to the updated address document if found, or null.
   */
  async setDefaultAddress(addressId: string) {
    return AddressModel.findByIdAndUpdate(
      addressId,
      { isDefault: true },
      { returnDocument: "after", runValidators: true },
    ).exec();
  },

  /**
   * Finds the default address document for a specific user.
   *
   * @param userId - The user's unique identifier.
   * @returns Promise resolving to the default address document if found, or null.
   */
  async findDefaultAddress(userId: string) {
    return AddressModel.findOne({ userId, isDefault: true }).exec();
  },

  /**
   * Finds the oldest available address document for a specific user.
   *
   * @param userId - The user's unique identifier.
   * @returns Promise resolving to the oldest address document if found, or null.
   */
  async findFirstAddress(userId: string) {
    return AddressModel.findOne({ userId }).sort({ createdAt: 1 }).exec();
  },

  /**
   * Counts total address documents belonging to a specific user.
   *
   * @param userId - The user's unique identifier.
   * @returns Promise resolving to the total count of address documents.
   */
  async countAddressesByUser(userId: string) {
    return AddressModel.countDocuments({ userId }).exec();
  },
};
