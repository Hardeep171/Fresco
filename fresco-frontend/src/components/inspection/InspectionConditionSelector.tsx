import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ITEM_CONDITIONS,
  ITEM_CONDITION_LABELS,
  ITEM_CONDITION_ICONS,
  ItemCondition,
} from "../../constants/inspection.constants";
import { AppText } from "../common";
import { colors, spacing, radius } from "../../theme";

export interface InspectionConditionSelectorProps {
  selectedCondition: ItemCondition;
  onSelectCondition: (condition: ItemCondition) => void;
  disabled?: boolean;
}

const getConditionColor = (condition: ItemCondition): string => {
  return colors.itemCondition[condition] || colors.textSecondary;
};


export const InspectionConditionSelector: React.FC<
  InspectionConditionSelectorProps
> = ({ selectedCondition, onSelectCondition, disabled = false }) => {
  return (
    <View style={styles.container}>
      {ITEM_CONDITIONS.map((condition) => {
        const isSelected = selectedCondition === condition;
        const conditionColor = getConditionColor(condition);
        const iconName = ITEM_CONDITION_ICONS[condition];
        const label = ITEM_CONDITION_LABELS[condition];

        return (
          <TouchableOpacity
            key={condition}
            activeOpacity={0.7}
            disabled={disabled}
            onPress={() => onSelectCondition(condition)}
            style={[
              styles.optionCard,
              isSelected ? styles.optionCardSelected : styles.optionCardUnselected,
              isSelected && { borderColor: conditionColor },
            ]}
            accessibilityRole="radio"
            accessibilityLabel={`Condition: ${label}`}
            accessibilityState={{ selected: isSelected, disabled }}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={iconName}
                size={20}
                color={isSelected ? conditionColor : colors.textMuted}
              />
            </View>

            <View style={styles.textContainer}>
              <AppText
                variant="bodyMedium"
                color={isSelected ? "primary" : "secondary"}
              >
                {label}
              </AppText>
            </View>

            <View style={styles.radioOuter}>
              {isSelected ? (
                <View
                  style={[
                    styles.radioInner,
                    { backgroundColor: conditionColor },
                  ]}
                />
              ) : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  optionCardSelected: {
    backgroundColor: colors.surface,
  },
  optionCardUnselected: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  iconContainer: {
    marginRight: spacing.sm,
    width: 24,
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: radius.round,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: radius.round,
  },
});
