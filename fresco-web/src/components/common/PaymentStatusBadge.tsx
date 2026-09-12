import React from "react";
import { PaymentStatus, PAYMENT_STATUS_LABELS } from "../../constants/payment.constants";
import { colors } from "../../theme/colors";

interface PaymentStatusBadgeProps {
  status: PaymentStatus | string;
  className?: string;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const statusKey = status as PaymentStatus;
  const label = PAYMENT_STATUS_LABELS[statusKey] || status;
  const color = colors.paymentStatus[statusKey as keyof typeof colors.paymentStatus] || "#64748B";

  return (
    <span
      className={`badge ${className}`}
      style={{
        backgroundColor: `${color}18`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: color,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
};
