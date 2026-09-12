import React from "react";
import { MapPin, Check, Trash2, Edit3, Star } from "lucide-react";
import { Address } from "../../types/address.types";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";

interface AddressCardProps {
  address: Address;
  isSelected?: boolean;
  onSelect?: (address: Address) => void;
  onEdit?: (address: Address) => void;
  onDelete?: (addressId: string) => void;
  onSetDefault?: (addressId: string) => void;
  selectable?: boolean;
  isDeleting?: boolean;
  isSettingDefault?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  selectable = false,
  isDeleting = false,
  isSettingDefault = false,
}) => {
  return (
    <Card
      className={selectable ? "fresco-card-hover" : ""}
      onClick={selectable && onSelect ? () => onSelect(address) : undefined}
      style={{
        border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
        backgroundColor: isSelected ? "var(--primary-surface)" : "var(--surface)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <MapPin size={18} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
            {address.addressType || "HOME"}
          </span>
          {address.isDefault && (
            <Badge variant="primary">
              <Star size={10} fill="currentColor" /> Default
            </Badge>
          )}
        </div>

        {isSelected && (
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check size={12} color="#ffffff" strokeWidth={3} />
          </div>
        )}
      </div>

      <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.5, marginBottom: "1rem" }}>
        <div>{address.addressLine1}</div>
        {address.addressLine2 && <div>{address.addressLine2}</div>}
        <div>
          {address.city}, {address.state} - {address.postalCode}
        </div>
        <div>{address.country || "India"}</div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "0.75rem",
          borderTop: "1px solid var(--border-light)",
        }}
      >
        <div>
          {!address.isDefault && onSetDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSetDefault(address._id);
              }}
              isLoading={isSettingDefault}
              leftIcon={<Star size={14} />}
            >
              Set as Default
            </Button>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(address);
              }}
              leftIcon={<Edit3 size={14} />}
            >
              Edit
            </Button>
          )}

          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(address._id);
              }}
              isLoading={isDeleting}
              leftIcon={<Trash2 size={14} />}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
