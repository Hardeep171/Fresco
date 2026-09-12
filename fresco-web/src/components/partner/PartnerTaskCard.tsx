import React from "react";
import { Truck, MapPin, CheckCircle, ArrowRight, DollarSign, User } from "lucide-react";
import { Assignment } from "../../types/assignment.types";
import { Order } from "../../types/order.types";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";

interface PartnerTaskCardProps {
  assignment: Assignment;
  order?: Order | null;
  onAccept: (assignmentId: string) => Promise<boolean>;
  onComplete: (assignmentId: string) => Promise<boolean>;
  onOpenCollectPayment: (orderId: string, amount: number) => void;
  isLoading?: boolean;
}

export const PartnerTaskCard: React.FC<PartnerTaskCardProps> = ({
  assignment,
  order,
  onAccept,
  onComplete,
  onOpenCollectPayment,
  isLoading = false,
}) => {
  const isPickup = assignment.assignmentType === "PICKUP";
  const isAssigned = assignment.status === "ASSIGNED";
  const isAccepted = assignment.status === "ACCEPTED";
  const isCompleted = assignment.status === "COMPLETED";

  const orderId =
    typeof assignment.orderId === "object"
      ? assignment.orderId._id
      : assignment.orderId;

  const orderNumber =
    typeof assignment.orderId === "object"
      ? assignment.orderId.orderNumber || assignment.orderId._id.slice(-8).toUpperCase()
      : order?.orderNumber || orderId.slice(-8).toUpperCase();

  const customerName =
    typeof assignment.orderId === "object" && (assignment.orderId as any).customerName
      ? (assignment.orderId as any).customerName
      : order
      ? `${(order as any).userId?.firstName || "Customer"} ${(order as any).userId?.lastName || ""}`
      : "Customer";

  const address =
    order?.deliveryAddress || (typeof assignment.orderId === "object" ? (assignment.orderId as any).deliveryAddress : null);

  const amountDue =
    order?.pricing?.totalAmount ?? order?.totalAmount ?? 0;

  const isPaymentPending = order?.paymentStatus === "PENDING";

  return (
    <Card className="fresco-card-hover" style={{ marginBottom: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1rem",
          paddingBottom: "0.75rem",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Badge
            variant={isPickup ? "primary" : "success"}
            className="flex items-center gap-1"
          >
            <Truck size={14} />
            {isPickup ? "Pickup Task" : "Delivery Task"}
          </Badge>

          <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
            Order #{orderNumber}
          </span>
        </div>

        <div>
          <Badge
            variant={
              isCompleted
                ? "success"
                : isAccepted
                ? "primary"
                : isAssigned
                ? "warning"
                : "neutral"
            }
          >
            {assignment.status}
          </Badge>
        </div>
      </div>

      {/* Task & Customer Info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-primary)", fontWeight: 600 }}>
          <User size={16} color="var(--text-muted)" />
          <span>{customerName}</span>
        </div>

        {address && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: "0.125rem" }} />
            <div>
              <div>{address.addressLine1} {address.addressLine2}</div>
              <div>{address.city}, {address.state} - {address.postalCode}</div>
            </div>
          </div>
        )}

        {assignment.notes && (
          <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", backgroundColor: "var(--surface-muted)", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)" }}>
            <span style={{ fontWeight: 600 }}>Instructions: </span>
            {assignment.notes}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          paddingTop: "0.75rem",
          borderTop: "1px solid var(--border-light)",
        }}
      >
        <div>
          {isPaymentPending && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--warning)", fontWeight: 600 }}>
                Payment Due:
              </span>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                ₹{amountDue}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {isAssigned && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAccept(assignment._id)}
              isLoading={isLoading}
              rightIcon={<ArrowRight size={14} />}
            >
              Accept Task
            </Button>
          )}

          {isAccepted && (
            <>
              {isPaymentPending && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onOpenCollectPayment(orderId, amountDue)}
                  leftIcon={<DollarSign size={14} />}
                >
                  Collect ₹{amountDue}
                </Button>
              )}

              <Button
                variant="success"
                size="sm"
                onClick={() => onComplete(assignment._id)}
                isLoading={isLoading}
                leftIcon={<CheckCircle size={14} />}
              >
                {isPickup ? "Confirm Clothes Picked Up" : "Complete Delivery"}
              </Button>
            </>
          )}

          {isCompleted && (
            <div style={{ color: "var(--success)", fontWeight: 600, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <CheckCircle size={16} /> Task Completed
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
