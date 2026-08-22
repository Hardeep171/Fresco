import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText, AppCard, AppDivider } from "../common";
import { spacing, shadows } from "../../theme";
import { formatCurrency } from "../../utils/formatters";

export interface PriceSummaryCardProps {
  unitPrice: number;
  quantity: number;
  serviceName: string;
}

export const PriceSummaryCard: React.FC<PriceSummaryCardProps> = ({
  unitPrice,
  quantity,
  serviceName,
}) => {
  const totalAmount = unitPrice * quantity;

  return (
    <AppCard variant="elevated" padding="md" style={styles.card}>
      <AppText variant="label" color="secondary" style={styles.header}>
        PRICING BREAKDOWN
      </AppText>

      <View style={styles.row}>
        <AppText variant="body" color="secondary">
          Selected Service:
        </AppText>
        <AppText variant="bodyMedium" color="primary">
          {serviceName}
        </AppText>
      </View>

      <View style={styles.row}>
        <AppText variant="body" color="secondary">
          Unit Price (Verified):
        </AppText>
        <AppText variant="bodyMedium" color="primary">
          {formatCurrency(unitPrice)}
        </AppText>
      </View>

      <View style={styles.row}>
        <AppText variant="body" color="secondary">
          Quantity:
        </AppText>
        <AppText variant="bodyMedium" color="primary">
          {quantity} {quantity === 1 ? "item" : "items"}
        </AppText>
      </View>

      <AppDivider spacing="sm" />

      <View style={styles.totalRow}>
        <View>
          <AppText variant="bodyBold" color="primary">
            Total Estimated:
          </AppText>
          <AppText variant="caption" color="muted">
            Includes standard fabric inspection
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
    ...shadows.card,
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
