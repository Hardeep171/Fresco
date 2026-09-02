import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, spacing } from "../../../theme";
import { AppText } from "../AppText";
import { AppIconButton } from "../AppIconButton";

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBackPress,
  rightAction,
  backgroundColor,
  style,
}) => {
  const { colors } = useTheme();
  const effectiveBg = backgroundColor || colors.background;
  const hasBack = Boolean(showBack && onBackPress);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: effectiveBg,
          borderBottomColor: colors.borderLight,
        },
        style,
      ]}
    >
      <View style={[styles.leftContainer, !hasBack && styles.emptySideContainer]}>
        {showBack && onBackPress && (
          <AppIconButton
            icon={<Ionicons name="arrow-back" size={24} color={colors.textPrimary} />}
            onPress={onBackPress}
            size="sm"
            accessibilityLabel="Go back"
            style={styles.backButton}
          />
        )}
      </View>

      <View style={styles.centerContainer}>
        <AppText variant="h3" color="primary" align="center" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="caption" color="secondary" align="center" numberOfLines={1}>
            {subtitle}
          </AppText>
        )}
      </View>

      <View style={[styles.rightContainer, !rightAction && styles.emptySideContainer]}>
        {rightAction}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
  },
  leftContainer: {
    minWidth: 40,
    alignItems: "flex-start",
    justifyContent: "center",
    flexShrink: 0,
  },
  emptySideContainer: {
    minWidth: 0,
  },
  backButton: {
    marginLeft: -spacing.xs,
  },
  centerContainer: {
    flex: 1,
    flexShrink: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  rightContainer: {
    minWidth: 40,
    alignItems: "flex-end",
    justifyContent: "center",
    flexShrink: 0,
  },
});
