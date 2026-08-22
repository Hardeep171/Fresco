import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { AuthStackParamList } from "../../types/navigation.types";
import { userApi } from "../../api/user.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";
import {
  AppText,
  AppButton,
  AppInput,
  AppCard,
  AppHeader,
  ScreenContainer,
} from "../../components/common";
import { colors, spacing, radius } from "../../theme";

type Props = NativeStackScreenProps<AuthStackParamList, "ResetPassword">;

export const ResetPasswordScreen: React.FC<Props> = ({ route, navigation }) => {
  const initialToken = route.params?.token || "";

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<NormalizedApiError | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!token.trim()) {
      setError({
        kind: "VALIDATION",
        statusCode: 400,
        message: "Password reset token is required.",
        rawErrors: [],
        isNetworkError: false,
        isTimeout: false,
        isAuthError: false,
      });
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError({
        kind: "VALIDATION",
        statusCode: 400,
        message: "New password must be at least 8 characters long.",
        rawErrors: [],
        isNetworkError: false,
        isTimeout: false,
        isAuthError: false,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setError({
        kind: "VALIDATION",
        statusCode: 400,
        message: "Passwords do not match.",
        rawErrors: [],
        isNetworkError: false,
        isTimeout: false,
        isAuthError: false,
      });
      return;
    }

    setIsLoading(true);
    try {
      await userApi.resetPassword({
        token: token.trim(),
        newPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable statusBarStyle="dark">
      <AppHeader
        title="Create New Password"
        onBackPress={() => navigation.goBack()}
        backgroundColor="transparent"
      />

      <View style={styles.headerContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-open-outline" size={32} color={colors.primary} />
        </View>
        <AppText variant="h1" color="primary" style={styles.title}>
          Set New Password
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          Enter the reset token received on your email and choose a strong password.
        </AppText>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color={colors.error} style={styles.errorIcon} />
          <AppText variant="captionMedium" color="error" style={styles.errorMessage}>
            {error.message}
          </AppText>
        </View>
      )}

      {success ? (
        <AppCard variant="outlined" padding="lg" style={styles.successCard}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-circle-outline" size={40} color={colors.success} />
          </View>
          <AppText variant="h3" color="success" align="center" style={styles.successTitle}>
            Password Reset Successful
          </AppText>
          <AppText variant="body" color="secondary" align="center" style={styles.successText}>
            Your password has been updated. You can now sign in with your new credentials.
          </AppText>
          <AppButton
            title="Sign In Now"
            variant="primary"
            size="lg"
            onPress={() => navigation.navigate("Login")}
          />
        </AppCard>
      ) : (
        <AppCard variant="outlined" padding="lg" style={styles.formCard}>
          <AppInput
            label="Reset Token"
            placeholder="Paste your reset token"
            value={token}
            onChangeText={setToken}
            leftIcon={<Ionicons name="key-outline" size={20} color={colors.textSecondary} />}
            required
          />

          <AppInput
            label="New Password"
            placeholder="Min 8 characters"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
            required
          />

          <AppInput
            label="Confirm New Password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} />}
            required
          />

          <AppButton
            title="Update Password"
            variant="primary"
            size="lg"
            loading={isLoading}
            onPress={handleSubmit}
            style={styles.actionButton}
          />
        </AppCard>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.round,
    backgroundColor: colors.primarySurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorSurface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorIcon: {
    marginRight: spacing.sm,
  },
  errorMessage: {
    flex: 1,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  successCard: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.round,
    backgroundColor: colors.successSurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  successTitle: {
    marginBottom: spacing.xs,
  },
  successText: {
    marginBottom: spacing.xl,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
});
