import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "error" | "info" | "neutral";
  color?: string;
  backgroundColor?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  color,
  backgroundColor,
  className = "",
}) => {
  const variantStyles: Record<string, { bg: string; text: string }> = {
    primary: { bg: "var(--primary-surface)", text: "var(--primary)" },
    success: { bg: "var(--success-surface)", text: "var(--success)" },
    warning: { bg: "var(--warning-surface)", text: "var(--warning)" },
    error: { bg: "var(--error-surface)", text: "var(--error)" },
    info: { bg: "var(--info-surface)", text: "var(--info)" },
    neutral: { bg: "var(--surface-muted)", text: "var(--text-secondary)" },
  };

  const currentVariant = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`badge ${className}`}
      style={{
        backgroundColor: backgroundColor || currentVariant.bg,
        color: color || currentVariant.text,
      }}
    >
      {children}
    </span>
  );
};
