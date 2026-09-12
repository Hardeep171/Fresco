import React from "react";
import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "3rem 1.5rem",
        backgroundColor: "var(--surface)",
        borderRadius: "var(--radius-md)",
        border: "1px dashed var(--border)",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "var(--radius-full)",
          backgroundColor: "var(--surface-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          marginBottom: "1rem",
        }}
      >
        {icon || <PackageOpen size={28} />}
      </div>
      <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", maxWidth: "24rem", marginBottom: "1.25rem" }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
