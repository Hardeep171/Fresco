import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  Search,
  RefreshCw,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  User,
} from "lucide-react";
import { paymentApi } from "../../api/payment.api";
import { Payment } from "../../types/payment.types";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { PaymentStatusBadge } from "../../components/common/PaymentStatusBadge";
import { PaymentVerificationModal } from "../../components/admin/PaymentVerificationModal";
import { Spinner } from "../../components/common/Spinner";
import { Alert } from "../../components/common/Alert";

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Verification modal
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: any = {};
      if (selectedFilter === "PENDING_VERIFICATION") {
        filters.verificationStatus = "PENDING";
      } else if (selectedFilter !== "ALL") {
        filters.status = selectedFilter;
      }
      const data = await paymentApi.getPayments(filters);
      setPayments(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load payments.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [selectedFilter]);

  const handleVerify = async (paymentIdOrOrderId: string, notes?: string): Promise<boolean> => {
    setIsVerifying(true);
    setError(null);
    try {
      await paymentApi.verifyPayment(paymentIdOrOrderId, {
        notes,
        verificationStatus: "VERIFIED",
      });
      setSuccessMsg("Payment verified and approved successfully.");
      setIsVerifyModalOpen(false);
      await fetchPayments();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Verification failed.");
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const orderId =
      typeof p.orderId === "object" ? p.orderId._id : p.orderId || "";
    return orderId.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
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
            Payment & Verification Ledger
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
            Track transactions, partner-reported cash collections, and admin payment approvals.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button variant="secondary" size="sm" onClick={fetchPayments} leftIcon={<RefreshCw size={14} />}>
            Refresh
          </Button>
        </div>
      </div>

      {successMsg && (
        <div style={{ marginBottom: "1rem" }}>
          <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />
        </div>
      )}

      {error && (
        <div style={{ marginBottom: "1rem" }}>
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1rem",
          overflowX: "auto",
          paddingBottom: "0.25rem",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {[
          { label: "All Payments", value: "ALL" },
          { label: "Pending Verification", value: "PENDING_VERIFICATION" },
          { label: "Paid", value: "PAID" },
          { label: "Pending", value: "PENDING" },
          { label: "Failed", value: "FAILED" },
          { label: "Refunded", value: "REFUNDED" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedFilter(tab.value)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-md)",
              border: "none",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              backgroundColor: selectedFilter === tab.value ? "var(--primary)" : "var(--card-bg)",
              color: selectedFilter === tab.value ? "#ffffff" : "var(--text-secondary)",
              boxShadow: selectedFilter === tab.value ? "var(--shadow-sm)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="catalog-search-wrapper" style={{ marginBottom: "1.5rem" }}>
        <Input
          placeholder="Search by Order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search size={16} />}
        />
      </div>

      {/* Payment Cards Grid */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
          <Spinner size="lg" color="var(--primary)" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <Card className="fresco-card">
          <div style={{ padding: "4rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
            <CreditCard size={48} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>
              No payments found
            </h3>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>
              No transaction entries match the current filter.
            </p>
          </div>
        </Card>
      ) : (
        <div className="admin-card-grid-3">
          {filteredPayments.map((payment) => {
            const orderId =
              typeof payment.orderId === "object" ? payment.orderId._id : payment.orderId;
            const collectorName =
              typeof payment.collectedBy === "object" && payment.collectedBy
                ? `${payment.collectedBy.firstName} ${payment.collectedBy.lastName}`
                : "—";

            const isPendingVerification =
              payment.verificationStatus === "PENDING" ||
              (payment.status === "PENDING" && payment.collectionReported);

            return (
              <Card
                key={payment._id}
                className="fresco-card fresco-card-hover"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "1.25rem",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {/* Top: Order ID & Payment Method */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                        Order Reference
                      </div>
                      <Link
                        to={`/admin/orders/${orderId}`}
                        style={{
                          fontWeight: 700,
                          fontSize: "1.0625rem",
                          color: "var(--primary)",
                          display: "inline-block",
                          marginTop: "0.15rem",
                        }}
                      >
                        #{orderId?.substring(orderId.length - 8).toUpperCase()}
                      </Link>
                    </div>

                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "0.25rem 0.6rem",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "rgba(30, 58, 138, 0.08)",
                        color: "var(--primary)",
                        textTransform: "uppercase",
                      }}
                    >
                      {payment.paymentMethod || "CASH"}
                    </span>
                  </div>

                  {/* Financial & Status Metrics */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.2fr 1fr",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      backgroundColor: "var(--surface-muted)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                        Amount
                      </div>
                      <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.15rem" }}>
                        ₹{payment.amount}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500, marginBottom: "0.25rem" }}>
                        Payment Status
                      </div>
                      <PaymentStatusBadge status={payment.status} />
                    </div>
                  </div>

                  {/* Verification & Collector row */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      fontSize: "0.8125rem",
                      padding: "0.625rem 0.75rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--text-muted)" }}>Verification:</span>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          padding: "0.15rem 0.45rem",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor:
                            payment.verificationStatus === "VERIFIED"
                              ? "rgba(16, 185, 129, 0.15)"
                              : isPendingVerification
                              ? "rgba(245, 158, 11, 0.15)"
                              : "rgba(107, 114, 128, 0.15)",
                          color:
                            payment.verificationStatus === "VERIFIED"
                              ? "var(--success)"
                              : isPendingVerification
                              ? "var(--warning)"
                              : "var(--text-muted)",
                        }}
                      >
                        {payment.verificationStatus || (payment.collectionReported ? "REPORTED" : "NONE")}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <User size={13} /> Collector:
                      </span>
                      <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                        {collectorName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--border-light)" }}>
                  {isPendingVerification ? (
                    <Button
                      variant="success"
                      size="sm"
                      fullWidth
                      onClick={() => {
                        setSelectedPayment(payment);
                        setIsVerifyModalOpen(true);
                      }}
                      leftIcon={<ShieldCheck size={14} />}
                      style={{ minHeight: "40px" }}
                    >
                      Verify & Approve
                    </Button>
                  ) : (
                    <Link
                      to={`/admin/orders/${orderId}`}
                      className="btn btn-secondary btn-sm"
                      style={{ width: "100%", justifyContent: "center", minHeight: "40px" }}
                    >
                      View Order Details
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Verification Modal */}
      <PaymentVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        payment={selectedPayment}
        onVerify={handleVerify}
        isLoading={isVerifying}
      />
    </div>
  );
};
