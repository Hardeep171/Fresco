import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { ProfileStackParamList } from "../../types/navigation.types";
import { useUser } from "../../hooks/useUser";
import {
  AppText,
  AppButton,
  AppInput,
  AppCard,
  AppHeader,
  ScreenContainer,
} from "../../components/common";
import { colors, spacing, radius } from "../../theme";

type Props = NativeStackScreenProps<ProfileStackParamList, "EditProfileScreen">;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const {
    profile,
    updateProfile,
    isUpdating,
    updateError,
    clearErrors,
    resetSuccess,
  } = useUser();

  const [firstName, setFirstName] = useState(profile?.firstName || "");
  const [lastName, setLastName] = useState(profile?.lastName || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phone?: string;
  }>({});

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  useEffect(() => {
    return () => {
      clearErrors();
      resetSuccess();
    };
  }, [clearErrors, resetSuccess]);

  const clearFieldError = (field: "firstName" | "lastName" | "phone") => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errors: { firstName?: string; lastName?: string; phone?: string } = {};

    // First Name: 2-50 chars
    if (!firstName.trim()) {
      errors.firstName = "First name is required.";
    } else if (firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters long.";
    } else if (firstName.trim().length > 50) {
      errors.firstName = "First name cannot exceed 50 characters.";
    }

    // Last Name: 2-50 chars
    if (!lastName.trim()) {
      errors.lastName = "Last name is required.";
    } else if (lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters long.";
    } else if (lastName.trim().length > 50) {
      errors.lastName = "Last name cannot exceed 50 characters.";
    }

    // Phone: 10-digit mobile number
    const mobileRegex = /^\d{10}$/;
    if (!phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!mobileRegex.test(phone.trim())) {
      errors.phone = "Phone number must be a valid 10-digit mobile number.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    clearErrors();
    if (!validate()) return;

    const success = await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
    });

    if (success) {
      Alert.alert(
        "Profile Updated",
        "Your profile details have been saved successfully.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <ScreenContainer scrollable statusBarStyle="dark">
      <AppHeader
        title="Edit Profile"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {updateError && !updateError.fieldErrors && (
        <View style={styles.errorBanner}>
          <Ionicons
            name="alert-circle"
            size={20}
            color={colors.error}
            style={styles.errorIcon}
          />
          <AppText variant="captionMedium" color="error" style={styles.errorText}>
            {updateError.message}
          </AppText>
        </View>
      )}

      <AppCard variant="outlined" padding="lg" style={styles.formCard}>
        <AppText variant="label" color="secondary" style={styles.cardHeader}>
          PERSONAL DETAILS
        </AppText>

        <AppInput
          label="First Name"
          placeholder="Enter first name"
          value={firstName}
          onChangeText={(val) => {
            setFirstName(val);
            clearFieldError("firstName");
          }}
          autoCapitalize="words"
          error={fieldErrors.firstName || updateError?.fieldErrors?.["firstName"]}
          leftIcon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <AppInput
          label="Last Name"
          placeholder="Enter last name"
          value={lastName}
          onChangeText={(val) => {
            setLastName(val);
            clearFieldError("lastName");
          }}
          autoCapitalize="words"
          error={fieldErrors.lastName || updateError?.fieldErrors?.["lastName"]}
          leftIcon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <AppInput
          label="Email Address"
          value={profile?.email || ""}
          editable={false}
          leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textDisabled} />}
          helperText="Email address cannot be modified directly."
        />

        <AppInput
          label="Phone Number"
          placeholder="10-digit mobile number"
          value={phone}
          onChangeText={(val) => {
            setPhone(val);
            clearFieldError("phone");
          }}
          keyboardType="phone-pad"
          error={fieldErrors.phone || updateError?.fieldErrors?.["phone"]}
          leftIcon={<Ionicons name="call-outline" size={20} color={colors.textSecondary} />}
          helperText="Used for pickup & delivery driver coordination"
          required
        />

        <AppButton
          title="Save Changes"
          variant="primary"
          size="lg"
          loading={isUpdating}
          onPress={handleSave}
          style={styles.saveButton}
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
  saveButton: {
    marginTop: spacing.md,
  },
});
