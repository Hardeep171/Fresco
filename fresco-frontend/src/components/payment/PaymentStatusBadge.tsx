import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PaymentStatus } from "../../constants/order.constants";
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_VARIANTS,
  PAYMENT_STATUS_ICONS,
} from "../../constants/payment.constants";
import { AppBadge } from "../common/AppBadge";
import { useTheme, spacing } from "../../theme";

export interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: "sm" | "md";
  showIcon?: boolean;
  style?: ViewStyle;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  size = "md",
  showIcon = true,
  style,
}) => {
  const { colors } = useTheme();
  const label = PAYMENT_STATUS_LABELS[status] || status;
  const variant = PAYMENT_STATUS_VARIANTS[status] || "neutral";
  const iconName = PAYMENT_STATUS_ICONS[status] || "information-circle-outline";

  const getIconColor = () => {
    switch (variant) {
      case "success":
        return colors.success;
      case "warning":
        return colors.warning;
      case "error":
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const iconSize = size === "sm" ? 14 : 16;

  return (
    <View style={[styles.container, style]}>
      {showIcon && (
        <Ionicons
          name={iconName}
          size={iconSize}
          color={getIconColor()}
          style={styles.icon}
        />
      )}
      <AppBadge label={label} variant={variant} size={size} showDot={false} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: spacing.xxs,
  },
});
