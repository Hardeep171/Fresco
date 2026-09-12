import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Garment } from "../../types/catalog.types";
import { Card } from "../common/Card";
import { Button } from "../common/Button";

interface GarmentCardProps {
  garment: Garment;
  onSelect: (garment: Garment) => void;
  priceStartingFrom?: number;
}

export const GarmentCard: React.FC<GarmentCardProps> = ({
  garment,
  onSelect,
  priceStartingFrom,
}) => {
  return (
    <Card
      className="fresco-card-hover"
      onClick={() => onSelect(garment)}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <div>
        <div
          style={{
            height: "140px",
            backgroundColor: "var(--primary-surface)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
            color: "var(--primary)",
          }}
        >
          {garment.icon ? (
            <span style={{ fontSize: "3rem" }}>{garment.icon}</span>
          ) : (
            <Sparkles size={48} />
          )}
        </div>

        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "0.25rem",
            textTransform: "capitalize",
          }}
        >
          {garment.name}
        </h3>

        {garment.description && (
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              marginBottom: "1rem",
              lineHeight: 1.4,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {garment.description}
          </p>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "1rem",
          paddingTop: "0.75rem",
          borderTop: "1px solid var(--border-light)",
        }}
      >
        <div>
          {priceStartingFrom !== undefined && priceStartingFrom > 0 && (
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Starts at </span>
              <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: "1rem" }}>
                ₹{priceStartingFrom}
              </span>
            </div>
          )}
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(garment);
          }}
          rightIcon={<ArrowRight size={14} />}
        >
          Select Service
        </Button>
      </div>
    </Card>
  );
};
