import React from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  Modal,
} from "react-native";
import { useTheme, spacing, radius } from "../../../theme";
import { AppText } from "../AppText";

export type LoaderVariant = "spinner" | "fullscreen" | "skeleton";

export interface AppLoaderProps {
  variant?: LoaderVariant;
  size?: "small" | "large";
  color?: string;
  message?: string;
  skeletonWidth?: number | `${number}%`;
  skeletonHeight?: number;
  skeletonRadius?: number;
  style?: ViewStyle;
}

export const AppLoader: React.FC<AppLoaderProps> = ({
  variant = "spinner",
  size = "large",
  color,
  message,
  skeletonWidth = "100%",
  skeletonHeight = 20,
  skeletonRadius = radius.sm,
  style,
}) => {
  const { colors } = useTheme();
  const spinnerColor = color || colors.primary;

  if (variant === "fullscreen") {
    return (
      <Modal transparent animationType="fade" visible>
        <View style={[styles.fullscreenOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.fullscreenCard, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size={size} color={spinnerColor} />
            {message && (
              <AppText variant="bodyMedium" color="primary" align="center" style={styles.message}>
                {message}
              </AppText>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  if (variant === "skeleton") {
    return (
      <View
        style={[
          styles.skeleton,
          {
            width: skeletonWidth,
            height: skeletonHeight,
            borderRadius: skeletonRadius,
            backgroundColor: colors.surfaceDisabled,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View style={[styles.inlineContainer, style]}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {message && (
        <AppText variant="captionMedium" color="secondary" style={styles.inlineMessage}>
          {message}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inlineContainer: {
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineMessage: {
    marginTop: spacing.sm,
  },
  fullscreenOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  fullscreenCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 150,
  },
  message: {
    marginTop: spacing.md,
  },
  skeleton: {},
});
