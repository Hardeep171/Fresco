import { InspectionStatus, ItemCondition } from "../constants/inspection.constants";

export interface InspectedItem {
  _id?: string;
  garmentId: string;
  serviceId: string;
  quantity: number;
  condition: ItemCondition;
  damageNotes?: string;
  additionalServiceCharge: number;
  originalUnitPrice: number;
  finalUnitPrice: number;
  finalTotalPrice: number;
}

export interface Inspection {
  _id: string;
  orderId: string;
  status: InspectionStatus;
  notes?: string;
  inspectedItems: InspectedItem[];
  originalTotalAmount: number;
  adjustmentAmount: number;
  adjustmentReason?: string;
  finalTotalAmount: number;
  inspectedBy?: string;
  createdAt: string;
  updatedAt: string;
}
