import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  id,
  className = "",
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {leftIcon && (
          <div style={{ position: "absolute", left: "0.75rem", pointerEvents: "none", color: "var(--text-muted)" }}>
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`form-input ${error ? "error" : ""} ${className}`}
          style={{
            paddingLeft: leftIcon ? "2.5rem" : undefined,
            paddingRight: rightIcon ? "2.5rem" : undefined,
          }}
          {...props}
        />
        {rightIcon && (
          <div style={{ position: "absolute", right: "0.75rem", color: "var(--text-muted)" }}>
            {rightIcon}
          </div>
        )}
      </div>
      {error && <span className="form-error">{error}</span>}
      {!error && helperText && (
        <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{helperText}</span>
      )}
    </div>
  );
};
