import React, { useEffect, useState } from "react";
import {
  Layers,
  Shirt,
  Sparkles,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { categoryApi } from "../../api/category.api";
import { garmentApi } from "../../api/garment.api";
import { serviceApi } from "../../api/service.api";
import { Category, Garment, Service } from "../../types/catalog.types";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Modal } from "../../components/common/Modal";
import { Spinner } from "../../components/common/Spinner";
import { Alert } from "../../components/common/Alert";

export const AdminCatalogPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"categories" | "garments" | "services">("categories");

  const [categories, setCategories] = useState<Category[]>([]);
  const [garments, setGarments] = useState<Garment[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formName, setFormName] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formCategoryId, setFormCategoryId] = useState<string>("");
  const [formTurnaround, setFormTurnaround] = useState<number>(24);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [cats, gars, servs] = await Promise.all([
        categoryApi.getAllCategoriesForAdmin().catch(() => []),
        garmentApi.getAllGarmentsForAdmin().catch(() => []),
        serviceApi.getAllServicesForAdmin().catch(() => []),
      ]);
      setCategories(cats);
      setGarments(gars);
      setServices(servs);
    } catch (err: any) {
      setError(err.message || "Failed to load catalog data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormDescription("");
    setFormCategoryId(categories[0]?._id || "");
    setFormTurnaround(24);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormName(item.name || "");
    setFormDescription(item.description || "");
    if (activeTab === "garments") {
      setFormCategoryId(typeof item.categoryId === "object" ? item.categoryId._id : item.categoryId || "");
    }
    if (activeTab === "services") {
      setFormTurnaround(item.turnaroundHours || 24);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsSaving(true);
    setError(null);
    try {
      if (activeTab === "categories") {
        if (editingItem) {
          await categoryApi.updateCategory(editingItem._id, {
            name: formName.trim(),
            description: formDescription.trim(),
          });
          setSuccessMsg("Category updated successfully.");
        } else {
          await categoryApi.createCategory({
            name: formName.trim(),
            description: formDescription.trim(),
          });
          setSuccessMsg("Category created successfully.");
        }
      } else if (activeTab === "garments") {
        if (editingItem) {
          await garmentApi.updateGarment(editingItem._id, {
            name: formName.trim(),
            description: formDescription.trim(),
            categoryId: formCategoryId,
          });
          setSuccessMsg("Garment updated successfully.");
        } else {
          await garmentApi.createGarment({
            name: formName.trim(),
            description: formDescription.trim(),
            categoryId: formCategoryId,
          });
          setSuccessMsg("Garment created successfully.");
        }
      } else if (activeTab === "services") {
        if (editingItem) {
          await serviceApi.updateService(editingItem._id, {
            name: formName.trim(),
            description: formDescription.trim(),
            turnaroundHours: formTurnaround,
          });
          setSuccessMsg("Service updated successfully.");
        } else {
          await serviceApi.createService({
            name: formName.trim(),
            description: formDescription.trim(),
            turnaroundHours: formTurnaround,
          });
          setSuccessMsg("Service created successfully.");
        }
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Operation failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (item: any) => {
    try {
      if (activeTab === "categories") {
        if (item.isActive) {
          await categoryApi.disableCategory(item._id);
        } else {
          await categoryApi.enableCategory(item._id);
        }
      } else if (activeTab === "garments") {
        if (item.isActive) {
          await garmentApi.disableGarment(item._id);
        } else {
          await garmentApi.enableGarment(item._id);
        }
      } else if (activeTab === "services") {
        if (item.isActive) {
          await serviceApi.disableService(item._id);
        } else {
          await serviceApi.enableService(item._id);
        }
      }
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to toggle status.");
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredGarments = garments.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header */}
      <div
        className="catalog-header"
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
            Catalog Management
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
            Configure garment categories, apparel items, and wash & dry cleaning services.
          </p>
        </div>

        <div className="catalog-header-actions" style={{ display: "flex", gap: "0.5rem" }}>
          <Button variant="secondary" size="sm" onClick={loadData} leftIcon={<RefreshCw size={14} />}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAdd} leftIcon={<Plus size={16} />}>
            Add {activeTab === "categories" ? "Category" : activeTab === "garments" ? "Garment" : "Service"}
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
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          overflowX: "auto",
          paddingBottom: "0.25rem",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <button
          onClick={() => { setActiveTab("categories"); setSearchQuery(""); }}
          style={{
            padding: "0.625rem 1.25rem",
            borderRadius: "var(--radius-md)",
            border: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            whiteSpace: "nowrap",
            flexShrink: 0,
            backgroundColor: activeTab === "categories" ? "var(--primary)" : "var(--card-bg, #ffffff)",
            color: activeTab === "categories" ? "#ffffff" : "var(--text-secondary)",
            boxShadow: activeTab === "categories" ? "var(--shadow-sm)" : "none",
          }}
        >
          <Layers size={16} /> Categories ({categories.length})
        </button>
        <button
          onClick={() => { setActiveTab("garments"); setSearchQuery(""); }}
          style={{
            padding: "0.625rem 1.25rem",
            borderRadius: "var(--radius-md)",
            border: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            whiteSpace: "nowrap",
            flexShrink: 0,
            backgroundColor: activeTab === "garments" ? "var(--primary)" : "var(--card-bg, #ffffff)",
            color: activeTab === "garments" ? "#ffffff" : "var(--text-secondary)",
            boxShadow: activeTab === "garments" ? "var(--shadow-sm)" : "none",
          }}
        >
          <Shirt size={16} /> Garments ({garments.length})
        </button>
        <button
          onClick={() => { setActiveTab("services"); setSearchQuery(""); }}
          style={{
            padding: "0.625rem 1.25rem",
            borderRadius: "var(--radius-md)",
            border: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            whiteSpace: "nowrap",
            flexShrink: 0,
            backgroundColor: activeTab === "services" ? "var(--primary)" : "var(--card-bg, #ffffff)",
            color: activeTab === "services" ? "#ffffff" : "var(--text-secondary)",
            boxShadow: activeTab === "services" ? "var(--shadow-sm)" : "none",
          }}
        >
          <Sparkles size={16} /> Services ({services.length})
        </button>
      </div>

      {/* Search Input */}
      <div className="catalog-search-wrapper" style={{ marginBottom: "1rem" }}>
        <Input
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search size={16} />}
        />
      </div>

      {/* Responsive Catalog Cards Grid */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
          <Spinner size="lg" color="var(--primary)" />
        </div>
      ) : (
        <>
          {activeTab === "categories" &&
            (filteredCategories.length === 0 ? (
              <Card className="fresco-card">
                <div style={{ padding: "4rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
                  <Layers size={48} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>
                    No categories found
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.875rem" }}>
                    {searchQuery ? `No categories match "${searchQuery}".` : "No categories defined yet."}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="admin-card-grid-3">
                {filteredCategories.map((item) => (
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
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                        <div style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--text-primary)", wordBreak: "break-word" }}>
                          {item.name}
                        </div>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            padding: "0.2rem 0.5rem",
                            borderRadius: "var(--radius-sm)",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            backgroundColor: item.isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(107, 114, 128, 0.15)",
                            color: item.isActive ? "var(--success)" : "var(--text-muted)",
                          }}
                        >
                          {item.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, wordBreak: "break-word" }}>
                        {item.description || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No description provided</span>}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-light)" }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        onClick={() => handleOpenEdit(item)}
                        leftIcon={<Edit2 size={14} />}
                        style={{ minHeight: "40px" }}
                      >
                        Edit
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
                ))}
              </div>
            ))}

          {activeTab === "garments" &&
            (filteredGarments.length === 0 ? (
              <Card className="fresco-card">
                <div style={{ padding: "4rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
                  <Shirt size={48} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>
                    No garments found
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.875rem" }}>
                    {searchQuery ? `No garments match "${searchQuery}".` : "No garments defined yet."}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="admin-card-grid-3">
                {filteredGarments.map((item) => {
                  const catName =
                    typeof item.categoryId === "object" && item.categoryId
                      ? (item.categoryId as any).name
                      : categories.find((c) => c._id === item.categoryId)?.name || "—";

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
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--text-primary)", wordBreak: "break-word" }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.35rem", marginTop: "0.3rem", padding: "0.2rem 0.5rem", borderRadius: "var(--radius-sm)", backgroundColor: "rgba(30, 58, 138, 0.08)", color: "var(--primary)", fontWeight: 600 }}>
                              <span>{catName}</span>
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              padding: "0.2rem 0.5rem",
                              borderRadius: "var(--radius-sm)",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                              backgroundColor: item.isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(107, 114, 128, 0.15)",
                              color: item.isActive ? "var(--success)" : "var(--text-muted)",
                            }}
                          >
                            {item.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>

                        <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, wordBreak: "break-word" }}>
                          {item.description || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No description provided</span>}
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-light)" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          fullWidth
                          onClick={() => handleOpenEdit(item)}
                          leftIcon={<Edit2 size={14} />}
                          style={{ minHeight: "40px" }}
                        >
                          Edit
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
            ))}

          {activeTab === "services" &&
            (filteredServices.length === 0 ? (
              <Card className="fresco-card">
                <div style={{ padding: "4rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
                  <Sparkles size={48} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>
                    No services found
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.875rem" }}>
                    {searchQuery ? `No services match "${searchQuery}".` : "No services defined yet."}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="admin-card-grid-3">
                {filteredServices.map((item) => (
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
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--text-primary)", wordBreak: "break-word" }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.35rem", marginTop: "0.3rem", padding: "0.2rem 0.5rem", borderRadius: "var(--radius-sm)", backgroundColor: "var(--surface-muted)", color: "var(--text-secondary)", fontWeight: 600 }}>
                            <span>Turnaround: {item.turnaroundHours || 24} hrs</span>
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            padding: "0.2rem 0.5rem",
                            borderRadius: "var(--radius-sm)",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            backgroundColor: item.isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(107, 114, 128, 0.15)",
                            color: item.isActive ? "var(--success)" : "var(--text-muted)",
                          }}
                        >
                          {item.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, wordBreak: "break-word" }}>
                        {item.description || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No description provided</span>}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-light)" }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        onClick={() => handleOpenEdit(item)}
                        leftIcon={<Edit2 size={14} />}
                        style={{ minHeight: "40px" }}
                      >
                        Edit
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
                ))}
              </div>
            ))}
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingItem
            ? `Edit ${activeTab === "categories" ? "Category" : activeTab === "garments" ? "Garment" : "Service"}`
            : `Add New ${activeTab === "categories" ? "Category" : activeTab === "garments" ? "Garment" : "Service"}`
        }
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", width: "100%", flexWrap: "wrap" }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
              {editingItem ? "Save Changes" : "Create"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
              Name *
            </label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Shirts, Dry Clean, Men's Wear..."
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
              Description
            </label>
            <Input
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Brief description..."
            />
          </div>

          {activeTab === "garments" && (
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                Category *
              </label>
              <Select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                options={categories.map((c) => ({ value: c._id, label: c.name }))}
                required
              />
            </div>
          )}

          {activeTab === "services" && (
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                Turnaround Time (Hours)
              </label>
              <Input
                type="number"
                min="1"
                max="168"
                value={formTurnaround.toString()}
                onChange={(e) => setFormTurnaround(Number(e.target.value))}
              />
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
