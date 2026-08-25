import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Assignment } from "../../types/assignment.types";
import {
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  AssignmentStatus,
  AssignmentType,
} from "../../constants/assignment.constants";
import { AppText, AppCard, AppBadge, AppButton } from "../common";
import { useTheme, spacing, radius } from "../../theme";
import { formatDateTime } from "../../utils/formatters";

export interface AssignmentCardProps {
  assignment: Assignment;
  onPress: (assignment: Assignment) => void;
  onAccept?: (assignment: Assignment) => void;
  onComplete?: (assignment: Assignment) => void;
  isActionLoading?: boolean;
}

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

const getTypeIcon = (
  type: AssignmentType
): keyof typeof Ionicons.glyphMap => {
  return type === "PICKUP" ? "arrow-up-circle" : "arrow-down-circle";
};

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onPress,
  onAccept,
  onComplete,
  isActionLoading = false,
}) => {
  const { colors } = useTheme();
  const formattedAssignmentId = `#ASG-${assignment._id.slice(-6).toUpperCase()}`;
  const orderIdStr =
    typeof assignment.orderId === "string"
      ? assignment.orderId
      : assignment.orderId?._id || "";
  const formattedOrderId = orderIdStr
    ? `#FRC-${orderIdStr.slice(-8).toUpperCase()}`
    : "N/A";

  const statusVariant = getStatusBadgeVariant(assignment.status);
  const isPickup = assignment.assignmentType === "PICKUP";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(assignment)}
      accessibilityRole="button"
      accessibilityLabel={`Assignment ${formattedAssignmentId}, Type ${assignment.assignmentType}, Status ${assignment.status}`}
      style={styles.touchable}
    >
      <AppCard variant="elevated" padding="md" style={styles.card}>
        {/* HEADER ROW */}
        <View style={styles.headerRow}>
          <View style={styles.typeBadgeContainer}>
            <Ionicons
              name={getTypeIcon(assignment.assignmentType)}
              size={18}
              color={isPickup ? colors.primary : colors.success}
              style={styles.typeIcon}
            />
            <AppText variant="bodyBold" color="primary">
              {ASSIGNMENT_TYPE_LABELS[assignment.assignmentType]}
            </AppText>
          </View>

          <AppBadge
            label={ASSIGNMENT_STATUS_LABELS[assignment.status] || assignment.status}
            variant={statusVariant}
            size="sm"
            showDot
          />
        </View>

        {/* DETAILS SECTION */}
        <View style={[styles.detailsContainer, { borderColor: colors.border }]}>
          <View style={styles.idRow}>
            <View style={styles.idCol}>
              <AppText variant="caption" color="muted">
                ASSIGNMENT ID
              </AppText>
              <AppText variant="bodyMedium" color="primary">
                {formattedAssignmentId}
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

          {/* ASSIGNED TIMESTAMP */}
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <AppText variant="caption" color="secondary" style={styles.timeText}>
              Assigned on {formatDateTime(assignment.assignedAt || assignment.createdAt)}
            </AppText>
          </View>

          {/* NOTES IF PRESENT */}
          {assignment.notes ? (
            <View style={[styles.notesContainer, { backgroundColor: colors.surfaceMuted }]}>
              <AppText variant="caption" color="secondary" numberOfLines={2}>
                Note: {assignment.notes}
              </AppText>
            </View>
          ) : null}
        </View>

        {/* QUICK ACTION BUTTONS */}
        <View style={styles.actionsRow}>
          {assignment.status === "ASSIGNED" && onAccept ? (
            <AppButton
              title="Accept Task"
              variant="primary"
              size="sm"
              loading={isActionLoading}
              disabled={isActionLoading}
              onPress={() => onAccept(assignment)}
              style={styles.actionBtn}
              leftIcon={<Ionicons name="checkmark-circle-outline" size={16} color={colors.textInverse} />}
            />
          ) : assignment.status === "ACCEPTED" && onComplete ? (
            <AppButton
              title={isPickup ? "Complete Pickup" : "Complete Delivery"}
              variant="primary"
              size="sm"
              loading={isActionLoading}
              disabled={isActionLoading}
              onPress={() => onComplete(assignment)}
              style={styles.actionBtn}
              leftIcon={<Ionicons name="checkmark-done-circle-outline" size={16} color={colors.textInverse} />}
            />
          ) : (
            <View style={styles.viewDetailsRow}>
              <AppText variant="captionMedium" color="brand">
                View Details & Address
              </AppText>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </View>
          )}
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
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
  },
  viewDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xxs,
  },
});
