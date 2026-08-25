import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { ProfileStackParamList } from "../../types/navigation.types";
import { useAuth } from "../../hooks/useAuth";
import { useUser } from "../../hooks/useUser";
import { useAddress } from "../../hooks/useAddress";
import {
  AppText,
  AppButton,
  AppCard,
  AppHeader,
  AppBadge,
  AppDivider,
  ScreenContainer,
} from "../../components/common";
import { useTheme, spacing, radius } from "../../theme";
import { formatDate } from "../../utils/formatters";

type Props = NativeStackScreenProps<ProfileStackParamList, "ProfileScreen">;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();
  const { profile, loadProfile } = useUser();
  const { addresses, loadAddresses } = useAddress();
  const { colors, isDark, mode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfile();
    loadAddresses();
  }, [loadProfile, loadAddresses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadProfile(), loadAddresses()]);
    setRefreshing(false);
  }, [loadProfile, loadAddresses]);

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of your FRESCO account?",
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
  };

  const initials = `${profile?.firstName?.charAt(0) || ""}${
    profile?.lastName?.charAt(0) || ""
  }`.toUpperCase() || "F";

  const themeLabel =
    mode === "system"
      ? `System (${isDark ? "Dark" : "Light"})`
      : mode === "dark"
      ? "Dark"
      : "Light";

  return (
    <ScreenContainer
      scrollable
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <AppHeader
        title="My Account"
        showBack={false}
        rightAction={
          <AppBadge
            label={profile?.role || "CUSTOMER"}
            variant="primary"
            size="sm"
          />
        }
      />

      {/* User Header Profile Card */}
      <AppCard variant="elevated" padding="lg" style={styles.userHeaderCard}>
        <View style={styles.avatarSection}>
          <View
            style={[
              styles.avatarCircle,
              {
                backgroundColor: colors.primarySurface,
                borderColor: colors.primaryLight,
              },
            ]}
          >
            <AppText variant="h1" color="brand" style={styles.avatarText}>
              {initials}
            </AppText>
          </View>
          <View style={styles.userSummary}>
            <AppText variant="h2" color="primary" numberOfLines={1}>
              {profile?.firstName} {profile?.lastName}
            </AppText>
            <AppText variant="body" color="secondary" numberOfLines={1}>
              {profile?.email}
            </AppText>
            <View style={styles.badgeRow}>
              <AppBadge
                label={profile?.isEmailVerified ? "Verified" : "Unverified Email"}
                variant={profile?.isEmailVerified ? "success" : "warning"}
                size="sm"
                showDot
              />
            </View>
          </View>
        </View>
      </AppCard>

      {/* Account Info Details */}
      <AppCard variant="outlined" padding="md" style={styles.sectionCard}>
        <AppText variant="label" color="secondary" style={styles.sectionLabel}>
          ACCOUNT INFORMATION
        </AppText>

        <View style={styles.detailRow}>
          <View style={styles.detailIconWrapper}>
            <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
          </View>
          <View style={styles.detailContent}>
            <AppText variant="caption" color="secondary">Phone Number</AppText>
            <AppText variant="bodyMedium" color="primary">{profile?.phone || "—"}</AppText>
          </View>
        </View>

        <AppDivider spacing="xs" />

        <View style={styles.detailRow}>
          <View style={styles.detailIconWrapper}>
            <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
          </View>
          <View style={styles.detailContent}>
            <AppText variant="caption" color="secondary">Member Since</AppText>
            <AppText variant="bodyMedium" color="primary">
              {profile?.createdAt ? formatDate(profile.createdAt) : "—"}
            </AppText>
          </View>
        </View>
      </AppCard>

      {/* Settings & Navigation Options */}
      <AppCard variant="outlined" padding="none" style={styles.sectionCard}>
        <AppText variant="label" color="secondary" style={[styles.sectionLabel, styles.menuPadding]}>
          SETTINGS & MANAGEMENT
        </AppText>

        {/* My Orders */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => (navigation.getParent() as any)?.navigate("OrdersTab")}
          style={styles.menuItem}
          accessibilityRole="button"
          accessibilityLabel="My Orders"
        >
          <View style={[styles.menuIconCircle, { backgroundColor: colors.primarySurface }]}>
            <Ionicons name="receipt-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.menuTextContainer}>
            <AppText variant="bodyMedium" color="primary">
              My Orders & History
            </AppText>
            <AppText variant="caption" color="secondary">
              Track status, receipts, and order history
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <AppDivider spacing="none" />

        {/* Appearance / Theme Settings (PHASE 11) */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate("ThemeSettingsScreen")}
          style={styles.menuItem}
          accessibilityRole="button"
          accessibilityLabel="Appearance and Theme Settings"
        >
          <View style={[styles.menuIconCircle, { backgroundColor: colors.primarySurface }]}>
            <Ionicons
              name={isDark ? "moon-outline" : "sunny-outline"}
              size={20}
              color={colors.primary}
            />
          </View>
          <View style={styles.menuTextContainer}>
            <AppText variant="bodyMedium" color="primary">
              Appearance & Theme
            </AppText>
            <AppText variant="caption" color="secondary">
              Current: {themeLabel}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <AppDivider spacing="none" />

        {/* Edit Profile */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate("EditProfileScreen")}
          style={styles.menuItem}
          accessibilityRole="button"
          accessibilityLabel="Edit Profile"
        >
          <View style={[styles.menuIconCircle, { backgroundColor: colors.primarySurface }]}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
          </View>

          <View style={styles.menuTextContainer}>
            <AppText variant="bodyMedium" color="primary">
              Edit Profile
            </AppText>
            <AppText variant="caption" color="secondary">
              Update name and contact phone number
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <AppDivider spacing="none" />

        {/* Saved Addresses */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate("AddressListScreen")}
          style={styles.menuItem}
          accessibilityRole="button"
          accessibilityLabel="Manage Saved Addresses"
        >
          <View style={[styles.menuIconCircle, { backgroundColor: colors.infoSurface }]}>
            <Ionicons name="location-outline" size={20} color={colors.info} />
          </View>
          <View style={styles.menuTextContainer}>
            <AppText variant="bodyMedium" color="primary">
              Saved Addresses
            </AppText>
            <AppText variant="caption" color="secondary">
              {addresses.length === 1
                ? "1 address saved"
                : `${addresses.length} addresses saved`}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <AppDivider spacing="none" />

        {/* Change Password */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate("ChangePasswordScreen")}
          style={styles.menuItem}
          accessibilityRole="button"
          accessibilityLabel="Change Password"
        >
          <View style={[styles.menuIconCircle, { backgroundColor: colors.warningSurface }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.warning} />
          </View>
          <View style={styles.menuTextContainer}>
            <AppText variant="bodyMedium" color="primary">
              Change Password
            </AppText>
            <AppText variant="caption" color="secondary">
              Update account security credentials
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </AppCard>

      {/* Logout Action */}
      <View style={styles.logoutContainer}>
        <AppButton
          title="Sign Out"
          variant="outline"
          size="md"
          onPress={handleSignOut}
          leftIcon={<Ionicons name="log-out-outline" size={20} color={colors.primary} />}
        />
        <AppText variant="caption" color="muted" align="center" style={styles.appVersion}>
          FRESCO v1.0.0 • Fabric Care & Laundry
        </AppText>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  userHeaderCard: {
    marginVertical: spacing.md,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: radius.round,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 24,
  },
  userSummary: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    marginTop: spacing.xs,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  menuPadding: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    marginBottom: spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  detailIconWrapper: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  detailContent: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  logoutContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxxl,
  },
  appVersion: {
    marginTop: spacing.md,
  },
});
