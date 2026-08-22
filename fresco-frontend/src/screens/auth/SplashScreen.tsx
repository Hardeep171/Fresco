import React, { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { AppText } from "../../components/common/AppText";
import { colors, spacing, radius } from "../../theme";
import { StatusBar } from "expo-status-bar";

export const SplashScreen: React.FC = () => {
  const { restoreSession } = useAuth();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <View style={styles.logoCircle}>
        <Ionicons name="shirt-outline" size={56} color={colors.textInverse} />
      </View>
      <AppText variant="display" color="inverse" style={styles.brandTitle}>
        FRESCO
      </AppText>
      <AppText variant="bodyLarge" color="inverse" style={styles.tagline}>
        Premium Laundry & Fabric Care
      </AppText>

      <View style={styles.loaderWrapper}>
        <ActivityIndicator size="small" color={colors.textInverse} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  logoCircle: {
    width: 104,
    height: 104,
    borderRadius: radius.round,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  brandTitle: {
    letterSpacing: 4,
    marginBottom: spacing.xs,
  },
  tagline: {
    opacity: 0.85,
  },
  loaderWrapper: {
    position: "absolute",
    bottom: spacing.huge,
  },
});
