import React from "react";
import {
  INSPECTION_STATUS_LABELS,
  InspectionStatus,
} from "../../constants/inspection.constants";
import { AppBadge } from "../common";

export interface InspectionStatusBadgeProps {
  status: InspectionStatus;
  size?: "sm" | "md";
}


const getStatusVariant = (
  status: InspectionStatus
): "primary" | "success" | "warning" | "error" | "neutral" => {
  switch (status) {
    case "DRAFT":
      return "warning";
    case "SUBMITTED":
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "error";
    case "CANCELLED":
      return "neutral";
    default:
      return "neutral";
  }
};

export const InspectionStatusBadge: React.FC<InspectionStatusBadgeProps> = ({
  status,
  size = "md",
}) => {
  const label = INSPECTION_STATUS_LABELS[status] || status;
  const variant = getStatusVariant(status);

  return <AppBadge label={label} variant={variant} size={size} showDot />;
};
