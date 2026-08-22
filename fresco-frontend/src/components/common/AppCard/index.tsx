import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { colors, spacing, radius, shadows } from "../../../theme";

export type CardVariant = "elevated" | "outlined" | "flat";
export type CardPadding = "none" | "sm" | "md" | "lg";

export interface AppCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  variant = "elevated",
  padding = "md",
  onPress,
  disabled = false,
  style,
  accessibilityLabel,
}) => {
  const getContainerStyle = (): ViewStyle => {
    return {
      ...styles.baseCard,
      ...variantStyles[variant],
      ...paddingStyles[padding],
      ...style,
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled}
        style={getContainerStyle()}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={getContainerStyle()} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
};

const paddingStyles: Record<CardPadding, ViewStyle> = {
  none: {
    padding: spacing.none,
  },
  sm: {
    padding: spacing.sm,
  },
  md: {
    padding: spacing.md,
  },
  lg: {
    padding: spacing.lg,
  },
};

const variantStyles: Record<CardVariant, ViewStyle> = {
  elevated: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  outlined: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flat: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 0,
  },
};

const styles = StyleSheet.create({
  baseCard: {
    borderRadius: radius.lg,
    width: "100%",
  },
});
