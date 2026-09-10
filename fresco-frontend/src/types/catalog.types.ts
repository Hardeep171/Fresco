/**
 * Category, Garment, Service, and Pricing types strictly matching FRESCO backend contracts.
 */

/** Category entity matching backend CategoryModel */
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

/** Garment entity matching backend GarmentModel */
export interface Garment {
  _id: string;
  categoryId: string;
  name: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Service entity matching backend ServiceModel */
export interface Service {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Pricing entity matching backend PricingModel */
export interface Pricing {
  _id: string;
  garmentId: string;
  serviceId: string;
  price: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Query parameters for fetching categories */
export interface GetCategoriesParams {
  isActive?: boolean;
}

/** Query parameters for fetching garments */
export interface GetGarmentsParams {
  categoryId?: string;
  isActive?: boolean;
}

/** Query parameters for fetching services */
export interface GetServicesParams {
  isActive?: boolean;
}

/** Query parameters for fetching pricing records */
export interface GetPricingParams {
  garmentId?: string;
  serviceId?: string;
  isActive?: boolean;
}

/** Helper interface associating a service with its authoritative backend pricing */
export interface ServiceOptionWithPrice {
  service: Service;
  pricing: Pricing;
}

// ============================================================================
// ADMIN CATALOG MUTATION INPUT INTERFACES (Matching Backend Zod Validators)
// ============================================================================

/** Input schema for creating a new Category */
export interface CreateCategoryInput {
  name: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

/** Input schema for updating an existing Category */
export type UpdateCategoryInput = Partial<CreateCategoryInput>;

/** Input schema for creating a new Garment */
export interface CreateGarmentInput {
  categoryId: string;
  name: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

/** Input schema for updating an existing Garment */
export type UpdateGarmentInput = Partial<CreateGarmentInput>;

/** Input schema for creating a new Service */
export interface CreateServiceInput {
  name: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

/** Input schema for updating an existing Service */
export type UpdateServiceInput = Partial<CreateServiceInput>;

/** Input schema for creating a new Pricing pair */
export interface CreatePricingInput {
  garmentId: string;
  serviceId: string;
  price: number;
  currency?: string;
  isActive?: boolean;
}

/** Input schema for updating an existing Pricing pair */
export type UpdatePricingInput = Partial<CreatePricingInput>;

