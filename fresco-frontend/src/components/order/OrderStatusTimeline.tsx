import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_DESCRIPTIONS,
  ORDER_STATUS_SEQUENCE,
  OrderStatus,
} from "../../constants/order.constants";
import { AppText, AppCard, AppBadge } from "../common";
import { colors, spacing, radius } from "../../theme";
import { formatDateTime } from "../../utils/formatters";

export interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  currentStatus,
  createdAt,
  updatedAt,
}) => {
  const isCancelled = currentStatus === "CANCELLED";

  // If order is cancelled, render a specialized cancellation alert card + history
  if (isCancelled) {
    return (
      <AppCard variant="outlined" padding="md" style={styles.container}>
        <AppText variant="label" color="secondary" style={styles.sectionHeader}>
          ORDER STATUS & PROGRESS
        </AppText>

        <View style={styles.cancelledBanner}>
          <View style={styles.cancelledIconCircle}>
            <Ionicons name="close-circle" size={28} color={colors.error} />
          </View>
          <View style={styles.cancelledTextContainer}>
            <AppText variant="bodyBold" color="error">
              {ORDER_STATUS_LABELS.CANCELLED}
            </AppText>
            <AppText variant="caption" color="secondary" style={styles.cancelledDescription}>
              {ORDER_STATUS_DESCRIPTIONS.CANCELLED}
            </AppText>
            {updatedAt ? (
              <AppText variant="caption" color="muted" style={styles.cancelledTimestamp}>
                Cancelled on {formatDateTime(updatedAt)}
              </AppText>
            ) : null}
          </View>
        </View>
      </AppCard>
    );
  }

  // Find index of current status in standard sequence
  const currentStepIndex = ORDER_STATUS_SEQUENCE.indexOf(currentStatus);

  return (
    <AppCard variant="outlined" padding="md" style={styles.container}>
      <View style={styles.headerRow}>
        <AppText variant="label" color="secondary" style={styles.sectionHeader}>
          LIVE ORDER TIMELINE
        </AppText>
        <AppBadge
          label={ORDER_STATUS_LABELS[currentStatus]}
          variant="primary"
          size="sm"
          showDot
        />
      </View>

      <View style={styles.timelineContainer}>
        {ORDER_STATUS_SEQUENCE.map((status, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isLast = index === ORDER_STATUS_SEQUENCE.length - 1;

          // Determine node icon & color
          let nodeIconName: keyof typeof Ionicons.glyphMap = "ellipse-outline";
          let nodeColor: string = colors.borderDark;
          let nodeBgColor: string = colors.surface;

          if (isCompleted) {
            nodeIconName = "checkmark-circle";
            nodeColor = colors.primary;
            nodeBgColor = colors.primarySurface;
          } else if (isCurrent) {
            nodeIconName = "radio-button-on";
            nodeColor = colors.primary;
            nodeBgColor = colors.primarySurface;
          }


          // Line color
          const lineColor = isCompleted ? colors.primary : colors.border;

          return (
            <View key={status} style={styles.stepRow}>
              {/* LEFT COLUMN: Node + Connector Line */}
              <View style={styles.nodeColumn}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: nodeBgColor,
                      borderColor: isCurrent ? colors.primary : "transparent",
                      borderWidth: isCurrent ? 2 : 0,
                    },
                  ]}
                >
                  <Ionicons
                    name={nodeIconName}
                    size={isCompleted || isCurrent ? 18 : 12}
                    color={nodeColor}
                  />
                </View>

                {!isLast && (
                  <View
                    style={[
                      styles.connectorLine,
                      {
                        backgroundColor: lineColor,
                      },
                    ]}
                  />
                )}
              </View>

              {/* RIGHT COLUMN: Step Info */}
              <View
                style={[
                  styles.contentColumn,
                  isCurrent && styles.activeContentColumn,
                  !isLast && styles.contentColumnSpacing,
                ]}
              >
                <View style={styles.stepTitleRow}>
                  <AppText
                    variant={isCurrent ? "bodyBold" : isCompleted ? "bodyMedium" : "body"}
                    color={isCurrent ? "brand" : isCompleted ? "primary" : "muted"}
                    style={styles.stepTitle}
                  >
                    {ORDER_STATUS_LABELS[status]}
                  </AppText>

                  {isCurrent && (
                    <AppBadge
                      label="CURRENT"
                      variant="primary"
                      size="sm"
                    />
                  )}
                </View>

                {/* Show description for current step or completed steps */}
                {isCurrent && (
                  <AppText
                    variant="caption"
                    color="secondary"
                    style={styles.stepDescription}
                  >
                    {ORDER_STATUS_DESCRIPTIONS[status]}
                  </AppText>
                )}

                {/* Timestamp hints */}
                {status === "PLACED" && isCompleted && (
                  <AppText variant="caption" color="muted" style={styles.stepTimestamp}>
                    Placed on {formatDateTime(createdAt)}
                  </AppText>
                )}
                {isCurrent && updatedAt && status !== "PLACED" && (
                  <AppText variant="caption" color="muted" style={styles.stepTimestamp}>
                    Updated {formatDateTime(updatedAt)}
                  </AppText>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionHeader: {
    letterSpacing: 0.8,
  },
  timelineContainer: {
    paddingLeft: spacing.xs,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  nodeColumn: {
    alignItems: "center",
    width: 28,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: radius.round,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    minHeight: 32,
    marginVertical: 2,
  },
  contentColumn: {
    flex: 1,
    marginLeft: spacing.sm,
    paddingTop: 2,
  },
  contentColumnSpacing: {
    paddingBottom: spacing.md,
  },
  activeContentColumn: {
    backgroundColor: colors.primarySurface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginLeft: spacing.xs,
    marginBottom: spacing.xs,
  },
  stepTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepTitle: {
    flex: 1,
    marginRight: spacing.xs,
  },
  stepDescription: {
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  stepTimestamp: {
    marginTop: spacing.xxs,
  },
  cancelledBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.errorSurface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  cancelledIconCircle: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  cancelledTextContainer: {
    flex: 1,
  },
  cancelledDescription: {
    marginTop: spacing.xxs,
  },
  cancelledTimestamp: {
    marginTop: spacing.xs,
  },
});
