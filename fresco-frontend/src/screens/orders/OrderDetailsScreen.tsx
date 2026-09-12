import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Alert,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { OrdersStackParamList } from "../../types/navigation.types";
import {
  ORDER_STATUS_LABELS,
  isOrderCancellable,
} from "../../constants/order.constants";
import { ADMIN_ROLES } from "../../constants/user.constants";
import { useOrders } from "../../hooks/useOrders";
import { usePayment } from "../../hooks/usePayment";
import { useAuth } from "../../hooks/useAuth";
import { userApi } from "../../api/user.api";
import { assignmentApi } from "../../api/assignment.api";
import { User } from "../../types/auth.types";
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

const ALLOWED_ADMIN_STATUSES: Record<string, string[]> = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PICKUP_ASSIGNED", "CANCELLED"],
  PICKUP_ASSIGNED: ["PICKED_UP"],
  PICKED_UP: ["UNDER_INSPECTION"],
  UNDER_INSPECTION: ["IN_PROCESS"],
  IN_PROCESS: ["READY_FOR_DELIVERY"],
  READY_FOR_DELIVERY: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

type Props = NativeStackScreenProps<OrdersStackParamList, "OrderDetailsScreen">;

export const OrderDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const isAdmin = Boolean(
    user?.role && (ADMIN_ROLES as readonly string[]).includes(user.role)
  );

  const { orderId } = route.params;
  const {
    currentOrder,
    isFetchingDetails,
    isCancellingOrder,
    isUpdatingStatus,
    updateStatusError,
    detailsError,
    cancelError,
    loadOrderById,
    cancelOrder,
    updateOrderStatus,
    updatePaymentStatus,
    clearCancel,
  } = useOrders();

  const {
    currentPayment,
    isRetryingPayment,
    isVerifyingPayment,
    loadPaymentByOrderId,
    retryPayment,
    verifyPayment,
  } = usePayment();

  const [refreshing, setRefreshing] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [assignModalType, setAssignModalType] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [partners, setPartners] = useState<User[]>([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [pickupAssignment, setPickupAssignment] = useState<any | null>(null);
  const [deliveryAssignment, setDeliveryAssignment] = useState<any | null>(null);
  const [pickupPartner, setPickupPartner] = useState<User | null>(null);
  const [deliveryPartner, setDeliveryPartner] = useState<User | null>(null);
  const [collectorPartner, setCollectorPartner] = useState<User | null>(null);
  const [verifierAdmin, setVerifierAdmin] = useState<User | null>(null);
  const [updatingStatusTarget, setUpdatingStatusTarget] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [paymentFeedback, setPaymentFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [assignmentFeedback, setAssignmentFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const isCancellingRef = useRef(false);

  // Helper to load all assignments and determine pickup vs delivery partners
  const loadOrderAssignments = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const list = await assignmentApi.getAllAssignments({
        orderId,
      });

      const activePickup =
        list.find((a) => a.assignmentType === "PICKUP" && a.isActive !== false) ||
        list
          .filter((a) => a.assignmentType === "PICKUP")
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0] ||
        null;

      const activeDelivery =
        list.find(
          (a) => a.assignmentType === "DELIVERY" && a.isActive !== false
        ) ||
        list
          .filter((a) => a.assignmentType === "DELIVERY")
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0] ||
        null;

      setPickupAssignment(activePickup);
      setDeliveryAssignment(activeDelivery);

      const fetchUser = async (asg: any) => {
        if (!asg) return null;
        const pId =
          typeof asg.partnerId === "object" && (asg.partnerId as any)?._id
            ? String((asg.partnerId as any)._id)
            : String(asg.partnerId);
        try {
          return await userApi.getUserById(pId);
        } catch {
          return null;
        }
      };

      const [pUser, dUser] = await Promise.all([
        fetchUser(activePickup),
        fetchUser(activeDelivery),
      ]);

      setPickupPartner(pUser);
      setDeliveryPartner(dUser);
    } catch {
      setPickupAssignment(null);
      setDeliveryAssignment(null);
      setPickupPartner(null);
      setDeliveryPartner(null);
    }
  }, [orderId, isAdmin]);

  // Resolve collector partner and verifier admin when payment updates
  useEffect(() => {
    if (!currentPayment) {
      setCollectorPartner(null);
      setVerifierAdmin(null);
      return;
    }
    if (currentPayment.collectedByPartnerId) {
      const cId = String(currentPayment.collectedByPartnerId);
      userApi
        .getUserById(cId)
        .then(setCollectorPartner)
        .catch(() => setCollectorPartner(null));
    } else {
      setCollectorPartner(null);
    }
    if (currentPayment.verifiedByAdminId) {
      const vId = String(currentPayment.verifiedByAdminId);
      userApi
        .getUserById(vId)
        .then(setVerifierAdmin)
        .catch(() => setVerifierAdmin(null));
    } else {
      setVerifierAdmin(null);
    }
  }, [currentPayment]);

  // Fetch order details, payment & assignments on mount
  useEffect(() => {
    loadOrderById(orderId);
    loadPaymentByOrderId(orderId);
    loadOrderAssignments();
  }, [orderId, loadOrderById, loadPaymentByOrderId, loadOrderAssignments]);

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setStatusFeedback(null);
    setPaymentFeedback(null);
    await Promise.all([
      loadOrderById(orderId),
      loadPaymentByOrderId(orderId),
      loadOrderAssignments(),
    ]);
    setRefreshing(false);
  }, [orderId, loadOrderById, loadPaymentByOrderId, loadOrderAssignments]);

  const handleOpenAssignModal = useCallback(
    async (typeOverride?: "PICKUP" | "DELIVERY") => {
      const targetType =
        typeOverride ||
        (currentOrder?.status === "READY_FOR_DELIVERY" ||
        currentOrder?.status === "OUT_FOR_DELIVERY"
          ? "DELIVERY"
          : "PICKUP");
      setAssignModalType(targetType);
      setIsLoadingPartners(true);
      setAssignmentFeedback(null);
      setIsAssignModalVisible(true);
      try {
        const list = await userApi.getUsers({
          role: "DELIVERY_PARTNER",
          status: "ACTIVE",
        });
        setPartners(list);
      } catch {
        setPartners([]);
      } finally {
        setIsLoadingPartners(false);
      }
    },
    [currentOrder?.status]
  );

  const handleAssignPartner = useCallback(
    async (partner: User, typeOverride?: "PICKUP" | "DELIVERY") => {
      if (isAssigning) return;
      setIsAssigning(true);
      setAssignmentFeedback(null);
      try {
        const assignmentType =
          typeOverride ||
          assignModalType ||
          (currentOrder?.status === "READY_FOR_DELIVERY" ||
          currentOrder?.status === "OUT_FOR_DELIVERY"
            ? "DELIVERY"
            : "PICKUP");

        await assignmentApi.assignPartner({
          orderId,
          partnerId: partner._id,
          deliveryPartnerId: partner._id,
          assignmentType,
        });

        setIsAssignModalVisible(false);
        const partnerName = `${partner.firstName} ${partner.lastName}`;
        const relevantActiveAsg =
          assignmentType === "DELIVERY"
            ? deliveryAssignment
            : pickupAssignment;
        const isReassignment = Boolean(
          relevantActiveAsg && relevantActiveAsg.isActive !== false
        );

        setStatusFeedback({
          type: "success",
          message: isReassignment
            ? `Partner reassigned to ${partnerName} for ${assignmentType.toLowerCase()} successfully!`
            : `Assigned ${partnerName} for ${assignmentType.toLowerCase()} successfully!`,
        });

        if (Platform.OS !== "web") {
          Alert.alert(
            isReassignment ? "Partner Reassigned" : "Partner Assigned",
            `Assigned ${partnerName} for ${assignmentType.toLowerCase()} successfully!`
          );
        }

        await Promise.all([
          loadOrderById(orderId),
          loadOrderAssignments(),
        ]);
      } catch (err: any) {
        const msg = err?.message || "Failed to assign partner.";
        setAssignmentFeedback({
          type: "error",
          message: msg,
        });
        if (Platform.OS !== "web") {
          Alert.alert("Assignment Error", msg);
        }
      } finally {
        setIsAssigning(false);
      }
    },
    [
      orderId,
      currentOrder,
      assignModalType,
      pickupAssignment,
      deliveryAssignment,
      loadOrderById,
      loadOrderAssignments,
      isAssigning,
    ]
  );

  const handleAdminVerifyPayment = useCallback(async () => {
    if (isVerifyingPayment) return;
    setPaymentFeedback(null);
    try {
      const result = await verifyPayment(orderId, {
        notes: "Verified and approved by store manager in Admin panel",
      });
      if (result) {
        setPaymentFeedback({
          type: "success",
          message: "Payment successfully verified and approved! Order is marked PAID.",
        });
        await Promise.all([
          loadOrderById(orderId),
          loadPaymentByOrderId(orderId),
        ]);
      } else {
        setPaymentFeedback({
          type: "error",
          message: "Failed to verify payment. Please try again.",
        });
      }
    } catch (err: any) {
      setPaymentFeedback({
        type: "error",
        message: err?.message || "Failed to verify payment.",
      });
    }
  }, [isVerifyingPayment, orderId, verifyPayment, loadOrderById, loadPaymentByOrderId]);

  const handleAdminUpdateStatus = useCallback(
    async (nextStatus: string) => {
      if (updatingStatusTarget || isUpdatingStatus) return;
      setUpdatingStatusTarget(nextStatus);
      setStatusFeedback(null);
      try {
        const success = await updateOrderStatus(orderId, nextStatus);
        if (success) {
          setStatusFeedback({
            type: "success",
            message: `Order status updated to "${nextStatus.replace(/_/g, " ")}" successfully!`,
          });
          await Promise.all([
            loadOrderById(orderId),
            loadOrderAssignments(),
          ]);
        } else {
          setStatusFeedback({
            type: "error",
            message:
              updateStatusError?.message ||
              `Failed to transition order to "${nextStatus.replace(/_/g, " ")}".`,
          });
        }
      } catch (err: any) {
        setStatusFeedback({
          type: "error",
          message:
            err?.message ||
            `Failed to transition order to "${nextStatus.replace(/_/g, " ")}".`,
        });
      } finally {
        setUpdatingStatusTarget(null);
      }
    },
    [
      orderId,
      updateOrderStatus,
      loadOrderById,
      loadOrderAssignments,
      updatingStatusTarget,
      isUpdatingStatus,
      updateStatusError,
    ]
  );

  const handleAdminUpdatePayment = useCallback(
    async (paymentStatus: string) => {
      if (isUpdatingPayment) return;
      setIsUpdatingPayment(true);
      setPaymentFeedback(null);
      try {
        const success = await updatePaymentStatus(orderId, paymentStatus);
        if (success) {
          setPaymentFeedback({
            type: "success",
            message: `Payment status updated to "${paymentStatus}" successfully!`,
          });
          await Promise.all([
            loadOrderById(orderId),
            loadPaymentByOrderId(orderId),
          ]);
        } else {
          setPaymentFeedback({
            type: "error",
            message: `Failed to update payment status to "${paymentStatus}".`,
          });
        }
      } catch (err: any) {
        setPaymentFeedback({
          type: "error",
          message:
            err?.message || `Failed to update payment status to "${paymentStatus}".`,
        });
      } finally {
        setIsUpdatingPayment(false);
      }
    },
    [orderId, updatePaymentStatus, loadOrderById, loadPaymentByOrderId, isUpdatingPayment]
  );

  // Cancel order with confirmation modal
  const handleCancelOrder = useCallback(() => {
    if (isCancellingRef.current || isCancellingOrder) return;

    const executeCancel = async () => {
      isCancellingRef.current = true;
      await cancelOrder(orderId);
      isCancellingRef.current = false;
    };

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm) {
        if (
          window.confirm(
            "Are you sure you want to cancel this order? This action cannot be undone."
          )
        ) {
          executeCancel();
        }
      } else {
        executeCancel();
      }
      return;
    }

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
          onPress: executeCancel,
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

          {/* ADMIN OPERATIONS PANEL OR CUSTOMER CANCELLATION */}
          {isAdmin ? (
            <AppCard variant="elevated" padding="md" style={styles.adminPanelCard}>
              <View style={styles.adminPanelHeader}>
                <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                <AppText variant="h3" color="primary" style={styles.adminPanelTitle}>
                  Admin Operations & Dispatch
                </AppText>
              </View>

              <AppDivider spacing="sm" />

              {/* CUSTOMER CONTACT OPERATIONS */}
              <View style={styles.adminField}>
                <AppText variant="caption" color="muted">
                  Customer Operations Contact:
                </AppText>
                <AppText variant="bodyBold" color="primary">
                  {order.deliveryAddress?.fullName || "Customer"} • {order.deliveryAddress?.phone ? formatPhone(order.deliveryAddress.phone) : "No Phone"}
                </AppText>
              </View>

              <AppDivider spacing="xs" />

              {/* CONTEXTUAL LIFECYCLE OPERATIONS CARD */}
              <View style={styles.adminField}>
                <AppText variant="caption" color="muted">
                  Current Lifecycle Status:
                </AppText>
                <View style={[styles.statusBadgeRow, { marginVertical: 4 }]}>
                  <AppBadge
                    label={ORDER_STATUS_LABELS[order.status] || order.status}
                    variant={order.status === "DELIVERED" ? "success" : order.status === "CANCELLED" ? "error" : "primary"}
                    size="md"
                    showDot
                  />
                </View>

                {statusFeedback && (
                  <View
                    style={[
                      styles.feedbackBanner,
                      {
                        backgroundColor:
                          statusFeedback.type === "success"
                            ? colors.successSurface
                            : colors.errorSurface,
                        borderColor:
                          statusFeedback.type === "success"
                            ? colors.success
                            : colors.error,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        statusFeedback.type === "success"
                          ? "checkmark-circle"
                          : "alert-circle"
                      }
                      size={16}
                      color={
                        statusFeedback.type === "success"
                          ? colors.success
                          : colors.error
                      }
                    />
                    <AppText
                      variant="captionMedium"
                      color={statusFeedback.type === "success" ? "success" : "error"}
                      style={{ flex: 1, marginLeft: 6 }}
                    >
                      {statusFeedback.message}
                    </AppText>
                  </View>
                )}

                {/* CONTEXTUAL ACTIONS BASED ON EXACT LIFECYCLE STAGE */}
                <View style={styles.contextualActionsContainer}>
                  {order.status === "PLACED" && (
                    <View style={styles.lifecycleActionCard}>
                      <View style={styles.actionHeaderRow}>
                        <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                        <AppText variant="bodyBold" color="primary" style={{ marginLeft: 6 }}>
                          Order Received
                        </AppText>
                      </View>
                      <AppText variant="caption" color="secondary" style={{ marginVertical: 4 }}>
                        Confirm this customer order to schedule pickup partner assignment.
                      </AppText>
                      <AppButton
                        title="Confirm Order"
                        variant="primary"
                        size="md"
                        loading={updatingStatusTarget === "CONFIRMED"}
                        disabled={Boolean(updatingStatusTarget)}
                        onPress={() => handleAdminUpdateStatus("CONFIRMED")}
                        leftIcon={<Ionicons name="checkmark-circle-outline" size={18} color={colors.textInverse} />}
                      />
                    </View>
                  )}

                  {order.status === "CONFIRMED" && (
                    <View style={styles.lifecycleActionCard}>
                      <View style={styles.actionHeaderRow}>
                        <Ionicons name="bicycle-outline" size={20} color={colors.primary} />
                        <AppText variant="bodyBold" color="primary" style={{ marginLeft: 6 }}>
                          Assign Pickup Partner
                        </AppText>
                      </View>
                      <AppText variant="caption" color="secondary" style={{ marginVertical: 4 }}>
                        Order is confirmed. Assign an active delivery partner to visit customer and pick up garments.
                      </AppText>
                      <AppButton
                        title="Assign Pickup Partner"
                        variant="primary"
                        size="md"
                        onPress={() => handleOpenAssignModal("PICKUP")}
                        leftIcon={<Ionicons name="bicycle" size={18} color={colors.textInverse} />}
                      />
                    </View>
                  )}

                  {order.status === "PICKUP_ASSIGNED" && (
                    <View style={styles.lifecycleActionCard}>
                      <View style={styles.actionHeaderRow}>
                        <Ionicons name="bicycle" size={20} color={colors.warning} />
                        <AppText variant="bodyBold" color="warning" style={{ marginLeft: 6 }}>
                          Pickup Partner Assigned
                        </AppText>
                        <View style={{ flex: 1, alignItems: "flex-end" }}>
                          <AppBadge label={pickupAssignment?.status || "ASSIGNED"} variant="warning" size="sm" />
                        </View>
                      </View>
                      {pickupPartner ? (
                        <View style={[styles.partnerCardInner, { backgroundColor: colors.surfaceMuted }]}>
                          <AppText variant="bodyBold" color="primary">
                            {pickupPartner.firstName} {pickupPartner.lastName}
                          </AppText>
                          <AppText variant="caption" color="secondary">
                            {pickupPartner.phone ? formatPhone(pickupPartner.phone) : pickupPartner.email}
                          </AppText>
                        </View>
                      ) : (
                        <AppText variant="caption" color="muted">Delivery partner assigned for pickup.</AppText>
                      )}
                      <AppButton
                        title="Reassign Pickup Partner"
                        variant="outline"
                        size="md"
                        style={{ marginTop: 8 }}
                        onPress={() => handleOpenAssignModal("PICKUP")}
                        leftIcon={<Ionicons name="swap-horizontal" size={18} color={colors.primary} />}
                      />
                    </View>
                  )}

                  {order.status === "PICKED_UP" && (
                    <View style={styles.lifecycleActionCard}>
                      <View style={styles.actionHeaderRow}>
                        <Ionicons name="shirt-outline" size={20} color={colors.primary} />
                        <AppText variant="bodyBold" color="primary" style={{ marginLeft: 6 }}>
                          Clothes Picked Up
                        </AppText>
                        <View style={{ flex: 1, alignItems: "flex-end" }}>
                          <AppBadge label="PICKED UP" variant="primary" size="sm" />
                        </View>
                      </View>
                      <AppText variant="caption" color="secondary" style={{ marginVertical: 4 }}>
                        Garments collected by {pickupPartner ? `${pickupPartner.firstName} ${pickupPartner.lastName}` : "delivery partner"} and received at facility. Ready for inspection.
                      </AppText>
                      <View style={styles.dualButtonRow}>
                        <AppButton
                          title="Start Inspection"
                          variant="primary"
                          size="md"
                          style={{ flex: 1, marginRight: 6 }}
                          loading={updatingStatusTarget === "UNDER_INSPECTION"}
                          disabled={Boolean(updatingStatusTarget)}
                          onPress={() => handleAdminUpdateStatus("UNDER_INSPECTION")}
                          leftIcon={<Ionicons name="search" size={18} color={colors.textInverse} />}
                        />
                        <AppButton
                          title="Inspection Details"
                          variant="outline"
                          size="md"
                          style={{ flex: 1, marginLeft: 6 }}
                          onPress={() =>
                            (navigation as any).navigate("InspectionReviewScreen", {
                              orderId: order._id,
                            })
                          }
                          leftIcon={<Ionicons name="document-text-outline" size={18} color={colors.primary} />}
                        />
                      </View>
                    </View>
                  )}

                  {order.status === "UNDER_INSPECTION" && (
                    <View style={styles.lifecycleActionCard}>
                      <View style={styles.actionHeaderRow}>
                        <Ionicons name="search-circle-outline" size={20} color={colors.warning} />
                        <AppText variant="bodyBold" color="warning" style={{ marginLeft: 6 }}>
                          Under Inspection
                        </AppText>
                        <View style={{ flex: 1, alignItems: "flex-end" }}>
                          <AppBadge label="INSPECTION" variant="warning" size="sm" />
                        </View>
                      </View>
                      <AppText variant="caption" color="secondary" style={{ marginVertical: 4 }}>
                        Garments are currently undergoing fabric & stain inspection. Review inspection details and drop garments for cleaning when ready.
                      </AppText>
                      <View style={styles.dualButtonRow}>
                        <AppButton
                          title="Drop for Cleaning"
                          variant="primary"
                          size="md"
                          style={{ flex: 1, marginRight: 6 }}
                          loading={updatingStatusTarget === "IN_PROCESS"}
                          disabled={Boolean(updatingStatusTarget)}
                          onPress={() => handleAdminUpdateStatus("IN_PROCESS")}
                          leftIcon={<Ionicons name="water-outline" size={18} color={colors.textInverse} />}
                        />
                        <AppButton
                          title="Inspection Details"
                          variant="outline"
                          size="md"
                          style={{ flex: 1, marginLeft: 6 }}
                          onPress={() =>
                            (navigation as any).navigate("InspectionReviewScreen", {
                              orderId: order._id,
                            })
                          }
                          leftIcon={<Ionicons name="document-text-outline" size={18} color={colors.primary} />}
                        />
                      </View>
                    </View>
                  )}

                  {order.status === "IN_PROCESS" && (
                    <View style={styles.lifecycleActionCard}>
                      <View style={styles.actionHeaderRow}>
                        <Ionicons name="water" size={20} color={colors.primary} />
                        <AppText variant="bodyBold" color="primary" style={{ marginLeft: 6 }}>
                          Cleaning in Progress
                        </AppText>
                        <View style={{ flex: 1, alignItems: "flex-end" }}>
                          <AppBadge label="CLEANING" variant="primary" size="sm" />
                        </View>
                      </View>
                      <AppText variant="caption" color="secondary" style={{ marginVertical: 4 }}>
                        Garments are being cleaned, pressed, and quality checked. When packing is complete, mark ready for delivery dispatch.
                      </AppText>
                      <AppButton
                        title="Ready for Delivery"
                        variant="primary"
                        size="md"
                        loading={updatingStatusTarget === "READY_FOR_DELIVERY"}
                        disabled={Boolean(updatingStatusTarget)}
                        onPress={() => handleAdminUpdateStatus("READY_FOR_DELIVERY")}
                        leftIcon={<Ionicons name="checkmark-done" size={18} color={colors.textInverse} />}
                      />
                    </View>
                  )}

                  {order.status === "READY_FOR_DELIVERY" && (
                    <View style={styles.lifecycleActionCard}>
                      <View style={styles.actionHeaderRow}>
                        <Ionicons name="cube-outline" size={20} color={colors.success} />
                        <AppText variant="bodyBold" color="success" style={{ marginLeft: 6 }}>
                          Ready for Delivery
                        </AppText>
                        <View style={{ flex: 1, alignItems: "flex-end" }}>
                          <AppBadge label="READY" variant="success" size="sm" />
                        </View>
                      </View>
                      <AppText variant="caption" color="secondary" style={{ marginVertical: 4 }}>
                        Cleaning complete. Clothes packed. Assign a delivery partner for final delivery visit.
                        {pickupPartner ? ` (Preferred: ${pickupPartner.firstName} ${pickupPartner.lastName})` : ""}
                      </AppText>
                      <AppButton
                        title="Assign Delivery Partner"
                        variant="primary"
                        size="md"
                        onPress={() => handleOpenAssignModal("DELIVERY")}
                        leftIcon={<Ionicons name="bicycle" size={18} color={colors.textInverse} />}
                      />
                    </View>
                  )}

                  {order.status === "OUT_FOR_DELIVERY" && (
                    <View style={styles.lifecycleActionCard}>
                      <View style={styles.actionHeaderRow}>
                        <Ionicons name="navigate-circle-outline" size={20} color={colors.primary} />
                        <AppText variant="bodyBold" color="primary" style={{ marginLeft: 6 }}>
                          Out for Delivery
                        </AppText>
                        <View style={{ flex: 1, alignItems: "flex-end" }}>
                          <AppBadge label="IN TRANSIT" variant="primary" size="sm" />
                        </View>
                      </View>
                      {deliveryPartner ? (
                        <View style={[styles.partnerCardInner, { backgroundColor: colors.surfaceMuted }]}>
                          <AppText variant="bodyBold" color="primary">
                            {deliveryPartner.firstName} {deliveryPartner.lastName}
                          </AppText>
                          <AppText variant="caption" color="secondary">
                            {deliveryPartner.phone ? formatPhone(deliveryPartner.phone) : deliveryPartner.email}
                            {deliveryAssignment ? ` • Task Status: ${deliveryAssignment.status}` : ""}
                          </AppText>
                        </View>
                      ) : (
                        <AppText variant="caption" color="muted">Delivery partner en route to customer.</AppText>
                      )}
                      <AppButton
                        title="Reassign Delivery Partner"
                        variant="outline"
                        size="md"
                        style={{ marginTop: 8 }}
                        onPress={() => handleOpenAssignModal("DELIVERY")}
                        leftIcon={<Ionicons name="swap-horizontal" size={18} color={colors.primary} />}
                      />
                    </View>
                  )}

                  {order.status === "DELIVERED" && (
                    <View style={[styles.lifecycleActionCard, { backgroundColor: colors.successSurface, borderColor: colors.success }]}>
                      <View style={styles.actionHeaderRow}>
                        <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                        <AppText variant="bodyBold" color="success" style={{ marginLeft: 6 }}>
                          Order Completed & Delivered
                        </AppText>
                      </View>
                      <AppText variant="caption" color="secondary" style={{ marginTop: 4 }}>
                        Customer received all garments. The operational laundry cycle is completed.
                      </AppText>
                    </View>
                  )}
                </View>

                {/* DIRECT STATUS TRANSITIONS CONTROLS */}
                {(() => {
                  const allowedNext = ALLOWED_ADMIN_STATUSES[order.status] || [];
                  if (allowedNext.length === 0) return null;
                  return (
                    <View style={{ marginTop: 8 }}>
                      <AppText variant="captionMedium" color="secondary" style={{ marginBottom: 6 }}>
                        Direct Status Transition:
                      </AppText>
                      <View style={styles.adminActionButtonsRow}>
                        {allowedNext.map((st) => {
                          const isCurrentMutating = updatingStatusTarget === st;
                          const isAnyMutating = Boolean(updatingStatusTarget);
                          return (
                            <TouchableOpacity
                              key={st}
                              disabled={isAnyMutating}
                              style={[
                                styles.adminActionButton,
                                {
                                  backgroundColor:
                                    st === "CANCELLED"
                                      ? colors.errorSurface
                                      : colors.primarySurface,
                                  borderColor:
                                    st === "CANCELLED"
                                      ? colors.error
                                      : colors.primary,
                                  opacity: isAnyMutating && !isCurrentMutating ? 0.5 : 1,
                                },
                              ]}
                              onPress={() => handleAdminUpdateStatus(st)}
                            >
                              {isCurrentMutating ? (
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                  <ActivityIndicator
                                    size="small"
                                    color={st === "CANCELLED" ? colors.error : colors.primary}
                                  />
                                  <AppText
                                    variant="caption"
                                    color={st === "CANCELLED" ? "error" : "primary"}
                                    style={{ fontWeight: "700" }}
                                  >
                                    Updating...
                                  </AppText>
                                </View>
                              ) : (
                                <AppText
                                  variant="caption"
                                  color={st === "CANCELLED" ? "error" : "primary"}
                                  style={{ fontWeight: "700" }}
                                >
                                  {st.replace(/_/g, " ")}
                                </AppText>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })()}
              </View>

              <AppDivider spacing="sm" />

              {/* TWO OPERATIONAL VISITS DISPATCH SUMMARY */}
              <View style={styles.adminField}>
                <AppText variant="caption" color="muted">
                  Operational Visits & Partner Assignments:
                </AppText>
                <View style={styles.twoVisitContainer}>
                  {/* VISIT 1: PICKUP */}
                  <View style={[styles.visitCard, { backgroundColor: colors.surfaceMuted }]}>
                    <View style={styles.visitHeader}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Ionicons name="arrow-up-circle-outline" size={18} color={colors.primary} />
                        <AppText variant="bodyBold" color="primary">Visit 1: Pickup</AppText>
                      </View>
                      <AppBadge
                        label={pickupAssignment?.status || "UNASSIGNED"}
                        variant={pickupAssignment?.status === "COMPLETED" ? "success" : pickupAssignment ? "primary" : "neutral"}
                        size="sm"
                      />
                    </View>
                    <AppText variant="caption" color="secondary" style={{ marginTop: 4 }}>
                      Partner: {pickupPartner ? `${pickupPartner.firstName} ${pickupPartner.lastName} (${formatPhone(pickupPartner.phone)})` : "No partner assigned"}
                    </AppText>
                    {order.status === "PICKUP_ASSIGNED" || order.status === "CONFIRMED" ? (
                      <TouchableOpacity
                        style={{ marginTop: 4 }}
                        onPress={() => handleOpenAssignModal("PICKUP")}
                      >
                        <AppText variant="captionMedium" color="brand">
                          {pickupAssignment ? "Reassign Pickup Partner →" : "Assign Pickup Partner →"}
                        </AppText>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  {/* VISIT 2: DELIVERY */}
                  <View style={[styles.visitCard, { backgroundColor: colors.surfaceMuted }]}>
                    <View style={styles.visitHeader}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Ionicons name="arrow-down-circle-outline" size={18} color={colors.success} />
                        <AppText variant="bodyBold" color="primary">Visit 2: Delivery</AppText>
                      </View>
                      <AppBadge
                        label={deliveryAssignment?.status || "UNASSIGNED"}
                        variant={deliveryAssignment?.status === "COMPLETED" ? "success" : deliveryAssignment ? "primary" : "neutral"}
                        size="sm"
                      />
                    </View>
                    <AppText variant="caption" color="secondary" style={{ marginTop: 4 }}>
                      Partner: {deliveryPartner ? `${deliveryPartner.firstName} ${deliveryPartner.lastName} (${formatPhone(deliveryPartner.phone)})` : (pickupPartner ? `Unassigned (Prefers ${pickupPartner.firstName})` : "No partner assigned")}
                    </AppText>
                    {order.status === "READY_FOR_DELIVERY" || order.status === "OUT_FOR_DELIVERY" ? (
                      <TouchableOpacity
                        style={{ marginTop: 4 }}
                        onPress={() => handleOpenAssignModal("DELIVERY")}
                      >
                        <AppText variant="captionMedium" color="brand">
                          {deliveryAssignment ? "Reassign Delivery Partner →" : "Assign Delivery Partner →"}
                        </AppText>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              </View>

              <AppDivider spacing="sm" />

              {/* PAYMENT & VERIFICATION SECTION */}
              <View style={styles.adminField}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons
                    name={
                      currentPayment?.verificationStatus === "PENDING"
                        ? "alert-circle"
                        : order.paymentStatus === "PAID"
                        ? "checkmark-circle"
                        : "card-outline"
                    }
                    size={18}
                    color={
                      currentPayment?.verificationStatus === "PENDING"
                        ? colors.warning
                        : order.paymentStatus === "PAID"
                        ? colors.success
                        : colors.primary
                    }
                  />
                  <AppText variant="label" color="secondary" style={styles.sectionTitle}>
                    PAYMENT & VERIFICATION
                  </AppText>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <AppBadge
                      label={
                        currentPayment?.verificationStatus === "PENDING"
                          ? "VERIFICATION REQUIRED"
                          : order.paymentStatus
                      }
                      variant={
                        currentPayment?.verificationStatus === "PENDING"
                          ? "warning"
                          : order.paymentStatus === "PAID"
                          ? "success"
                          : "error"
                      }
                      size="sm"
                    />
                  </View>
                </View>

                {paymentFeedback && (
                  <View
                    style={[
                      styles.feedbackBanner,
                      {
                        backgroundColor:
                          paymentFeedback.type === "success"
                            ? colors.successSurface
                            : colors.errorSurface,
                        borderColor:
                          paymentFeedback.type === "success"
                            ? colors.success
                            : colors.error,
                        marginTop: 6,
                      },
                    ]}
                  >
                    <Ionicons
                      name={paymentFeedback.type === "success" ? "checkmark-circle" : "alert-circle"}
                      size={16}
                      color={paymentFeedback.type === "success" ? colors.success : colors.error}
                    />
                    <AppText
                      variant="captionMedium"
                      color={paymentFeedback.type === "success" ? "success" : "error"}
                      style={{ flex: 1, marginLeft: 6 }}
                    >
                      {paymentFeedback.message}
                    </AppText>
                  </View>
                )}

                {/* HIGH-PRIORITY VERIFICATION REQUIRED BANNER */}
                {currentPayment?.verificationStatus === "PENDING" ? (
                  <View style={[styles.verificationAlertBanner, { backgroundColor: colors.warningSurface, borderColor: colors.warning }]}>
                    <Ionicons name="warning" size={24} color={colors.warning} />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <AppText variant="bodyBold" color="warning">
                        ⚠️ Payment Verification Required
                      </AppText>
                      <AppText variant="caption" color="secondary" style={{ marginTop: 2 }}>
                        Delivery partner reported collecting payment from customer. Please verify funds.
                      </AppText>

                      <View style={styles.auditInfoGrid}>
                        <View style={styles.auditItem}>
                          <AppText variant="caption" color="muted">Reported Amount:</AppText>
                          <AppText variant="bodyBold" color="primary">₹{currentPayment.amount || order.pricing.totalAmount}</AppText>
                        </View>
                        <View style={styles.auditItem}>
                          <AppText variant="caption" color="muted">Method:</AppText>
                          <AppText variant="bodyBold" color="primary">{currentPayment.paymentMethod || "CASH"}</AppText>
                        </View>
                        <View style={styles.auditItem}>
                          <AppText variant="caption" color="muted">Collected By:</AppText>
                          <AppText variant="captionMedium" color="primary">
                            {collectorPartner ? `${collectorPartner.firstName} ${collectorPartner.lastName}` : (pickupPartner ? `${pickupPartner.firstName} ${pickupPartner.lastName}` : "Delivery Partner")}
                          </AppText>
                        </View>
                        {currentPayment.collectedAt && (
                          <View style={styles.auditItem}>
                            <AppText variant="caption" color="muted">Collected At:</AppText>
                            <AppText variant="captionMedium" color="primary">
                              {formatDateTime(currentPayment.collectedAt)}
                            </AppText>
                          </View>
                        )}
                      </View>

                      <AppButton
                        title="Verify & Approve Payment"
                        variant="primary"
                        size="md"
                        style={{ marginTop: 10 }}
                        loading={isVerifyingPayment}
                        disabled={isVerifyingPayment}
                        onPress={handleAdminVerifyPayment}
                        leftIcon={<Ionicons name="shield-checkmark" size={18} color={colors.textInverse} />}
                      />
                    </View>
                  </View>
                ) : order.paymentStatus === "PAID" ? (
                  <View style={[styles.verifiedAuditCard, { backgroundColor: colors.surfaceMuted }]}>
                    <View style={styles.auditSummaryRow}>
                      <View>
                        <AppText variant="caption" color="muted">Verified Amount:</AppText>
                        <AppText variant="bodyBold" color="success">₹{currentPayment?.amount || order.pricing.totalAmount}</AppText>
                      </View>
                      <View>
                        <AppText variant="caption" color="muted">Method:</AppText>
                        <AppText variant="bodyMedium" color="primary">{currentPayment?.paymentMethod || "UPI"}</AppText>
                      </View>
                      <View>
                        <AppText variant="caption" color="muted">Verified By:</AppText>
                        <AppText variant="captionMedium" color="primary">
                          {verifierAdmin ? `${verifierAdmin.firstName} ${verifierAdmin.lastName}` : "Store Manager"}
                        </AppText>
                      </View>
                    </View>
                    {currentPayment?.verifiedAt && (
                      <AppText variant="caption" color="muted" style={{ marginTop: 4 }}>
                        Approved on {formatDateTime(currentPayment.verifiedAt)}
                      </AppText>
                    )}
                  </View>
                ) : (
                  <View style={[styles.unpaidBox, { backgroundColor: colors.surfaceMuted }]}>
                    <AppText variant="caption" color="secondary">
                      Payment Pending (Due: ₹{order.pricing.totalAmount}). Partner can collect payment via QR or Cash at pickup or delivery visit.
                    </AppText>
                  </View>
                )}

                {/* Manual Payment Status Override */}
                <AppText variant="caption" color="muted" style={{ marginTop: 10 }}>
                  Manual Payment Override:
                </AppText>
                <View style={[styles.adminActionButtonsRow, { marginTop: 6 }]}>
                  {(["PAID", "PENDING", "REFUNDED", "FAILED"] as const).map((ps) => {
                    const isCurrent = order.paymentStatus === ps;
                    return (
                      <TouchableOpacity
                        key={ps}
                        style={[
                          styles.adminActionButton,
                          {
                            backgroundColor: isCurrent
                              ? colors.primary
                              : colors.surfaceMuted,
                            borderColor: isCurrent
                              ? colors.primary
                              : colors.border,
                            opacity: isUpdatingPayment && !isCurrent ? 0.5 : 1,
                          },
                        ]}
                        disabled={isCurrent || isUpdatingPayment}
                        onPress={() => handleAdminUpdatePayment(ps)}
                      >
                        <AppText
                          variant="caption"
                          color={isCurrent ? "inverse" : "primary"}
                          style={{ fontWeight: "600" }}
                        >
                          {ps}
                        </AppText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </AppCard>
          ) : (
            <>
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
            </>
          )}
        </ScrollView>
      ) : null}

      {/* DELIVERY / PICKUP PARTNER ASSIGNMENT MODAL */}
      <Modal
        visible={isAssignModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAssignModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="bicycle" size={24} color={colors.primary} />
                <AppText variant="h3" color="primary">
                  {assignModalType === "DELIVERY"
                    ? deliveryAssignment && deliveryAssignment.isActive !== false
                      ? "Reassign Delivery Partner"
                      : "Assign Delivery Partner"
                    : pickupAssignment && pickupAssignment.isActive !== false
                    ? "Reassign Pickup Partner"
                    : "Assign Pickup Partner"}
                </AppText>
              </View>
              <TouchableOpacity onPress={() => setIsAssignModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <AppDivider spacing="sm" />

            {assignmentFeedback && (
              <View
                style={[
                  styles.modalFeedbackBanner,
                  {
                    backgroundColor:
                      assignmentFeedback.type === "success"
                        ? colors.successSurface
                        : colors.errorSurface,
                    borderColor:
                      assignmentFeedback.type === "success"
                        ? colors.success
                        : colors.error,
                  },
                ]}
              >
                <Ionicons
                  name={
                    assignmentFeedback.type === "success"
                      ? "checkmark-circle"
                      : "alert-circle"
                  }
                  size={16}
                  color={
                    assignmentFeedback.type === "success"
                      ? colors.success
                      : colors.error
                  }
                />
                <AppText
                  variant="captionMedium"
                  color={assignmentFeedback.type === "success" ? "success" : "error"}
                  style={{ flex: 1 }}
                >
                  {assignmentFeedback.message}
                </AppText>
              </View>
            )}

            {(() => {
              const currentActive =
                assignModalType === "DELIVERY"
                  ? deliveryAssignment
                  : pickupAssignment;
              const currentP =
                assignModalType === "DELIVERY"
                  ? deliveryPartner
                  : pickupPartner;
              if (!currentActive || currentActive.isActive === false) return null;
              return (
                <View
                  style={[
                    styles.currentlyAssignedCard,
                    { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <AppText
                        variant="caption"
                        color="muted"
                        style={{ fontWeight: "700" }}
                      >
                        CURRENTLY ASSIGNED ({assignModalType})
                      </AppText>
                      <AppText variant="bodyBold" color="primary">
                        {currentP
                          ? `${currentP.firstName} ${currentP.lastName}`
                          : "Partner"}
                      </AppText>
                      <AppText variant="caption" color="secondary">
                        Status: {currentActive.status} • Type: {currentActive.assignmentType}
                      </AppText>
                    </View>
                    <AppBadge label="Active" variant="success" size="sm" />
                  </View>
                  <AppText
                    variant="caption"
                    color="secondary"
                    style={{ marginTop: 4 }}
                  >
                    Select another partner below to replace this assignment.
                  </AppText>
                </View>
              );
            })()}

            {/* RECOMMENDATION: If assigning DELIVERY and pickupPartner exists and isn't already assigned */}
            {assignModalType === "DELIVERY" && pickupPartner && (
              <View
                style={[
                  styles.recommendedPartnerBox,
                  {
                    backgroundColor: colors.primarySurface,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                  <Ionicons name="star" size={20} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="captionMedium" color="primary" style={{ fontWeight: "700" }}>
                      ⭐ Recommended: Previous Pickup Partner
                    </AppText>
                    <AppText variant="caption" color="secondary">
                      {pickupPartner.firstName} {pickupPartner.lastName} (handled customer pickup)
                    </AppText>
                  </View>
                </View>
                {deliveryAssignment &&
                deliveryAssignment.isActive !== false &&
                (String(deliveryAssignment.partnerId) === pickupPartner._id ||
                  (typeof deliveryAssignment.partnerId === "object" &&
                    String((deliveryAssignment.partnerId as any)?._id) === pickupPartner._id)) ? (
                  <AppBadge label="Assigned" variant="primary" size="sm" />
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.adminActionButton,
                      {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                        minHeight: 32,
                        paddingVertical: 4,
                      },
                    ]}
                    disabled={isAssigning}
                    onPress={() => handleAssignPartner(pickupPartner, "DELIVERY")}
                  >
                    <AppText variant="caption" color="inverse" style={{ fontWeight: "700" }}>
                      Assign
                    </AppText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {isLoadingPartners ? (
              <AppLoader variant="spinner" size="small" message="Loading active partners..." />
            ) : partners.length === 0 ? (
              <AppText variant="body" color="secondary" style={{ textAlign: "center", paddingVertical: 16 }}>
                No active delivery partners currently available.
              </AppText>
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {partners.map((p) => {
                  const targetAsg =
                    assignModalType === "DELIVERY"
                      ? deliveryAssignment
                      : pickupAssignment;
                  const isCurrent = Boolean(
                    targetAsg &&
                      targetAsg.isActive !== false &&
                      (String(targetAsg.partnerId) === p._id ||
                        (typeof targetAsg.partnerId === "object" &&
                          String((targetAsg.partnerId as any)?._id) === p._id))
                  );
                  const isRecommended = Boolean(
                    assignModalType === "DELIVERY" &&
                      pickupPartner &&
                      pickupPartner._id === p._id
                  );
                  return (
                    <TouchableOpacity
                      key={p._id}
                      style={[
                        styles.partnerPickerItem,
                        isCurrent && {
                          backgroundColor: colors.primarySurface,
                          borderRadius: radius.sm,
                          paddingHorizontal: spacing.xs,
                        },
                      ]}
                      activeOpacity={0.7}
                      disabled={isAssigning}
                      onPress={() => handleAssignPartner(p, assignModalType)}
                    >
                      <View style={styles.partnerPickerAvatar}>
                        <Ionicons
                          name="person"
                          size={18}
                          color={isCurrent ? colors.primary : colors.textSecondary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <AppText variant="bodyBold" color="primary">
                            {p.firstName} {p.lastName}
                          </AppText>
                          {isCurrent && (
                            <AppBadge label="Currently Assigned" variant="primary" size="sm" />
                          )}
                          {isRecommended && !isCurrent && (
                            <AppBadge label="⭐ Pickup Partner" variant="info" size="sm" />
                          )}
                        </View>
                        <AppText variant="caption" color="secondary">
                          {p.phone ? formatPhone(p.phone) : p.email}
                        </AppText>
                      </View>
                      {isAssigning ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Ionicons
                          name={isCurrent ? "checkmark-circle" : "chevron-forward"}
                          size={16}
                          color={isCurrent ? colors.primary : colors.textSecondary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  adminPanelCard: {
    marginBottom: spacing.md,
    ...shadows.card,
    borderRadius: radius.md,
  },
  adminPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  adminPanelTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  adminField: {
    paddingVertical: spacing.xxs,
  },
  statusBadgeRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  adminActionButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: 4,
  },
  adminActionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  assignedPartnerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    paddingVertical: spacing.xxs,
  },
  modalFeedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  currentlyAssignedCard: {
    borderRadius: radius.sm,
    borderWidth: 1,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.screenPadding,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 440,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.modal,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  partnerPickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  partnerPickerAvatar: {
    width: 36,
    height: 36,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  contextualActionsContainer: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  lifecycleActionCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  actionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  partnerCardInner: {
    padding: spacing.xs,
    borderRadius: radius.sm,
    marginTop: 4,
  },
  dualButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 4,
  },
  twoVisitContainer: {
    gap: spacing.xs,
    marginTop: 4,
  },
  visitCard: {
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  visitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  verificationAlertBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  auditInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  auditItem: {
    minWidth: 120,
    flex: 1,
  },
  verifiedAuditCard: {
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  auditSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  unpaidBox: {
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  recommendedPartnerBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
});

