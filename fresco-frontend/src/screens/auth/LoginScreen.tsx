import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { AuthStackParamList } from "../../types/navigation.types";
import { useAuth } from "../../hooks/useAuth";
import {
  AppText,
  AppButton,
  AppInput,
  AppCard,
  ScreenContainer,
} from "../../components/common";
import { useTheme, colors, spacing, radius } from "../../theme";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, isLoading, error, clearError, clearFieldError } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localErrors, setLocalErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    if (!validate()) return;

    await login({
      email: email.trim().toLowerCase(),
      password,
    });
  };

  const hasFieldErrors = Boolean(
    error?.fieldErrors && Object.keys(error.fieldErrors).length > 0
  );
  const shouldShowBanner = Boolean(error && !hasFieldErrors);

  return (
    <ScreenContainer scrollable>
      <View style={styles.headerContainer}>
        <View style={[styles.logoBadge, { backgroundColor: colors.primarySurface }]}>
          <Ionicons name="shirt" size={28} color={colors.primary} />
        </View>
        <AppText variant="h1" color="primary" style={styles.title}>
          Welcome Back
        </AppText>
        <AppText variant="body" color="secondary">
          Sign in to track orders and schedule fabric care
        </AppText>
      </View>

      {shouldShowBanner && error && (
        <View style={[styles.errorBanner, { backgroundColor: colors.errorSurface }]}>
          <Ionicons name="alert-circle" size={20} color={colors.error} style={styles.errorIcon} />
          <AppText variant="captionMedium" color="error" style={styles.errorMessage}>
            {error.message}
          </AppText>
        </View>
      )}

      <AppCard variant="outlined" padding="lg" style={styles.formCard}>
        <AppInput
          label="Email Address"
          placeholder="name@example.com"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (localErrors.email) setLocalErrors((prev) => ({ ...prev, email: undefined }));
            if (error?.fieldErrors?.["email"]) clearFieldError("email");
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={localErrors.email || error?.fieldErrors?.["email"]}
          leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <AppInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (localErrors.password) setLocalErrors((prev) => ({ ...prev, password: undefined }));
            if (error?.fieldErrors?.["password"]) clearFieldError("password");
          }}
          secureTextEntry
          error={localErrors.password || error?.fieldErrors?.["password"]}
          leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate("ForgotPassword")}
          style={styles.forgotPasswordButton}
          accessibilityRole="button"
        >
          <AppText variant="captionMedium" color="brand">
            Forgot Password?
          </AppText>
        </TouchableOpacity>

        <AppButton
          title="Sign In"
          variant="primary"
          size="lg"
          loading={isLoading}
          onPress={handleLogin}
          style={styles.signInButton}
        />
      </AppCard>

      <View style={styles.footerContainer}>
        <AppText variant="body" color="secondary">
          Don't have an account?{" "}
        </AppText>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Register")}
          accessibilityRole="button"
        >
          <AppText variant="bodyBold" color="brand">
            Sign Up
          </AppText>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  logoBadge: {
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
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: spacing.lg,
    paddingVertical: spacing.xs,
  },
  signInButton: {
    marginTop: spacing.xs,
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    marginBottom: spacing.xxl,
  },
});
