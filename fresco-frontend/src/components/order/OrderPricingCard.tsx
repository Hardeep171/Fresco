import React from "react";
import { View, StyleSheet } from "react-native";
import { PricingSnapshot } from "../../types/order.types";
import { PaymentStatus } from "../../constants/order.constants";
import { AppText, AppCard, AppBadge, AppDivider } from "../common";
import { spacing } from "../../theme";
import { formatCurrency } from "../../utils/formatters";



export interface OrderPricingCardProps {
  pricing: PricingSnapshot;
  paymentStatus: PaymentStatus;
}

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

export const OrderPricingCard: React.FC<OrderPricingCardProps> = ({
  pricing,
  paymentStatus,
}) => {
  const paymentVariant = getPaymentBadgeVariant(paymentStatus);

  return (
    <AppCard variant="outlined" padding="md" style={styles.card}>
      <View style={styles.headerRow}>
        <AppText variant="label" color="secondary" style={styles.sectionTitle}>
          BILL DETAILS & PAYMENT
        </AppText>
        <AppBadge
          label={paymentStatus}
          variant={paymentVariant}
          size="sm"
        />
      </View>

      {/* Items Subtotal */}
      <View style={styles.row}>
        <AppText variant="body" color="secondary">
          Items Subtotal:
        </AppText>
        <AppText variant="bodyMedium" color="primary">
          {formatCurrency(pricing.subtotal)}
        </AppText>
      </View>

      {/* Discount if present */}
      {pricing.discount > 0 ? (
        <View style={styles.row}>
          <AppText variant="body" color="success">
            Discount Applied:
          </AppText>
          <AppText variant="bodyMedium" color="success">
            - {formatCurrency(pricing.discount)}
          </AppText>
        </View>
      ) : null}

      {/* Doorstep Delivery */}
      <View style={styles.row}>
        <AppText variant="body" color="secondary">
          Doorstep Pickup & Delivery:
        </AppText>
        <AppText variant="bodyMedium" color={pricing.deliveryCharge === 0 ? "brand" : "primary"}>
          {pricing.deliveryCharge === 0 ? "FREE" : formatCurrency(pricing.deliveryCharge)}
        </AppText>
      </View>

      {/* Taxes */}
      <View style={styles.row}>
        <AppText variant="body" color="secondary">
          Taxes & Inspection:
        </AppText>
        <AppText variant="captionMedium" color="muted">
          {pricing.tax > 0 ? formatCurrency(pricing.tax) : "Included"}
        </AppText>
      </View>

      <AppDivider spacing="sm" />

      {/* Grand Total */}
      <View style={styles.totalRow}>
        <View>
          <AppText variant="bodyBold" color="primary">
            Total Amount:
          </AppText>
          <AppText variant="caption" color="muted">
            Verified backend invoice
          </AppText>
        </View>

        <AppText variant="h2" color="brand">
          {formatCurrency(pricing.totalAmount)}
        </AppText>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xxs,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.xs,
  },
});
