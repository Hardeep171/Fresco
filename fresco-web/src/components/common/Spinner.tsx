import React from "react";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className = "",
  color,
}) => {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 36,
  };

  return (
    <Loader2
      size={sizeMap[size]}
      className={`animate-spin ${className}`}
      style={{ color: color || "currentColor" }}
    />
  );
};
