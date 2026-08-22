import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../../../theme";
import { AppText } from "../AppText";
import { AppButton } from "../AppButton";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionTitle,
  onActionPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        {icon || (
          <Ionicons
            name="cube-outline"
            size={48}
            color={colors.primary}
          />
        )}
      </View>

      <AppText variant="h2" color="primary" align="center" style={styles.title}>
        {title}
      </AppText>

      {description && (
        <AppText variant="body" color="secondary" align="center" style={styles.description}>
          {description}
        </AppText>
      )}

      {actionTitle && onActionPress && (
        <View style={styles.actionWrapper}>
          <AppButton
            title={actionTitle}
            onPress={onActionPress}
            variant="primary"
            size="md"
            fullWidth={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    width: "100%",
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primarySurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  description: {
    marginBottom: spacing.xl,
    maxWidth: 320,
  },
  actionWrapper: {
    minWidth: 160,
  },
});
