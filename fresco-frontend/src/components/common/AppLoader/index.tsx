import React from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  Modal,
} from "react-native";
import { colors, spacing, radius } from "../../../theme";
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
  color = colors.primary,
  message,
  skeletonWidth = "100%",
  skeletonHeight = 20,
  skeletonRadius = radius.sm,
  style,
}) => {
  if (variant === "fullscreen") {
    return (
      <Modal transparent animationType="fade" visible>
        <View style={styles.fullscreenOverlay}>
          <View style={styles.fullscreenCard}>
            <ActivityIndicator size={size} color={color} />
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
          },
          style,
        ]}
      />
    );
  }

  return (
    <View style={[styles.inlineContainer, style]}>
      <ActivityIndicator size={size} color={color} />
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
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  fullscreenCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 150,
  },
  message: {
    marginTop: spacing.md,
  },
  skeleton: {
    backgroundColor: colors.surfaceDisabled,
  },
});
