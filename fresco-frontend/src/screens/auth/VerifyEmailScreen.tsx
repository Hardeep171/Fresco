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
import { useTheme, colors, spacing, radius } from "../../theme";

type Props = NativeStackScreenProps<AuthStackParamList, "VerifyEmail">;

export const VerifyEmailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const initialToken = route.params?.token || "";

  const [token, setToken] = useState(initialToken);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<NormalizedApiError | null>(null);
  const [success, setSuccess] = useState(false);

  const handleVerify = async () => {
    setError(null);
    if (!token.trim()) {
      setError({
        kind: "VALIDATION",
        statusCode: 400,
        message: "Email verification token is required.",
        rawErrors: [],
        isNetworkError: false,
        isTimeout: false,
        isAuthError: false,
      });
      return;
    }

    setIsLoading(true);
    try {
      await userApi.verifyEmail({ token: token.trim() });
      setSuccess(true);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable>
      <AppHeader
        title="Email Verification"
        onBackPress={() => navigation.goBack()}
        backgroundColor="transparent"
      />

      <View style={styles.headerContainer}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primarySurface }]}>
          <Ionicons name="mail-open-outline" size={32} color={colors.primary} />
        </View>
        <AppText variant="h1" color="primary" style={styles.title}>
          Verify Your Email
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          Enter the verification token sent to your registered email address.
        </AppText>
      </View>

      {error && (
        <View style={[styles.errorBanner, { backgroundColor: colors.errorSurface }]}>
          <Ionicons name="alert-circle" size={20} color={colors.error} style={styles.errorIcon} />
          <AppText variant="captionMedium" color="error" style={styles.errorMessage}>
            {error.message}
          </AppText>
        </View>
      )}

      {success ? (
        <AppCard variant="outlined" padding="lg" style={styles.successCard}>
          <View style={[styles.successIconCircle, { backgroundColor: colors.successSurface }]}>
            <Ionicons name="checkmark-done-circle-outline" size={40} color={colors.success} />
          </View>
          <AppText variant="h3" color="success" align="center" style={styles.successTitle}>
            Email Verified Successfully!
          </AppText>
          <AppText variant="body" color="secondary" align="center" style={styles.successText}>
            Your email has been verified. You now have full access to FRESCO services.
          </AppText>
          <AppButton
            title="Proceed to Sign In"
            variant="primary"
            size="lg"
            onPress={() => navigation.navigate("Login")}
          />
        </AppCard>
      ) : (
        <AppCard variant="outlined" padding="lg" style={styles.formCard}>
          <AppInput
            label="Verification Token"
            placeholder="Enter token from email"
            value={token}
            onChangeText={setToken}
            leftIcon={<Ionicons name="shield-outline" size={20} color={colors.textSecondary} />}
            required
          />

          <AppButton
            title="Verify Email"
            variant="primary"
            size="lg"
            loading={isLoading}
            onPress={handleVerify}
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
