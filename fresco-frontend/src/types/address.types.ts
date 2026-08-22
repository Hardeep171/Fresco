import { AddressLabel } from "../constants/address.constants";

/**
 * Address entity strictly matching FRESCO backend Address model.
 */
export interface Address {
  _id: string;
  userId: string;
  label: AddressLabel;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input payload for creating an address matching createAddressSchema.
 */
export interface CreateAddressInput {
  label: AddressLabel;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

/**
 * Input payload for updating an address matching updateAddressSchema.
 */
export type UpdateAddressInput = Partial<CreateAddressInput>;
