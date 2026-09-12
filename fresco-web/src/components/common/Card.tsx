import React from "react";

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  footer,
  className = "",
  style,
  onClick,
}) => {
  const isClickable = Boolean(onClick);

  return (
    <div
      className={`fresco-card ${isClickable ? "fresco-card-hover" : ""} ${className}`}
      onClick={onClick}
      style={{ cursor: isClickable ? "pointer" : "default", ...style }}
    >
      {(title || action) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
            paddingBottom: "0.5rem",
            borderBottom: "1px solid var(--border-light)",
          }}
        >
          <div>
            {title && (
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.125rem" }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      <div>{children}</div>

      {footer && (
        <div
          style={{
            marginTop: "1rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--border-light)",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};
