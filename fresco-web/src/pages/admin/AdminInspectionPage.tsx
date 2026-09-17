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
              whiteSpace: "nowrap",
              flexShrink: 0,
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
      <div className="catalog-search-wrapper" style={{ marginBottom: "1.5rem" }}>
        <Input
          placeholder="Search by Order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search size={16} />}
        />
      </div>

      {/* Table */}
      {/* Inspection Cards Grid */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
          <Spinner size="lg" color="var(--primary)" />
        </div>
      ) : filteredInspections.length === 0 ? (
        <Card className="fresco-card">
          <div style={{ padding: "4rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
            <ClipboardCheck size={48} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>
              No inspections found
            </h3>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>
              Inspections are automatically created when orders arrive for cleaning.
            </p>
          </div>
        </Card>
      ) : (
        <div className="admin-card-grid-3">
          {filteredInspections.map((ins) => {
            const orderId =
              typeof ins.orderId === "object" ? ins.orderId._id : ins.orderId;
            const adjustment = ins.pricingSummary?.adjustmentAmount || 0;
            const issueCount =
              ins.items?.filter((it) => it.condition !== "NORMAL" || Boolean(it.damageNotes)).length || 0;

            return (
              <Card
                key={ins._id}
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
                  {/* Top: Order Ref + Status */}
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
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {ins.status}
                    </span>
                  </div>

                  {/* Summary Box */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      backgroundColor: "var(--surface-muted)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                        Items Checked
                      </div>
                      <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "0.15rem" }}>
                        {ins.items?.length || 0} garment{ins.items?.length === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                        Adjustment
                      </div>
                      <div style={{ fontSize: "1.125rem", fontWeight: 700, color: adjustment > 0 ? "var(--warning)" : "var(--text-primary)", marginTop: "0.15rem" }}>
                        {adjustment === 0 ? "₹0" : `₹${adjustment}`}
                      </div>
                    </div>
                  </div>

                  {/* Details metadata */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8125rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>Date:</span>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                      {new Date(ins.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  {issueCount > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.75rem",
                        color: "var(--warning)",
                        fontWeight: 600,
                        padding: "0.3rem 0.5rem",
                        backgroundColor: "rgba(245, 158, 11, 0.1)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      <AlertTriangle size={13} />
                      <span>{issueCount} item(s) flagged with damage/stains</span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--border-light)" }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setActiveInspection(ins);
                      setIsDetailModalOpen(true);
                    }}
                    leftIcon={<Eye size={14} />}
                    style={{ minHeight: "40px" }}
                  >
                    Audit & Review Details
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

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
