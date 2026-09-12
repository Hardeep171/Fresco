import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CreditCard,
  XCircle,
  ShieldCheck,
  Package,
} from "lucide-react";
import { useOrders } from "../../hooks/useOrders";
import { usePayment } from "../../hooks/usePayment";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { OrderStatusBadge } from "../../components/common/OrderStatusBadge";
import { PaymentStatusBadge } from "../../components/common/PaymentStatusBadge";
import { OrderTimeline } from "../../components/common/OrderTimeline";
import { Modal } from "../../components/common/Modal";
import { Spinner } from "../../components/common/Spinner";
import { Alert } from "../../components/common/Alert";
import { isOrderCancellable, OrderStatus } from "../../constants/order.constants";

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    currentOrder,
    isFetchingDetails,
    detailsError,
    loadOrderById,
    cancelOrder,
    isCancellingOrder,
    cancelSuccess,
    cancelError,
    clearCancel,
  } = useOrders();

  const { loadPaymentByOrderId, currentPayment } = usePayment();

  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrderById(id);
      loadPaymentByOrderId(id);
    }
  }, [id, loadOrderById, loadPaymentByOrderId]);

  if (isFetchingDetails && !currentOrder) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}>
        <Spinner size="lg" color="var(--primary)" />
      </div>
    );
  }

  if (detailsError || !currentOrder) {
    return (
      <div style={{ maxWidth: "28rem", margin: "3rem auto", textAlign: "center" }}>
        <Alert
          type="error"
          message={detailsError?.message || "Order not found"}
        />
        <Link to="/orders" className="btn btn-secondary">
          Back to Orders
        </Link>
      </div>
    );
  }

  const order = currentOrder;
  const cancellable = isOrderCancellable(order.orderStatus as OrderStatus);

  const handleConfirmCancel = async () => {
    if (!id) return;
    const success = await cancelOrder(id);
    if (success) {
      setCancelModalOpen(false);
    }
  };

  const address = order.deliveryAddress;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      {/* Back button & Title */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          to="/orders"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            color: "var(--text-secondary)",
            fontSize: "0.875rem",
            marginBottom: "0.5rem",
          }}
        >
          <ArrowLeft size={16} /> Back to My Orders
        </Link>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Order Reference
            </span>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>
              #{order.orderNumber || order._id.slice(-8).toUpperCase()}
            </h1>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <OrderStatusBadge status={order.orderStatus || order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
            {cancellable && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setCancelModalOpen(true)}
                leftIcon={<XCircle size={16} />}
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>
      </div>

      {cancelSuccess && (
        <Alert
          type="success"
          message="Order Cancelled Successfully"
          description="Your order has been cancelled."
          onClose={clearCancel}
        />
      )}

      {cancelError && (
        <Alert
          type="error"
          message={cancelError.message || "Failed to cancel order"}
          onClose={clearCancel}
        />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="order-details-grid">
        {/* Left Column: Lifecycle Timeline & Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Timeline Card */}
          <Card title="Live Care & Delivery Timeline">
            <OrderTimeline
              currentStatus={order.orderStatus || order.status}
              createdAt={order.createdAt}
              updatedAt={order.updatedAt}
            />
          </Card>

          {/* Garments Breakdown */}
          <Card title={`Garments in Care (${itemCount})`}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {order.items.map((item, index) => {
                const garmentName = item.garmentName || "Garment";
                const serviceName = item.serviceName || "Service";

                return (
                  <div
                    key={item._id || index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingBottom: "0.75rem",
                      borderBottom:
                        index < order.items.length - 1
                          ? "1px solid var(--border-light)"
                          : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: "var(--primary-surface)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--primary)",
                        }}
                      >
                        <Package size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {garmentName}
                        </div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                          {serviceName} • Qty: <strong>{item.quantity}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                        ₹{item.totalPrice || item.unitPrice * item.quantity}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        ₹{item.unitPrice} each
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Address, Payment & Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Pickup & Delivery Address */}
          <Card title="Pickup & Delivery Address">
            {address ? (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <MapPin size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: "0.125rem" }} />
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {address.addressType || "Delivery Location"}
                  </div>
                  <div>{address.addressLine1}</div>
                  {address.addressLine2 && <div>{address.addressLine2}</div>}
                  <div>
                    {address.city}, {address.state} - {address.postalCode}
                  </div>
                  <div>{address.country || "India"}</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                Address information recorded with order.
              </div>
            )}
          </Card>

          {/* Payment Details */}
          <Card title="Payment Information">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-secondary)" }}>Payment Method</span>
                <span style={{ fontWeight: 600 }}>
                  {order.paymentMethod === "CASH" ? "Cash on Visit" : "UPI / QR Scan"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-secondary)" }}>Payment Status</span>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>

              {currentPayment?.verificationStatus && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Verification</span>
                  <span style={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                    {currentPayment.verificationStatus === "VERIFIED"
                      ? "Approved & Verified"
                      : currentPayment.verificationStatus === "PENDING"
                      ? "Pending Admin Audit"
                      : "Standard"}
                  </span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-secondary)" }}>Total Amount</span>
                <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--primary)" }}>
                  ₹{order.pricing?.totalAmount ?? order.totalAmount ?? 0}
                </span>
              </div>
            </div>
          </Card>

          {/* Special Instructions */}
          {order.notes && (
            <Card title="Special Care Notes">
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                "{order.notes}"
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order Confirmation"
        footer={
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", width: "100%" }}>
            <Button
              variant="secondary"
              onClick={() => setCancelModalOpen(false)}
              disabled={isCancellingOrder}
            >
              Keep Order
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCancel}
              isLoading={isCancellingOrder}
            >
              Yes, Cancel Order
            </Button>
          </div>
        }
      >
        <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Are you sure you want to cancel order #{order.orderNumber || order._id.slice(-8).toUpperCase()}?
          This action cannot be undone.
        </p>
      </Modal>

      <style>{`
        @media (min-width: 1024px) {
          .order-details-grid {
            grid-template-columns: 2fr 1.2fr !important;
          }
        }
      `}</style>
    </div>
  );
};
