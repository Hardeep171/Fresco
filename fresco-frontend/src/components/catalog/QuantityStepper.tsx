import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "../common";
import { colors, spacing, radius } from "../../theme";

export interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
}) => {
  const isMin = quantity <= min;
  const isMax = quantity >= max;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onDecrement}
        disabled={isMin}
        style={[styles.button, isMin && styles.buttonDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        accessibilityState={{ disabled: isMin }}
      >
        <Ionicons
          name="remove"
          size={18}
          color={isMin ? colors.textDisabled : colors.primary}
        />
      </TouchableOpacity>

      <View style={styles.valueContainer}>
        <AppText variant="bodyBold" color="primary" align="center" style={styles.valueText}>
          {quantity}
        </AppText>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onIncrement}
        disabled={isMax}
        style={[styles.button, isMax && styles.buttonDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        accessibilityState={{ disabled: isMax }}
      >
        <Ionicons
          name="add"
          size={18}
          color={isMax ? colors.textDisabled : colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.xxs,
    alignSelf: "flex-start",
  },
  button: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.surfaceDisabled,
    opacity: 0.6,
  },
  valueContainer: {
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  valueText: {
    fontSize: 16,
  },
});
