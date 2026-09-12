import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { useCatalog } from "../../hooks/useCatalog";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { EmptyState } from "../../components/common/EmptyState";
import { Spinner } from "../../components/common/Spinner";
import { Alert } from "../../components/common/Alert";

export const CartPage: React.FC = () => {
  const {
    enrichedItems,
    totalAmount,
    totalItemCount,
    isLoading,
    isMutating,
    mutatingItemId,
    error,
    loadCart,
    updateQuantity,
    removeItem,
    clearCart,
    clearErrors,
  } = useCart();

  const { loadInitialCatalog } = useCatalog();
  const navigate = useNavigate();

  useEffect(() => {
    loadInitialCatalog();
    loadCart();
  }, [loadInitialCatalog, loadCart]);

  if (isLoading && enrichedItems.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}>
        <Spinner size="lg" color="var(--primary)" />
      </div>
    );
  }

  if (enrichedItems.length === 0) {
    return (
      <div style={{ maxWidth: "32rem", margin: "2rem auto" }}>
        <EmptyState
          icon={<ShoppingBag size={36} />}
          title="Your care basket is empty"
          description="You haven't added any garments or services yet. Select items from our catalog to get started."
          action={
            <Link to="/catalog" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <Sparkles size={16} /> Explore Catalog
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>
            Your Care Basket
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Review your selected garments and services
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => clearCart()}
          disabled={isMutating}
          leftIcon={<Trash2 size={16} />}
          style={{ color: "var(--error)" }}
        >
          Clear Basket
        </Button>
      </div>

      {error && (
        <Alert
          type="error"
          message={error.message || "Failed to update basket"}
          onClose={clearErrors}
        />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="cart-grid">
        {/* Items List */}
        <div>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {enrichedItems.map((item, index) => {
                const isItemUpdating = isMutating && mutatingItemId === item._id;
                const itemTotal = (item.unitPrice || 0) * item.quantity;

                return (
                  <div
                    key={item._id || index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingBottom: "1rem",
                      borderBottom:
                        index < enrichedItems.length - 1
                          ? "1px solid var(--border-light)"
                          : "none",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    {/* Garment & Service Info */}
                    <div style={{ flex: 1, minWidth: "14rem" }}>
                      <div style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--text-primary)" }}>
                        {item.garmentName}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "var(--primary)", fontWeight: 500 }}>
                        {item.serviceName}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>
                        ₹{item.unitPrice} per piece
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item._id, item.quantity - 1);
                          } else {
                            removeItem(item._id);
                          }
                        }}
                        disabled={isItemUpdating}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "var(--radius-full)",
                          border: "1px solid var(--border-dark)",
                          backgroundColor: "var(--surface)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>

                      <span style={{ minWidth: "1.75rem", textAlign: "center", fontWeight: 700, fontSize: "1rem" }}>
                        {isItemUpdating ? <Spinner size="sm" /> : item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={isItemUpdating}
                        style={{
                          width: 32,
                          height: 32,
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
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Total & Remove */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", minWidth: "6rem", justifyContent: "flex-end" }}>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--primary)" }}>
                          ₹{itemTotal}
                        </span>
                      </div>

                      <button
                        onClick={() => removeItem(item._id)}
                        disabled={isItemUpdating}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          padding: "0.25rem",
                          display: "flex",
                          alignItems: "center",
                        }}
                        aria-label="Remove item"
                        title="Remove from basket"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Order Summary Box */}
        <div>
          <Card title="Order Summary">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9375rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Total Garments</span>
                <span style={{ fontWeight: 600 }}>{totalItemCount} pieces</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>₹{totalAmount}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Doorstep Pickup & Delivery</span>
                <span style={{ color: "var(--success)", fontWeight: 600 }}>FREE</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Quality Inspection</span>
                <span style={{ color: "var(--success)", fontWeight: 600 }}>INCLUDED</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "0.5rem",
                  paddingTop: "0.75rem",
                  borderTop: "2px solid var(--border)",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: "1.125rem" }}>Grand Total</span>
                <span style={{ fontWeight: 800, fontSize: "1.5rem", color: "var(--primary)" }}>
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <Button
                variant="primary"
                size="lg"
                style={{ width: "100%" }}
                onClick={() => navigate("/checkout")}
                rightIcon={<ArrowRight size={18} />}
              >
                Proceed to Checkout
              </Button>
            </div>

            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <Link to="/catalog" style={{ fontSize: "0.875rem", color: "var(--primary)", fontWeight: 600 }}>
                + Add more garments
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .cart-grid {
            grid-template-columns: 2fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
