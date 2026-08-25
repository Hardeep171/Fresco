import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { OrdersStackParamList } from "../../types/navigation.types";
import { PaymentMethod } from "../../constants/payment.constants";
import { usePayment } from "../../hooks/usePayment";
import { useOrders } from "../../hooks/useOrders";
import {
  AppText,
  AppButton,
  AppCard,
  AppHeader,
  AppDivider,
  AppLoader,
  ErrorState,
  ScreenContainer,
} from "../../components/common";
import {
  PaymentStatusBadge,
  PaymentMethodSelector,
  RefundHistoryCard,
} from "../../components/payment";
import { useTheme, colors, spacing, radius, shadows } from "../../theme";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

type Props = NativeStackScreenProps<OrdersStackParamList, "PaymentScreen">;

export const PaymentScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { orderId, initialPaymentMethod } = route.params;

  const {
    currentOrder,
    isFetchingDetails,
    loadOrderById,
  } = useOrders();

  const {
    currentPayment,
    isFetchingPayment,
    isRecordingPayment,
    isRetryingPayment,
    recordError,
    retryError,
    error: generalPaymentError,
    loadPaymentByOrderId,
    recordPayment,
    retryPayment,
    clearErrors,
  } = usePayment();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    initialPaymentMethod || "CASH"
  );
  const [refreshing, setRefreshing] = useState(false);

  // Synchronous double-tap guard ref
  const isSubmittingRef = useRef(false);

  // Fetch order and payment records on mount
  useEffect(() => {
    loadOrderById(orderId);
    loadPaymentByOrderId(orderId);
  }, [orderId, loadOrderById, loadPaymentByOrderId]);

  // Sync selected method if payment record already exists
  useEffect(() => {
    if (currentPayment?.paymentMethod) {
      setSelectedMethod(currentPayment.paymentMethod);
    }
  }, [currentPayment?.paymentMethod]);

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadOrderById(orderId),
      loadPaymentByOrderId(orderId),
    ]);
    setRefreshing(false);
  }, [orderId, loadOrderById, loadPaymentByOrderId]);

  // Handle Confirm / Record / Retry payment
  const handleConfirmPayment = async () => {
    if (isSubmittingRef.current || isRecordingPayment || isRetryingPayment) {
      return;
    }

    clearErrors();
    isSubmittingRef.current = true;

    try {
      if (currentPayment && currentPayment.status === "FAILED") {
        // Retry failed payment
        const result = await retryPayment(currentPayment._id, {
          paymentMethod: selectedMethod,
        });
        if (result) {
          Alert.alert(
            "Payment Recorded",
            `Payment method updated to ${selectedMethod}. Please complete the payment upon doorstep handover.`
          );
        }
      } else {
        // First-time recording
        const result = await recordPayment({
          orderId,
          paymentMethod: selectedMethod,
        });
        if (result) {
          Alert.alert(
            "Payment Recorded",
            `Payment recorded with ${selectedMethod}. Please complete the payment upon doorstep handover.`
          );
        }
      }
    } catch {
      // Handled via Redux error state
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const order = currentOrder && currentOrder._id === orderId ? currentOrder : null;
  const formattedOrderId = order
    ? `#FRC-${order._id.slice(-8).toUpperCase()}`
    : `#FRC-${orderId.slice(-8).toUpperCase()}`;

  const payableAmount = currentPayment?.amount ?? order?.pricing?.totalAmount ?? 0;
  const paymentStatus = currentPayment?.status ?? order?.paymentStatus ?? "PENDING";
  const isPaid = paymentStatus === "PAID";
  const isFailed = paymentStatus === "FAILED";
  const isRefunded = paymentStatus === "REFUNDED";
  const isSubmitting = isRecordingPayment || isRetryingPayment;
  const activeError = recordError || retryError || generalPaymentError;

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader
        title="Payment"
        subtitle={formattedOrderId}
        onBackPress={() => navigation.goBack()}
      />

      {/* INITIAL LOADING STATE */}
      {(isFetchingDetails || isFetchingPayment) && !refreshing && !order && !currentPayment ? (
        <View style={styles.loadingContainer}>
          <AppLoader
            variant="spinner"
            size="large"
            message="Loading payment details..."
          />
        </View>
      ) : !order && !currentPayment && generalPaymentError ? (
        /* ERROR STATE */
        <ErrorState
          title="Unable to Load Payment"
          message={generalPaymentError.message || "Failed to load order payment."}
          retryText="Try Again"
          onRetry={() => {
            loadOrderById(orderId);
            loadPaymentByOrderId(orderId);
          }}
        />
      ) : (
        /* PAYMENT CONTENT */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* ERROR BANNER */}
          {activeError && (
            <View style={[styles.errorBanner, { backgroundColor: colors.errorSurface }]}>
              <Ionicons
                name="alert-circle"
                size={20}
                color={colors.error}
                style={styles.errorIcon}
              />
              <AppText variant="captionMedium" color="error" style={styles.errorText}>
                {activeError.message || "Payment request failed. Please try again."}
              </AppText>
            </View>
          )}

          {/* ORDER & AMOUNT SUMMARY CARD */}
          <AppCard variant="elevated" padding="md" style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.orderRefCol}>
                <AppText variant="caption" color="muted">
                  ORDER REFERENCE
                </AppText>
                <AppText variant="h2" color="primary" numberOfLines={1}>
                  {formattedOrderId}
                </AppText>
              </View>

              <PaymentStatusBadge status={paymentStatus} size="md" />
            </View>

            <AppDivider spacing="md" />

            <View style={styles.amountRow}>
              <View>
                <AppText variant="bodyBold" color="secondary">
                  {isPaid ? "Amount Paid" : "Total Payable Amount"}
                </AppText>
                <AppText variant="caption" color="muted">
                  Authoritative backend invoice
                </AppText>
              </View>

              <AppText variant="h1" color="brand" style={styles.amountText}>
                {formatCurrency(payableAmount)}
              </AppText>
            </View>
          </AppCard>

          {/* PAID SUCCESS BANNER */}
          {isPaid && (
            <AppCard variant="outlined" padding="md" style={styles.successCard}>
              <View style={styles.successHeader}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.success}
                  style={styles.successIcon}
                />
                <View style={styles.successTextCol}>
                  <AppText variant="bodyBold" color="success">
                    Payment Completed
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    This order has been verified and fully paid
                    {currentPayment?.receivedAt
                      ? ` on ${formatDateTime(currentPayment.receivedAt)}.`
                      : "."}
                  </AppText>
                </View>
              </View>
            </AppCard>
          )}

          {/* REFUNDED BANNER */}
          {isRefunded && (
            <AppCard variant="outlined" padding="md" style={styles.refundedCard}>
              <View style={styles.refundedHeader}>
                <Ionicons
                  name="arrow-undo-circle"
                  size={24}
                  color={colors.primary}
                  style={styles.refundedIcon}
                />
                <View style={styles.refundedTextCol}>
                  <AppText variant="bodyBold" color="primary">
                    Order Refunded
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Payment for this order has been refunded by FRESCO customer support.
                  </AppText>
                </View>
              </View>
            </AppCard>
          )}

          {/* REFUND TRANSACTIONS HISTORY (IF AVAILABLE) */}
          {currentPayment?.refunds && currentPayment.refunds.length > 0 && (
            <RefundHistoryCard refunds={currentPayment.refunds} />
          )}

          {/* PAYMENT METHOD SELECTION (ONLY WHEN PENDING OR FAILED) */}
          {!isPaid && !isRefunded && (
            <>
              <PaymentMethodSelector
                selectedMethod={selectedMethod}
                onSelectMethod={(method) => {
                  setSelectedMethod(method);
                  clearErrors();
                }}
                disabled={isSubmitting}
              />

              {/* DOORSTEP PAYMENT NOTICE */}
              <View style={styles.noticeBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={colors.primary}
                  style={styles.noticeIcon}
                />
                <AppText variant="caption" color="secondary" style={styles.noticeText}>
                  FRESCO operates a simple, backend-recorded doorstep payment workflow.
                  Select your preferred method above and confirm. You will pay the delivery
                  partner directly when your laundry is serviced.
                </AppText>
              </View>

              {/* ACTION CTA */}
              <View style={styles.ctaContainer}>
                <AppButton
                  title={
                    isFailed
                      ? `Retry Payment • ${selectedMethod}`
                      : currentPayment
                      ? `Confirm Method • ${selectedMethod}`
                      : `Confirm Payment • ${formatCurrency(payableAmount)}`
                  }
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  onPress={handleConfirmPayment}
                  leftIcon={
                    <Ionicons
                      name={
                        isFailed
                          ? "refresh-outline"
                          : "checkmark-circle-outline"
                      }
                      size={22}
                      color={colors.textInverse}
                    />
                  }
                />
              </View>
            </>
          )}

          {/* BACK TO ORDER DETAILS CTA IF PAID / REFUNDED */}
          {(isPaid || isRefunded) && (
            <View style={styles.ctaContainer}>
              <AppButton
                title="View Order Details"
                variant="outline"
                size="md"
                onPress={() => navigation.goBack()}
                leftIcon={
                  <Ionicons
                    name="receipt-outline"
                    size={20}
                    color={colors.primary}
                  />
                }
              />
            </View>
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  scrollContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorSurface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorIcon: {
    marginRight: spacing.sm,
  },
  errorText: {
    flex: 1,
  },
  summaryCard: {
    marginBottom: spacing.md,
    ...shadows.card,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderRefCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountText: {
    letterSpacing: -0.5,
  },
  successCard: {
    marginBottom: spacing.md,
    borderColor: colors.success,
    backgroundColor: colors.successSurface,
  },
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  successIcon: {
    marginRight: spacing.sm,
  },
  successTextCol: {
    flex: 1,
  },
  refundedCard: {
    marginBottom: spacing.md,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMuted,
  },
  refundedHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  refundedIcon: {
    marginRight: spacing.sm,
  },
  refundedTextCol: {
    flex: 1,
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noticeIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  noticeText: {
    flex: 1,
    lineHeight: 18,
  },
  ctaContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
});
