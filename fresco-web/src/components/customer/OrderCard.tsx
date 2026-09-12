import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Calendar, Package } from "lucide-react";
import { Order } from "../../types/order.types";
import { Card } from "../common/Card";
import { OrderStatusBadge } from "../common/OrderStatusBadge";
import { PaymentStatusBadge } from "../common/PaymentStatusBadge";

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Card className="fresco-card-hover" style={{ marginBottom: "1rem" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1rem",
          paddingBottom: "0.75rem",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Order ID
          </span>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
            #{order.orderNumber || order._id.slice(-8).toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <OrderStatusBadge status={order.orderStatus || order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            <Calendar size={16} color="var(--text-muted)" />
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            <Package size={16} color="var(--text-muted)" />
            <span>{itemCount} {itemCount === 1 ? "garment" : "garments"}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
              Total Amount
            </span>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary)" }}>
              ₹{order.pricing?.totalAmount ?? order.totalAmount ?? 0}
            </span>
          </div>

          <Link
            to={`/orders/${order._id}`}
            className="btn btn-secondary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <span>Details</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </Card>
  );
};
