import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../../../theme";
import { AppText } from "../AppText";
import { AppButton } from "../AppButton";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
  retryText = "Try Again",
  icon,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        {icon || (
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={colors.error}
          />
        )}
      </View>

      <AppText variant="h2" color="primary" align="center" style={styles.title}>
        {title}
      </AppText>

      <AppText variant="body" color="secondary" align="center" style={styles.message}>
        {message}
      </AppText>

      {onRetry && (
        <View style={styles.actionWrapper}>
          <AppButton
            title={retryText}
            onPress={onRetry}
            variant="outline"
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
    backgroundColor: colors.errorSurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  message: {
    marginBottom: spacing.xl,
    maxWidth: 320,
  },
  actionWrapper: {
    minWidth: 160,
  },
});
