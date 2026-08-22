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
  AppHeader,
  ScreenContainer,
} from "../../components/common";
import { colors, spacing, radius } from "../../theme";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register, isLoading, error, clearError } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!firstName.trim() || firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters.";
    }

    if (!lastName.trim() || lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters.";
    }

    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      errors.phone = "Phone number must be at least 10 digits.";
    }

    if (!password || password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    clearError();
    if (!validate()) return;

    await register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.replace(/\D/g, ""),
      password,
    });
  };

  return (
    <ScreenContainer scrollable statusBarStyle="dark">
      <AppHeader
        title="Create Account"
        onBackPress={() => navigation.goBack()}
        backgroundColor="transparent"
      />

      <View style={styles.headerContainer}>
        <AppText variant="h1" color="primary" style={styles.title}>
          Join FRESCO
        </AppText>
        <AppText variant="body" color="secondary">
          Experience premium on-demand fabric care
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

      <AppCard variant="outlined" padding="lg" style={styles.formCard}>
        <View style={styles.row}>
          <View style={styles.flexItem}>
            <AppInput
              label="First Name"
              placeholder="John"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (localErrors.firstName) setLocalErrors((prev) => ({ ...prev, firstName: "" }));
              }}
              error={localErrors.firstName || error?.fieldErrors?.["firstName"]}
              required
            />
          </View>
          <View style={styles.columnSpacer} />
          <View style={styles.flexItem}>
            <AppInput
              label="Last Name"
              placeholder="Doe"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (localErrors.lastName) setLocalErrors((prev) => ({ ...prev, lastName: "" }));
              }}
              error={localErrors.lastName || error?.fieldErrors?.["lastName"]}
              required
            />
          </View>
        </View>

        <AppInput
          label="Email Address"
          placeholder="name@example.com"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (localErrors.email) setLocalErrors((prev) => ({ ...prev, email: "" }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={localErrors.email || error?.fieldErrors?.["email"]}
          leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <AppInput
          label="Mobile Number"
          placeholder="9876543210"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (localErrors.phone) setLocalErrors((prev) => ({ ...prev, phone: "" }));
          }}
          keyboardType="phone-pad"
          error={localErrors.phone || error?.fieldErrors?.["phone"]}
          leftIcon={<Ionicons name="call-outline" size={20} color={colors.textSecondary} />}
          helperText="10-digit mobile number for delivery coordination."
          required
        />

        <AppInput
          label="Password"
          placeholder="Min 8 characters"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (localErrors.password) setLocalErrors((prev) => ({ ...prev, password: "" }));
          }}
          secureTextEntry
          error={localErrors.password || error?.fieldErrors?.["password"]}
          leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <AppInput
          label="Confirm Password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (localErrors.confirmPassword) setLocalErrors((prev) => ({ ...prev, confirmPassword: "" }));
          }}
          secureTextEntry
          error={localErrors.confirmPassword}
          leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <AppButton
          title="Create My Account"
          variant="primary"
          size="lg"
          loading={isLoading}
          onPress={handleRegister}
          style={styles.submitButton}
        />
      </AppCard>

      <View style={styles.footerContainer}>
        <AppText variant="body" color="secondary">
          Already have an account?{" "}
        </AppText>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Login")}
          accessibilityRole="button"
        >
          <AppText variant="bodyBold" color="brand">
            Sign In
          </AppText>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
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
  row: {
    flexDirection: "row",
  },
  flexItem: {
    flex: 1,
  },
  columnSpacer: {
    width: spacing.md,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    marginBottom: spacing.xxl,
  },
});
