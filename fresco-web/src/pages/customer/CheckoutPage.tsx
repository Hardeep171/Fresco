import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Plus,
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { useAddress } from "../../hooks/useAddress";
import { useOrders } from "../../hooks/useOrders";
import { useAuth } from "../../hooks/useAuth";
import { AddressLabel, CreateAddressInput } from "../../types/address.types";
import { AddressCard } from "../../components/customer/AddressCard";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { Alert } from "../../components/common/Alert";
import { Spinner } from "../../components/common/Spinner";
import { PaymentMethod } from "../../constants/payment.constants";

export const CheckoutPage: React.FC = () => {
  const { enrichedItems, totalAmount, totalItemCount } = useCart();
  const { addresses, loadAddresses, addAddress, isLoading: isAddressLoading } = useAddress();
  const { placeOrder, isPlacingOrder, placeOrderError, clearErrors } = useOrders();
  const { user } = useAuth();

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [specialInstructions, setSpecialInstructions] = useState<string>("");
  const [newAddressModalOpen, setNewAddressModalOpen] = useState(false);

  // New Address Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [stateName, setStateName] = useState("Maharashtra");
  const [postalCode, setPostalCode] = useState("400001");
  const [addressType, setAddressType] = useState<"HOME" | "WORK" | "OTHER">("HOME");
  const [isDefault, setIsDefault] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // Set default address as selected
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault);
      setSelectedAddressId(defaultAddr ? defaultAddr._id : addresses[0]._id);
    }
  }, [addresses, selectedAddressId]);

  // If cart is empty, redirect to catalog
  useEffect(() => {
    if (totalItemCount === 0) {
      navigate("/catalog");
    }
  }, [totalItemCount, navigate]);

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(null);
    setIsSavingAddress(true);

    const validLabel = addressType === "WORK" ? "OFFICE" : addressType;

    try {
      const success = await addAddress({
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
      });

      if (success) {
        setNewAddressModalOpen(false);
        // Reset form
        setFullName("");
        setPhone("");
        setAddressLine1("");
        setAddressLine2("");
      } else {
        setAddressError("Failed to save address. Please check entered details.");
      }
    } catch (err: any) {
      setAddressError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert("Please select or add a delivery address.");
      return;
    }

    const selectedAddr = addresses.find((a) => a._id === selectedAddressId);
    if (!selectedAddr) {
      alert("Selected address could not be found.");
      return;
    }

    clearErrors();

    const validLabel: AddressLabel =
      (selectedAddr.label as any) === "WORK"
        ? "OFFICE"
        : ((selectedAddr.label as AddressLabel) || "HOME");

    const addressSnapshot: CreateAddressInput = {
      label: validLabel,
      fullName: selectedAddr.fullName || `${user?.firstName || "Valued"} ${user?.lastName || "Customer"}`.trim(),
      phone: selectedAddr.phone || user?.phone || "+919876543210",
      addressLine1: selectedAddr.addressLine1,
      addressLine2: selectedAddr.addressLine2 || undefined,
      city: selectedAddr.city,
      state: selectedAddr.state,
      postalCode: selectedAddr.postalCode,
      country: selectedAddr.country || "India",
    };

    const order = await placeOrder({
      pickupAddress: addressSnapshot,
      deliveryAddress: addressSnapshot,
      paymentMethod,
      specialInstructions: specialInstructions.trim() || undefined,
    });

    if (order) {
      navigate(`/orders/${order._id}`, { replace: true });
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>
          Checkout & Confirmation
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          Confirm your address, preferred payment method, and schedule pickup
        </p>
      </div>

      {placeOrderError && (
        <Alert
          type="error"
          message={placeOrderError.message || "Failed to place order"}
          onClose={clearErrors}
        />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="checkout-grid">
        {/* Left Side: Address & Payment Selection */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* 1. Address Section */}
          <Card
            title="1. Pickup & Delivery Address"
            subtitle="Where should our delivery partner collect and return your garments?"
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setNewAddressModalOpen(true)}
                leftIcon={<Plus size={16} />}
              >
                Add Address
              </Button>
            }
          >
            {isAddressLoading && addresses.length === 0 ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "2rem 0" }}>
                <Spinner size="md" color="var(--primary)" />
              </div>
            ) : addresses.length === 0 ? (
              <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                  No saved addresses found. Please add an address to proceed.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setNewAddressModalOpen(true)}
                  leftIcon={<Plus size={16} />}
                >
                  Add Address Now
                </Button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                {addresses.map((address) => (
                  <AddressCard
                    key={address._id}
                    address={address}
                    selectable
                    isSelected={address._id === selectedAddressId}
                    onSelect={() => setSelectedAddressId(address._id)}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* 2. Payment Method */}
          <Card
            title="2. Payment Preference"
            subtitle="Choose how you would like to settle your order amount"
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div
                onClick={() => setPaymentMethod("CASH")}
                style={{
                  padding: "1.25rem",
                  borderRadius: "var(--radius-md)",
                  border: `2px solid ${
                    paymentMethod === "CASH" ? "var(--primary)" : "var(--border)"
                  }`,
                  backgroundColor:
                    paymentMethod === "CASH" ? "var(--primary-surface)" : "var(--surface)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <Banknote size={24} color={paymentMethod === "CASH" ? "var(--primary)" : "var(--text-secondary)"} />
                  <div style={{ fontWeight: 700, fontSize: "1rem" }}>Cash on Visit</div>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  Pay cash directly to the delivery partner during pickup or final doorstep delivery.
                </p>
              </div>

              <div
                onClick={() => setPaymentMethod("UPI")}
                style={{
                  padding: "1.25rem",
                  borderRadius: "var(--radius-md)",
                  border: `2px solid ${
                    paymentMethod === "UPI" ? "var(--primary)" : "var(--border)"
                  }`,
                  backgroundColor:
                    paymentMethod === "UPI" ? "var(--primary-surface)" : "var(--surface)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <QrCode size={24} color={paymentMethod === "UPI" ? "var(--primary)" : "var(--text-secondary)"} />
                  <div style={{ fontWeight: 700, fontSize: "1rem" }}>UPI / QR Code</div>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  Scan the delivery partner's verified UPI QR code on your mobile phone at your doorstep.
                </p>
              </div>
            </div>
          </Card>

          {/* 3. Special Instructions */}
          <Card title="3. Laundry & Delivery Notes">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="order-notes">
                Special Care Instructions (Optional)
              </label>
              <textarea
                id="order-notes"
                className="form-textarea"
                rows={3}
                placeholder="e.g. Please take extra care with the embroidered kurta; call before arrival; deliver after 5 PM."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              />
            </div>
          </Card>
        </div>

        {/* Right Side: Order Review & Confirmation */}
        <div>
          <Card title="Review Order">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
              {enrichedItems.map((item, i) => (
                <div
                  key={item._id || i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.875rem",
                    paddingBottom: "0.5rem",
                    borderBottom: "1px solid var(--border-light)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                      {item.garmentName} × {item.quantity}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {item.serviceName}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                    ₹{(item.unitPrice || 0) * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Garments Count</span>
                <span style={{ fontWeight: 600 }}>{totalItemCount} items</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Pickup & Delivery Fee</span>
                <span style={{ color: "var(--success)", fontWeight: 600 }}>FREE</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Expert Fabric Inspection</span>
                <span style={{ color: "var(--success)", fontWeight: 600 }}>FREE</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "0.75rem",
                  paddingTop: "0.75rem",
                  borderTop: "2px solid var(--border)",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: "1.125rem" }}>Total Amount</span>
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
                onClick={handlePlaceOrder}
                isLoading={isPlacingOrder}
                disabled={!selectedAddressId || addresses.length === 0}
                leftIcon={<CheckCircle size={20} />}
              >
                Place Order (₹{totalAmount})
              </Button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginTop: "1rem",
                padding: "0.75rem",
                backgroundColor: "var(--surface-muted)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
              }}
            >
              <ShieldCheck size={16} color="var(--success)" style={{ flexShrink: 0 }} />
              <span>
                FRESCO Quality Assurance guarantee covers every garment in our care.
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Add New Address Modal */}
      <Modal
        isOpen={newAddressModalOpen}
        onClose={() => setNewAddressModalOpen(false)}
        title="Add Delivery Address"
        footer={
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", width: "100%" }}>
            <Button
              variant="secondary"
              onClick={() => setNewAddressModalOpen(false)}
              disabled={isSavingAddress}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveNewAddress}
              isLoading={isSavingAddress}
            >
              Save & Use Address
            </Button>
          </div>
        }
      >
        {addressError && (
          <Alert
            type="error"
            message={addressError}
            onClose={() => setAddressError(null)}
          />
        )}

        <form onSubmit={handleSaveNewAddress}>
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
            label="Street Address / Flat / Building"
            placeholder="Flat 402, Sunshine Heights, MG Road"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            required
            leftIcon={<MapPin size={18} />}
          />

          <Input
            label="Landmark / Area (Optional)"
            placeholder="Near Central Mall"
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
              label="Postal Code (PIN)"
              placeholder="400001"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
            <div className="form-group">
              <label className="form-label" htmlFor="address-type">Address Type</label>
              <select
                id="address-type"
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
              id="set-default"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <label htmlFor="set-default" style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              Set as default delivery address
            </label>
          </div>
        </form>
      </Modal>

      <style>{`
        @media (min-width: 1024px) {
          .checkout-grid {
            grid-template-columns: 2fr 1.2fr !important;
          }
        }
      `}</style>
    </div>
  );
};
