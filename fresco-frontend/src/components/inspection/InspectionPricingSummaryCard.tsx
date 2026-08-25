import React from "react";
import { View, StyleSheet } from "react-native";
import { InspectionPricingSummary } from "../../types/inspection.types";
import { AppText, AppCard, AppDivider } from "../common";
import { spacing } from "../../theme";
import { formatCurrency } from "../../utils/formatters";


export interface InspectionPricingSummaryCardProps {
  pricing: InspectionPricingSummary;
}

export const InspectionPricingSummaryCard: React.FC<
  InspectionPricingSummaryCardProps
> = ({ pricing }) => {
  const isAdjustmentPresent =
    pricing.adjustmentAmount !== undefined && pricing.adjustmentAmount !== 0;

  return (
    <AppCard variant="elevated" padding="md" style={styles.card}>
      <AppText variant="label" color="secondary" style={styles.title}>
        FINANCIAL & PRICING SUMMARY
      </AppText>

      {/* INITIAL TOTAL */}
      <View style={styles.row}>
        <AppText variant="body" color="secondary">
          Initial Order Total:
        </AppText>
        <AppText variant="bodyMedium" color="primary">
          {formatCurrency(pricing.initialTotal)}
        </AppText>
      </View>

      {/* INSPECTED SUBTOTAL */}
      <View style={styles.row}>
        <AppText variant="body" color="secondary">
          Inspected Items Subtotal:
        </AppText>
        <AppText variant="bodyMedium" color="primary">
          {formatCurrency(pricing.inspectedSubtotal)}
        </AppText>
      </View>

      {/* EXTRA SERVICES CHARGES */}
      {pricing.extraServiceCharges > 0 ? (
        <View style={styles.row}>
          <AppText variant="body" color="secondary">
            Extra Services:
          </AppText>
          <AppText variant="bodyMedium" color="primary">
            +{formatCurrency(pricing.extraServiceCharges)}
          </AppText>
        </View>
      ) : null}

      {/* ADJUSTMENT AMOUNT & REASON */}
      {isAdjustmentPresent ? (
        <View style={styles.row}>
          <View style={styles.adjustmentLabelCol}>
            <AppText variant="body" color="secondary">
              Condition Adjustment:
            </AppText>
            {pricing.adjustmentReason ? (
              <AppText variant="caption" color="muted">
                Reason: {pricing.adjustmentReason}
              </AppText>
            ) : null}
          </View>
          <AppText
            variant="bodyMedium"
            color={pricing.adjustmentAmount > 0 ? "error" : "success"}
          >
            {pricing.adjustmentAmount > 0 ? "+" : ""}
            {formatCurrency(pricing.adjustmentAmount)}
          </AppText>
        </View>
      ) : null}

      {/* TAX */}
      {pricing.finalTax > 0 ? (
        <View style={styles.row}>
          <AppText variant="body" color="secondary">
            Taxes:
          </AppText>
          <AppText variant="bodyMedium" color="primary">
            {formatCurrency(pricing.finalTax)}
          </AppText>
        </View>
      ) : null}

      <AppDivider spacing="sm" />

      {/* FINAL TOTAL AMOUNT */}
      <View style={styles.totalRow}>
        <AppText variant="bodyBold" color="primary">
          Final Total Amount:
        </AppText>
        <AppText variant="h2" color="brand">
          {formatCurrency(pricing.finalTotalAmount)}
        </AppText>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  title: {
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xxs,
  },
  adjustmentLabelCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.xxs,
  },
});
