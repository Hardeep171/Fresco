import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import {
  AppText,
  AppHeader,
  AppCard,
  AppBadge,
  AppButton,
  AppDivider,
  ScreenContainer,
} from "../../components/common";
import { colors, spacing, radius, shadows } from "../../theme";
import { formatPhone } from "../../utils/formatters";

export const PartnerProfileScreen: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = useCallback(() => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out from your partner account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  }, [logout]);

  const fullName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Delivery Partner";

  return (
    <ScreenContainer scrollable={false} statusBarStyle="dark">
      <AppHeader
        title="Partner Profile"
        showBack={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* PROFILE SUMMARY CARD */}
        <AppCard variant="elevated" padding="lg" style={styles.summaryCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={36} color={colors.primary} />
            </View>

            <View style={styles.nameContainer}>
              <AppText variant="h2" color="primary">
                {fullName}
              </AppText>
              <AppText variant="caption" color="secondary" style={styles.emailText}>
                {user?.email || "partner@fresco.com"}
              </AppText>
              <View style={styles.badgeRow}>
                <AppBadge label="DELIVERY PARTNER" variant="primary" size="sm" />
                <AppBadge label="ACTIVE" variant="success" size="sm" showDot />
              </View>
            </View>
          </View>
        </AppCard>

        {/* ACCOUNT INFORMATION */}
        <AppCard variant="outlined" padding="md" style={styles.sectionCard}>
          <AppText variant="label" color="secondary" style={styles.sectionTitle}>
            ACCOUNT DETAILS
          </AppText>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCol}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoTextCol}>
              <AppText variant="caption" color="muted">
                Contact Phone
              </AppText>
              <AppText variant="bodyMedium" color="primary">
                {user?.phone ? formatPhone(user.phone) : "Not registered"}
              </AppText>
            </View>
          </View>

          <AppDivider spacing="sm" />

          <View style={styles.infoRow}>
            <View style={styles.infoIconCol}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoTextCol}>
              <AppText variant="caption" color="muted">
                Registered Email
              </AppText>
              <AppText variant="bodyMedium" color="primary">
                {user?.email || "N/A"}
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* PARTNER DISPATCH GUIDELINES */}
        <AppCard variant="outlined" padding="md" style={styles.sectionCard}>
          <AppText variant="label" color="secondary" style={styles.sectionTitle}>
            DISPATCH GUIDELINES & PROTOCOL
          </AppText>

          <View style={styles.protocolRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} style={styles.protocolIcon} />
            <AppText variant="caption" color="secondary" style={styles.protocolText}>
              Always verify garment count at customer doorstep during pickup.
            </AppText>
          </View>

          <View style={styles.protocolRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} style={styles.protocolIcon} />
            <AppText variant="caption" color="secondary" style={styles.protocolText}>
              Check fabric care notes from the customer prior to collection.
            </AppText>
          </View>

          <View style={styles.protocolRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} style={styles.protocolIcon} />
            <AppText variant="caption" color="secondary" style={styles.protocolText}>
              Mark tasks completed in the app promptly upon delivery.
            </AppText>
          </View>
        </AppCard>

        {/* LOGOUT BUTTON */}
        <View style={styles.logoutContainer}>
          <AppButton
            title="Sign Out"
            variant="danger"
            size="lg"
            loading={isLoading}
            disabled={isLoading}
            onPress={handleLogout}
            leftIcon={<Ionicons name="log-out-outline" size={20} color={colors.textInverse} />}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  summaryCard: {
    marginBottom: spacing.md,
    ...shadows.card,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.round,
    backgroundColor: colors.primarySurface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  nameContainer: {
    flex: 1,
  },
  emailText: {
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xxs,
  },
  infoIconCol: {
    width: 28,
    alignItems: "center",
  },
  infoTextCol: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  protocolRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: spacing.xxs,
  },
  protocolIcon: {
    marginRight: spacing.xs,
    marginTop: 2,
  },
  protocolText: {
    flex: 1,
    lineHeight: 18,
  },
  logoutContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
