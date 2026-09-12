export type AddressLabel = "HOME" | "OFFICE" | "WORK" | "OTHER";

export interface Address {
  _id: string;
  userId: string;
  label: AddressLabel;
  addressType?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  street?: string;
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

export interface CreateAddressInput {
  label?: AddressLabel;
  addressType?: string;
  fullName?: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  street?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export type UpdateAddressInput = Partial<CreateAddressInput>;
