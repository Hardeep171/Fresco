import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, CheckCircle } from "lucide-react";
import { useCatalog } from "../../hooks/useCatalog";
import { useCart } from "../../hooks/useCart";
import { Garment } from "../../types/catalog.types";
import { GarmentCard } from "../../components/customer/GarmentCard";
import { ServiceSelectorModal } from "../../components/customer/ServiceSelectorModal";
import { Spinner } from "../../components/common/Spinner";
import { Alert } from "../../components/common/Alert";
import { EmptyState } from "../../components/common/EmptyState";

export const CatalogPage: React.FC = () => {
  const {
    categories,
    garments,
    pricingList,
    isLoading,
    error,
    loadInitialCatalog,
    loadGarments,
    getServicesForGarment,
  } = useCatalog();

  const { addItem, totalItemCount } = useCart();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [activeGarment, setActiveGarment] = useState<Garment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [cartSuccessMessage, setCartSuccessMessage] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadInitialCatalog();
  }, [loadInitialCatalog]);

  // Once categories load, default to the first active category and load its garments
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      const firstCat = categories[0];
      setSelectedCategoryId(firstCat._id);
      loadGarments({ categoryId: firstCat._id, isActive: true });
    }
  }, [categories, selectedCategoryId, loadGarments]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategoryId(catId);
    loadGarments({ categoryId: catId, isActive: true });
  };

  const handleSelectGarment = (garment: Garment) => {
    setActiveGarment(garment);
    setModalOpen(true);
  };

  const handleAddToCart = async (
    garmentId: string,
    serviceId: string,
    quantity: number
  ): Promise<boolean> => {
    setIsAdding(true);
    try {
      const success = await addItem({ garmentId, serviceId, quantity });
      if (success) {
        setCartSuccessMessage(
          `Added ${quantity} ${activeGarment?.name || "item"}${quantity > 1 ? "s" : ""} to cart!`
        );
        setTimeout(() => setCartSuccessMessage(null), 4000);
        return true;
      }
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  const getStartingPrice = (garmentId: string): number => {
    const prices = pricingList
      .filter((p) => p.garmentId === garmentId && p.isActive)
      .map((p) => p.price);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const activeCategory = categories.find((c) => c._id === selectedCategoryId);

  return (
    <div>
      {/* Banner / Header */}
      <div
        style={{
          backgroundColor: "var(--primary)",
          borderRadius: "var(--radius-lg)",
          color: "#ffffff",
          padding: "2.5rem 2rem",
          marginBottom: "2rem",
          backgroundImage: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
        }}
      >
        <div style={{ maxWidth: "36rem" }}>
          <span
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "0.25rem 0.625rem",
              borderRadius: "var(--radius-full)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Premium Laundry & Care
          </span>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.75rem", marginBottom: "0.5rem" }}>
            Garment Care Catalog
          </h1>
          <p style={{ fontSize: "1rem", opacity: 0.9, lineHeight: 1.5 }}>
            Choose from our extensive selection of garments and tailor each item with professional washing, dry cleaning, or steam pressing.
          </p>
        </div>
      </div>

      {/* Cart Success Alert */}
      {cartSuccessMessage && (
        <div
          className="catalog-toast"
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            zIndex: 1000,
            backgroundColor: "var(--surface)",
            border: "2px solid var(--success)",
            borderRadius: "var(--radius-md)",
            padding: "0.875rem 1.25rem",
            boxShadow: "var(--shadow-xl)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            maxWidth: "calc(100vw - 2rem)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle size={20} color="var(--success)" />
            <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
              {cartSuccessMessage}
            </span>
          </div>
          <Link to="/cart" className="btn btn-primary btn-sm">
            View Cart ({totalItemCount})
          </Link>
        </div>
      )}

      {error && (
        <Alert
          type="error"
          message={error.message || "Failed to load catalog"}
        />
      )}

      {/* Category Tabs */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div className="tabs-container">
          {categories.map((cat) => {
            const isSelected = cat._id === selectedCategoryId;
            return (
              <button
                key={cat._id}
                onClick={() => handleCategorySelect(cat._id)}
                className={`tab-btn ${isSelected ? "active" : ""}`}
                style={{ fontSize: "1rem", padding: "0.75rem 1.25rem" }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Garments Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {activeCategory?.name || "Garments"}
          </h2>
          <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            {garments.length} {garments.length === 1 ? "item" : "items"} available
          </span>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <Spinner size="lg" color="var(--primary)" />
          </div>
        ) : garments.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={32} />}
            title="No garments found in this category"
            description="Please choose another category or check back soon for seasonal updates."
          />
        ) : (
          <div
            className="grid grid-cols-1 sm-grid-cols-2 md-grid-cols-3 lg-grid-cols-4 gap-6"
          >
            {garments.map((garment) => (
              <GarmentCard
                key={garment._id}
                garment={garment}
                onSelect={handleSelectGarment}
                priceStartingFrom={getStartingPrice(garment._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Service Selector Modal */}
      {activeGarment && (
        <ServiceSelectorModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          garment={activeGarment}
          serviceOptions={getServicesForGarment(activeGarment._id)}
          onAddToCart={handleAddToCart}
          isLoading={isAdding}
        />
      )}
    </div>
  );
};
