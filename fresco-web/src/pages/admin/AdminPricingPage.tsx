import React, { useEffect, useState, useMemo } from "react";
import {
  DollarSign,
  Plus,
  Edit2,
  RefreshCw,
  Search,
  Layers,
  Filter,
  Clock,
  Sparkles,
} from "lucide-react";
import { pricingApi } from "../../api/pricing.api";
import { garmentApi } from "../../api/garment.api";
import { serviceApi } from "../../api/service.api";
import { categoryApi } from "../../api/category.api";
import { Pricing, Garment, Service, Category } from "../../types/catalog.types";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Modal } from "../../components/common/Modal";
import { Spinner } from "../../components/common/Spinner";
import { Alert } from "../../components/common/Alert";

export const AdminPricingPage: React.FC = () => {
  const [pricingList, setPricingList] = useState<Pricing[]>([]);
  const [garments, setGarments] = useState<Garment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPricing, setEditingPricing] = useState<Pricing | null>(null);
  const [formGarmentId, setFormGarmentId] = useState<string>("");
  const [formServiceId, setFormServiceId] = useState<string>("");
  const [formBasePrice, setFormBasePrice] = useState<number>(0);
  const [formMinDays, setFormMinDays] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pricingData, garmentsData, servicesData, categoriesData] =
        await Promise.all([
          pricingApi.getAllPricingForAdmin().catch(() => []),
          garmentApi.getGarments().catch(() => []),
          serviceApi.getServices().catch(() => []),
          categoryApi.getCategories().catch(() => []),
        ]);

      setPricingList(pricingData);
      setGarments(garmentsData);
      setServices(servicesData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message || "Failed to load pricing matrix.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingPricing(null);
    setFormGarmentId(garments[0]?._id || "");
    setFormServiceId(services[0]?._id || "");
    setFormBasePrice(50);
    setFormMinDays(1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Pricing) => {
    setEditingPricing(item);
    const gId = typeof item.garmentId === "object" ? (item.garmentId as any)._id : item.garmentId;
    const sId = typeof item.serviceId === "object" ? (item.serviceId as any)._id : item.serviceId;
    setFormGarmentId(gId);
    setFormServiceId(sId);
    setFormBasePrice(item.basePrice ?? item.price ?? 0);
    setFormMinDays(item.minDays || 1);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGarmentId || !formServiceId || formBasePrice <= 0) return;

    setIsSaving(true);
    setError(null);
    try {
      if (editingPricing) {
        await pricingApi.updatePricing(editingPricing._id, {
          basePrice: formBasePrice,
          minDays: formMinDays,
        });
        setSuccessMsg("Pricing updated successfully.");
      } else {
        await pricingApi.createPricing({
          garmentId: formGarmentId,
          serviceId: formServiceId,
          basePrice: formBasePrice,
          minDays: formMinDays,
        });
        setSuccessMsg("Pricing entry created successfully.");
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to save pricing.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (item: Pricing) => {
    try {
      if (item.isActive) {
        await pricingApi.disablePricing(item._id);
      } else {
        await pricingApi.enablePricing(item._id);
      }
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to toggle status.");
    }
  };

  // Filtered pricing
  const filteredPricing = useMemo(() => {
    return pricingList.filter((item) => {
      const garment = typeof item.garmentId === "object" ? (item.garmentId as any) : null;
      const service = typeof item.serviceId === "object" ? (item.serviceId as any) : null;
      const garmentName = garment ? (garment.name || "").toLowerCase() : "";
      const serviceName = service ? (service.name || "").toLowerCase() : "";

      // Category filter
      if (selectedCategory !== "ALL") {
        const catId =
          garment && typeof garment.categoryId === "object"
            ? garment.categoryId._id
            : garment?.categoryId;
        if (catId !== selectedCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return garmentName.includes(q) || serviceName.includes(q);
      }

      return true;
    });
  }, [pricingList, selectedCategory, searchQuery]);

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
            Pricing Matrix
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
            Set service rates and turnaround times for every garment and care combination.
          </p>
        </div>

        <div className="catalog-header-actions" style={{ display: "flex", gap: "0.5rem" }}>
          <Button variant="secondary" size="sm" onClick={loadData} leftIcon={<RefreshCw size={14} />}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAdd} leftIcon={<Plus size={16} />}>
            Add Rate
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

      {/* Filter Bar */}
      <Card className="fresco-card" style={{ padding: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "1 1 250px", maxWidth: "350px", width: "100%" }}>
            <Input
              placeholder="Search garment or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>

          <div style={{ flex: "1 1 200px", maxWidth: "250px", width: "100%" }}>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: "ALL", label: "All Categories" },
                ...categories.map((c) => ({ value: c._id, label: c.name })),
              ]}
            />
          </div>

          <div style={{ marginLeft: "auto", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Showing <strong>{filteredPricing.length}</strong> combinations
          </div>
        </div>
      </Card>

      {/* Pricing Cards Grid */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
          <Spinner size="lg" color="var(--primary)" />
        </div>
      ) : filteredPricing.length === 0 ? (
        <Card className="fresco-card">
          <div style={{ padding: "4rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
            <DollarSign size={48} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>
              No pricing records found
            </h3>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>
              Click "Add Rate" to define prices for garments and services.
            </p>
          </div>
        </Card>
      ) : (
        <div className="admin-card-grid-3">
          {filteredPricing.map((item) => {
            const garmentName =
              typeof item.garmentId === "object" && item.garmentId
                ? (item.garmentId as any).name
                : "Garment";
            const serviceName =
              typeof item.serviceId === "object" && item.serviceId
                ? (item.serviceId as any).name
                : "Service";

            return (
              <Card
                key={item._id}
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
                  {/* Top: Garment Name & Status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--text-primary)" }}>
                        {garmentName}
                      </div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          marginTop: "0.35rem",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: "rgba(30, 58, 138, 0.08)",
                          color: "var(--primary)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        <Sparkles size={12} />
                        <span>{serviceName}</span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        padding: "0.2rem 0.5rem",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: item.isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(107, 114, 128, 0.15)",
                        color: item.isActive ? "var(--success)" : "var(--text-muted)",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {item.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  {/* Pricing and Turnaround metrics */}
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
                        Base Rate
                      </div>
                      <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.15rem" }}>
                        ₹{item.basePrice ?? item.price ?? 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                        Turnaround
                      </div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Clock size={14} style={{ color: "var(--text-muted)" }} />
                        <span>{item.minDays || 1} day(s)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-light)" }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => handleOpenEdit(item)}
                    leftIcon={<Edit2 size={14} />}
                    style={{ minHeight: "40px" }}
                  >
                    Edit Rate
                  </Button>
                  <Button
                    variant={item.isActive ? "danger" : "success"}
                    size="sm"
                    fullWidth
                    onClick={() => handleToggleStatus(item)}
                    style={{ minHeight: "40px" }}
                  >
                    {item.isActive ? "Disable" : "Enable"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pricing Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPricing ? "Edit Pricing Rate" : "Add New Pricing Rate"}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", width: "100%" }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
              {editingPricing ? "Save Changes" : "Create Rate"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
              Garment *
            </label>
            <Select
              value={formGarmentId}
              onChange={(e) => setFormGarmentId(e.target.value)}
              disabled={!!editingPricing}
              options={garments.map((g) => ({ value: g._id, label: g.name }))}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
              Service *
            </label>
            <Select
              value={formServiceId}
              onChange={(e) => setFormServiceId(e.target.value)}
              disabled={!!editingPricing}
              options={services.map((s) => ({ value: s._id, label: s.name }))}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
              Base Price (₹) *
            </label>
            <Input
              type="number"
              min="1"
              value={formBasePrice.toString()}
              onChange={(e) => setFormBasePrice(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
              Minimum Turnaround Days
            </label>
            <Input
              type="number"
              min="1"
              max="14"
              value={formMinDays.toString()}
              onChange={(e) => setFormMinDays(Number(e.target.value))}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
