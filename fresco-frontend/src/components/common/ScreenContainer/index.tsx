import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  RefreshControlProps,
} from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme, spacing } from "../../../theme";

export interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  edges?: Edge[];
  backgroundColor?: string;
  statusBarStyle?: "light" | "dark" | "auto";
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  edges = ["top", "bottom", "left", "right"],
  backgroundColor,
  statusBarStyle,
  refreshControl,
}) => {
  const { colors, isDark } = useTheme();
  const effectiveBg = backgroundColor || colors.background;
  const effectiveStatusBarStyle =
    statusBarStyle || (isDark ? "light" : "dark");

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: effectiveBg,
  };

  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, { backgroundColor: effectiveBg }]}>
      <StatusBar style={effectiveStatusBarStyle} backgroundColor={effectiveBg} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoid}
      >
        {scrollable ? (
          <ScrollView
            style={[containerStyle, style]}
            contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={refreshControl}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[containerStyle, styles.staticContent, style]}>
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPadding,
  },
  staticContent: {
    paddingHorizontal: spacing.screenPadding,
  },
});
