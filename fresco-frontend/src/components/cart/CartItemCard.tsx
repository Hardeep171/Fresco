import React from "react";
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EnrichedCartItem } from "../../types/cart.types";
import { AppText, AppCard } from "../common";
import { colors, spacing, radius, shadows } from "../../theme";
import { formatCurrency } from "../../utils/formatters";

export interface CartItemCardProps {
  item: EnrichedCartItem;
  isMutating: boolean;
  onIncrement: (item: EnrichedCartItem) => void;
  onDecrement: (item: EnrichedCartItem) => void;
  onRemove: (item: EnrichedCartItem) => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  isMutating,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  const isMin = item.quantity <= 1;

  return (
    <AppCard variant="elevated" padding="md" style={styles.card}>
      <View style={styles.contentRow}>
        {/* Garment Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="shirt-outline" size={24} color={colors.primary} />
        </View>

        {/* Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <AppText variant="bodyBold" color="primary" numberOfLines={1} style={styles.title}>
              {item.garmentName}
            </AppText>

            {/* Remove Action Button (44x44 minimum touch target) */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onRemove(item)}
              disabled={isMutating}
              style={styles.removeButton}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item.garmentName} from cart`}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>

          {/* Service Name & Unit Price */}
          <AppText variant="caption" color="secondary" numberOfLines={1} style={styles.serviceText}>
            Service: {item.serviceName}
          </AppText>
          <AppText variant="caption" color="muted" style={styles.unitPriceText}>
            {formatCurrency(item.unitPrice)} per item
          </AppText>

          {/* Controls Row: Quantity & Subtotal */}
          <View style={styles.controlsRow}>
            {/* Quantity Stepper (touch targets 44x44) */}
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onDecrement(item)}
                disabled={isMutating || isMin}
                style={[
                  styles.stepperButton,
                  (isMutating || isMin) && styles.stepperButtonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Decrease item quantity"
              >
                <Ionicons
                  name="remove"
                  size={16}
                  color={isMutating || isMin ? colors.textDisabled : colors.primary}
                />
              </TouchableOpacity>

              <View style={styles.stepperValue}>
                {isMutating ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <AppText variant="bodyBold" color="primary">
                    {item.quantity}
                  </AppText>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onIncrement(item)}
                disabled={isMutating}
                style={[styles.stepperButton, isMutating && styles.stepperButtonDisabled]}
                accessibilityRole="button"
                accessibilityLabel="Increase item quantity"
              >
                <Ionicons
                  name="add"
                  size={16}
                  color={isMutating ? colors.textDisabled : colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Subtotal */}
            <View style={styles.subtotalContainer}>
              <AppText variant="caption" color="muted" align="right">
                Item Total
              </AppText>
              <AppText variant="bodyBold" color="brand" align="right">
                {formatCurrency(item.subtotal)}
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    ...shadows.card,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primarySurface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    marginTop: spacing.xxs,
  },
  detailsContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    flex: 1,
    marginRight: spacing.xs,
  },
  removeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -spacing.xs,
    marginTop: -spacing.xs,
  },
  serviceText: {
    marginTop: spacing.xxs,
  },
  unitPriceText: {
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.xxs,
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonDisabled: {
    backgroundColor: colors.surfaceDisabled,
    opacity: 0.6,
  },
  stepperValue: {
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  subtotalContainer: {
    alignItems: "flex-end",
  },
});
