import React from "react";
import { Check, Clock, AlertTriangle } from "lucide-react";
import {
  OrderStatus,
  ORDER_STATUS_SEQUENCE,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_DESCRIPTIONS,
} from "../../constants/order.constants";

interface OrderTimelineProps {
  currentStatus: OrderStatus | string;
  createdAt?: string;
  updatedAt?: string;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  currentStatus,
  createdAt,
  updatedAt,
}) => {
  const isCancelled = currentStatus === "CANCELLED";

  if (isCancelled) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1.25rem",
          backgroundColor: "var(--error-surface)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          borderRadius: "var(--radius-md)",
          color: "var(--error)",
        }}
      >
        <AlertTriangle size={28} />
        <div>
          <h4 style={{ fontWeight: 700, fontSize: "1rem" }}>Order Cancelled</h4>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.125rem" }}>
            This order was cancelled on {updatedAt ? new Date(updatedAt).toLocaleDateString() : "earlier"}.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(currentStatus as OrderStatus);

  return (
    <div style={{ position: "relative", paddingLeft: "1.5rem" }}>
      {/* Vertical line connecting steps */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          bottom: "1rem",
          left: "0.9375rem",
          width: 2,
          backgroundColor: "var(--border)",
          transform: "translateX(-50%)",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {ORDER_STATUS_SEQUENCE.map((status, index) => {
          const isCompleted = currentIndex > index;
          const isCurrent = currentIndex === index;
          const isUpcoming = currentIndex < index;

          const label = ORDER_STATUS_LABELS[status];
          const description = ORDER_STATUS_DESCRIPTIONS[status];

          let circleBg = "var(--surface)";
          let circleBorder = "var(--border)";
          let icon = <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--border-dark)" }} />;

          if (isCompleted) {
            circleBg = "var(--success)";
            circleBorder = "var(--success)";
            icon = <Check size={14} color="#ffffff" strokeWidth={3} />;
          } else if (isCurrent) {
            circleBg = "var(--primary)";
            circleBorder = "var(--primary)";
            icon = <Clock size={14} color="#ffffff" />;
          }

          return (
            <div
              key={status}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
              }}
            >
              {/* Step indicator circle */}
              <div
                style={{
                  position: "absolute",
                  left: "-1.5rem",
                  top: 0,
                  transform: "translateX(-50%)",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: circleBg,
                  border: `2px solid ${circleBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                  boxShadow: isCurrent ? "0 0 0 4px rgba(30, 58, 138, 0.15)" : undefined,
                  transition: "all 0.2s",
                }}
              >
                {icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    style={{
                      fontWeight: isCurrent ? 700 : isCompleted ? 600 : 500,
                      fontSize: "0.9375rem",
                      color: isCurrent
                        ? "var(--primary)"
                        : isCompleted
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                    }}
                  >
                    {label}
                  </span>
                  {isCurrent && (
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        backgroundColor: "var(--primary-surface)",
                        color: "var(--primary)",
                        padding: "0.125rem 0.5rem",
                        borderRadius: "var(--radius-full)",
                        textTransform: "uppercase",
                      }}
                    >
                      Current Status
                    </span>
                  )}
                  {isCompleted && index === 0 && createdAt && (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {new Date(createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: isCurrent ? "var(--text-secondary)" : "var(--text-muted)",
                    marginTop: "0.25rem",
                  }}
                >
                  {description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
