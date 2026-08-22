import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Garment } from "../../types/catalog.types";
import { AppText, AppCard, AppBadge } from "../common";
import { colors, spacing, radius, shadows } from "../../theme";
import { formatCurrency } from "../../utils/formatters";

export interface GarmentCardProps {
  garment: Garment;
  onPress: (garment: Garment) => void;
  minPrice?: number;
  serviceCount?: number;
}

export const GarmentCard: React.FC<GarmentCardProps> = ({
  garment,
  onPress,
  minPrice,
  serviceCount,
}) => {
  const formattedName =
    garment.name.charAt(0).toUpperCase() + garment.name.slice(1);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onPress(garment)}
      accessibilityRole="button"
      accessibilityLabel={`View services for ${formattedName}`}
    >
      <AppCard variant="elevated" padding="md" style={styles.card}>
        <View style={styles.contentRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="shirt-outline" size={24} color={colors.primary} />
          </View>

          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <AppText variant="h3" color="primary" numberOfLines={1} style={styles.title}>
                {formattedName}
              </AppText>
              {serviceCount !== undefined && serviceCount > 0 && (
                <AppBadge
                  label={`${serviceCount} ${serviceCount === 1 ? "service" : "services"}`}
                  variant="info"
                  size="sm"
                />
              )}
            </View>

            {garment.description ? (
              <AppText
                variant="caption"
                color="secondary"
                numberOfLines={2}
                style={styles.description}
              >
                {garment.description}
              </AppText>
            ) : null}

            <View style={styles.footerRow}>
              {minPrice !== undefined && minPrice > 0 ? (
                <AppText variant="bodyBold" color="brand">
                  From {formatCurrency(minPrice)}
                </AppText>
              ) : (
                <AppText variant="captionMedium" color="brand">
                  View Services & Pricing
                </AppText>
              )}
            </View>
          </View>

          <View style={styles.chevronWrapper}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    ...shadows.card,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primarySurface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    flex: 1,
    marginRight: spacing.xs,
  },
  description: {
    marginTop: spacing.xxs,
  },
  footerRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chevronWrapper: {
    marginLeft: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
});
