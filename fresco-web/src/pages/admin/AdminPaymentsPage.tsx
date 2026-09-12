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
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", overflowX: "auto" }}>
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
      <div style={{ maxWidth: "360px", marginBottom: "1.5rem" }}>
        <Input
          placeholder="Search by Order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search size={16} />}
        />
      </div>

      {/* Table */}
      <Card className="fresco-card">
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <Spinner size="lg" color="var(--primary)" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div style={{ padding: "4rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
            <CreditCard size={48} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>
              No payments found
            </h3>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>
              No transaction entries match the current filter.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="fresco-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Order ID
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Amount
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Method
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Status
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Verification
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Collector
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
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
                    <tr key={payment._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "0.875rem 1rem", fontWeight: 700, fontSize: "0.875rem" }}>
                        <Link
                          to={`/admin/orders/${orderId}`}
                          style={{ color: "var(--primary)", textDecoration: "none" }}
                        >
                          #{orderId?.substring(orderId.length - 8).toUpperCase()}
                        </Link>
                      </td>

                      <td style={{ padding: "0.875rem 1rem", fontWeight: 800, fontSize: "0.9375rem" }}>
                        ₹{payment.amount}
                      </td>

                      <td style={{ padding: "0.875rem 1rem", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                        {payment.paymentMethod || "CASH"}
                      </td>

                      <td style={{ padding: "0.875rem 1rem" }}>
                        <PaymentStatusBadge status={payment.status} />
                      </td>

                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.5rem",
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
                      </td>

                      <td style={{ padding: "0.875rem 1rem", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                        {collectorName}
                      </td>

                      <td style={{ padding: "0.875rem 1rem", textAlign: "right" }}>
                        {isPendingVerification ? (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setIsVerifyModalOpen(true);
                            }}
                            leftIcon={<ShieldCheck size={14} />}
                          >
                            Verify
                          </Button>
                        ) : (
                          <Link
                            to={`/admin/orders/${orderId}`}
                            className="btn btn-secondary btn-sm"
                          >
                            Order Details
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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
