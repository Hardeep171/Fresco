import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { PartnerStackParamList } from "../../types/navigation.types";
import {
  TASK_STATUS_LABELS,
  TaskStatus,
} from "../../constants/delivery-task.constants";
import { useDeliveryTasks } from "../../hooks/useDeliveryTasks";
import { usePartnerAssignments } from "../../hooks/usePartnerAssignments";
import {
  AppText,
  AppHeader,
  AppCard,
  AppBadge,
  AppDivider,
  AppLoader,
  ErrorState,
  ScreenContainer,
} from "../../components/common";

import { colors, spacing, shadows } from "../../theme";
import { formatDateTime, formatDate, formatPhone } from "../../utils/formatters";



type Props = NativeStackScreenProps<PartnerStackParamList, "DeliveryTaskDetailsScreen">;

const getTaskStatusVariant = (
  status: TaskStatus
): "primary" | "success" | "warning" | "error" | "neutral" => {
  switch (status) {
    case "PENDING":
      return "warning";
    case "ACCEPTED":
    case "IN_PROGRESS":
      return "primary";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "error";
    default:
      return "neutral";
  }
};

export const DeliveryTaskDetailsScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { taskId } = route.params;

  const { tasks, isFetchingTasks, loadTasks } = useDeliveryTasks();
  const { selectedAssignmentOrder, loadOrderDetails } = usePartnerAssignments();

  const [refreshing, setRefreshing] = useState(false);

  const task = useMemo(
    () => tasks.find((t) => t._id === taskId) || null,
    [tasks, taskId]
  );

  const orderIdStr = useMemo(() => {
    if (!task) return "";
    return typeof task.orderId === "string"
      ? task.orderId
      : task.orderId?._id || "";
  }, [task]);

  useEffect(() => {
    if (tasks.length === 0) {
      loadTasks();
    }
  }, [tasks.length, loadTasks]);

  useEffect(() => {
    if (orderIdStr) {
      loadOrderDetails(orderIdStr);
    }
  }, [orderIdStr, loadOrderDetails]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    if (orderIdStr) {
      await loadOrderDetails(orderIdStr);
    }
    setRefreshing(false);
  }, [loadTasks, loadOrderDetails, orderIdStr]);

  const formattedTaskId = task ? `#TSK-${task._id.slice(-6).toUpperCase()}` : "";
  const formattedOrderId = orderIdStr
    ? `#FRC-${orderIdStr.slice(-8).toUpperCase()}`
    : "N/A";

  const isPickup = task?.taskType === "PICKUP";
  const order = selectedAssignmentOrder;
  const address = isPickup ? order?.pickupAddress : order?.deliveryAddress;

  return (
    <ScreenContainer scrollable={false} statusBarStyle="dark">
      <AppHeader
        title="Delivery Task Details"
        subtitle={formattedTaskId}
        onBackPress={() => navigation.goBack()}
      />

      {isFetchingTasks && !refreshing && !task ? (
        <View style={styles.loadingContainer}>
          <AppLoader
            variant="spinner"
            size="large"
            message="Loading task details..."
          />
        </View>
      ) : !task ? (
        <ErrorState
          title="Task Not Found"
          message="Could not locate the requested delivery task record."
          retryText="Back to Tasks"
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
          {/* SUMMARY CARD */}
          <AppCard variant="elevated" padding="md" style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View>
                <AppText variant="caption" color="muted">
                  TASK TYPE & REFERENCE
                </AppText>
                <AppText variant="h2" color="primary">
                  {isPickup ? "Pickup Task" : "Delivery Task"}
                </AppText>
                <AppText variant="bodyMedium" color="brand" style={styles.orderRefText}>
                  Order Reference: {formattedOrderId}
                </AppText>
              </View>

              <AppBadge
                label={TASK_STATUS_LABELS[task.status] || task.status}
                variant={getTaskStatusVariant(task.status)}
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
            ) : (
              <AppText variant="caption" color="muted">
                Address details unavailable.
              </AppText>
            )}
          </AppCard>

          {/* ORDER SUMMARY */}
          {order ? (
            <AppCard variant="outlined" padding="md" style={styles.sectionCard}>
              <AppText variant="label" color="secondary" style={styles.sectionTitle}>
                ORDER DETAILS
              </AppText>

              <View style={styles.summaryRow}>
                <AppText variant="body" color="secondary">
                  Scheduled Pickup:
                </AppText>
                <AppText variant="bodyMedium" color="primary">
                  {order.pickupDate ? formatDate(order.pickupDate) : "Standard"}
                </AppText>
              </View>

              <View style={styles.summaryRow}>
                <AppText variant="body" color="secondary">
                  Expected Delivery:
                </AppText>
                <AppText variant="bodyMedium" color="primary">
                  {order.deliveryDate ? formatDate(order.deliveryDate) : "Standard"}
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
            </AppCard>
          ) : null}

          {/* TIMELINE & METADATA */}
          <AppCard variant="outlined" padding="md" style={styles.sectionCard}>
            <AppText variant="label" color="secondary" style={styles.sectionTitle}>
              TASK TIMESTAMPS
            </AppText>

            <View style={styles.timeRow}>
              <AppText variant="body" color="secondary">
                Created At:
              </AppText>
              <AppText variant="captionMedium" color="primary">
                {formatDateTime(task.createdAt)}
              </AppText>
            </View>

            {task.startedAt ? (
              <View style={styles.timeRow}>
                <AppText variant="body" color="secondary">
                  Started At:
                </AppText>
                <AppText variant="captionMedium" color="primary">
                  {formatDateTime(task.startedAt)}
                </AppText>
              </View>
            ) : null}

            {task.completedAt ? (
              <View style={styles.timeRow}>
                <AppText variant="body" color="secondary">
                  Completed At:
                </AppText>
                <AppText variant="captionMedium" color="success">
                  {formatDateTime(task.completedAt)}
                </AppText>
              </View>
            ) : null}

            {task.notes ? (
              <>
                <AppDivider spacing="sm" />
                <AppText variant="caption" color="muted">
                  Task Notes:
                </AppText>
                <AppText variant="caption" color="secondary">
                  {task.notes}
                </AppText>
              </>
            ) : null}
          </AppCard>
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
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xxs,
  },
});
