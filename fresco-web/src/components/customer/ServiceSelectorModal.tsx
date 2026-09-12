import React, { useState, useEffect } from "react";
import { Plus, Minus, Check, ShoppingBag, Sparkles } from "lucide-react";
import { Garment, ServiceOptionWithPrice } from "../../types/catalog.types";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Alert } from "../common/Alert";

interface ServiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  garment: Garment | null;
  serviceOptions: ServiceOptionWithPrice[];
  onAddToCart: (garmentId: string, serviceId: string, quantity: number) => Promise<boolean>;
  isLoading?: boolean;
}

export const ServiceSelectorModal: React.FC<ServiceSelectorModalProps> = ({
  isOpen,
  onClose,
  garment,
  serviceOptions,
  onAddToCart,
  isLoading = false,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (serviceOptions.length > 0) {
      setSelectedServiceId(serviceOptions[0].service._id);
    } else {
      setSelectedServiceId("");
    }
    setQuantity(1);
    setErrorMsg(null);
  }, [garment, serviceOptions, isOpen]);

  if (!garment) return null;

  const activeOption = serviceOptions.find(
    (opt) => opt.service._id === selectedServiceId
  );
  const unitPrice = activeOption?.pricing.price || 0;
  const totalPrice = unitPrice * quantity;

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAdd = async () => {
    if (!selectedServiceId) {
      setErrorMsg("Please select a fabric care service.");
      return;
    }

    try {
      const success = await onAddToCart(garment._id, selectedServiceId, quantity);
      if (success) {
        onClose();
      } else {
        setErrorMsg("Failed to add garment to cart. Please try again.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while adding to cart.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>{garment.icon || <Sparkles size={20} />}</span>
          <span>Select Care Service — {garment.name}</span>
        </div>
      }
      footer={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div>
            <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Total: </span>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary)" }}>
              ₹{totalPrice}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAdd}
              isLoading={isLoading}
              disabled={!activeOption}
              leftIcon={<ShoppingBag size={18} />}
            >
              Add to Cart
            </Button>
          </div>
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

      {serviceOptions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-muted)" }}>
          No services are currently configured for this garment.
        </div>
      ) : (
        <div>
          <h4
            style={{
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: "0.75rem",
            }}
          >
            Available Services
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {serviceOptions.map((opt) => {
              const isSelected = opt.service._id === selectedServiceId;
              return (
                <div
                  key={opt.service._id}
                  onClick={() => setSelectedServiceId(opt.service._id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${
                      isSelected ? "var(--primary)" : "var(--border)"
                    }`,
                    backgroundColor: isSelected
                      ? "var(--primary-surface)"
                      : "var(--surface)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: `2px solid ${
                          isSelected ? "var(--primary)" : "var(--border-dark)"
                        }`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isSelected ? "var(--primary)" : "transparent",
                      }}
                    >
                      {isSelected && <Check size={12} color="#ffffff" strokeWidth={3} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {opt.service.name}
                      </div>
                      {opt.service.description && (
                        <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                          {opt.service.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--primary)" }}>
                      ₹{opt.pricing.price}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                      per piece
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quantity Selector */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem",
              backgroundColor: "var(--surface-muted)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Quantity</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                Select number of garments
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= 1 || isLoading}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border-dark)",
                  backgroundColor: "var(--surface)",
                  cursor: quantity > 1 ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: quantity <= 1 ? 0.5 : 1,
                }}
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>

              <span
                style={{
                  minWidth: "2rem",
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  color: "var(--text-primary)",
                }}
              >
                {quantity}
              </span>

              <button
                type="button"
                onClick={handleIncrement}
                disabled={isLoading}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border-dark)",
                  backgroundColor: "var(--surface)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
