import React, { useState } from "react";
import { CheckCircle, ShieldCheck, DollarSign, Calendar, User, FileText } from "lucide-react";
import { Payment } from "../../types/payment.types";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Alert } from "../common/Alert";

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onVerify: (paymentIdOrOrderId: string, notes?: string) => Promise<boolean>;
  isLoading?: boolean;
}

export const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  isOpen,
  onClose,
  payment,
  onVerify,
  isLoading = false,
}) => {
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!payment) return null;

  const handleApprove = async () => {
    try {
      const success = await onVerify(payment._id, adminNotes.trim() || undefined);
      if (success) {
        onClose();
      } else {
        setErrorMsg("Failed to verify payment. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during verification.");
    }
  };

  const collectorName =
    typeof payment.collectedBy === "object" && payment.collectedBy
      ? `${payment.collectedBy.firstName} ${payment.collectedBy.lastName}`
      : "Delivery Partner";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ShieldCheck size={20} color="var(--success)" />
          <span>Verify Partner-Reported Payment</span>
        </div>
      }
      footer={
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", width: "100%" }}>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleApprove}
            isLoading={isLoading}
            leftIcon={<CheckCircle size={18} />}
          >
            Approve & Mark as PAID
          </Button>
        </div>
      }
    >
      {errorMsg && (
        <Alert
          type="error"
          message={errorMsg}
          onClose={() => setErrorMsg(null)}
        />
      )}

      <div
        style={{
          backgroundColor: "var(--surface-muted)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          marginBottom: "1.25rem",
          border: "1px solid var(--border)",
        }}
      >
        <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.75rem", textTransform: "uppercase" }}>
          Payment Audit Metadata
        </h4>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <DollarSign size={14} /> Amount Collected
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary)" }}>
              ₹{payment.amount}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              Payment Method
            </div>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>
              {payment.paymentMethod === "CASH" ? "Cash on Visit" : "UPI / QR Scan"}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <User size={14} /> Collected By
            </div>
            <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)" }}>
              {collectorName}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Calendar size={14} /> Reported At
            </div>
            <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>
              {payment.collectedAt
                ? new Date(payment.collectedAt).toLocaleString()
                : new Date(payment.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {payment.collectionNotes && (
          <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-light)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <FileText size={14} /> Collector Notes
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              "{payment.collectionNotes}"
            </div>
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="verification-notes">
          Admin Verification Notes (Optional)
        </label>
        <textarea
          id="verification-notes"
          className="form-textarea"
          rows={3}
          placeholder="e.g. Verified with cash handover at hub / confirmed transaction UTR in bank portal."
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
        />
      </div>
    </Modal>
  );
};
