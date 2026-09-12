import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardCheck,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertTriangle,
  FileText,
  Tag,
  Plus,
} from "lucide-react";
import { inspectionApi } from "../../api/inspection.api";
import { orderApi } from "../../api/order.api";
import { Inspection, InspectionItem } from "../../types/inspection.types";
import { Order } from "../../types/order.types";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Modal } from "../../components/common/Modal";
import { Spinner } from "../../components/common/Spinner";
import { Alert } from "../../components/common/Alert";

export const AdminInspectionPage: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Selected inspection for details / review modal
  const [activeInspection, setActiveInspection] = useState<Inspection | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchInspections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inspectionApi.getInspections({
        status: selectedStatus !== "ALL" ? selectedStatus : undefined,
      });
      setInspections(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load inspections.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [selectedStatus]);

  const handleSubmitInspection = async (inspectionId: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await inspectionApi.submitInspection(inspectionId);
      setSuccessMsg("Inspection completed and submitted successfully.");
      setIsDetailModalOpen(false);
      await fetchInspections();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to submit inspection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInspections = inspections.filter((ins) => {
    const orderId =
      typeof ins.orderId === "object" ? ins.orderId._id : ins.orderId || "";
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
            Garment Inspections
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
            Audit incoming apparel condition, pre-existing stains, damages, and adjust wash charges.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button variant="secondary" size="sm" onClick={fetchInspections} leftIcon={<RefreshCw size={14} />}>
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

      {/* Status Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {[
          { label: "All Inspections", value: "ALL" },
          { label: "Draft", value: "DRAFT" },
          { label: "Submitted", value: "SUBMITTED" },
          { label: "Approved", value: "APPROVED" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedStatus(tab.value)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-md)",
              border: "none",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: selectedStatus === tab.value ? "var(--primary)" : "var(--card-bg)",
              color: selectedStatus === tab.value ? "#ffffff" : "var(--text-secondary)",
              boxShadow: selectedStatus === tab.value ? "var(--shadow-sm)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
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
        ) : filteredInspections.length === 0 ? (
          <div style={{ padding: "4rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
            <ClipboardCheck size={48} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>
              No inspections found
            </h3>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>
              Inspections are automatically created when orders arrive for cleaning.
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
                    Items Count
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Status
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Adjustments
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Created Date
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInspections.map((ins) => {
                  const orderId =
                    typeof ins.orderId === "object" ? ins.orderId._id : ins.orderId;
                  const adjustment = ins.pricingSummary?.adjustmentAmount || 0;

                  return (
                    <tr key={ins._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "0.875rem 1rem", fontWeight: 700, fontSize: "0.875rem" }}>
                        <Link
                          to={`/admin/orders/${orderId}`}
                          style={{ color: "var(--primary)", textDecoration: "none" }}
                        >
                          #{orderId?.substring(orderId.length - 8).toUpperCase()}
                        </Link>
                      </td>

                      <td style={{ padding: "0.875rem 1rem", fontSize: "0.875rem" }}>
                        {ins.items?.length || 0} inspected garment(s)
                      </td>

                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.5rem",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor:
                              ins.status === "APPROVED" || ins.status === "SUBMITTED"
                                ? "rgba(16, 185, 129, 0.15)"
                                : ins.status === "DRAFT"
                                ? "rgba(245, 158, 11, 0.15)"
                                : "rgba(107, 114, 128, 0.15)",
                            color:
                              ins.status === "APPROVED" || ins.status === "SUBMITTED"
                                ? "var(--success)"
                                : ins.status === "DRAFT"
                                ? "var(--warning)"
                                : "var(--text-muted)",
                          }}
                        >
                          {ins.status}
                        </span>
                      </td>

                      <td style={{ padding: "0.875rem 1rem", fontSize: "0.875rem", fontWeight: 600 }}>
                        {adjustment === 0 ? "₹0" : `₹${adjustment}`}
                      </td>

                      <td style={{ padding: "0.875rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                        {new Date(ins.createdAt).toLocaleDateString("en-IN")}
                      </td>

                      <td style={{ padding: "0.875rem 1rem", textAlign: "right" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setActiveInspection(ins);
                            setIsDetailModalOpen(true);
                          }}
                          leftIcon={<Eye size={14} />}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Review Modal */}
      {activeInspection && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Inspection Audit Details"
          footer={
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
              {activeInspection.status === "DRAFT" && (
                <Button
                  variant="success"
                  onClick={() => handleSubmitInspection(activeInspection._id)}
                  isLoading={isSubmitting}
                  leftIcon={<CheckCircle size={16} />}
                >
                  Approve & Submit Inspection
                </Button>
              )}
            </div>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                Status: <strong>{activeInspection.status}</strong>
              </span>
              {activeInspection.notes && (
                <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                  Notes: {activeInspection.notes}
                </span>
              )}
            </div>

            <div>
              <h4 style={{ fontSize: "0.875rem", fontWeight: 700, margin: "0 0 0.5rem 0" }}>
                Inspected Items
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {activeInspection.items?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--surface-color)",
                      border: "1px solid var(--border-color)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        {item.garmentName} ({item.serviceName})
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Condition: <strong style={{ color: item.condition === "NORMAL" ? "var(--success)" : "var(--warning)" }}>{item.condition}</strong>
                        {item.damageNotes && ` — ${item.damageNotes}`}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>₹{item.totalPrice}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Qty: {item.inspectedQuantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {activeInspection.pricingSummary && (
              <div
                style={{
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "0.75rem",
                  fontSize: "0.875rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Inspected Subtotal:</span>
                  <span>₹{activeInspection.pricingSummary.inspectedSubtotal || 0}</span>
                </div>
                {activeInspection.pricingSummary.extraServiceCharges > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Extra Service Charges:</span>
                    <span>₹{activeInspection.pricingSummary.extraServiceCharges}</span>
                  </div>
                )}
                {activeInspection.pricingSummary.adjustmentAmount !== 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--primary)" }}>
                    <span>Adjustment:</span>
                    <span>₹{activeInspection.pricingSummary.adjustmentAmount}</span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 800,
                    marginTop: "0.5rem",
                    borderTop: "1px dashed var(--border-color)",
                    paddingTop: "0.5rem",
                  }}
                >
                  <span>Final Total:</span>
                  <span>₹{activeInspection.pricingSummary.finalTotalAmount || 0}</span>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
