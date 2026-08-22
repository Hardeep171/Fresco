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

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<NormalizedApiError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError({
        kind: "VALIDATION",
        statusCode: 400,
        message: "Please enter a valid email address.",
        rawErrors: [],
        isNetworkError: false,
        isTimeout: false,
        isAuthError: false,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await userApi.forgotPassword({ email: email.trim().toLowerCase() });
      setSuccessMessage(response.message || "Password reset token sent to your email.");
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable statusBarStyle="dark">
      <AppHeader
        title="Reset Password"
        onBackPress={() => navigation.goBack()}
        backgroundColor="transparent"
      />

      <View style={styles.headerContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="key-outline" size={32} color={colors.primary} />
        </View>
        <AppText variant="h1" color="primary" style={styles.title}>
          Forgot Password?
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          Enter your registered email address. We will send you instructions to reset your password.
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

      {successMessage ? (
        <AppCard variant="outlined" padding="lg" style={styles.successCard}>
          <View style={styles.successIconCircle}>
            <Ionicons name="mail-unread-outline" size={36} color={colors.success} />
          </View>
          <AppText variant="h3" color="success" align="center" style={styles.successTitle}>
            Check Your Email
          </AppText>
          <AppText variant="body" color="secondary" align="center" style={styles.successText}>
            {successMessage}
          </AppText>
          <AppButton
            title="Enter Reset Token"
            variant="primary"
            size="lg"
            onPress={() => navigation.navigate("ResetPassword", {})}
            style={styles.actionButton}
          />
          <AppButton
            title="Back to Sign In"
            variant="ghost"
            size="md"
            onPress={() => navigation.navigate("Login")}
          />
        </AppCard>
      ) : (
        <AppCard variant="outlined" padding="lg" style={styles.formCard}>
          <AppInput
            label="Registered Email"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
            required
          />

          <AppButton
            title="Send Reset Instructions"
            variant="primary"
            size="lg"
            loading={isLoading}
            onPress={handleSubmit}
            style={styles.actionButton}
          />

          <AppButton
            title="Back to Sign In"
            variant="ghost"
            size="md"
            onPress={() => navigation.navigate("Login")}
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
    marginBottom: spacing.sm,
  },
});
