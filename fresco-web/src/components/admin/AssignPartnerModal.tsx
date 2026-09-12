import React, { useState, useEffect } from "react";
import { UserCheck, Truck } from "lucide-react";
import { User } from "../../types/auth.types";
import { Assignment } from "../../types/assignment.types";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Select } from "../common/Select";
import { Alert } from "../common/Alert";

interface AssignPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  assignmentType: "PICKUP" | "DELIVERY";
  existingAssignment?: Assignment | null;
  partners: User[];
  onAssign: (data: {
    orderId: string;
    deliveryPartnerId: string;
    assignmentType: "PICKUP" | "DELIVERY";
    notes?: string;
  }) => Promise<boolean>;
  isLoading?: boolean;
}

export const AssignPartnerModal: React.FC<AssignPartnerModalProps> = ({
  isOpen,
  onClose,
  orderId,
  assignmentType,
  existingAssignment,
  partners,
  onAssign,
  isLoading = false,
}) => {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (existingAssignment) {
      const pId =
        typeof existingAssignment.deliveryPartnerId === "object"
          ? existingAssignment.deliveryPartnerId._id
          : existingAssignment.deliveryPartnerId || "";
      setSelectedPartnerId(pId);
      setNotes(existingAssignment.notes || "");
    } else if (partners.length > 0) {
      setSelectedPartnerId(partners[0]._id);
      setNotes("");
    } else {
      setSelectedPartnerId("");
      setNotes("");
    }
    setErrorMsg(null);
  }, [existingAssignment, partners, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId) {
      setErrorMsg("Please select a delivery partner.");
      return;
    }

    try {
      const success = await onAssign({
        orderId,
        deliveryPartnerId: selectedPartnerId,
        assignmentType,
        notes: notes.trim() || undefined,
      });

      if (success) {
        onClose();
      } else {
        setErrorMsg("Failed to assign delivery partner. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during assignment.");
    }
  };

  const partnerOptions = partners.map((p) => ({
    label: `${p.firstName} ${p.lastName} (${p.phone || p.email})`,
    value: p._id,
  }));

  const isReassignment = Boolean(existingAssignment);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Truck size={20} color="var(--primary)" />
          <span>
            {isReassignment ? "Reassign" : "Assign"} {assignmentType === "PICKUP" ? "Pickup" : "Delivery"} Partner
          </span>
        </div>
      }
      footer={
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", width: "100%" }}>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={partners.length === 0}
            leftIcon={<UserCheck size={18} />}
          >
            {isReassignment ? "Confirm Reassignment" : "Assign Partner"}
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

      {isReassignment && (
        <Alert
          type="info"
          message="Active Assignment Detected"
          description="Selecting a new delivery partner will safely cancel the previous active assignment and create a new active assignment."
        />
      )}

      {partners.length === 0 ? (
        <div style={{ textAlign: "center", padding: "1.5rem 0", color: "var(--text-muted)" }}>
          No active delivery partners found in the system.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <Select
              label="Select Delivery Partner"
              options={partnerOptions}
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="assignment-notes">
              Operational Notes (Optional)
            </label>
            <textarea
              id="assignment-notes"
              className="form-textarea"
              rows={3}
              placeholder="e.g. Call customer before arrival, gate code #1234, handle silk garments with extra care."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </form>
      )}
    </Modal>
  );
};
