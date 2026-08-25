import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText, AppCard, AppDivider } from "../common";
import { spacing } from "../../theme";
import { formatCurrency } from "../../utils/formatters";

export interface CartSummaryCardProps {
  totalAmount: number;
  itemCount: number;
}

export const CartSummaryCard: React.FC<CartSummaryCardProps> = ({
  totalAmount,
  itemCount,
}) => {
  return (
    <AppCard variant="elevated" padding="md" style={styles.card}>
      <AppText variant="label" color="secondary" style={styles.header}>
        BILL DETAILS
      </AppText>

      <View style={styles.row}>
        <AppText variant="body" color="secondary">
          Items Total ({itemCount} {itemCount === 1 ? "item" : "items"}):
        </AppText>
        <AppText variant="bodyMedium" color="primary">
          {formatCurrency(totalAmount)}
        </AppText>
      </View>

      <View style={styles.row}>
        <AppText variant="body" color="secondary">
          Doorstep Pickup & Delivery:
        </AppText>
        <AppText variant="bodyMedium" color="brand">
          FREE
        </AppText>
      </View>

      <View style={styles.row}>
        <AppText variant="body" color="secondary">
          Taxes & Fabric Inspection:
        </AppText>
        <AppText variant="captionMedium" color="muted">
          Included
        </AppText>
      </View>

      <AppDivider spacing="sm" />

      <View style={styles.totalRow}>
        <View>
          <AppText variant="bodyBold" color="primary">
            To Pay:
          </AppText>
          <AppText variant="caption" color="muted">
            Verified backend pricing
          </AppText>
        </View>
        <AppText variant="h2" color="brand">
          {formatCurrency(totalAmount)}
        </AppText>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing.md,
  },
  header: {
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
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
