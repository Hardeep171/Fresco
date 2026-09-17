import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CreditCard,
  User,
  Phone,
  Mail,
  Truck,
  Package,
  ShieldCheck,
  RefreshCw,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useOrders } from "../../hooks/useOrders";
import { usePayment } from "../../hooks/usePayment";
import { userApi } from "../../api/user.api";
import { assignmentApi } from "../../api/assignment.api";
import { orderApi } from "../../api/order.api";
import { User as UserType } from "../../types/auth.types";
import { Assignment } from "../../types/assignment.types";
import { OrderLifecycleActionCard } from "../../components/admin/OrderLifecycleActionCard";
import { AssignPartnerModal } from "../../components/admin/AssignPartnerModal";
import { PaymentVerificationModal } from "../../components/admin/PaymentVerificationModal";
import { OrderTimeline } from "../../components/common/OrderTimeline";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { OrderStatusBadge } from "../../components/common/OrderStatusBadge";
import { PaymentStatusBadge } from "../../components/common/PaymentStatusBadge";
import { Spinner } from "../../components/common/Spinner";
import { Alert } from "../../components/common/Alert";

export const AdminOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    currentOrder,
    isFetchingDetails,
    detailsError,
    loadOrderById,
    updateOrderStatus,
    isUpdatingStatus,
  } = useOrders();

  const {
    currentPayment,
    loadPaymentByOrderId,
    verifyPayment,
    isVerifyingPayment,
  } = usePayment();

  const [partners, setPartners] = useState<UserType[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [assignmentType, setAssignmentType] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [isAssigning, setIsAssigning] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  // Load Order & Payment
  const refreshData = useCallback(async () => {
    if (!id) return;
    try {
      await Promise.all([
        loadOrderById(id),
        loadPaymentByOrderId(id),
        assignmentApi.getAllAssignments({ orderId: id }).then(setAssignments).catch(() => setAssignments([])),
      ]);
    } catch {
      // handled in store
    }
  }, [id, loadOrderById, loadPaymentByOrderId]);

  // Load partners list once
  useEffect(() => {
    userApi
      .getUsers({ role: "DELIVERY_PARTNER" })
      .then(setPartners)
      .catch(() => setPartners([]));
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handle Lifecycle Status Transition
  const handleUpdateStatus = async (newStatus: string): Promise<boolean> => {
    if (!id) return false;
    setActionErrorMessage(null);
    setActionSuccessMessage(null);
    try {
      const ok = await updateOrderStatus(id, newStatus);
      if (ok) {
        setActionSuccessMessage(`Order status updated to ${newStatus}`);
        await refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      setActionErrorMessage(err.message || "Failed to update order status");
      return false;
    }
  };

  // Open Partner Assignment Modal
  const handleOpenAssignPartner = (type: "PICKUP" | "DELIVERY") => {
    setAssignmentType(type);
    setIsAssignModalOpen(true);
  };

  // Handle Partner Assignment (Supports Pickup vs Delivery & Safe Reassignment)
  const handleAssignPartner = async (data: {
    orderId: string;
    deliveryPartnerId: string;
    assignmentType: "PICKUP" | "DELIVERY";
    notes?: string;
  }): Promise<boolean> => {
    setIsAssigning(true);
    setActionErrorMessage(null);
    setActionSuccessMessage(null);
    try {
      await assignmentApi.assignPartner({
        orderId: data.orderId,
        deliveryPartnerId: data.deliveryPartnerId,
        assignmentType: data.assignmentType,
        notes: data.notes,
      });

      setActionSuccessMessage(
        `${data.assignmentType === "PICKUP" ? "Pickup" : "Delivery"} partner assigned successfully!`
      );
      await refreshData();
      return true;
    } catch (err: any) {
      setActionErrorMessage(
        err.response?.data?.message || err.message || "Failed to assign partner."
      );
      return false;
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle Payment Verification
  const handleVerifyPayment = async (
    paymentIdOrOrderId: string,
    notes?: string
  ): Promise<boolean> => {
    setActionErrorMessage(null);
    setActionSuccessMessage(null);
    try {
      const result = await verifyPayment(paymentIdOrOrderId, {
        notes,
        verificationStatus: "VERIFIED",
      });
      if (result) {
        setActionSuccessMessage("Payment verified and approved to PAID!");
        await refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      setActionErrorMessage(err.message || "Payment verification failed.");
      return false;
    }
  };

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
        <Alert type="error" message={detailsError?.message || "Order not found."} />
        <Link to="/admin/orders" className="btn btn-secondary" style={{ marginTop: "1rem" }}>
          Back to Orders
        </Link>
      </div>
    );
  }

  // Active assignment for the current modal assignment type
  const activeAssignment = assignments.find(
    (a) => a.assignmentType === assignmentType && (a.status === "ASSIGNED" || a.status === "ACCEPTED")
  );

  const customer = typeof currentOrder.userId === "object" ? currentOrder.userId : null;
  const customerName = customer
    ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Customer"
    : "Customer";

  const totalAmount = currentOrder.pricing?.totalAmount ?? currentOrder.totalAmount ?? 0;
  const subtotal = currentOrder.pricing?.subtotal ?? currentOrder.subtotal ?? totalAmount;
  const tax = currentOrder.pricing?.tax ?? currentOrder.tax ?? 0;
  const deliveryFee = currentOrder.pricing?.deliveryCharge ?? currentOrder.deliveryFee ?? 0;
  const discount = currentOrder.pricing?.discount ?? currentOrder.discount ?? 0;

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Back Button & Top Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <Link
          to="/admin/orders"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        <Button
          variant="secondary"
          size="sm"
          onClick={refreshData}
          leftIcon={<RefreshCw size={14} />}
        >
          Refresh Order
        </Button>
      </div>

      {/* Action Banners */}
      {actionSuccessMessage && (
        <div style={{ marginBottom: "1rem" }}>
          <Alert type="success" message={actionSuccessMessage} onClose={() => setActionSuccessMessage(null)} />
        </div>
      )}
      {actionErrorMessage && (
        <div style={{ marginBottom: "1rem" }}>
          <Alert type="error" message={actionErrorMessage} onClose={() => setActionErrorMessage(null)} />
        </div>
      )}

      {/* Header Info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
              Order #{currentOrder._id.substring(currentOrder._id.length - 8).toUpperCase()}
            </h1>
            <OrderStatusBadge status={currentOrder.orderStatus || currentOrder.status} />
            <PaymentStatusBadge status={currentOrder.paymentStatus} />
          </div>
          <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            Booked on {new Date(currentOrder.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Lifecycle Actions Card */}
      <div style={{ marginBottom: "1.5rem" }}>
        <OrderLifecycleActionCard
          order={currentOrder}
          payment={currentPayment}
          onUpdateStatus={handleUpdateStatus}
          onOpenAssignPartner={handleOpenAssignPartner}
          onOpenVerifyPayment={() => setIsVerifyModalOpen(true)}
          isLoading={isUpdatingStatus}
        />
      </div>

      {/* Grid Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Left Column: Customer & Addresses */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Customer Card */}
          <Card className="fresco-card">
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1rem 0", color: "var(--text-primary)" }}>
              Customer Information
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <User size={16} color="var(--text-muted)" />
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{customerName}</span>
              </div>
              {customer?.email && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Mail size={16} color="var(--text-muted)" />
                  <a href={`mailto:${customer.email}`} style={{ fontSize: "0.875rem", color: "var(--primary)" }}>
                    {customer.email}
                  </a>
                </div>
              )}
              {customer?.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Phone size={16} color="var(--text-muted)" />
                  <a href={`tel:${customer.phone}`} style={{ fontSize: "0.875rem", color: "var(--primary)" }}>
                    {customer.phone}
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* Pickup & Delivery Addresses */}
          <Card className="fresco-card">
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1rem 0", color: "var(--text-primary)" }}>
              Address & Timing
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                  <MapPin size={16} /> Pickup Address
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", paddingLeft: "1.5rem" }}>
                  {typeof currentOrder.pickupAddress === "object" && currentOrder.pickupAddress ? (
                    <>
                      <div>{currentOrder.pickupAddress.street}</div>
                      <div>
                        {currentOrder.pickupAddress.city}, {currentOrder.pickupAddress.state} -{" "}
                        {currentOrder.pickupAddress.postalCode}
                      </div>
                    </>
                  ) : (
                    "Address specified in order"
                  )}
                  {currentOrder.pickupDate && (
                    <div style={{ marginTop: "0.25rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Calendar size={13} /> {new Date(currentOrder.pickupDate).toLocaleDateString("en-IN")}{" "}
                      {currentOrder.pickupTimeSlot && `(${currentOrder.pickupTimeSlot})`}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--success)", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                  <Truck size={16} /> Delivery Address
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", paddingLeft: "1.5rem" }}>
                  {typeof currentOrder.deliveryAddress === "object" && currentOrder.deliveryAddress ? (
                    <>
                      <div>{currentOrder.deliveryAddress.street}</div>
                      <div>
                        {currentOrder.deliveryAddress.city}, {currentOrder.deliveryAddress.state} -{" "}
                        {currentOrder.deliveryAddress.postalCode}
                      </div>
                    </>
                  ) : (
                    "Same as pickup address"
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Assignments History */}
          <Card className="fresco-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Logistics & Partner History
              </h3>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {assignments.length} assignments
              </span>
            </div>

            {assignments.length === 0 ? (
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0 }}>
                No delivery partners assigned yet. Use the action buttons above to assign a partner.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {assignments.map((assignment) => {
                  const partner =
                    typeof assignment.deliveryPartnerId === "object"
                      ? assignment.deliveryPartnerId
                      : null;
                  const partnerName = partner
                    ? `${partner.firstName || ""} ${partner.lastName || ""}`.trim() || "Delivery Partner"
                    : "Delivery Partner";

                  return (
                    <div
                      key={assignment._id}
                      style={{
                        padding: "0.75rem",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--surface-color)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--text-primary)" }}>
                          {assignment.assignmentType} ASSIGNMENT
                        </span>
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            padding: "0.125rem 0.375rem",
                            borderRadius: "var(--radius-sm)",
                            fontWeight: 600,
                            backgroundColor:
                              assignment.status === "COMPLETED"
                                ? "rgba(16, 185, 129, 0.15)"
                                : assignment.status === "CANCELLED"
                                ? "rgba(239, 68, 68, 0.15)"
                                : "rgba(59, 130, 246, 0.15)",
                            color:
                              assignment.status === "COMPLETED"
                                ? "var(--success)"
                                : assignment.status === "CANCELLED"
                                ? "var(--error)"
                                : "var(--primary)",
                          }}
                        >
                          {assignment.status}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                        Partner: <strong>{partnerName}</strong>
                        {partner?.phone && ` (${partner.phone})`}
                      </div>
                      {assignment.notes && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                          Notes: {assignment.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Order Items & Payment Breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Order Items */}
          <Card className="fresco-card">
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1rem 0", color: "var(--text-primary)" }}>
              Garment Items ({currentOrder.items?.length || 0})
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {currentOrder.items?.map((item, index) => {
                const garmentName =
                  typeof item.garmentId === "object" && item.garmentId
                    ? item.garmentId.name
                    : "Garment";
                const serviceName =
                  typeof item.serviceId === "object" && item.serviceId
                    ? item.serviceId.name
                    : "Service";

                return (
                  <div
                    key={item._id || index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingBottom: "0.75rem",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                        {garmentName}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Service: {serviceName} &bull; Qty: {item.quantity} &times; ₹{item.unitPrice}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                      ₹{item.totalPrice}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            <div style={{ marginTop: "1rem", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {tax > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                  <span>Tax (GST)</span>
                  <span>₹{tax}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "var(--success)" }}>
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "0.5rem",
                  marginTop: "0.25rem",
                }}
              >
                <span>Grand Total</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
          </Card>

          {/* Payment Details & Verification */}
          <Card className="fresco-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Payment Status
              </h3>
              <PaymentStatusBadge status={currentOrder.paymentStatus} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8125rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Method:</span>
                <span style={{ fontWeight: 600 }}>{currentOrder.paymentMethod || "CASH"}</span>
              </div>
              {currentPayment && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Verification:</span>
                    <span style={{ fontWeight: 600, color: currentPayment.verificationStatus === "VERIFIED" ? "var(--success)" : "var(--warning)" }}>
                      {currentPayment.verificationStatus || "PENDING"}
                    </span>
                  </div>
                  {currentPayment.collectionReported && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Collection:</span>
                      <span style={{ fontWeight: 600, color: "var(--success)" }}>
                        Reported by Partner
                      </span>
                    </div>
                  )}
                  {currentPayment.verifiedAt && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Verified At:</span>
                      <span>{new Date(currentPayment.verifiedAt).toLocaleDateString("en-IN")}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {(currentPayment?.verificationStatus === "PENDING" ||
              (currentOrder.paymentStatus === "PENDING" && currentPayment?.collectionReported)) && (
              <div style={{ marginTop: "1rem" }}>
                <Button
                  variant="success"
                  fullWidth
                  onClick={() => setIsVerifyModalOpen(true)}
                  leftIcon={<ShieldCheck size={16} />}
                >
                  Verify Partner Payment
                </Button>
              </div>
            )}
          </Card>

          {/* 10-Stage Visual Timeline */}
          <Card className="fresco-card">
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1rem 0", color: "var(--text-primary)" }}>
              Order Lifecycle Timeline
            </h3>
            <OrderTimeline currentStatus={currentOrder.orderStatus || currentOrder.status} />
          </Card>
        </div>
      </div>

      {/* Assign Partner Modal (Safe Pickup vs Delivery Assignment) */}
      <AssignPartnerModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        orderId={currentOrder._id}
        assignmentType={assignmentType}
        existingAssignment={activeAssignment}
        partners={partners}
        onAssign={handleAssignPartner}
        isLoading={isAssigning}
      />

      {/* Verify Payment Modal */}
      <PaymentVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        payment={currentPayment}
        onVerify={handleVerifyPayment}
        isLoading={isVerifyingPayment}
      />
    </div>
  );
};
