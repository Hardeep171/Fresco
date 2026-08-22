import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { colors, radius } from "../../../theme";

export type IconButtonVariant = "default" | "filled" | "outlined";
export type IconButtonSize = "sm" | "md" | "lg";

export interface AppIconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  accessibilityLabel: string;
  style?: ViewStyle;
}

export const AppIconButton: React.FC<AppIconButtonProps> = ({
  icon,
  onPress,
  variant = "default",
  size = "md",
  disabled = false,
  accessibilityLabel,
  style,
}) => {
  const sizeConfig = sizeStyles[size];
  const variantConfig = variantStyles[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={[
        styles.base,
        sizeConfig,
        variantConfig,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon}
    </TouchableOpacity>
  );
};

const sizeStyles: Record<IconButtonSize, ViewStyle> = {
  sm: {
    width: 36,
    height: 36,
    borderRadius: radius.round,
  },
  md: {
    width: 44,
    height: 44,
    borderRadius: radius.round,
  },
  lg: {
    width: 52,
    height: 52,
    borderRadius: radius.round,
  },
};

const variantStyles: Record<IconButtonVariant, ViewStyle> = {
  default: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  filled: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 0,
  },
  outlined: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
};

const styles = StyleSheet.create({
  base: {
    justifyContent: "center",
    alignItems: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});
