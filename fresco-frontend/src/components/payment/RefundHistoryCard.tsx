import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RefundTransaction } from "../../types/payment.types";
import {
  REFUND_STATUS_LABELS,
  REFUND_STATUS_VARIANTS,
} from "../../constants/payment.constants";
import { AppText } from "../common/AppText";
import { AppCard } from "../common/AppCard";
import { AppBadge } from "../common/AppBadge";
import { AppDivider } from "../common/AppDivider";
import { useTheme, spacing, radius } from "../../theme";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

export interface RefundHistoryCardProps {
  refunds: RefundTransaction[];
}

export const RefundHistoryCard: React.FC<RefundHistoryCardProps> = ({
  refunds,
}) => {
  const { colors } = useTheme();

  if (!refunds || refunds.length === 0) {
    return null;
  }

  const totalRefunded = refunds
    .filter((r) => r.status === "COMPLETED")
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <AppCard variant="outlined" padding="md" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Ionicons
            name="arrow-undo-circle-outline"
            size={20}
            color={colors.primary}
          />
          <AppText
            variant="bodyBold"
            color="primary"
            style={styles.headerTitle}
          >
            Refund History ({refunds.length})
          </AppText>
        </View>
        <AppText variant="bodyBold" color="brand">
          Total: {formatCurrency(totalRefunded)}
        </AppText>
      </View>

      <AppText variant="caption" color="secondary" style={styles.subtitle}>
        Processed refunds issued for this order.
      </AppText>

      <AppDivider spacing="sm" />

      <View style={styles.refundsList}>
        {refunds.map((refund, idx) => {
          const statusLabel =
            REFUND_STATUS_LABELS[refund.status] || refund.status;
          const statusVariant =
            REFUND_STATUS_VARIANTS[refund.status] || "neutral";

          return (
            <View key={refund._id || idx} style={styles.refundItem}>
              <View style={styles.itemTopRow}>
                <View style={styles.amountCol}>
                  <AppText variant="bodyBold" color="primary">
                    {formatCurrency(refund.amount)}
                  </AppText>
                  {refund.processedAt || refund.createdAt ? (
                    <AppText variant="caption" color="muted">
                      {formatDateTime(
                        refund.processedAt || refund.createdAt!
                      )}
                    </AppText>
                  ) : null}
                </View>

                <AppBadge
                  label={statusLabel}
                  variant={statusVariant}
                  size="sm"
                  showDot
                />
              </View>

              {refund.reason ? (
                <View style={[styles.reasonBlock, { backgroundColor: colors.surfaceMuted }]}>
                  <AppText variant="caption" color="secondary">
                    Reason: {refund.reason}
                  </AppText>
                </View>
              ) : null}

              {idx < refunds.length - 1 && <AppDivider spacing="xs" />}
            </View>
          );
        })}
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
    marginBottom: 2,
  },
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    marginLeft: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.xs,
  },
  refundsList: {
    gap: spacing.xs,
  },
  refundItem: {
    paddingVertical: spacing.xxs,
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  amountCol: {
    flex: 1,
  },
  reasonBlock: {
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    marginTop: spacing.xxs,
  },
});
