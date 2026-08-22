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
