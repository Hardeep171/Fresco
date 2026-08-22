import React from "react";
import { View, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { colors, spacing, radius } from "../../../theme";
import { AppText } from "../AppText";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

export type BadgeSize = "sm" | "md";

export interface AppBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  showDot?: boolean;
  leftIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AppBadge: React.FC<AppBadgeProps> = ({
  label,
  variant = "neutral",
  size = "md",
  showDot = false,
  leftIcon,
  style,
  textStyle,
}) => {
  const variantConfig = variantStyles[variant];
  const sizeConfig = sizeStyles[size];

  return (
    <View
      style={[
        styles.badgeContainer,
        sizeConfig.container,
        { backgroundColor: variantConfig.backgroundColor },
        style,
      ]}
      accessibilityRole="text"
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            sizeConfig.dot,
            { backgroundColor: variantConfig.dotColor },
          ]}
        />
      )}
      {leftIcon && <View style={styles.iconWrapper}>{leftIcon}</View>}
      <AppText
        variant={sizeConfig.textVariant}
        color={variantConfig.textColor}
        style={textStyle}
      >
        {label}
      </AppText>
    </View>
  );
};

const sizeStyles = {
  sm: {
    container: {
      paddingVertical: spacing.xxs,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.round,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: spacing.xs,
    },
    textVariant: "label" as const,
  },
  md: {
    container: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: radius.round,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: spacing.xs,
    },
    textVariant: "captionMedium" as const,
  },
};

const variantStyles: Record<
  BadgeVariant,
  {
    backgroundColor: string;
    dotColor: string;
    textColor: Parameters<typeof AppText>[0]["color"];
  }
> = {
  primary: {
    backgroundColor: colors.primarySurface,
    dotColor: colors.primary,
    textColor: "brand",
  },
  secondary: {
    backgroundColor: colors.surfaceMuted,
    dotColor: colors.textSecondary,
    textColor: "secondary",
  },
  success: {
    backgroundColor: colors.successSurface,
    dotColor: colors.success,
    textColor: "success",
  },
  warning: {
    backgroundColor: colors.warningSurface,
    dotColor: colors.warning,
    textColor: "warning",
  },
  error: {
    backgroundColor: colors.errorSurface,
    dotColor: colors.error,
    textColor: "error",
  },
  info: {
    backgroundColor: colors.infoSurface,
    dotColor: colors.info,
    textColor: "info",
  },
  neutral: {
    backgroundColor: colors.surfaceMuted,
    dotColor: colors.textMuted,
    textColor: "secondary",
  },
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  dot: {},
  iconWrapper: {
    marginRight: spacing.xs,
  },
});
