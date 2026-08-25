import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Order } from "../../types/order.types";
import {
  ORDER_STATUS_LABELS,
  OrderStatus,
  PaymentStatus,
} from "../../constants/order.constants";
import { AppText, AppCard, AppBadge } from "../common";
import { useTheme, spacing, radius } from "../../theme";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

export interface OrderCardProps {
  order: Order;
  onPress: (order: Order) => void;
}

/**
 * Returns appropriate semantic variant for AppBadge based on backend OrderStatus.
 */
const getStatusBadgeVariant = (
  status: OrderStatus
): "primary" | "success" | "warning" | "error" | "info" | "neutral" => {
  switch (status) {
    case "DELIVERED":
      return "success";
    case "CANCELLED":
      return "error";
    case "PLACED":
      return "info";
    case "CONFIRMED":
    case "PICKUP_ASSIGNED":
    case "PICKED_UP":
    case "READY_FOR_DELIVERY":
    case "OUT_FOR_DELIVERY":
      return "primary";
    case "UNDER_INSPECTION":
    case "IN_PROCESS":
      return "warning";
    default:
      return "neutral";
  }
};

/**
 * Returns appropriate semantic variant for AppBadge based on backend PaymentStatus.
 */
const getPaymentBadgeVariant = (
  paymentStatus: PaymentStatus
): "success" | "warning" | "error" | "neutral" => {
  switch (paymentStatus) {
    case "PAID":
      return "success";
    case "PENDING":
      return "warning";
    case "FAILED":
      return "error";
    case "REFUNDED":
      return "neutral";
    default:
      return "neutral";
  }
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const { colors } = useTheme();
  const formattedOrderId = `#FRC-${order._id.slice(-8).toUpperCase()}`;
  const totalGarments = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;
  const statusVariant = getStatusBadgeVariant(order.status);
  const paymentVariant = getPaymentBadgeVariant(order.paymentStatus);

  // Generate preview of items (first 2 items names)
  const itemsPreview = order.items
    .slice(0, 2)
    .map((item) => `${item.garmentName} (${item.serviceName}) x${item.quantity}`)
    .join(", ");
  const remainingItemsCount = order.items.length - 2;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(order)}
      accessibilityRole="button"
      accessibilityLabel={`View order details for ${formattedOrderId}, status ${statusLabel}, total ${formatCurrency(
        order.pricing.totalAmount
      )}`}
    >
      <AppCard variant="elevated" padding="md" style={styles.card}>
        {/* TOP ROW: Order ID, Date, Status */}
        <View style={styles.headerRow}>
          <View style={styles.orderIdContainer}>
            <AppText variant="bodyBold" color="primary" numberOfLines={1}>
              {formattedOrderId}
            </AppText>
            <AppText variant="caption" color="muted">
              {formatDateTime(order.createdAt)}
            </AppText>
          </View>

          <View style={styles.badgeGroup}>
            <AppBadge
              label={statusLabel}
              variant={statusVariant}
              size="sm"
              showDot
            />
          </View>
        </View>

        {/* ITEMS PREVIEW */}
        <View style={[styles.itemsSection, { backgroundColor: colors.surfaceMuted }]}>
          <View style={styles.itemIconRow}>
            <Ionicons
              name="shirt-outline"
              size={16}
              color={colors.textSecondary}
              style={styles.itemIcon}
            />
            <AppText
              variant="captionMedium"
              color="secondary"
              numberOfLines={1}
              style={styles.itemsPreviewText}
            >
              {itemsPreview}
              {remainingItemsCount > 0 ? ` +${remainingItemsCount} more` : ""}
            </AppText>
          </View>

          <AppText variant="caption" color="muted">
            {totalGarments} {totalGarments === 1 ? "garment" : "garments"} total
          </AppText>
        </View>

        {/* ADDRESS & SCHEDULE SUMMARY */}
        <View style={styles.addressRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={colors.textMuted}
            style={styles.locationIcon}
          />
          <AppText
            variant="caption"
            color="secondary"
            numberOfLines={1}
            style={styles.addressText}
          >
            {order.pickupAddress.city} • {order.pickupAddress.addressLine1}
          </AppText>
        </View>

        {/* FOOTER: Total Amount & Payment Status & Action CTA */}
        <View style={[styles.footerRow, { borderTopColor: colors.borderLight }]}>
          <View style={styles.priceContainer}>
            <AppText variant="caption" color="muted">
              Total Amount
            </AppText>
            <AppText variant="bodyLarge" color="brand" style={styles.priceValue}>
              {formatCurrency(order.pricing.totalAmount)}
            </AppText>
          </View>

          <View style={styles.footerActions}>
            <AppBadge
              label={order.paymentStatus}
              variant={paymentVariant}
              size="sm"
            />
            <View style={styles.chevronWrapper}>
              <AppText variant="captionMedium" color="brand" style={styles.detailsCtaText}>
                Details
              </AppText>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.primary}
              />
            </View>
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: spacing.xs,
  },
  orderIdContainer: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  badgeGroup: {
    alignItems: "flex-end",
  },
  itemsSection: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginVertical: spacing.xs,
  },
  itemIconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  itemIcon: {
    marginRight: spacing.xs,
  },
  itemsPreviewText: {
    flex: 1,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xxs,
    marginBottom: spacing.xs,
  },
  locationIcon: {
    marginRight: spacing.xxs,
  },
  addressText: {
    flex: 1,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.xs,
    borderTopWidth: 1,
  },
  priceContainer: {
    justifyContent: "center",
  },
  priceValue: {
    fontWeight: "700",
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  chevronWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsCtaText: {
    marginRight: 2,
  },
});
