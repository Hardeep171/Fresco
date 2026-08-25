import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Payment } from "../../types/payment.types";
import { PaymentStatus } from "../../constants/order.constants";
import {
  PAYMENT_STATUS_DESCRIPTIONS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ICONS,
} from "../../constants/payment.constants";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { AppText } from "../common/AppText";
import { AppCard } from "../common/AppCard";
import { AppButton } from "../common/AppButton";
import { AppDivider } from "../common/AppDivider";
import { useTheme, spacing, radius } from "../../theme";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

export interface PaymentStatusCardProps {
  payment?: Payment | null;
  orderPaymentStatus?: PaymentStatus;
  orderTotalAmount?: number;
  onRecordOrChangePayment?: () => void;
  onRetryPayment?: () => void;
  isRetrying?: boolean;
  showActions?: boolean;
}

export const PaymentStatusCard: React.FC<PaymentStatusCardProps> = ({
  payment,
  orderPaymentStatus = "PENDING",
  orderTotalAmount,
  onRecordOrChangePayment,
  onRetryPayment,
  isRetrying = false,
  showActions = true,
}) => {
  const { colors } = useTheme();
  const currentStatus: PaymentStatus = payment?.status || orderPaymentStatus;
  const description =
    PAYMENT_STATUS_DESCRIPTIONS[currentStatus] ||
    "Payment status managed by FRESCO.";
  const methodLabel = payment?.paymentMethod
    ? PAYMENT_METHOD_LABELS[payment.paymentMethod]
    : "Cash on Delivery (Default)";
  const methodIcon = payment?.paymentMethod
    ? PAYMENT_METHOD_ICONS[payment.paymentMethod]
    : "cash-outline";

  const displayAmount = payment?.amount ?? orderTotalAmount ?? 0;
  const isPaid = currentStatus === "PAID";
  const isFailed = currentStatus === "FAILED";
  const isRefunded = currentStatus === "REFUNDED";
  const isPending = currentStatus === "PENDING";

  return (
    <AppCard variant="elevated" padding="md" style={styles.card}>
      {/* HEADER ROW */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons
            name="wallet-outline"
            size={20}
            color={colors.primary}
          />
          <AppText
            variant="label"
            color="secondary"
            style={styles.sectionTitle}
          >
            PAYMENT DETAILS
          </AppText>
        </View>

        <PaymentStatusBadge status={currentStatus} size="sm" />
      </View>

      <AppDivider spacing="sm" />

      {/* AMOUNT AND STATUS SUMMARY */}
      <View style={styles.detailRow}>
        <AppText variant="body" color="secondary">
          {isPaid ? "Amount Paid:" : "Payable Amount:"}
        </AppText>
        <AppText variant="h3" color="brand">
          {formatCurrency(displayAmount)}
        </AppText>
      </View>

      {/* PAYMENT METHOD */}
      <View style={styles.detailRow}>
        <AppText variant="body" color="secondary">
          Payment Method:
        </AppText>
        <View style={styles.methodBadge}>
          <Ionicons
            name={methodIcon}
            size={16}
            color={colors.primary}
            style={styles.methodIcon}
          />
          <AppText variant="bodyMedium" color="primary">
            {methodLabel}
          </AppText>
        </View>
      </View>

      {/* RECEIVED AT (IF PAID) */}
      {isPaid && payment?.receivedAt ? (
        <View style={styles.detailRow}>
          <AppText variant="body" color="secondary">
            Payment Confirmed:
          </AppText>
          <AppText variant="captionMedium" color="primary">
            {formatDateTime(payment.receivedAt)}
          </AppText>
        </View>
      ) : null}

      {/* STATUS DESCRIPTION */}
      <View
        style={[
          styles.descriptionBox,
          {
            backgroundColor: isPaid
              ? colors.successSurface
              : isFailed
              ? colors.errorSurface
              : colors.surfaceMuted,
          },
        ]}
      >
        <Ionicons
          name={
            isPaid
              ? "checkmark-circle-outline"
              : isFailed
              ? "alert-circle-outline"
              : isRefunded
              ? "arrow-undo-circle-outline"
              : "information-circle-outline"
          }
          size={18}
          color={
            isPaid
              ? colors.success
              : isFailed
              ? colors.error
              : isRefunded
              ? colors.textSecondary
              : colors.primary
          }
          style={styles.descIcon}
        />
        <AppText
          variant="caption"
          color={isPaid ? "success" : isFailed ? "error" : "secondary"}
          style={styles.descText}
        >
          {description}
        </AppText>
      </View>

      {/* ACTIONS */}
      {showActions && (
        <>
          {isFailed && onRetryPayment ? (
            <View style={styles.actionContainer}>
              <AppButton
                title="Retry Payment"
                variant="primary"
                size="md"
                loading={isRetrying}
                disabled={isRetrying}
                onPress={onRetryPayment}
                leftIcon={
                  <Ionicons
                    name="refresh-outline"
                    size={18}
                    color={colors.textInverse}
                  />
                }
              />
            </View>
          ) : isPending && onRecordOrChangePayment ? (
            <View style={styles.actionContainer}>
              <AppButton
                title={
                  payment
                    ? "Change Payment Method"
                    : "Select Payment Method"
                }
                variant="outline"
                size="sm"
                onPress={onRecordOrChangePayment}
                leftIcon={
                  <Ionicons
                    name="card-outline"
                    size={16}
                    color={colors.primary}
                  />
                }
              />
            </View>
          ) : null}
        </>
      )}
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
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    letterSpacing: 0.8,
    marginLeft: spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xxs,
  },
  methodBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  methodIcon: {
    marginRight: spacing.xxs,
  },
  descriptionBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  descIcon: {
    marginRight: spacing.xs,
  },
  descText: {
    flex: 1,
    lineHeight: 16,
  },
  actionContainer: {
    marginTop: spacing.sm,
  },
});
