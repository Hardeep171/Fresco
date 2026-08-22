import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { ProfileStackParamList } from "../../types/navigation.types";
import { useUser } from "../../hooks/useUser";
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

type Props = NativeStackScreenProps<
  ProfileStackParamList,
  "ChangePasswordScreen"
>;

export const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();
  const {
    changePassword,
    isChangingPassword,
    changePasswordError,
    clearErrors,
    resetSuccess,
  } = useUser();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    return () => {
      clearErrors();
      resetSuccess();
    };
  }, [clearErrors, resetSuccess]);

  const clearFieldError = (
    field: "currentPassword" | "newPassword" | "confirmPassword"
  ) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!currentPassword) {
      errors.currentPassword = "Current password is required.";
    } else if (currentPassword.length < 8) {
      errors.currentPassword = "Current password must be at least 8 characters long.";
    }

    if (!newPassword) {
      errors.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
      errors.newPassword = "New password must be at least 8 characters long.";
    } else if (newPassword === currentPassword) {
      errors.newPassword = "New password must be different from the current password.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm password is required.";
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    clearErrors();
    if (!validate()) return;

    const success = await changePassword({
      currentPassword,
      newPassword,
    });

    if (success) {
      Alert.alert(
        "Password Changed",
        "Your password has been changed successfully. For your security, please sign in again with your new password.",
        [
          {
            text: "Sign In",
            onPress: async () => {
              await logout();
            },
          },
        ]
      );
    }
  };

  return (
    <ScreenContainer scrollable statusBarStyle="dark">
      <AppHeader
        title="Change Password"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {changePasswordError && !changePasswordError.fieldErrors && (
        <View style={styles.errorBanner}>
          <Ionicons
            name="alert-circle"
            size={20}
            color={colors.error}
            style={styles.errorIcon}
          />
          <AppText
            variant="captionMedium"
            color="error"
            style={styles.errorText}
          >
            {changePasswordError.message}
          </AppText>
        </View>
      )}

      <AppCard variant="outlined" padding="lg" style={styles.formCard}>
        <AppText variant="label" color="secondary" style={styles.cardHeader}>
          SECURITY CREDENTIALS
        </AppText>

        <AppInput
          label="Current Password"
          placeholder="Enter current password"
          value={currentPassword}
          onChangeText={(val) => {
            setCurrentPassword(val);
            clearFieldError("currentPassword");
          }}
          secureTextEntry
          error={
            fieldErrors.currentPassword ||
            changePasswordError?.fieldErrors?.["currentPassword"]
          }
          leftIcon={
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.textSecondary}
            />
          }
          required
        />

        <AppInput
          label="New Password"
          placeholder="Enter at least 8 characters"
          value={newPassword}
          onChangeText={(val) => {
            setNewPassword(val);
            clearFieldError("newPassword");
          }}
          secureTextEntry
          error={
            fieldErrors.newPassword ||
            changePasswordError?.fieldErrors?.["newPassword"]
          }
          leftIcon={
            <Ionicons
              name="key-outline"
              size={20}
              color={colors.textSecondary}
            />
          }
          helperText="Must be at least 8 characters and different from current password"
          required
        />

        <AppInput
          label="Confirm New Password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChangeText={(val) => {
            setConfirmPassword(val);
            clearFieldError("confirmPassword");
          }}
          secureTextEntry
          error={
            fieldErrors.confirmPassword ||
            changePasswordError?.fieldErrors?.["confirmPassword"]
          }
          leftIcon={
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={colors.textSecondary}
            />
          }
          required
        />

        <AppButton
          title="Update Password"
          variant="primary"
          size="lg"
          loading={isChangingPassword}
          onPress={handleChangePassword}
          style={styles.submitButton}
        />
      </AppCard>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorSurface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  errorIcon: {
    marginRight: spacing.sm,
  },
  errorText: {
    flex: 1,
  },
  formCard: {
    marginVertical: spacing.md,
    marginBottom: spacing.xxxl,
  },
  cardHeader: {
    marginBottom: spacing.md,
    letterSpacing: 0.8,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
