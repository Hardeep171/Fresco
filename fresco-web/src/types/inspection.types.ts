import {
  InspectionStatus,
  ItemCondition,
} from "../constants/inspection.constants";
import { User } from "./auth.types";
import { Order } from "./order.types";

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

export interface InspectionExtraService {
  serviceName: string;
  price: number;
}

export interface InspectionPricingSummary {
  initialTotal: number;
  inspectedSubtotal: number;
  extraServiceCharges: number;
  adjustmentAmount: number;
  adjustmentReason?: string;
  finalTax: number;
  finalTotalAmount: number;
}

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

export interface StartInspectionInput {
  orderId: string;
  notes?: string;
}

export interface SubmitInspectionInput {
  items: {
    garmentId: string;
    serviceId: string;
    inspectedQuantity: number;
    condition: ItemCondition;
    damageNotes?: string;
    imageUrls?: string[];
  }[];
  extraServices?: {
    serviceName: string;
    price: number;
  }[];
  adjustmentAmount?: number;
  adjustmentReason?: string;
  notes?: string;
}

export type CreateInspectionInput = StartInspectionInput;
export type UpdateInspectionInput = Partial<SubmitInspectionInput>;

export interface InspectionFilters {
  orderId?: string;
  inspectorId?: string;
  status?: InspectionStatus | string;
  limit?: number;
  page?: number;
}

export interface InspectionResponse {
  inspection: Inspection;
}

export interface InspectionsResponse {
  inspections: Inspection[];
}
