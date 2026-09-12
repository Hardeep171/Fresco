import React from "react";
import {
  CheckCircle,
  Truck,
  ClipboardCheck,
  Sparkles,
  PackageCheck,
  ShieldCheck,
  XCircle,
  UserCheck,
} from "lucide-react";
import { Order, OrderStatus } from "../../types/order.types";
import { Payment } from "../../types/payment.types";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { OrderStatusBadge } from "../common/OrderStatusBadge";
import { PaymentStatusBadge } from "../common/PaymentStatusBadge";

interface OrderLifecycleActionCardProps {
  order: Order;
  payment?: Payment | null;
  onUpdateStatus: (newStatus: string) => Promise<boolean>;
  onOpenAssignPartner: (assignmentType: "PICKUP" | "DELIVERY") => void;
  onOpenVerifyPayment?: () => void;
  isLoading?: boolean;
}

export const OrderLifecycleActionCard: React.FC<OrderLifecycleActionCardProps> = ({
  order,
  payment,
  onUpdateStatus,
  onOpenAssignPartner,
  onOpenVerifyPayment,
  isLoading = false,
}) => {
  const status = (order.orderStatus || order.status) as OrderStatus;
  const isPaymentPendingVerification =
    payment?.verificationStatus === "PENDING" ||
    (order.paymentStatus === "PENDING" && payment?.collectionReported);

  return (
    <Card className="fresco-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Operational Control
          </span>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Lifecycle Actions
          </h3>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <OrderStatusBadge status={order.orderStatus || order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Payment Verification Banner */}
      {isPaymentPendingVerification && (
        <div
          style={{
            backgroundColor: "var(--warning-surface)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck size={20} color="var(--warning)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#92400E" }}>
                Partner Reported Payment Collection
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                Amount: ₹{payment?.amount || order.pricing?.totalAmount || order.totalAmount} via{" "}
                {payment?.paymentMethod || "CASH"}
              </div>
            </div>
          </div>

          {onOpenVerifyPayment && (
            <Button
              variant="success"
              size="sm"
              onClick={onOpenVerifyPayment}
              leftIcon={<CheckCircle size={16} />}
            >
              Verify Payment
            </Button>
          )}
        </div>
      )}

      {/* Action Buttons based on status */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        {status === "PLACED" && (
          <>
            <Button
              variant="primary"
              onClick={() => onUpdateStatus("CONFIRMED")}
              isLoading={isLoading}
              leftIcon={<CheckCircle size={16} />}
            >
              Confirm Order
            </Button>
            <Button
              variant="danger"
              onClick={() => onUpdateStatus("CANCELLED")}
              isLoading={isLoading}
              leftIcon={<XCircle size={16} />}
            >
              Cancel Order
            </Button>
          </>
        )}

        {status === "CONFIRMED" && (
          <>
            <Button
              variant="primary"
              onClick={() => onOpenAssignPartner("PICKUP")}
              leftIcon={<Truck size={16} />}
            >
              Assign Pickup Partner
            </Button>
            <Button
              variant="danger"
              onClick={() => onUpdateStatus("CANCELLED")}
              isLoading={isLoading}
              leftIcon={<XCircle size={16} />}
            >
              Cancel Order
            </Button>
          </>
        )}

        {status === "PICKUP_ASSIGNED" && (
          <>
            <Button
              variant="secondary"
              onClick={() => onOpenAssignPartner("PICKUP")}
              leftIcon={<UserCheck size={16} />}
            >
              Reassign Pickup Partner
            </Button>
            <Button
              variant="primary"
              onClick={() => onUpdateStatus("PICKED_UP")}
              isLoading={isLoading}
              leftIcon={<Truck size={16} />}
            >
              Confirm Clothes Picked Up
            </Button>
          </>
        )}

        {status === "PICKED_UP" && (
          <>
            <Button
              variant="secondary"
              onClick={() => onUpdateStatus("UNDER_INSPECTION")}
              isLoading={isLoading}
              leftIcon={<ClipboardCheck size={16} />}
            >
              Start Garment Inspection
            </Button>
            <Button
              variant="primary"
              onClick={() => onUpdateStatus("IN_PROCESS")}
              isLoading={isLoading}
              leftIcon={<Sparkles size={16} />}
            >
              Send to Cleaning
            </Button>
          </>
        )}

        {status === "UNDER_INSPECTION" && (
          <Button
            variant="primary"
            onClick={() => onUpdateStatus("IN_PROCESS")}
            isLoading={isLoading}
            leftIcon={<Sparkles size={16} />}
          >
            Complete Inspection & Start Cleaning
          </Button>
        )}

        {status === "IN_PROCESS" && (
          <Button
            variant="primary"
            onClick={() => onUpdateStatus("READY_FOR_DELIVERY")}
            isLoading={isLoading}
            leftIcon={<PackageCheck size={16} />}
          >
            Mark Ready for Delivery
          </Button>
        )}

        {status === "READY_FOR_DELIVERY" && (
          <Button
            variant="primary"
            onClick={() => onOpenAssignPartner("DELIVERY")}
            leftIcon={<Truck size={16} />}
          >
            Assign Delivery Partner
          </Button>
        )}

        {status === "OUT_FOR_DELIVERY" && (
          <>
            <Button
              variant="secondary"
              onClick={() => onOpenAssignPartner("DELIVERY")}
              leftIcon={<UserCheck size={16} />}
            >
              Reassign Delivery Partner
            </Button>
            <Button
              variant="success"
              onClick={() => onUpdateStatus("DELIVERED")}
              isLoading={isLoading}
              leftIcon={<CheckCircle size={16} />}
            >
              Confirm Delivered to Customer
            </Button>
          </>
        )}

        {status === "DELIVERED" && (
          <div style={{ color: "var(--success)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle size={18} /> Order fulfilled and delivered successfully.
          </div>
        )}

        {status === "CANCELLED" && (
          <div style={{ color: "var(--error)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <XCircle size={18} /> This order is cancelled. No further actions available.
          </div>
        )}
      </div>
    </Card>
  );
};
