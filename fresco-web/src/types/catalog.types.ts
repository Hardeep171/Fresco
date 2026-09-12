export interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Garment {
  _id: string;
  categoryId: string | Category;
  name: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id: string;
  name: string;
  description?: string;
  turnaroundHours?: number;
  icon?: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pricing {
  _id: string;
  garmentId: string | Garment;
  serviceId: string | Service;
  price: number;
  basePrice?: number;
  minDays?: number;
  currency?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetCategoriesParams {
  isActive?: boolean;
}

export interface GetGarmentsParams {
  categoryId?: string;
  isActive?: boolean;
}

export interface GetServicesParams {
  isActive?: boolean;
}

export interface GetPricingParams {
  garmentId?: string;
  serviceId?: string;
  isActive?: boolean;
}

export interface ServiceOptionWithPrice {
  service: Service;
  pricing: Pricing;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export interface CreateGarmentInput {
  categoryId: string;
  name: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export type UpdateGarmentInput = Partial<CreateGarmentInput>;

export interface CreateServiceInput {
  name: string;
  description?: string;
  turnaroundHours?: number;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export type UpdateServiceInput = Partial<CreateServiceInput>;

export interface CreatePricingInput {
  garmentId: string;
  serviceId: string;
  price?: number;
  basePrice?: number;
  minDays?: number;
  currency?: string;
  isActive?: boolean;
}

export interface UpdatePricingInput {
  price?: number;
  basePrice?: number;
  minDays?: number;
  isActive?: boolean;
}
