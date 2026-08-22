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
import { colors, spacing } from "../../../theme";

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
  backgroundColor = colors.background,
  statusBarStyle = "dark",
  refreshControl,
}) => {
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
  };

  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar style={statusBarStyle} backgroundColor={backgroundColor} />
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
