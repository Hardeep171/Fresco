import {
  InspectionStatus,
  ItemCondition,
} from "../constants/inspection.constants";
import { User } from "./auth.types";
import { Order } from "./order.types";

/**
 * Inspected garment item within an inspection record.
 */
export interface InspectionItem {
  garmentId: string;
  serviceId: string;
  garmentName: string;
  serviceName: string;
  initialQuantity: number;
  inspectedQuantity: number;
  unitPrice: number;
  totalPrice: number;
  condition: ItemCondition;
  damageNotes?: string;
  imageUrls?: string[];
}

/**
 * Extra service added during inspection.
 */
export interface InspectionExtraService {
  serviceName: string;
  price: number;
}

/**
 * Financial pricing summary calculated server-side for an inspection.
 */
export interface InspectionPricingSummary {
  initialTotal: number;
  inspectedSubtotal: number;
  extraServiceCharges: number;
  adjustmentAmount: number;
  adjustmentReason?: string;
  finalTax: number;
  finalTotalAmount: number;
}

/**
 * Full FRESCO Order Inspection Entity.
 */
export interface Inspection {
  _id: string;
  orderId: string | Order;
  inspectorId: string | User;
  status: InspectionStatus;
  items: InspectionItem[];
  extraServices: InspectionExtraService[];
  pricingSummary: InspectionPricingSummary;
  notes?: string;
  inspectedAt?: string;
  submittedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for single item during inspection creation or update.
 */
export interface InspectionItemInput {
  garmentId: string;
  serviceId: string;
  initialQuantity: number;
  inspectedQuantity: number;
  condition: ItemCondition;
  damageNotes?: string;
  imageUrls?: string[];
}

/**
 * Input for extra service addition during inspection.
 */
export interface InspectionExtraServiceInput {
  serviceId: string;
  quantity: number;
}

/**
 * Input payload for creating a new inspection.
 */
export interface CreateInspectionInput {
  orderId: string;
  items: InspectionItemInput[];
  extraServices?: InspectionExtraServiceInput[];
  adjustmentAmount?: number;
  adjustmentReason?: string;
  notes?: string;
}

/**
 * Input payload for updating a DRAFT inspection.
 */
export interface UpdateInspectionInput {
  items?: InspectionItemInput[];
  extraServices?: InspectionExtraServiceInput[];
  adjustmentAmount?: number;
  adjustmentReason?: string;
  notes?: string;
}

/**
 * Query filter options for inspections list.
 */
export interface InspectionFilters {
  orderId?: string;
  inspectorId?: string;
  status?: InspectionStatus;
  isActive?: boolean;
}

/**
 * Response payload containing a single inspection.
 */
export interface InspectionResponse {
  inspection: Inspection;
}

/**
 * Response payload containing multiple inspections.
 */
export interface InspectionsResponse {
  inspections: Inspection[];
}
