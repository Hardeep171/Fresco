import React from "react";
import { OrderStatus, ORDER_STATUS_LABELS } from "../../constants/order.constants";
import { colors } from "../../theme/colors";

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const statusKey = status as OrderStatus;
  const label = ORDER_STATUS_LABELS[statusKey] || status;
  const color = colors.orderStatus[statusKey as keyof typeof colors.orderStatus] || "#64748B";

  return (
    <span
      className={`badge ${className}`}
      style={{
        backgroundColor: `${color}18`, // 10% opacity tint
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
