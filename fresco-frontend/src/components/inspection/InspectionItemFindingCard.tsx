import React from "react";
import { View, StyleSheet, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { InspectionItem } from "../../types/inspection.types";
import {
  ITEM_CONDITION_LABELS,
  ITEM_CONDITION_ICONS,
  ItemCondition,
} from "../../constants/inspection.constants";
import { AppText, AppCard, AppBadge } from "../common";
import { colors, spacing, radius } from "../../theme";
import { formatCurrency } from "../../utils/formatters";

export interface InspectionItemFindingCardProps {
  item: InspectionItem;
  index: number;
}

const getConditionVariant = (
  condition: ItemCondition
): "primary" | "success" | "warning" | "error" | "neutral" => {
  switch (condition) {
    case "NORMAL":
      return "success";
    case "STAINED":
      return "warning";
    case "DAMAGED":
    case "TORN":
      return "error";
    case "COLOR_BLEED_RISK":
      return "primary";
    default:
      return "neutral";
  }
};

export const InspectionItemFindingCard: React.FC<InspectionItemFindingCardProps> = ({
  item,
  index,
}) => {
  const conditionLabel = ITEM_CONDITION_LABELS[item.condition] || item.condition;
  const conditionVariant = getConditionVariant(item.condition);
  const conditionIcon = ITEM_CONDITION_ICONS[item.condition];
  const isQuantityMismatch = item.inspectedQuantity !== item.initialQuantity;

  return (
    <AppCard variant="outlined" padding="md" style={styles.card}>
      {/* HEADER: GARMENT & SERVICE */}
      <View style={styles.headerRow}>
        <View style={styles.garmentInfo}>
          <AppText variant="caption" color="muted">
            ITEM #{index + 1}
          </AppText>
          <AppText variant="bodyBold" color="primary">
            {item.garmentName}
          </AppText>
          <AppText variant="captionMedium" color="brand">
            {item.serviceName}
          </AppText>
        </View>

        <AppBadge
          label={conditionLabel}
          variant={conditionVariant}
          size="sm"
          showDot
        />
      </View>

      {/* QUANTITIES AND PRICE */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCol}>
          <AppText variant="caption" color="muted">
            INITIAL QTY
          </AppText>
          <AppText variant="bodyMedium" color="secondary">
            {item.initialQuantity}
          </AppText>
        </View>

        <View style={styles.metricCol}>
          <AppText variant="caption" color="muted">
            INSPECTED QTY
          </AppText>
          <AppText
            variant="bodyBold"
            color={isQuantityMismatch ? "error" : "primary"}
          >
            {item.inspectedQuantity}
          </AppText>
        </View>

        <View style={styles.metricCol}>
          <AppText variant="caption" color="muted">
            UNIT PRICE
          </AppText>
          <AppText variant="bodyMedium" color="secondary">
            {formatCurrency(item.unitPrice)}
          </AppText>
        </View>

        <View style={styles.metricCol}>
          <AppText variant="caption" color="muted">
            TOTAL
          </AppText>
          <AppText variant="bodyBold" color="primary">
            {formatCurrency(item.totalPrice)}
          </AppText>
        </View>
      </View>

      {/* DAMAGE / STAIN NOTES */}
      {item.damageNotes ? (
        <View style={styles.notesContainer}>
          <View style={styles.notesHeader}>
            <Ionicons name={conditionIcon} size={14} color={colors.warning} />
            <AppText variant="captionMedium" color="warning" style={styles.notesTitle}>
              Inspection Finding Notes
            </AppText>
          </View>
          <AppText variant="caption" color="secondary" style={styles.notesText}>
            "{item.damageNotes}"
          </AppText>
        </View>
      ) : null}

      {/* DISPLAY EXISTING BACKEND IMAGE URLS IF PRESENT */}
      {item.imageUrls && item.imageUrls.length > 0 ? (
        <View style={styles.imagesContainer}>
          <AppText variant="caption" color="muted" style={styles.imagesLabel}>
            Attached Evidence ({item.imageUrls.length})
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {item.imageUrls.map((url, imgIdx) => (
              <Image
                key={`${url}-${imgIdx}`}
                source={{ uri: url }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  garmentInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginVertical: spacing.xs,
  },
  metricCol: {
    alignItems: "center",
  },
  notesContainer: {
    marginTop: spacing.xs,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    padding: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  notesTitle: {
    marginLeft: 4,
  },
  notesText: {
    fontStyle: "italic",
  },
  imagesContainer: {
    marginTop: spacing.xs,
  },
  imagesLabel: {
    marginBottom: spacing.xxs,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    marginRight: spacing.xs,
    backgroundColor: colors.surfaceMuted,
  },
});
