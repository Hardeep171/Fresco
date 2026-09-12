import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  Platform,
  Modal,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { PartnerStackParamList } from "../../types/navigation.types";
import {
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  AssignmentStatus,
} from "../../constants/assignment.constants";
import { usePartnerAssignments } from "../../hooks/usePartnerAssignments";
import { usePayment } from "../../hooks/usePayment";
import {
  AppText,
  AppHeader,
  AppCard,
  AppBadge,
  AppButton,
  AppDivider,
  AppLoader,
  ErrorState,
  ScreenContainer,
} from "../../components/common";
import { useTheme, colors, spacing, radius, shadows } from "../../theme";
import { formatDateTime, formatDate, formatPhone } from "../../utils/formatters";

type Props = NativeStackScreenProps<PartnerStackParamList, "AssignmentDetailsScreen">;

const getStatusBadgeVariant = (
  status: AssignmentStatus
): "primary" | "success" | "warning" | "error" | "neutral" => {
  switch (status) {
    case "ASSIGNED":
      return "warning";
    case "ACCEPTED":
      return "primary";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "error";
    default:
      return "neutral";
  }
};

export const AssignmentDetailsScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { colors } = useTheme();
  const { assignmentId } = route.params;

  const {
    assignments,
    selectedAssignmentOrder,
    isFetchingAssignments,
    isAcceptingAssignment,
    isCompletingAssignment,
    isFetchingOrderDetails,
    acceptError,
    completeError,
    loadAssignments,
    acceptAssignment,
    completeAssignment,
    loadOrderDetails,
    clearErrors,
  } = usePartnerAssignments();

  const {
    currentPayment,
    loadPaymentByOrderId,
    reportPaymentCollected,
    isReportingPayment,
  } = usePayment();

  const [refreshing, setRefreshing] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [collectMethod, setCollectMethod] = useState<"CASH" | "UPI">("CASH");
  const [collectNotes, setCollectNotes] = useState("");
  const [paymentFeedback, setPaymentFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Find target assignment in loaded assignments array
  const assignment = useMemo(
    () => assignments.find((a) => a._id === assignmentId) || null,
    [assignments, assignmentId]
  );

  const orderIdStr = useMemo(() => {
    if (!assignment) return "";
    return typeof assignment.orderId === "string"
      ? assignment.orderId
      : assignment.orderId?._id || "";
  }, [assignment]);

  // Load assignments & order details on mount
  useEffect(() => {
    if (assignments.length === 0) {
      loadAssignments();
    }
  }, [assignments.length, loadAssignments]);

  useEffect(() => {
    if (orderIdStr) {
      loadOrderDetails(orderIdStr);
      loadPaymentByOrderId(orderIdStr);
    }
  }, [orderIdStr, loadOrderDetails, loadPaymentByOrderId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPaymentFeedback(null);
    await loadAssignments();
    if (orderIdStr) {
      await Promise.all([
        loadOrderDetails(orderIdStr),
        loadPaymentByOrderId(orderIdStr),
      ]);
    }
    setRefreshing(false);
  }, [loadAssignments, loadOrderDetails, loadPaymentByOrderId, orderIdStr]);

  const handleAccept = useCallback(async () => {
    if (isAcceptingAssignment) return;
    clearErrors();
    const success = await acceptAssignment(assignmentId);
    if (success) {
      await loadAssignments();
      if (orderIdStr) {
        await Promise.all([
          loadOrderDetails(orderIdStr),
          loadPaymentByOrderId(orderIdStr),
        ]);
      }
    }
  }, [
    isAcceptingAssignment,
    clearErrors,
    acceptAssignment,
    assignmentId,
    loadAssignments,
    loadOrderDetails,
    loadPaymentByOrderId,
    orderIdStr,
  ]);

  const handleComplete = useCallback(() => {
    if (isCompletingAssignment) return;

    const actionText =
      assignment?.assignmentType === "PICKUP" ? "Pickup" : "Delivery";

    const executeComplete = async () => {
      clearErrors();
      const success = await completeAssignment(assignmentId);
      if (success) {
        await loadAssignments();
        if (orderIdStr) {
          await Promise.all([
            loadOrderDetails(orderIdStr),
            loadPaymentByOrderId(orderIdStr),
          ]);
        }
      }
    };

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm) {
        if (
          window.confirm(
            `Are you sure you have completed this ${actionText.toLowerCase()} task? The order status will be updated immediately.`
          )
        ) {
          executeComplete();
        }
      } else {
        executeComplete();
      }
    } else {
      Alert.alert(
        `Complete ${actionText}`,
        `Are you sure you have completed this ${actionText.toLowerCase()} task? The order status will be updated immediately.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes, Mark Completed",
            onPress: executeComplete,
          },
        ]
      );
    }
  }, [
    isCompletingAssignment,
    assignment?.assignmentType,
    clearErrors,
    completeAssignment,
    assignmentId,
    loadAssignments,
    loadOrderDetails,
    loadPaymentByOrderId,
    orderIdStr,
  ]);

  const handleReportPayment = useCallback(async () => {
    if (isReportingPayment || !orderIdStr) return;
    setPaymentFeedback(null);
    try {
      const result = await reportPaymentCollected(orderIdStr, {
        paymentMethod: collectMethod,
        notes:
          collectNotes.trim() ||
          `Collected by partner during ${assignment?.assignmentType || "visit"}`,
      });
      if (result) {
        setShowCollectModal(false);
        setPaymentFeedback({
          type: "success",
          message: "Payment collection reported! Waiting for admin approval.",
        });
        await Promise.all([
          loadPaymentByOrderId(orderIdStr),
          loadOrderDetails(orderIdStr),
        ]);
      } else {
        setPaymentFeedback({
          type: "error",
          message: "Failed to report payment collection. Please try again.",
        });
      }
    } catch (err: any) {
      setPaymentFeedback({
        type: "error",
        message: err?.message || "Failed to report payment collection.",
      });
    }
  }, [
    isReportingPayment,
    orderIdStr,
    collectMethod,
    collectNotes,
    assignment?.assignmentType,
    reportPaymentCollected,
    loadPaymentByOrderId,
    loadOrderDetails,
  ]);

  const formattedAssignmentId = assignment
    ? `#ASG-${assignment._id.slice(-6).toUpperCase()}`
    : "";

  const formattedOrderId = orderIdStr
    ? `#FRC-${orderIdStr.slice(-8).toUpperCase()}`
    : "N/A";

  const isPickup = assignment?.assignmentType === "PICKUP";
  const order = selectedAssignmentOrder;
  const address = isPickup ? order?.pickupAddress : order?.deliveryAddress;

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader
        title="Assignment Details"
        subtitle={formattedAssignmentId}
        onBackPress={() => navigation.goBack()}
      />

      {isFetchingAssignments && !refreshing && !assignment ? (
        <View style={styles.loadingContainer}>
          <AppLoader
            variant="spinner"
            size="large"
            message="Loading assignment details..."
          />
        </View>
      ) : !assignment ? (
        <ErrorState
          title="Assignment Not Found"
          message="Could not locate the requested assignment record."
          retryText="Back to Assignments"
          onRetry={() => navigation.goBack()}
        />
      ) : (
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
          {/* ERROR BANNERS */}
          {acceptError ? (
            <View style={[styles.errorBanner, { backgroundColor: colors.errorSurface }]}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <AppText variant="captionMedium" color="error" style={styles.errorText}>
                {acceptError.message || "Failed to accept assignment."}
              </AppText>
            </View>
          ) : null}

          {completeError ? (
            <View style={[styles.errorBanner, { backgroundColor: colors.errorSurface }]}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <AppText variant="captionMedium" color="error" style={styles.errorText}>
                {completeError.message || "Failed to complete assignment."}
              </AppText>
            </View>
          ) : null}

          {/* SUMMARY CARD */}
          <AppCard variant="elevated" padding="md" style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View>
                <AppText variant="caption" color="muted">
                  TASK TYPE & REFERENCE
                </AppText>
                <AppText variant="h2" color="primary">
                  {ASSIGNMENT_TYPE_LABELS[assignment.assignmentType]}
                </AppText>
                <AppText variant="bodyMedium" color="brand" style={styles.orderRefText}>
                  Order Reference: {formattedOrderId}
                </AppText>
              </View>

              <AppBadge
                label={ASSIGNMENT_STATUS_LABELS[assignment.status] || assignment.status}
                variant={getStatusBadgeVariant(assignment.status)}
                size="md"
                showDot
              />
            </View>
          </AppCard>

          {/* SERVICE LOCATIONS */}
          {isPickup ? (
            /* PICKUP VISIT */
            <AppCard variant="outlined" padding="md" style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons
                  name="arrow-up-circle-outline"
                  size={20}
                  color={colors.primary}
                />
                <AppText variant="label" color="secondary" style={styles.sectionTitle}>
                  PICKUP LOCATION & CONTACT
                </AppText>
              </View>

              {address ? (
                <View style={styles.addressBlock}>
                  <AppText variant="bodyBold" color="primary">
                    {address.fullName}
                  </AppText>
                  <AppText variant="bodyMedium" color="brand" style={styles.phoneText}>
                    Phone: {formatPhone(address.phone)}
                  </AppText>
                  <AppText variant="body" color="secondary" style={styles.addressLine}>
                    {address.addressLine1}
                    {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                  </AppText>
                  {address.landmark ? (
                    <AppText variant="caption" color="muted">
                      Landmark: {address.landmark}
                    </AppText>
                  ) : null}
                  <AppText variant="captionMedium" color="secondary">
                    {address.city}, {address.state} - {address.postalCode}
                  </AppText>
                </View>
              ) : isFetchingOrderDetails ? (
                <AppLoader variant="spinner" size="small" message="Loading address..." />
              ) : (
                <AppText variant="caption" color="muted">
                  Address details unavailable.
                </AppText>
              )}

              <AppDivider spacing="sm" />

              <View style={styles.hubRouteRow}>
                <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <AppText variant="captionMedium" color="secondary">
                    Drop-off Facility:
                  </AppText>
                  <AppText variant="caption" color="muted">
                    FRESCO Central Processing Hub • Unit 4B, Sector 18, Gurugram
                  </AppText>
                </View>
              </View>
            </AppCard>
          ) : (
            /* DELIVERY VISIT - Shows Collection Facility + Customer Delivery Address */
            <>
              <AppCard variant="outlined" padding="md" style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons
                    name="business-outline"
                    size={20}
                    color={colors.warning}
                  />
                  <AppText variant="label" color="secondary" style={styles.sectionTitle}>
                    1. COLLECTION FACILITY (PICKUP CLEAN CLOTHES)
                  </AppText>
                </View>

                <View style={styles.addressBlock}>
                  <AppText variant="bodyBold" color="primary">
                    FRESCO Central Processing Hub
                  </AppText>
                  <AppText variant="bodyMedium" color="brand" style={styles.phoneText}>
                    Dispatch Desk • Counter #2
                  </AppText>
                  <AppText variant="body" color="secondary" style={styles.addressLine}>
                    Unit 4B, Express Industrial Estate, Sector 18
                  </AppText>
                  <AppText variant="captionMedium" color="secondary">
                    Gurugram, Haryana - 122015
                  </AppText>
                  <AppText variant="caption" color="muted" style={{ marginTop: 4 }}>
                    Collect clean, ironed, and tagged garments before dispatching to destination.
                  </AppText>
                </View>
              </AppCard>

              <AppCard variant="outlined" padding="md" style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons
                    name="arrow-down-circle-outline"
                    size={20}
                    color={colors.success}
                  />
                  <AppText variant="label" color="secondary" style={styles.sectionTitle}>
                    2. CUSTOMER DELIVERY LOCATION & CONTACT
                  </AppText>
                </View>

                {address ? (
                  <View style={styles.addressBlock}>
                    <AppText variant="bodyBold" color="primary">
                      {address.fullName}
                    </AppText>
                    <AppText variant="bodyMedium" color="brand" style={styles.phoneText}>
                      Phone: {formatPhone(address.phone)}
                    </AppText>
                    <AppText variant="body" color="secondary" style={styles.addressLine}>
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                    </AppText>
                    {address.landmark ? (
                      <AppText variant="caption" color="muted">
                        Landmark: {address.landmark}
                      </AppText>
                    ) : null}
                    <AppText variant="captionMedium" color="secondary">
                      {address.city}, {address.state} - {address.postalCode}
                    </AppText>
                  </View>
                ) : isFetchingOrderDetails ? (
                  <AppLoader variant="spinner" size="small" message="Loading delivery address..." />
                ) : (
                  <AppText variant="caption" color="muted">
                    Delivery address unavailable.
                  </AppText>
                )}
              </AppCard>
            </>
          )}

          {/* ORDER ITEMS & SCHEDULE */}
          {order ? (
            <AppCard variant="outlined" padding="md" style={styles.sectionCard}>
              <AppText variant="label" color="secondary" style={styles.sectionTitle}>
                ORDER SUMMARY & SCHEDULE
              </AppText>

              <View style={styles.summaryRow}>
                <AppText variant="body" color="secondary">
                  Scheduled Pickup:
                </AppText>
                <AppText variant="bodyMedium" color="primary">
                  {order.pickupDate ? formatDate(order.pickupDate) : "Standard Pickup"}
                </AppText>
              </View>

              <View style={styles.summaryRow}>
                <AppText variant="body" color="secondary">
                  Expected Delivery:
                </AppText>
                <AppText variant="bodyMedium" color="primary">
                  {order.deliveryDate ? formatDate(order.deliveryDate) : "Standard Delivery"}
                </AppText>
              </View>

              <View style={styles.summaryRow}>
                <AppText variant="body" color="secondary">
                  Total Garments:
                </AppText>
                <AppText variant="bodyMedium" color="primary">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} garments
                </AppText>
              </View>

              {order.specialInstructions ? (
                <>
                  <AppDivider spacing="sm" />
                  <AppText variant="caption" color="muted">
                    Customer Care Notes:
                  </AppText>
                  <AppText variant="body" color="primary" style={styles.careNotes}>
                    "{order.specialInstructions}"
                  </AppText>
                </>
              ) : null}
            </AppCard>
          ) : null}

          {/* TIMELINE & METADATA */}
          <AppCard variant="outlined" padding="md" style={styles.sectionCard}>
            <AppText variant="label" color="secondary" style={styles.sectionTitle}>
              ASSIGNMENT TIMESTAMPS
            </AppText>

            <View style={styles.timeRow}>
              <AppText variant="body" color="secondary">
                Assigned At:
              </AppText>
              <AppText variant="captionMedium" color="primary">
                {formatDateTime(assignment.assignedAt || assignment.createdAt)}
              </AppText>
            </View>

            {assignment.acceptedAt ? (
              <View style={styles.timeRow}>
                <AppText variant="body" color="secondary">
                  Accepted At:
                </AppText>
                <AppText variant="captionMedium" color="primary">
                  {formatDateTime(assignment.acceptedAt)}
                </AppText>
              </View>
            ) : null}

            {assignment.completedAt ? (
              <View style={styles.timeRow}>
                <AppText variant="body" color="secondary">
                  Completed At:
                </AppText>
                <AppText variant="captionMedium" color="success">
                  {formatDateTime(assignment.completedAt)}
                </AppText>
              </View>
            ) : null}

            {assignment.notes ? (
              <>
                <AppDivider spacing="sm" />
                <AppText variant="caption" color="muted">
                  Manager Dispatch Notes:
                </AppText>
                <AppText variant="caption" color="secondary">
                  {assignment.notes}
                </AppText>
              </>
            ) : null}
          </AppCard>

          {/* PAYMENT COLLECTION SECTION */}
          {(() => {
            const orderAmount =
              order?.pricing?.totalAmount ?? currentPayment?.amount ?? 0;
            const isPaid =
              order?.paymentStatus === "PAID" ||
              currentPayment?.status === "PAID" ||
              currentPayment?.verificationStatus === "VERIFIED";
            const isPendingVerification =
              !isPaid &&
              (currentPayment?.verificationStatus === "PENDING" ||
                Boolean(currentPayment?.collectionReported));

            const cardBorderColor = isPendingVerification
              ? colors.warning
              : !isPaid
              ? colors.primary
              : colors.border;

            return (
              <AppCard
                variant="outlined"
                padding="md"
                style={StyleSheet.flatten([
                  styles.sectionCard,
                  { borderColor: cardBorderColor },
                ])}
              >
                <View style={styles.sectionHeaderRow}>
                  <Ionicons
                    name={
                      isPaid
                        ? "checkmark-circle"
                        : isPendingVerification
                        ? "time"
                        : "card-outline"
                    }
                    size={20}
                    color={
                      isPaid
                        ? colors.success
                        : isPendingVerification
                        ? colors.warning
                        : colors.primary
                    }
                  />
                  <AppText
                    variant="label"
                    color={
                      isPaid
                        ? "secondary"
                        : isPendingVerification
                        ? "warning"
                        : "primary"
                    }
                    style={styles.sectionTitle}
                  >
                    {isPaid
                      ? "PAYMENT STATUS"
                      : isPendingVerification
                      ? "PAYMENT REPORTED"
                      : "PAYMENT COLLECTION"}
                  </AppText>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <AppBadge
                      label={
                        isPaid
                          ? "PAID & VERIFIED"
                          : isPendingVerification
                          ? "VERIFICATION PENDING"
                          : "PAYMENT DUE"
                      }
                      variant={
                        isPaid
                          ? "success"
                          : isPendingVerification
                          ? "warning"
                          : "error"
                      }
                      size="sm"
                    />
                  </View>
                </View>

                {isPaid ? (
                  <View style={styles.paymentSummaryBox}>
                    <View style={styles.summaryRow}>
                      <AppText variant="body" color="secondary">
                        Amount Paid:
                      </AppText>
                      <AppText variant="bodyBold" color="success">
                        ₹{orderAmount}
                      </AppText>
                    </View>
                    <View style={styles.summaryRow}>
                      <AppText variant="body" color="secondary">
                        Payment Method:
                      </AppText>
                      <AppText variant="bodyMedium" color="primary">
                        {currentPayment?.paymentMethod || "UPI / CASH"}
                      </AppText>
                    </View>
                    <AppText variant="caption" color="muted" style={{ marginTop: 4 }}>
                      Verified and approved by store manager.
                    </AppText>
                  </View>
                ) : isPendingVerification ? (
                  <View style={styles.paymentSummaryBox}>
                    <View style={styles.summaryRow}>
                      <AppText variant="body" color="secondary">
                        Reported Amount:
                      </AppText>
                      <AppText variant="bodyBold" color="primary">
                        ₹{orderAmount}
                      </AppText>
                    </View>
                    <View style={styles.summaryRow}>
                      <AppText variant="body" color="secondary">
                        Reported Method:
                      </AppText>
                      <AppText variant="bodyMedium" color="primary">
                        {currentPayment?.paymentMethod || collectMethod}
                      </AppText>
                    </View>
                    <View
                      style={[
                        styles.feedbackBanner,
                        { backgroundColor: colors.warningSurface, marginTop: 8 },
                      ]}
                    >
                      <Ionicons
                        name="information-circle"
                        size={16}
                        color={colors.warning}
                      />
                      <AppText
                        variant="captionMedium"
                        color="warning"
                        style={{ marginLeft: 6, flex: 1 }}
                      >
                        Payment collected & reported. Awaiting admin manager approval.
                      </AppText>
                    </View>
                  </View>
                ) : (
                  <View>
                    <View style={styles.paymentDueRow}>
                      <View>
                        <AppText variant="caption" color="muted">
                          Payment Due:
                        </AppText>
                        <AppText variant="h2" color="primary">
                          ₹{orderAmount}
                        </AppText>
                      </View>
                      <AppText
                        variant="caption"
                        color="secondary"
                        style={{ maxWidth: 180, textAlign: "right" }}
                      >
                        Collect at pickup or delivery via QR or Cash.
                      </AppText>
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
                            marginTop: 8,
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            paymentFeedback.type === "success"
                              ? "checkmark-circle"
                              : "alert-circle"
                          }
                          size={16}
                          color={
                            paymentFeedback.type === "success"
                              ? colors.success
                              : colors.error
                          }
                        />
                        <AppText
                          variant="captionMedium"
                          color={
                            paymentFeedback.type === "success"
                              ? "success"
                              : "error"
                          }
                          style={{ marginLeft: 6, flex: 1 }}
                        >
                          {paymentFeedback.message}
                        </AppText>
                      </View>
                    )}

                    <View style={styles.paymentActionButtons}>
                      <AppButton
                        title="Show QR"
                        variant="outline"
                        size="md"
                        style={{ flex: 1, marginRight: spacing.xs }}
                        onPress={() => setShowQrModal(true)}
                        leftIcon={
                          <Ionicons
                            name="qr-code-outline"
                            size={18}
                            color={colors.primary}
                          />
                        }
                      />
                      <AppButton
                        title="Payment Collected"
                        variant="primary"
                        size="md"
                        style={{ flex: 1, marginLeft: spacing.xs }}
                        onPress={() => setShowCollectModal(true)}
                        leftIcon={
                          <Ionicons
                            name="cash-outline"
                            size={18}
                            color={colors.textInverse}
                          />
                        }
                      />
                    </View>
                  </View>
                )}
              </AppCard>
            );
          })()}

          {/* PRIMARY ACTION BUTTONS */}
          <View style={styles.actionsContainer}>
            {assignment.status === "ASSIGNED" ? (
              <AppButton
                title="Accept Assignment"
                variant="primary"
                size="lg"
                loading={isAcceptingAssignment}
                disabled={isAcceptingAssignment}
                onPress={handleAccept}
                leftIcon={
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={colors.textInverse}
                  />
                }
              />
            ) : assignment.status === "ACCEPTED" ? (
              <AppButton
                title={isPickup ? "Clothes Picked Up" : "Complete Delivery"}
                variant="primary"
                size="lg"
                loading={isCompletingAssignment}
                disabled={isCompletingAssignment}
                onPress={handleComplete}
                leftIcon={
                  <Ionicons
                    name="checkmark-done-circle-outline"
                    size={20}
                    color={colors.textInverse}
                  />
                }
              />
            ) : (
              <View style={styles.completedNotice}>
                <Ionicons
                  name={assignment.status === "COMPLETED" ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={assignment.status === "COMPLETED" ? colors.success : colors.error}
                  style={styles.noticeIcon}
                />
                <AppText
                  variant="bodyMedium"
                  color={assignment.status === "COMPLETED" ? "success" : "error"}
                >
                  This assignment has been {assignment.status.toLowerCase()}.
                </AppText>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* SHOW QR MODAL */}
      <Modal
        visible={showQrModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQrModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="qr-code" size={24} color={colors.primary} />
                <AppText variant="h3" color="primary">
                  Scan & Pay via UPI
                </AppText>
              </View>
              <TouchableOpacity onPress={() => setShowQrModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <AppDivider spacing="sm" />

            <View style={styles.qrCenterContent}>
              <View style={[styles.qrCodeBox, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
                <Ionicons name="qr-code" size={140} color={colors.primary} />
                <AppText variant="caption" color="muted" style={{ marginTop: 4 }}>
                  UPI QR CODE
                </AppText>
              </View>

              <AppText variant="h2" color="primary" style={{ marginTop: spacing.sm }}>
                ₹{order?.pricing?.totalAmount ?? currentPayment?.amount ?? 0}
              </AppText>

              <AppText variant="bodyMedium" color="secondary" style={{ marginTop: 4 }}>
                UPI ID: <AppText variant="bodyBold" color="brand">fresco@icici</AppText>
              </AppText>
              <AppText variant="caption" color="muted" style={{ marginTop: 2 }}>
                Order Ref: {formattedOrderId}
              </AppText>

              <View style={[styles.scanHintBox, { backgroundColor: colors.surfaceMuted }]}>
                <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
                <AppText variant="caption" color="secondary" style={{ marginLeft: 6, flex: 1 }}>
                  Accepts Google Pay, PhonePe, Paytm, BHIM and all UPI apps.
                </AppText>
              </View>
            </View>

            <AppDivider spacing="md" />

            <AppButton
              title="Close QR"
              variant="outline"
              size="md"
              onPress={() => setShowQrModal(false)}
            />
          </View>
        </View>
      </Modal>

      {/* PAYMENT COLLECTED MODAL */}
      <Modal
        visible={showCollectModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCollectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="cash" size={24} color={colors.primary} />
                <AppText variant="h3" color="primary">
                  Record Payment Collection
                </AppText>
              </View>
              <TouchableOpacity onPress={() => setShowCollectModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <AppDivider spacing="sm" />

            <View style={styles.collectModalContent}>
              <View style={styles.collectDueHeader}>
                <AppText variant="caption" color="muted">
                  Amount to Collect:
                </AppText>
                <AppText variant="h2" color="primary">
                  ₹{order?.pricing?.totalAmount ?? currentPayment?.amount ?? 0}
                </AppText>
              </View>

              <AppText variant="captionMedium" color="secondary" style={{ marginTop: spacing.sm, marginBottom: spacing.xs }}>
                Select Collection Method:
              </AppText>

              <View style={styles.methodToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.methodButton,
                    collectMethod === "CASH" && { backgroundColor: colors.primary, borderColor: colors.primary },
                    collectMethod !== "CASH" && { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
                  ]}
                  onPress={() => setCollectMethod("CASH")}
                >
                  <Ionicons
                    name="cash-outline"
                    size={20}
                    color={collectMethod === "CASH" ? colors.textInverse : colors.textPrimary}
                  />
                  <AppText
                    variant="bodyBold"
                    color={collectMethod === "CASH" ? "inverse" : "primary"}
                    style={{ marginLeft: 6 }}
                  >
                    Cash
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.methodButton,
                    collectMethod === "UPI" && { backgroundColor: colors.primary, borderColor: colors.primary },
                    collectMethod !== "UPI" && { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
                  ]}
                  onPress={() => setCollectMethod("UPI")}
                >
                  <Ionicons
                    name="qr-code-outline"
                    size={20}
                    color={collectMethod === "UPI" ? colors.textInverse : colors.textPrimary}
                  />
                  <AppText
                    variant="bodyBold"
                    color={collectMethod === "UPI" ? "inverse" : "primary"}
                    style={{ marginLeft: 6 }}
                  >
                    UPI / QR
                  </AppText>
                </TouchableOpacity>
              </View>

              <AppText variant="captionMedium" color="secondary" style={{ marginTop: spacing.md, marginBottom: spacing.xs }}>
                Collector Notes (Optional):
              </AppText>
              <TextInput
                style={[styles.notesTextInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}
                placeholder="e.g. Received cash from customer"
                placeholderTextColor={colors.textMuted}
                value={collectNotes}
                onChangeText={setCollectNotes}
                maxLength={200}
              />

              <View style={[styles.infoBanner, { backgroundColor: colors.surfaceMuted, marginTop: spacing.md }]}>
                <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
                <AppText variant="caption" color="secondary" style={{ marginLeft: 6, flex: 1 }}>
                  Partner-reported payments are submitted as verification pending and require admin approval.
                </AppText>
              </View>
            </View>

            <AppDivider spacing="md" />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <AppButton
                title="Cancel"
                variant="outline"
                size="md"
                style={{ flex: 1 }}
                onPress={() => setShowCollectModal(false)}
                disabled={isReportingPayment}
              />
              <AppButton
                title="Confirm & Report"
                variant="primary"
                size="md"
                style={{ flex: 1 }}
                loading={isReportingPayment}
                disabled={isReportingPayment}
                onPress={handleReportPayment}
              />
            </View>
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
  errorText: {
    marginLeft: spacing.xs,
    flex: 1,
  },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: "transparent",
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
  orderRefText: {
    marginTop: 2,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    letterSpacing: 0.8,
    marginLeft: spacing.xs,
  },
  addressBlock: {
    paddingVertical: spacing.xxs,
  },
  phoneText: {
    marginVertical: 2,
  },
  addressLine: {
    marginVertical: 2,
  },
  hubRouteRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xxs,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xxs,
  },
  careNotes: {
    marginTop: spacing.xxs,
    fontStyle: "italic",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xxs,
  },
  paymentSummaryBox: {
    paddingVertical: spacing.xxs,
  },
  paymentDueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  paymentActionButtons: {
    flexDirection: "row",
    marginTop: spacing.sm,
  },
  actionsContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  completedNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  noticeIcon: {
    marginRight: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 480,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qrCenterContent: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  qrCodeBox: {
    width: 180,
    height: 180,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanHintBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.md,
    width: "100%",
  },
  collectModalContent: {
    paddingVertical: spacing.xs,
  },
  collectDueHeader: {
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  methodToggleRow: {
    flexDirection: "row",
    gap: 12,
  },
  methodButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  notesTextInput: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    fontSize: 14,
    minHeight: 44,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
});
