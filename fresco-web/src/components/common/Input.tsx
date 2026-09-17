import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  showPasswordToggle,
  id,
  type = "text",
  className = "",
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  const isPasswordType = type === "password";
  const shouldShowToggle = showPasswordToggle ?? isPasswordType;
  const computedType = isPasswordType && isPasswordVisible ? "text" : type;

  const resolvedRightIcon =
    rightIcon ||
    (shouldShowToggle ? (
      <button
        type="button"
        onClick={() => setIsPasswordVisible((prev) => !prev)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "0.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          outline: "none",
        }}
        aria-label={isPasswordVisible ? "Hide password" : "Show password"}
        title={isPasswordVisible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    ) : null);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {leftIcon && (
          <div
            style={{
              position: "absolute",
              left: "0.75rem",
              pointerEvents: "none",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          type={computedType}
          className={`form-input ${error ? "error" : ""} ${className}`}
          style={{
            paddingLeft: leftIcon ? "2.5rem" : undefined,
            paddingRight: resolvedRightIcon ? "2.5rem" : undefined,
          }}
          {...props}
        />
        {resolvedRightIcon && (
          <div
            style={{
              position: "absolute",
              right: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
            }}
          >
            {resolvedRightIcon}
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
