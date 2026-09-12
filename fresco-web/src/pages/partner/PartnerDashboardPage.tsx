import React, { useEffect, useState, useMemo } from "react";
import {
  Truck,
  CheckCircle,
  Clock,
  RefreshCw,
  ShoppingBag,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { usePartnerAssignments } from "../../hooks/usePartnerAssignments";
import { paymentApi } from "../../api/payment.api";
import { orderApi } from "../../api/order.api";
import { Assignment } from "../../types/assignment.types";
import { Order } from "../../types/order.types";
import { PaymentMethod } from "../../constants/payment.constants";
import { PartnerTaskCard } from "../../components/partner/PartnerTaskCard";
import { CollectPaymentModal } from "../../components/partner/CollectPaymentModal";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Spinner } from "../../components/common/Spinner";
import { Alert } from "../../components/common/Alert";

export const PartnerDashboardPage: React.FC = () => {
  const {
    assignments,
    isFetchingAssignments,
    loadAssignments,
    acceptAssignment,
    completeAssignment,
    isAcceptingAssignment,
    isCompletingAssignment,
  } = usePartnerAssignments();

  const [filterTab, setFilterTab] = useState<"ACTIVE" | "COMPLETED" | "ALL">("ACTIVE");
  const [orderDetailsMap, setOrderDetailsMap] = useState<Record<string, Order>>({});
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Payment Collection Modal
  const [collectModalOpen, setCollectModalOpen] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [isCollecting, setIsCollecting] = useState<boolean>(false);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // Load order details for each assignment so addresses and totals render nicely
  useEffect(() => {
    if (assignments.length === 0) return;

    const fetchAssociatedOrders = async () => {
      setIsLoadingOrders(true);
      const newMap: Record<string, Order> = { ...orderDetailsMap };
      const missingOrderIds = assignments
        .map((a) => (typeof a.orderId === "object" ? a.orderId._id : a.orderId))
        .filter((id) => id && !newMap[id]);

      if (missingOrderIds.length > 0) {
        await Promise.all(
          missingOrderIds.map(async (oId) => {
            try {
              const res = await orderApi.getOrderById(oId);
              if (res) newMap[oId] = res;
            } catch {
              // ignore
            }
          })
        );
        setOrderDetailsMap(newMap);
      }
      setIsLoadingOrders(false);
    };

    fetchAssociatedOrders();
  }, [assignments]);

  // Actions
  const handleAcceptTask = async (assignmentId: string): Promise<boolean> => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const ok = await acceptAssignment(assignmentId);
    if (ok) {
      setSuccessMessage("Task accepted! Proceed to the customer location.");
      await loadAssignments();
      return true;
    }
    setErrorMessage("Failed to accept task.");
    return false;
  };

  const handleCompleteTask = async (assignmentId: string): Promise<boolean> => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const ok = await completeAssignment(assignmentId);
    if (ok) {
      setSuccessMessage("Task marked as completed!");
      await loadAssignments();
      return true;
    }
    setErrorMessage("Failed to complete task.");
    return false;
  };

  const handleOpenCollectPayment = (orderId: string, amount: number) => {
    setSelectedOrderId(orderId);
    setSelectedAmount(amount);
    setCollectModalOpen(true);
  };

  const handleReportPayment = async (data: {
    paymentMethod: PaymentMethod;
    amount: number;
    notes?: string;
  }): Promise<boolean> => {
    setIsCollecting(true);
    setErrorMessage(null);
    try {
      await paymentApi.reportPaymentCollected(selectedOrderId, {
        paymentMethod: data.paymentMethod,
        amount: data.amount,
        notes: data.notes,
      });

      setSuccessMessage(
        `Payment of ₹${data.amount} reported via ${data.paymentMethod}. Awaiting Admin verification.`
      );
      setCollectModalOpen(false);
      await loadAssignments();
      return true;
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || err.message || "Failed to record payment collection."
      );
      return false;
    } finally {
      setIsCollecting(false);
    }
  };

  // Filter tasks
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (filterTab === "ACTIVE") {
        return a.status === "ASSIGNED" || a.status === "ACCEPTED";
      }
      if (filterTab === "COMPLETED") {
        return a.status === "COMPLETED";
      }
      return true;
    });
  }, [assignments, filterTab]);

  const activePickups = assignments.filter(
    (a) => a.assignmentType === "PICKUP" && (a.status === "ASSIGNED" || a.status === "ACCEPTED")
  ).length;

  const activeDeliveries = assignments.filter(
    (a) => a.assignmentType === "DELIVERY" && (a.status === "ASSIGNED" || a.status === "ACCEPTED")
  ).length;

  const completedCount = assignments.filter((a) => a.status === "COMPLETED").length;

  return (
    <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Partner Dispatch Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
            Accept and fulfill clothes pickups and deliveries assigned to you.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => loadAssignments()}
          isLoading={isFetchingAssignments}
          leftIcon={<RefreshCw size={14} />}
        >
          Refresh Tasks
        </Button>
      </div>

      {successMessage && (
        <div style={{ marginBottom: "1rem" }}>
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
        </div>
      )}

      {errorMessage && (
        <div style={{ marginBottom: "1rem" }}>
          <Alert type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
        </div>
      )}

      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <Card className="fresco-card" style={{ padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
              }}
            >
              <Truck size={18} />
            </div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {activePickups}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Active Pickups
              </div>
            </div>
          </div>
        </Card>

        <Card className="fresco-card" style={{ padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--warning)",
              }}
            >
              <ShoppingBag size={18} />
            </div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {activeDeliveries}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Active Deliveries
              </div>
            </div>
          </div>
        </Card>

        <Card className="fresco-card" style={{ padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--success)",
              }}
            >
              <CheckCircle size={18} />
            </div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {completedCount}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Completed Tasks
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setFilterTab("ACTIVE")}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "var(--radius-md)",
            border: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            backgroundColor: filterTab === "ACTIVE" ? "var(--primary)" : "var(--card-bg)",
            color: filterTab === "ACTIVE" ? "#ffffff" : "var(--text-secondary)",
            boxShadow: filterTab === "ACTIVE" ? "var(--shadow-sm)" : "none",
          }}
        >
          Active Tasks ({activePickups + activeDeliveries})
        </button>

        <button
          onClick={() => setFilterTab("COMPLETED")}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "var(--radius-md)",
            border: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            backgroundColor: filterTab === "COMPLETED" ? "var(--primary)" : "var(--card-bg)",
            color: filterTab === "COMPLETED" ? "#ffffff" : "var(--text-secondary)",
            boxShadow: filterTab === "COMPLETED" ? "var(--shadow-sm)" : "none",
          }}
        >
          Completed ({completedCount})
        </button>

        <button
          onClick={() => setFilterTab("ALL")}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "var(--radius-md)",
            border: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            backgroundColor: filterTab === "ALL" ? "var(--primary)" : "var(--card-bg)",
            color: filterTab === "ALL" ? "#ffffff" : "var(--text-secondary)",
            boxShadow: filterTab === "ALL" ? "var(--shadow-sm)" : "none",
          }}
        >
          All ({assignments.length})
        </button>
      </div>

      {/* Task Cards List */}
      {isFetchingAssignments && assignments.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
          <Spinner size="lg" color="var(--primary)" />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card className="fresco-card" style={{ padding: "4rem 1rem", textAlign: "center" }}>
          <Truck size={48} style={{ margin: "0 auto 1rem", opacity: 0.4, color: "var(--text-muted)" }} />
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>
            No tasks found
          </h3>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>
            {filterTab === "ACTIVE"
              ? "You're all caught up! New pickup or delivery assignments will appear here."
              : "No tasks match this filter."}
          </p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredAssignments.map((assignment) => {
            const oId =
              typeof assignment.orderId === "object"
                ? assignment.orderId._id
                : assignment.orderId;
            const orderObj = orderDetailsMap[oId] || (typeof assignment.orderId === "object" ? assignment.orderId : null);

            return (
              <PartnerTaskCard
                key={assignment._id}
                assignment={assignment}
                order={orderObj as Order}
                onAccept={handleAcceptTask}
                onComplete={handleCompleteTask}
                onOpenCollectPayment={handleOpenCollectPayment}
                isLoading={isAcceptingAssignment || isCompletingAssignment}
              />
            );
          })}
        </div>
      )}

      {/* Payment Collection Modal */}
      <CollectPaymentModal
        isOpen={collectModalOpen}
        onClose={() => setCollectModalOpen(false)}
        orderId={selectedOrderId}
        amount={selectedAmount}
        onCollect={handleReportPayment}
        isLoading={isCollecting}
      />
    </div>
  );
};
