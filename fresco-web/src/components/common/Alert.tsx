import React from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

interface AlertProps {
  type?: "info" | "success" | "warning" | "error";
  message: string;
  description?: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = "info",
  message,
  description,
  onClose,
  className = "",
}) => {
  const typeConfig = {
    info: {
      icon: <Info size={20} color="var(--info)" />,
      bg: "var(--info-surface)",
      border: "rgba(14, 165, 233, 0.2)",
      text: "#0369A1",
    },
    success: {
      icon: <CheckCircle size={20} color="var(--success)" />,
      bg: "var(--success-surface)",
      border: "rgba(16, 185, 129, 0.2)",
      text: "#065F46",
    },
    warning: {
      icon: <AlertTriangle size={20} color="var(--warning)" />,
      bg: "var(--warning-surface)",
      border: "rgba(245, 158, 11, 0.2)",
      text: "#92400E",
    },
    error: {
      icon: <AlertCircle size={20} color="var(--error)" />,
      bg: "var(--error-surface)",
      border: "rgba(239, 68, 68, 0.2)",
      text: "#991B1B",
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: "var(--radius-md)",
        padding: "0.875rem 1rem",
        marginBottom: "1rem",
      }}
    >
      <div style={{ flexShrink: 0, marginTop: "0.125rem" }}>{config.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: "0.875rem", color: config.text }}>
          {message}
        </div>
        {description && (
          <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            {description}
          </div>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: "0.125rem",
          }}
          aria-label="Close alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
