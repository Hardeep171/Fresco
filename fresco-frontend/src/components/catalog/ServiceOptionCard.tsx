import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ServiceOptionWithPrice } from "../../types/catalog.types";
import { AppText, AppCard, AppBadge } from "../common";
import { colors, spacing, shadows } from "../../theme";
import { formatCurrency } from "../../utils/formatters";

export interface ServiceOptionCardProps {
  option: ServiceOptionWithPrice;
  isSelected: boolean;
  onSelect: (option: ServiceOptionWithPrice) => void;
}

export const ServiceOptionCard: React.FC<ServiceOptionCardProps> = ({
  option,
  isSelected,
  onSelect,
}) => {
  const { service, pricing } = option;
  const formattedServiceName =
    service.name.charAt(0).toUpperCase() + service.name.slice(1);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onSelect(option)}
      accessibilityRole="radio"
      accessibilityLabel={`Select ${formattedServiceName} service for ${formatCurrency(pricing.price)}`}
      accessibilityState={{ selected: isSelected }}
    >
      <AppCard
        variant="elevated"
        padding="md"
        style={{
          ...styles.card,
          ...(isSelected ? styles.selectedCard : {}),
        }}
      >
        <View style={styles.cardContent}>
          {/* Radio Selection Indicator */}
          <View style={styles.radioWrapper}>
            <Ionicons
              name={isSelected ? "radio-button-on" : "radio-button-off"}
              size={22}
              color={isSelected ? colors.primary : colors.textMuted}
            />
          </View>

          {/* Service Info */}
          <View style={styles.infoContainer}>
            <View style={styles.serviceTitleRow}>
              <AppText variant="bodyBold" color="primary" style={styles.serviceName}>
                {formattedServiceName}
              </AppText>
              {isSelected && (
                <AppBadge label="Selected" variant="primary" size="sm" />
              )}
            </View>

            {service.description ? (
              <AppText
                variant="caption"
                color="secondary"
                numberOfLines={2}
                style={styles.serviceDescription}
              >
                {service.description}
              </AppText>
            ) : null}
          </View>

          {/* Price Badge */}
          <View style={styles.priceContainer}>
            <AppText variant="bodyLarge" color="brand" align="right" style={styles.priceText}>
              {formatCurrency(pricing.price)}
            </AppText>
            <AppText variant="caption" color="muted" align="right">
              per item
            </AppText>
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.card,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioWrapper: {
    marginRight: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContainer: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  serviceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  serviceName: {
    marginRight: spacing.xs,
  },
  serviceDescription: {
    marginTop: spacing.xxs,
  },
  priceContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 80,
  },
  priceText: {
    fontWeight: "700",
  },
});
