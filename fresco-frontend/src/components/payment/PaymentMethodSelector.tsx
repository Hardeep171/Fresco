import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_DESCRIPTIONS,
  PAYMENT_METHOD_ICONS,
  PaymentMethod,
} from "../../constants/payment.constants";
import { AppText } from "../common/AppText";
import { AppCard } from "../common/AppCard";
import { useTheme, spacing, radius } from "../../theme";

export interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  disabled = false,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <AppText variant="label" color="secondary" style={styles.headerLabel}>
        SELECT PAYMENT METHOD
      </AppText>

      <View style={styles.methodsList}>
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method;
          const label = PAYMENT_METHOD_LABELS[method];
          const description = PAYMENT_METHOD_DESCRIPTIONS[method];
          const iconName = PAYMENT_METHOD_ICONS[method] || "card-outline";

          return (
            <TouchableOpacity
              key={method}
              activeOpacity={0.7}
              disabled={disabled}
              onPress={() => onSelectMethod(method)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, disabled }}
              accessibilityLabel={`${label}: ${description}`}
              style={styles.touchable}
            >
              <AppCard
                variant={isSelected ? "elevated" : "outlined"}
                padding="md"
                style={{
                  ...styles.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                  ...(isSelected ? { borderWidth: 1.5, backgroundColor: colors.surface } : {}),
                  ...(disabled ? styles.disabledCard : {}),
                }}
              >
                <View style={styles.row}>
                  {/* METHOD ICON */}
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: isSelected ? colors.primary : colors.surfaceMuted },
                    ]}
                  >
                    <Ionicons
                      name={iconName}
                      size={22}
                      color={isSelected ? colors.textInverse : colors.primary}
                    />
                  </View>

                  {/* METHOD DETAILS */}
                  <View style={styles.detailsCol}>
                    <AppText
                      variant="bodyBold"
                      color={isSelected ? "primary" : "secondary"}
                    >
                      {label}
                    </AppText>
                    <AppText
                      variant="caption"
                      color="secondary"
                      style={styles.descriptionText}
                    >
                      {description}
                    </AppText>
                  </View>

                  {/* RADIO INDICATOR */}
                  <View
                    style={[
                      styles.radioOuter,
                      { borderColor: isSelected ? colors.primary : colors.border },
                    ]}
                  >
                    {isSelected && (
                      <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                </View>
              </AppCard>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  headerLabel: {
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  methodsList: {
    gap: spacing.sm,
  },
  touchable: {
    minHeight: 56, // >= 44x44 accessibility requirement
  },
  card: {},
  disabledCard: {
    opacity: 0.6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.round,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  detailsCol: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  descriptionText: {
    marginTop: 2,
    lineHeight: 16,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: radius.round,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.xs,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: radius.round,
  },
});
