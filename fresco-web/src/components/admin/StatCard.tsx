import React from "react";
import { Card } from "../common/Card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  color?: string;
  bgColor?: string;
  variant?: "primary" | "warning" | "success" | "info" | "secondary" | string;
}

const VARIANT_COLORS: Record<string, { color: string; bgColor: string }> = {
  primary: { color: "var(--primary)", bgColor: "rgba(59, 130, 246, 0.12)" },
  warning: { color: "var(--warning)", bgColor: "rgba(245, 158, 11, 0.12)" },
  success: { color: "var(--success)", bgColor: "rgba(16, 185, 129, 0.12)" },
  info: { color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.12)" },
  secondary: { color: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.12)" },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  color,
  bgColor,
  variant = "primary",
}) => {
  const variantConfig = VARIANT_COLORS[variant] || VARIANT_COLORS.primary;
  const finalColor = color || variantConfig.color;
  const finalBgColor = bgColor || variantConfig.bgColor;
  return (
    <Card className="fresco-card-hover">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)" }}>
            {title}
          </span>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.25rem" }}>
            {value}
          </div>
          {subtitle && (
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              {subtitle}
            </div>
          )}
        </div>

        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "var(--radius-md)",
            backgroundColor: finalBgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: finalColor,
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};
