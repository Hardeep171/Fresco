import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DeliveryTask } from "../../types/delivery-task.types";
import {
  TASK_STATUS_LABELS,
  TaskStatus,
  TaskType,
} from "../../constants/delivery-task.constants";
import { AppText, AppCard, AppBadge } from "../common";
import { useTheme, spacing, radius } from "../../theme";
import { formatDateTime } from "../../utils/formatters";

export interface DeliveryTaskCardProps {
  task: DeliveryTask;
  onPress: (task: DeliveryTask) => void;
}

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

const getTaskTypeIcon = (
  type: TaskType
): keyof typeof Ionicons.glyphMap => {
  return type === "PICKUP" ? "arrow-up-circle" : "arrow-down-circle";
};

export const DeliveryTaskCard: React.FC<DeliveryTaskCardProps> = ({
  task,
  onPress,
}) => {
  const { colors } = useTheme();
  const formattedTaskId = `#TSK-${task._id.slice(-6).toUpperCase()}`;
  const orderIdStr =
    typeof task.orderId === "string" ? task.orderId : task.orderId?._id || "";
  const formattedOrderId = orderIdStr
    ? `#FRC-${orderIdStr.slice(-8).toUpperCase()}`
    : "N/A";

  const statusVariant = getTaskStatusVariant(task.status);
  const isPickup = task.taskType === "PICKUP";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(task)}
      accessibilityRole="button"
      accessibilityLabel={`Delivery Task ${formattedTaskId}, Type ${task.taskType}, Status ${task.status}`}
      style={styles.touchable}
    >
      <AppCard variant="outlined" padding="md" style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.typeBadgeContainer}>
            <Ionicons
              name={getTaskTypeIcon(task.taskType)}
              size={18}
              color={isPickup ? colors.primary : colors.success}
              style={styles.typeIcon}
            />
            <AppText variant="bodyBold" color="primary">
              {isPickup ? "Pickup Task" : "Delivery Task"}
            </AppText>
          </View>

          <AppBadge
            label={TASK_STATUS_LABELS[task.status] || task.status}
            variant={statusVariant}
            size="sm"
            showDot
          />
        </View>

        <View style={[styles.detailsContainer, { borderColor: colors.border }]}>
          <View style={styles.idRow}>
            <View style={styles.idCol}>
              <AppText variant="caption" color="muted">
                TASK ID
              </AppText>
              <AppText variant="bodyMedium" color="primary">
                {formattedTaskId}
              </AppText>
            </View>

            <View style={styles.idCol}>
              <AppText variant="caption" color="muted">
                ORDER REF
              </AppText>
              <AppText variant="bodyMedium" color="brand">
                {formattedOrderId}
              </AppText>
            </View>
          </View>

          <View style={styles.timeRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <AppText variant="caption" color="secondary" style={styles.timeText}>
              Created on {formatDateTime(task.createdAt)}
            </AppText>
          </View>

          {task.startedAt ? (
            <View style={styles.timeRow}>
              <Ionicons name="play-outline" size={14} color={colors.primary} />
              <AppText variant="caption" color="secondary" style={styles.timeText}>
                Started on {formatDateTime(task.startedAt)}
              </AppText>
            </View>
          ) : null}

          {task.notes ? (
            <View style={[styles.notesContainer, { backgroundColor: colors.surfaceMuted }]}>
              <AppText variant="caption" color="secondary" numberOfLines={2}>
                Note: {task.notes}
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.footerRow}>
          <AppText variant="captionMedium" color="brand">
            View Task Details
          </AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      </AppCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginBottom: spacing.md,
  },
  card: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  typeBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeIcon: {
    marginRight: spacing.xs,
  },
  detailsContainer: {
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginVertical: spacing.xs,
  },
  idRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  idCol: {
    flex: 1,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xxs,
  },
  timeText: {
    marginLeft: 4,
  },
  notesContainer: {
    marginTop: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.sm,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: spacing.xxs,
  },
});
