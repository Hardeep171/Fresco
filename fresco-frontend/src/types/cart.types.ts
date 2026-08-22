/**
 * Cart entities strictly matching FRESCO backend Cart contracts.
 */

/** Single cart item matching backend CartItemSchema */
export interface CartItem {
  _id?: string;
  garmentId: string;
  serviceId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

/** Complete customer cart matching backend CartModel */
export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Payload for adding an item to the cart */
export interface AddCartItemInput {
  garmentId: string;
  serviceId: string;
  quantity: number;
}

/** Payload for updating an item's quantity in the cart */
export interface UpdateCartItemInput {
  quantity: number;
}

/** Enriched cart item helper combining CartItem with resolved Garment and Service names */
export interface EnrichedCartItem extends CartItem {
  garmentName: string;
  serviceName: string;
}
