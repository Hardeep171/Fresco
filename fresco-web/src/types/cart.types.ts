export interface CartItem {
  _id: string;
  garmentId: string;
  serviceId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddCartItemInput {
  garmentId: string;
  serviceId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface EnrichedCartItem extends CartItem {
  garmentName: string;
  serviceName: string;
  categoryName?: string;
}
