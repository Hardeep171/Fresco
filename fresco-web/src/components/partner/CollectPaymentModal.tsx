import React, { useState } from "react";
import { DollarSign, QrCode, Banknote, CheckCircle } from "lucide-react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Alert } from "../common/Alert";
import { PaymentMethod } from "../../constants/payment.constants";

interface CollectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  onCollect: (data: {
    paymentMethod: PaymentMethod;
    amount: number;
    notes?: string;
  }) => Promise<boolean>;
  isLoading?: boolean;
}

export const CollectPaymentModal: React.FC<CollectPaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  amount,
  onCollect,
  isLoading = false,
}) => {
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [showQr, setShowQr] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      const success = await onCollect({
        paymentMethod: method,
        amount,
        notes: notes.trim() || undefined,
      });

      if (success) {
        onClose();
      } else {
        setErrorMsg("Failed to report payment collection. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <DollarSign size={20} color="var(--primary)" />
          <span>Collect Payment</span>
        </div>
      }
      footer={
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", width: "100%" }}>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            isLoading={isLoading}
            leftIcon={<CheckCircle size={18} />}
          >
            Confirm Collection (₹{amount})
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
          textAlign: "center",
          backgroundColor: "var(--primary-surface)",
          padding: "1.5rem",
          borderRadius: "var(--radius-md)",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          Order #{orderId.slice(-8).toUpperCase()} Amount Due
        </div>
        <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)", marginTop: "0.25rem" }}>
          ₹{amount}
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label className="form-label" style={{ marginBottom: "0.5rem", display: "block" }}>
          Select Collection Method
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div
            onClick={() => {
              setMethod("CASH");
              setShowQr(false);
            }}
            style={{
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              border: `2px solid ${method === "CASH" ? "var(--primary)" : "var(--border)"}`,
              backgroundColor: method === "CASH" ? "var(--primary-surface)" : "var(--surface)",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s",
            }}
          >
            <Banknote size={28} color={method === "CASH" ? "var(--primary)" : "var(--text-secondary)"} style={{ margin: "0 auto 0.5rem" }} />
            <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Cash on Visit</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Physical currency handover</div>
          </div>

          <div
            onClick={() => {
              setMethod("UPI");
              setShowQr(true);
            }}
            style={{
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              border: `2px solid ${method === "UPI" ? "var(--primary)" : "var(--border)"}`,
              backgroundColor: method === "UPI" ? "var(--primary-surface)" : "var(--surface)",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s",
            }}
          >
            <QrCode size={28} color={method === "UPI" ? "var(--primary)" : "var(--text-secondary)"} style={{ margin: "0 auto 0.5rem" }} />
            <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>UPI / QR Code</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Customer scans to pay</div>
          </div>
        </div>
      </div>

      {method === "UPI" && showQr && (
        <div
          style={{
            textAlign: "center",
            padding: "1.25rem",
            backgroundColor: "var(--surface-muted)",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.25rem",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              width: 180,
              height: 180,
              margin: "0 auto 0.75rem",
              backgroundColor: "#ffffff",
              border: "2px solid var(--border)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {/* SVG QR Code representation */}
            <svg width="150" height="150" viewBox="0 0 100 100">
              <rect width="100" height="100" fill="#ffffff" />
              {/* Corner 1 */}
              <rect x="10" y="10" width="25" height="25" fill="#1E3A8A" />
              <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
              <rect x="19" y="19" width="7" height="7" fill="#1E3A8A" />
              {/* Corner 2 */}
              <rect x="65" y="10" width="25" height="25" fill="#1E3A8A" />
              <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
              <rect x="74" y="19" width="7" height="7" fill="#1E3A8A" />
              {/* Corner 3 */}
              <rect x="10" y="65" width="25" height="25" fill="#1E3A8A" />
              <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
              <rect x="19" y="74" width="7" height="7" fill="#1E3A8A" />
              {/* Random Pattern Dots */}
              <rect x="42" y="12" width="6" height="6" fill="#1E3A8A" />
              <rect x="52" y="18" width="6" height="6" fill="#1E3A8A" />
              <rect x="42" y="28" width="6" height="6" fill="#1E3A8A" />
              <rect x="12" y="45" width="6" height="6" fill="#1E3A8A" />
              <rect x="25" y="52" width="6" height="6" fill="#1E3A8A" />
              <rect x="40" y="42" width="16" height="16" fill="#1E3A8A" />
              <rect x="65" y="45" width="6" height="6" fill="#1E3A8A" />
              <rect x="78" y="52" width="6" height="6" fill="#1E3A8A" />
              <rect x="45" y="65" width="8" height="8" fill="#1E3A8A" />
              <rect x="60" y="72" width="8" height="8" fill="#1E3A8A" />
              <rect x="75" y="65" width="8" height="8" fill="#1E3A8A" />
              <rect x="85" y="80" width="6" height="6" fill="#1E3A8A" />
            </svg>
          </div>
          <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
            Scan with any UPI app (GPay, PhonePe, Paytm)
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>
            UPI ID: fresco.care@upi • Amount: ₹{amount}
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="collect-notes">
          Collection Notes (Optional)
        </label>
        <textarea
          id="collect-notes"
          className="form-textarea"
          rows={2}
          placeholder="e.g. Received exact cash from customer / UTR #123456"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
        * Note: Payment reported by partner will be submitted for Admin audit and verified before final settlement.
      </div>
    </Modal>
  );
};
