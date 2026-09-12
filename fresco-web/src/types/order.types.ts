import { OrderStatus, PaymentStatus } from "../constants/order.constants";
export type { OrderStatus, PaymentStatus };
import { CreateAddressInput } from "./address.types";
import { User } from "./auth.types";
import { Garment, Service } from "./catalog.types";

export interface OrderItem {
  _id?: string;
  garmentId: string | Garment;
  serviceId: string | Service;
  garmentName?: string;
  serviceName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PricingSnapshot {
  subtotal: number;
  discount: number;
  tax: number;
  deliveryCharge: number;
  totalAmount: number;
}

export interface AddressSnapshot {
  fullName?: string;
  phone?: string;
  addressType?: string;
  addressLine1?: string;
  addressLine2?: string;
  street?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface Order {
  _id: string;
  orderNumber?: string;
  userId: string | User;
  items: OrderItem[];
  pricing?: PricingSnapshot;
  pickupAddress: AddressSnapshot;
  deliveryAddress: AddressSnapshot;
  status: OrderStatus;
  orderStatus?: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  totalAmount?: number;
  subtotal?: number;
  tax?: number;
  deliveryFee?: number;
  discount?: number;
  pickupDate?: string;
  pickupTimeSlot?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  specialInstructions?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  pickupAddress?: CreateAddressInput;
  deliveryAddress?: CreateAddressInput;
  pickupAddressId?: string;
  deliveryAddressId?: string;
  paymentMethod?: string;
  pickupDate?: string;
  deliveryDate?: string;
  specialInstructions?: string;
  notes?: string;
}

export interface OrderFilters {
  status?: OrderStatus | string;
  paymentStatus?: PaymentStatus | string;
  userId?: string;
  limit?: number;
  page?: number;
}
