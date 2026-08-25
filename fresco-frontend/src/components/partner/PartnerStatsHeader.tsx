import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText, AppCard, AppBadge } from "../common";
import { useTheme, spacing, radius } from "../../theme";

export interface PartnerStatsHeaderProps {
  partnerName: string;
  activePickupsCount: number;
  activeDeliveriesCount: number;
  totalAssignmentsCount: number;
}

export const PartnerStatsHeader: React.FC<PartnerStatsHeaderProps> = ({
  partnerName,
  activePickupsCount,
  activeDeliveriesCount,
  totalAssignmentsCount,
}) => {
  const { colors } = useTheme();

  return (
    <AppCard variant="elevated" padding="md" style={styles.container}>
      {/* GREETING & STATUS ROW */}
      <View style={styles.topRow}>
        <View style={styles.partnerInfo}>
          <AppText variant="caption" color="muted">
            DELIVERY PARTNER
          </AppText>
          <AppText variant="h2" color="primary" numberOfLines={1}>
            {partnerName || "Partner"}
          </AppText>
        </View>

        <AppBadge
          label="ACTIVE ON DUTY"
          variant="success"
          size="sm"
          showDot
        />
      </View>

      {/* STATS METRIC GRID */}
      <View style={[styles.statsGrid, { backgroundColor: colors.surfaceMuted }]}>
        <View style={styles.statBox}>
          <View style={styles.statIconCircle}>
            <Ionicons name="arrow-up-circle" size={20} color={colors.primary} />
          </View>
          <AppText variant="h2" color="primary">
            {activePickupsCount}
          </AppText>
          <AppText variant="caption" color="secondary">
            Pickups Active
          </AppText>
        </View>

        <View style={[styles.dividerVertical, { backgroundColor: colors.border }]} />

        <View style={styles.statBox}>
          <View style={styles.statIconCircle}>
            <Ionicons name="arrow-down-circle" size={20} color={colors.success} />
          </View>
          <AppText variant="h2" color="success">
            {activeDeliveriesCount}
          </AppText>
          <AppText variant="caption" color="secondary">
            Deliveries Active
          </AppText>
        </View>

        <View style={[styles.dividerVertical, { backgroundColor: colors.border }]} />

        <View style={styles.statBox}>
          <View style={styles.statIconCircle}>
            <Ionicons name="layers-outline" size={20} color={colors.textSecondary} />
          </View>
          <AppText variant="h2" color="brand">
            {totalAssignmentsCount}
          </AppText>
          <AppText variant="caption" color="secondary">
            Total Tasks
          </AppText>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  partnerInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  statsGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconCircle: {
    marginBottom: spacing.xxs,
  },
  dividerVertical: {
    width: 1,
    height: 36,
  },
});
