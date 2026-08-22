import React from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { colors, spacing, radius } from "../../../theme";
import { AppText } from "../AppText";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  accessibilityLabel?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  accessibilityLabel,
  style,
  textStyle,
}) => {
  const isInteractive = !disabled && !loading;

  // Determine container styling based on variant and state
  const getContainerStyle = (): ViewStyle => {
    const sizeStyle = sizeStyles[size];
    let variantStyle = variantStyles[variant].container;

    if (disabled) {
      variantStyle = disabledStyles[variant]?.container || {
        backgroundColor: colors.surfaceDisabled,
        borderColor: colors.surfaceDisabled,
      };
    }

    return {
      ...styles.baseButton,
      ...sizeStyle.container,
      ...variantStyle,
      ...(fullWidth ? styles.fullWidth : {}),
      ...style,
    };
  };

  // Determine text color based on variant and state
  const getTextColor = (): Parameters<typeof AppText>[0]["color"] => {
    if (disabled) {
      return "disabled";
    }
    return variantStyles[variant].textColor;
  };

  // Determine indicator color
  const getSpinnerColor = (): string => {
    if (variant === "primary" || variant === "danger") {
      return colors.textInverse;
    }
    return colors.primary;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={!isInteractive}
      style={getContainerStyle()}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getSpinnerColor()} />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}
          <AppText
            variant={sizeStyles[size].textVariant}
            color={getTextColor()}
            align="center"
            style={textStyle}
          >
            {title}
          </AppText>
          {rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const sizeStyles = {
  sm: {
    container: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      minHeight: 36,
      borderRadius: radius.sm,
    },
    textVariant: "captionMedium" as const,
  },
  md: {
    container: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      minHeight: 48,
      borderRadius: radius.md,
    },
    textVariant: "bodyBold" as const,
  },
  lg: {
    container: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      minHeight: 56,
      borderRadius: radius.lg,
    },
    textVariant: "bodyLarge" as const,
  },
};

const variantStyles: Record<
  ButtonVariant,
  {
    container: ViewStyle;
    textColor: "inverse" | "brand" | "primary" | "error";
  }
> = {
  primary: {
    container: {
      backgroundColor: colors.primary,
      borderWidth: 0,
    },
    textColor: "inverse",
  },
  secondary: {
    container: {
      backgroundColor: colors.primarySurface,
      borderWidth: 0,
    },
    textColor: "brand",
  },
  outline: {
    container: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    textColor: "brand",
  },
  danger: {
    container: {
      backgroundColor: colors.error,
      borderWidth: 0,
    },
    textColor: "inverse",
  },
  ghost: {
    container: {
      backgroundColor: "transparent",
      borderWidth: 0,
    },
    textColor: "brand",
  },
};

const disabledStyles: Partial<
  Record<ButtonVariant, { container: ViewStyle }>
> = {
  outline: {
    container: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
  },
  ghost: {
    container: {
      backgroundColor: "transparent",
      borderWidth: 0,
    },
  },
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  leftIconWrapper: {
    marginRight: spacing.sm,
  },
  rightIconWrapper: {
    marginLeft: spacing.sm,
  },
});
