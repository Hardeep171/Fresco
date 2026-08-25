import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
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
import { colors, spacing, radius, shadows } from "../../theme";
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

  const [refreshing, setRefreshing] = useState(false);

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
    }
  }, [orderIdStr, loadOrderDetails]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAssignments();
    if (orderIdStr) {
      await loadOrderDetails(orderIdStr);
    }
    setRefreshing(false);
  }, [loadAssignments, loadOrderDetails, orderIdStr]);

  const handleAccept = useCallback(async () => {
    if (isAcceptingAssignment) return;
    clearErrors();
    const success = await acceptAssignment(assignmentId);
    if (success) {
      await loadAssignments();
      if (orderIdStr) {
        await loadOrderDetails(orderIdStr);
      }
    }
  }, [
    isAcceptingAssignment,
    clearErrors,
    acceptAssignment,
    assignmentId,
    loadAssignments,
    loadOrderDetails,
    orderIdStr,
  ]);

  const handleComplete = useCallback(() => {
    if (isCompletingAssignment) return;

    const actionText =
      assignment?.assignmentType === "PICKUP" ? "Pickup" : "Delivery";

    Alert.alert(
      `Complete ${actionText}`,
      `Are you sure you have completed this ${actionText.toLowerCase()} task? The order status will be updated immediately.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Mark Completed",
          onPress: async () => {
            clearErrors();
            const success = await completeAssignment(assignmentId);
            if (success) {
              await loadAssignments();
              if (orderIdStr) {
                await loadOrderDetails(orderIdStr);
              }
            }
          },
        },
      ]
    );
  }, [
    isCompletingAssignment,
    assignment?.assignmentType,
    clearErrors,
    completeAssignment,
    assignmentId,
    loadAssignments,
    loadOrderDetails,
    orderIdStr,
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
    <ScreenContainer scrollable={false} statusBarStyle="dark">
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
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <AppText variant="captionMedium" color="error" style={styles.errorText}>
                {acceptError.message || "Failed to accept assignment."}
              </AppText>
            </View>
          ) : null}

          {completeError ? (
            <View style={styles.errorBanner}>
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

          {/* CUSTOMER CONTACT & SERVICE ADDRESS */}
          <AppCard variant="outlined" padding="md" style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons
                name={isPickup ? "arrow-up-circle-outline" : "arrow-down-circle-outline"}
                size={20}
                color={isPickup ? colors.primary : colors.success}
              />
              <AppText variant="label" color="secondary" style={styles.sectionTitle}>
                {isPickup ? "PICKUP LOCATION & CONTACT" : "DELIVERY LOCATION & CONTACT"}
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
          </AppCard>

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
                title={isPickup ? "Complete Pickup Task" : "Complete Delivery Task"}
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
});
