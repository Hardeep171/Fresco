import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  ASSIGNMENT_FILTER_TABS,
  ASSIGNMENT_STATUS_LABELS,
  AssignmentFilterTab,
  AssignmentStatus,
} from "../../constants/assignment.constants";
import { AppText } from "../common";
import { colors, spacing, radius } from "../../theme";

export interface AssignmentFilterChipsProps {
  selectedTab: AssignmentFilterTab;
  onSelectTab: (tab: AssignmentFilterTab) => void;
  counts?: Partial<Record<AssignmentFilterTab, number>>;
}

const getTabLabel = (tab: AssignmentFilterTab): string => {
  if (tab === "ALL") return "All Tasks";
  return ASSIGNMENT_STATUS_LABELS[tab as AssignmentStatus] || tab;
};

export const AssignmentFilterChips: React.FC<AssignmentFilterChipsProps> = ({
  selectedTab,
  onSelectTab,
  counts,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ASSIGNMENT_FILTER_TABS.map((tab) => {
          const isSelected = selectedTab === tab;
          const label = getTabLabel(tab);
          const count = counts?.[tab];

          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.7}
              onPress={() => onSelectTab(tab)}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}
              accessibilityRole="tab"
              accessibilityLabel={`Filter ${label}${count !== undefined ? `, ${count} tasks` : ""}`}
              accessibilityState={{ selected: isSelected }}
            >
              <AppText
                variant="captionMedium"
                color={isSelected ? "inverse" : "secondary"}
                style={styles.chipText}
              >
                {label}
              </AppText>

              {count !== undefined ? (
                <View
                  style={[
                    styles.badge,
                    isSelected ? styles.badgeSelected : styles.badgeUnselected,
                  ]}
                >
                  <AppText
                    variant="label"
                    color={isSelected ? "brand" : "secondary"}
                    style={styles.badgeText}
                  >
                    {count}
                  </AppText>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.xs,
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipText: {
    lineHeight: 18,
  },
  badge: {
    marginLeft: spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.round,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeSelected: {
    backgroundColor: colors.surface,
  },
  badgeUnselected: {
    backgroundColor: colors.surfaceMuted,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
