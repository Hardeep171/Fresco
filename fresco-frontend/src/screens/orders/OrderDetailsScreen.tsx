import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Alert,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { OrdersStackParamList } from "../../types/navigation.types";
import {
  ORDER_STATUS_LABELS,
  isOrderCancellable,
} from "../../constants/order.constants";
import { useOrders } from "../../hooks/useOrders";
import { usePayment } from "../../hooks/usePayment";
import {
  AppText,
  AppButton,
  AppCard,
  AppHeader,
  AppBadge,
  AppDivider,
  AppLoader,
  ErrorState,
  ScreenContainer,
} from "../../components/common";
import {
  OrderStatusTimeline,
  OrderItemList,
  OrderPricingCard,
} from "../../components/order";
import {
  PaymentStatusCard,
  RefundHistoryCard,
} from "../../components/payment";
import { useTheme, colors, spacing, radius, shadows } from "../../theme";
import { formatDate, formatDateTime, formatPhone } from "../../utils/formatters";

type Props = NativeStackScreenProps<OrdersStackParamList, "OrderDetailsScreen">;

export const OrderDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { orderId } = route.params;
  const {
    currentOrder,
    isFetchingDetails,
    isCancellingOrder,
    detailsError,
    cancelError,
    loadOrderById,
    cancelOrder,
    clearCancel,
  } = useOrders();

  const {
    currentPayment,
    isRetryingPayment,
    loadPaymentByOrderId,
    retryPayment,
  } = usePayment();

  const [refreshing, setRefreshing] = useState(false);
  const isCancellingRef = useRef(false);

  // Fetch order details & payment on mount
  useEffect(() => {
    loadOrderById(orderId);
    loadPaymentByOrderId(orderId);
  }, [orderId, loadOrderById, loadPaymentByOrderId]);

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadOrderById(orderId),
      loadPaymentByOrderId(orderId),
    ]);
    setRefreshing(false);
  }, [orderId, loadOrderById, loadPaymentByOrderId]);

  // Cancel order with confirmation modal
  const handleCancelOrder = useCallback(() => {
    if (isCancellingRef.current || isCancellingOrder) return;

    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? This action cannot be undone.",
      [
        {
          text: "Keep Order",
          style: "cancel",
          onPress: () => clearCancel(),
        },
        {
          text: "Yes, Cancel Order",
          style: "destructive",
          onPress: async () => {
            isCancellingRef.current = true;
            await cancelOrder(orderId);
            isCancellingRef.current = false;
          },
        },
      ]
    );
  }, [orderId, cancelOrder, clearCancel, isCancellingOrder]);

  const order = currentOrder && currentOrder._id === orderId ? currentOrder : null;
  const formattedOrderId = order ? `#FRC-${order._id.slice(-8).toUpperCase()}` : "";
  const canCancel = order ? isOrderCancellable(order.status) : false;

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader
        title="Order Details"
        subtitle={formattedOrderId}
        onBackPress={() => navigation.goBack()}
      />

      {/* ERROR STATE */}
      {detailsError && !order ? (
        <ErrorState
          title="Order Not Found"
          message={detailsError.message || "Unable to retrieve order details."}
          retryText="Try Again"
          onRetry={() => loadOrderById(orderId)}
        />
      ) : isFetchingDetails && !refreshing && !order ? (
        /* INITIAL LOADING STATE */
        <View style={styles.loadingContainer}>
          <AppLoader
            variant="spinner"
            size="large"
            message="Loading order details..."
          />
        </View>
      ) : order ? (
        /* ORDER DETAILS CONTENT */
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
          {/* CANCELLATION ERROR BANNER */}
          {cancelError && (
            <View style={[styles.errorBanner, { backgroundColor: colors.errorSurface }]}>
              <Ionicons
                name="alert-circle"
                size={20}
                color={colors.error}
                style={styles.errorIcon}
              />
              <AppText variant="captionMedium" color="error" style={styles.errorMessage}>
                {cancelError.message || "Failed to cancel order. Please try again."}
              </AppText>
            </View>
          )}

          {/* TOP SUMMARY CARD */}
          <AppCard variant="elevated" padding="md" style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View>
                <AppText variant="caption" color="muted">
                  ORDER REFERENCE
                </AppText>
                <AppText variant="h2" color="primary">
                  {formattedOrderId}
                </AppText>
                <AppText variant="caption" color="secondary" style={styles.placedDate}>
                  Placed on {formatDateTime(order.createdAt)}
                </AppText>
              </View>

              <AppBadge
                label={ORDER_STATUS_LABELS[order.status] || order.status}
                variant={order.status === "DELIVERED" ? "success" : order.status === "CANCELLED" ? "error" : "primary"}
                size="md"
                showDot
              />
            </View>
          </AppCard>

          {/* LIVE STATUS TIMELINE */}
          <OrderStatusTimeline
            currentStatus={order.status}
            createdAt={order.createdAt}
            updatedAt={order.updatedAt}
          />

          {/* GARMENT INSPECTION REPORT BANNER */}
          <AppCard variant="outlined" padding="md" style={styles.sectionCard}>
            <View style={styles.inspectionHeaderRow}>
              <View style={styles.inspectionTitleBlock}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={colors.primary}
                />
                <AppText
                  variant="bodyBold"
                  color="primary"
                  style={styles.inspectionTitle}
                >
                  Garment Inspection
                </AppText>
              </View>
              <AppBadge
                label={
                  order.status === "UNDER_INSPECTION"
                    ? "Under Inspection"
                    : order.status === "PLACED" ||
                      order.status === "CONFIRMED" ||
                      order.status === "PICKUP_ASSIGNED" ||
                      order.status === "PICKED_UP"
                    ? "Pending Inspection"
                    : "Inspected"
                }
                variant={
                  order.status === "UNDER_INSPECTION"
                    ? "warning"
                    : order.status === "PLACED" ||
                      order.status === "CONFIRMED" ||
                      order.status === "PICKUP_ASSIGNED" ||
                      order.status === "PICKED_UP"
                    ? "neutral"
                    : "success"
                }
                size="sm"
                showDot
              />
            </View>

            <AppText
              variant="caption"
              color="secondary"
              style={styles.inspectionDesc}
            >
              Garments are inspected in your presence before workshop processing to verify fabric condition and pre-existing stains.
            </AppText>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate("InspectionReviewScreen", {
                  orderId: order._id,
                })
              }
              style={styles.viewInspectionBtn}
              accessibilityRole="button"
              accessibilityLabel="View inspection details and findings"
            >
              <AppText variant="captionMedium" color="brand">
                View Inspection Details & Findings
              </AppText>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          </AppCard>

          {/* ITEMIZED GARMENTS LIST */}
          <OrderItemList items={order.items} />


          {/* AUTHORITATIVE PRICING BREAKDOWN */}
          <OrderPricingCard
            pricing={order.pricing}
            paymentStatus={order.paymentStatus}
          />

          {/* PAYMENT DETAILS & RECORDING FLOW */}
          <PaymentStatusCard
            payment={
              currentPayment && currentPayment.orderId === order._id
                ? currentPayment
                : null
            }
            orderPaymentStatus={order.paymentStatus}
            orderTotalAmount={order.pricing.totalAmount}
            onRecordOrChangePayment={() =>
              navigation.navigate("PaymentScreen", {
                orderId: order._id,
                initialPaymentMethod:
                  currentPayment?.paymentMethod || "CASH",
              })
            }
            onRetryPayment={async () => {
              if (currentPayment) {
                await retryPayment(currentPayment._id, {
                  paymentMethod: currentPayment.paymentMethod,
                });
                await loadOrderById(orderId);
              } else {
                navigation.navigate("PaymentScreen", {
                  orderId: order._id,
                });
              }
            }}
            isRetrying={isRetryingPayment}
          />

          {/* REFUND HISTORY (IF ANY PROCESSED REFUNDS EXIST) */}
          {currentPayment?.refunds && currentPayment.refunds.length > 0 && (
            <RefundHistoryCard refunds={currentPayment.refunds} />
          )}

          {/* PICKUP & DELIVERY ADDRESSES */}
          <AppCard variant="outlined" padding="md" style={styles.sectionCard}>
            <AppText variant="label" color="secondary" style={styles.sectionTitle}>
              SERVICE ADDRESSES
            </AppText>

            {/* Pickup Address */}
            <View style={styles.addressBlock}>
              <View style={styles.addressHeaderRow}>
                <Ionicons name="arrow-up-circle-outline" size={18} color={colors.primary} />
                <AppText variant="bodyBold" color="primary" style={styles.addressTypeTitle}>
                  Pickup Address
                </AppText>
              </View>

              <AppText variant="bodyMedium" color="primary" style={styles.addressPersonName}>
                {order.pickupAddress.fullName} • {formatPhone(order.pickupAddress.phone)}
              </AppText>
              <AppText variant="body" color="secondary">
                {order.pickupAddress.addressLine1}
                {order.pickupAddress.addressLine2 ? `, ${order.pickupAddress.addressLine2}` : ""}
              </AppText>
              {order.pickupAddress.landmark ? (
                <AppText variant="caption" color="muted">
                  Landmark: {order.pickupAddress.landmark}
                </AppText>
              ) : null}
              <AppText variant="captionMedium" color="secondary">
                {order.pickupAddress.city}, {order.pickupAddress.state} - {order.pickupAddress.postalCode}
              </AppText>
            </View>

            <AppDivider spacing="md" />

            {/* Delivery Address */}
            <View style={styles.addressBlock}>
              <View style={styles.addressHeaderRow}>
                <Ionicons name="arrow-down-circle-outline" size={18} color={colors.success} />
                <AppText variant="bodyBold" color="primary" style={styles.addressTypeTitle}>
                  Delivery Address
                </AppText>
              </View>

              <AppText variant="bodyMedium" color="primary" style={styles.addressPersonName}>
                {order.deliveryAddress.fullName} • {formatPhone(order.deliveryAddress.phone)}
              </AppText>
              <AppText variant="body" color="secondary">
                {order.deliveryAddress.addressLine1}
                {order.deliveryAddress.addressLine2 ? `, ${order.deliveryAddress.addressLine2}` : ""}
              </AppText>
              {order.deliveryAddress.landmark ? (
                <AppText variant="caption" color="muted">
                  Landmark: {order.deliveryAddress.landmark}
                </AppText>
              ) : null}
              <AppText variant="captionMedium" color="secondary">
                {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.postalCode}
              </AppText>
            </View>
          </AppCard>

          {/* SCHEDULE & INSTRUCTIONS */}
          <AppCard variant="outlined" padding="md" style={styles.sectionCard}>
            <AppText variant="label" color="secondary" style={styles.sectionTitle}>
              SCHEDULE & SPECIAL NOTES
            </AppText>

            <View style={styles.scheduleRow}>
              <View style={styles.scheduleCol}>
                <AppText variant="caption" color="muted">
                  Pickup Scheduled
                </AppText>
                <AppText variant="bodyBold" color="primary">
                  {order.pickupDate ? formatDate(order.pickupDate) : "Standard Pickup"}
                </AppText>
              </View>

              <View style={styles.scheduleCol}>
                <AppText variant="caption" color="muted">
                  Expected Delivery
                </AppText>
                <AppText variant="bodyBold" color="primary">
                  {order.deliveryDate ? formatDate(order.deliveryDate) : "Standard Delivery"}
                </AppText>
              </View>
            </View>

            {order.specialInstructions ? (
              <>
                <AppDivider spacing="sm" />
                <View style={styles.instructionsContainer}>
                  <AppText variant="caption" color="muted">
                    Special Fabric Care Instructions:
                  </AppText>
                  <AppText variant="body" color="primary" style={styles.instructionsText}>
                    "{order.specialInstructions}"
                  </AppText>
                </View>
              </>
            ) : null}
          </AppCard>

          {/* CANCELLATION ACTIONS */}
          {canCancel ? (
            <AppCard variant="outlined" padding="md" style={styles.cancelCard}>
              <View style={styles.cancelContent}>
                <AppText variant="bodyBold" color="error">
                  Need to cancel this order?
                </AppText>
                <AppText variant="caption" color="secondary" style={styles.cancelNotice}>
                  You can cancel your order free of charge before pickup partner assignment.
                </AppText>
                <AppButton
                  title="Cancel Order"
                  variant="danger"
                  size="md"
                  loading={isCancellingOrder}
                  disabled={isCancellingOrder}
                  onPress={handleCancelOrder}
                  style={styles.cancelButton}
                  leftIcon={<Ionicons name="close-circle-outline" size={18} color={colors.textInverse} />}
                />
              </View>
            </AppCard>
          ) : order.status !== "CANCELLED" && order.status !== "DELIVERED" ? (
            <View style={styles.inProgressNotice}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={colors.textSecondary}
                style={styles.infoIcon}
              />
              <AppText variant="caption" color="secondary" style={styles.infoText}>
                This order is in active processing. To make changes or request support, please contact our support team.
              </AppText>
            </View>
          ) : null}
        </ScrollView>
      ) : null}
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
  errorMessage: {
    flex: 1,
  },
  summaryCard: {
    marginBottom: spacing.md,
    ...shadows.card,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  placedDate: {
    marginTop: 2,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  addressBlock: {
    paddingVertical: spacing.xxs,
  },
  addressHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  addressTypeTitle: {
    marginLeft: spacing.xs,
  },
  addressPersonName: {
    marginBottom: 2,
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xxs,
  },
  scheduleCol: {
    flex: 1,
  },
  instructionsContainer: {
    paddingTop: spacing.xxs,
  },
  instructionsText: {
    marginTop: spacing.xxs,
    fontStyle: "italic",
  },
  cancelCard: {
    marginBottom: spacing.md,
    borderColor: colors.errorSurface,
    backgroundColor: colors.errorSurface,
  },
  cancelContent: {
    alignItems: "flex-start",
  },
  cancelNotice: {
    marginTop: spacing.xxs,
    marginBottom: spacing.md,
  },
  cancelButton: {
    width: "100%",
  },
  inProgressNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoIcon: {
    marginRight: spacing.sm,
  },
  infoText: {
    flex: 1,
  },
  inspectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  inspectionTitleBlock: {
    flexDirection: "row",
    alignItems: "center",
  },
  inspectionTitle: {
    marginLeft: spacing.xs,
  },
  inspectionDesc: {
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  viewInspectionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});

