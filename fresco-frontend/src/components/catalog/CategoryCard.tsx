import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category } from "../../types/catalog.types";
import { AppText, AppCard } from "../common";
import { useTheme, spacing, radius } from "../../theme";

export interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
  garmentCount?: number;
}

/**
 * Returns a fitting Ionicons glyph based on category name.
 */
const getCategoryIconName = (name: string): keyof typeof Ionicons.glyphMap => {
  const lower = name.toLowerCase();
  if (lower.includes("men") && !lower.includes("women")) return "man-outline";
  if (lower.includes("women") || lower.includes("saree") || lower.includes("dress"))
    return "woman-outline";
  if (lower.includes("kid") || lower.includes("baby") || lower.includes("child"))
    return "happy-outline";
  if (lower.includes("house") || lower.includes("home") || lower.includes("bed") || lower.includes("curtain") || lower.includes("linen"))
    return "bed-outline";
  if (lower.includes("shoe") || lower.includes("leather") || lower.includes("bag"))
    return "pricetag-outline";
  if (lower.includes("winter") || lower.includes("jacket") || lower.includes("coat"))
    return "snow-outline";
  return "shirt-outline";
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  garmentCount,
}) => {
  const { colors } = useTheme();
  const iconName = getCategoryIconName(category.name);
  const formattedName =
    category.name.charAt(0).toUpperCase() + category.name.slice(1);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onPress(category)}
      accessibilityRole="button"
      accessibilityLabel={`View ${formattedName} garments`}
    >
      <AppCard variant="elevated" padding="md" style={styles.card}>
        <View style={styles.contentRow}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primarySurface }]}>
            <Ionicons name={iconName} size={28} color={colors.primary} />
          </View>

          <View style={styles.textContainer}>
            <AppText variant="h3" color="primary" numberOfLines={1}>
              {formattedName}
            </AppText>
            {category.description ? (
              <AppText
                variant="caption"
                color="secondary"
                numberOfLines={2}
                style={styles.description}
              >
                {category.description}
              </AppText>
            ) : null}
            {garmentCount !== undefined ? (
              <AppText variant="label" color="brand" style={styles.countText}>
                {garmentCount === 1 ? "1 ITEM AVAILABLE" : `${garmentCount} ITEMS AVAILABLE`}
              </AppText>
            ) : null}
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
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  description: {
    marginTop: spacing.xxs,
  },
  countText: {
    marginTop: spacing.xs,
    letterSpacing: 0.8,
  },
  chevronWrapper: {
    marginLeft: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
});
