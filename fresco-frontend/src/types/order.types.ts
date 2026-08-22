import { OrderStatus, PaymentStatus } from "../constants/order.constants";
import { CreateAddressInput } from "./address.types";

/** Single item in an order matching backend OrderItemSchema */
export interface OrderItem {
  garmentId: string;
  serviceId: string;
  garmentName: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/** Pricing financial snapshot matching backend PricingSnapshotSchema */
export interface PricingSnapshot {
  subtotal: number;
  discount: number;
  tax: number;
  deliveryCharge: number;
  totalAmount: number;
}

/** Address snapshot stored inside an order matching backend AddressSnapshotSchema */
export interface AddressSnapshot {
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
}

/** Complete order matching backend OrderModel */
export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  pricing: PricingSnapshot;
  pickupAddress: AddressSnapshot;
  deliveryAddress: AddressSnapshot;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  pickupDate?: string;
  deliveryDate?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating a new order */
export interface CreateOrderInput {
  pickupAddress: CreateAddressInput;
  deliveryAddress: CreateAddressInput;
  pickupDate?: string;
  deliveryDate?: string;
  specialInstructions?: string;
}

/** Query parameters for order filters */
export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  userId?: string;
}
