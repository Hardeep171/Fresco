import React, { useEffect, useState } from "react";
import { Plus, MapPin } from "lucide-react";
import { useAddress } from "../../hooks/useAddress";
import { useAuth } from "../../hooks/useAuth";
import { Address, CreateAddressInput, UpdateAddressInput } from "../../types/address.types";
import { AddressCard } from "../../components/customer/AddressCard";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { Alert } from "../../components/common/Alert";
import { EmptyState } from "../../components/common/EmptyState";
import { Spinner } from "../../components/common/Spinner";

export const AddressesPage: React.FC = () => {
  const {
    addresses,
    isLoading,
    isDeleting,
    isSettingDefault,
    error,
    actionError,
    loadAddresses,
    addAddress,
    editAddress,
    removeAddress,
    makeDefault,
    clearErrors,
  } = useAddress();

  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [stateName, setStateName] = useState("Maharashtra");
  const [postalCode, setPostalCode] = useState("400001");
  const [addressType, setAddressType] = useState<"HOME" | "WORK" | "OTHER">("HOME");
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFullName(user ? `${user.firstName} ${user.lastName}`.trim() : "");
    setPhone(user?.phone || "+919876543210");
    setAddressLine1("");
    setAddressLine2("");
    setCity("Mumbai");
    setStateName("Maharashtra");
    setPostalCode("400001");
    setAddressType("HOME");
    setIsDefault(false);
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    setFullName(addr.fullName || (user ? `${user.firstName} ${user.lastName}`.trim() : ""));
    setPhone(addr.phone || user?.phone || "+919876543210");
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || "");
    setCity(addr.city);
    setStateName(addr.state);
    setPostalCode(addr.postalCode);
    setAddressType((addr.addressType as any) || "HOME");
    setIsDefault(addr.isDefault);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    const validLabel = addressType === "WORK" ? "OFFICE" : addressType;

    try {
      if (editingAddress) {
        const payload: UpdateAddressInput = {
          label: validLabel,
          fullName: fullName.trim() || undefined,
          phone: phone.trim() || undefined,
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          city: city.trim(),
          state: stateName.trim(),
          postalCode: postalCode.trim(),
          isDefault,
        };
        const success = await editAddress(editingAddress._id, payload);
        if (success) {
          setModalOpen(false);
        } else {
          setFormError("Failed to update address.");
        }
      } else {
        const payload: CreateAddressInput = {
          label: validLabel,
          fullName: fullName.trim() || `${user?.firstName || "Valued"} ${user?.lastName || "Customer"}`.trim(),
          phone: phone.trim() || user?.phone || "+919876543210",
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          city: city.trim(),
          state: stateName.trim(),
          postalCode: postalCode.trim(),
          country: "India",
          isDefault,
        };
        const success = await addAddress(payload);
        if (success) {
          setModalOpen(false);
        } else {
          setFormError("Failed to create address.");
        }
      }
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>
            Saved Addresses
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Manage your doorstep pickup and delivery locations
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenAdd}
          leftIcon={<Plus size={18} />}
        >
          Add New Address
        </Button>
      </div>

      {(error || actionError) && (
        <Alert
          type="error"
          message={error?.message || actionError?.message || "Address action failed"}
          onClose={clearErrors}
        />
      )}

      {isLoading && addresses.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
          <Spinner size="lg" color="var(--primary)" />
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin size={32} />}
          title="No addresses saved yet"
          description="Save your home, office, or apartment addresses for fast doorstep service."
          action={
            <Button
              variant="primary"
              onClick={handleOpenAdd}
              leftIcon={<Plus size={16} />}
            >
              Add Your First Address
            </Button>
          }
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(20rem, 1fr))", gap: "1.25rem" }}>
          {addresses.map((addr) => (
            <AddressCard
              key={addr._id}
              address={addr}
              onEdit={handleOpenEdit}
              onDelete={(id) => removeAddress(id)}
              onSetDefault={(id) => makeDefault(id)}
              isDeleting={isDeleting}
              isSettingDefault={isSettingDefault}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAddress ? "Edit Address" : "Add New Address"}
        footer={
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", width: "100%" }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
              {editingAddress ? "Save Changes" : "Save Address"}
            </Button>
          </div>
        }
      >
        {formError && (
          <Alert
            type="error"
            message={formError}
            onClose={() => setFormError(null)}
          />
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Input
              label="Recipient Name"
              placeholder="e.g. Rahul Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Contact Phone"
              placeholder="e.g. +919876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <Input
            label="Street Address / Flat / Floor / Building"
            placeholder="e.g. Flat 301, Tower B, Palm Meadows"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            required
            leftIcon={<MapPin size={18} />}
          />

          <Input
            label="Landmark / Locality (Optional)"
            placeholder="e.g. Near Metro Station"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Input
              label="City"
              placeholder="Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <Input
              label="State"
              placeholder="Maharashtra"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Input
              label="PIN Code"
              placeholder="400001"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
            <div className="form-group">
              <label className="form-label" htmlFor="type-select">Address Type</label>
              <select
                id="type-select"
                className="form-select"
                value={addressType}
                onChange={(e) => setAddressType(e.target.value as any)}
              >
                <option value="HOME">Home</option>
                <option value="WORK">Work</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
            <input
              type="checkbox"
              id="modal-set-default"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <label htmlFor="modal-set-default" style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              Set as default address for future orders
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};
