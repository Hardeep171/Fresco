import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  AppText,
  AppButton,
  AppInput,
  AppCard,
} from "../common";
import {
  ADDRESS_LABELS,
  AddressLabel,
  DEFAULT_COUNTRY,
} from "../../constants/address.constants";
import {
  CreateAddressInput,
} from "../../types/address.types";
import { NormalizedApiError } from "../../types/api.types";
import { colors, spacing, radius } from "../../theme";

export interface AddressFormProps {
  initialValues?: Partial<CreateAddressInput>;
  onSubmit: (values: CreateAddressInput) => Promise<boolean | void>;
  isSubmitting: boolean;
  submitTitle?: string;
  serverError?: NormalizedApiError | null;
  onCancel?: () => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting,
  submitTitle = "Save Address",
  serverError,
  onCancel,
}) => {
  const [label, setLabel] = useState<AddressLabel>(
    initialValues?.label || "HOME"
  );
  const [fullName, setFullName] = useState(initialValues?.fullName || "");
  const [phone, setPhone] = useState(initialValues?.phone || "");
  const [addressLine1, setAddressLine1] = useState(
    initialValues?.addressLine1 || ""
  );
  const [addressLine2, setAddressLine2] = useState(
    initialValues?.addressLine2 || ""
  );
  const [landmark, setLandmark] = useState(initialValues?.landmark || "");
  const [city, setCity] = useState(initialValues?.city || "");
  const [stateName, setStateName] = useState(initialValues?.state || "");
  const [postalCode, setPostalCode] = useState(initialValues?.postalCode || "");
  const [country, setCountry] = useState(
    initialValues?.country || DEFAULT_COUNTRY
  );
  const [isDefault, setIsDefault] = useState(initialValues?.isDefault ?? false);

  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string | undefined>
  >({});

  // Sync initial values if updated from parent
  useEffect(() => {
    if (initialValues) {
      if (initialValues.label) setLabel(initialValues.label);
      if (initialValues.fullName !== undefined) setFullName(initialValues.fullName);
      if (initialValues.phone !== undefined) setPhone(initialValues.phone);
      if (initialValues.addressLine1 !== undefined)
        setAddressLine1(initialValues.addressLine1);
      if (initialValues.addressLine2 !== undefined)
        setAddressLine2(initialValues.addressLine2);
      if (initialValues.landmark !== undefined)
        setLandmark(initialValues.landmark);
      if (initialValues.city !== undefined) setCity(initialValues.city);
      if (initialValues.state !== undefined) setStateName(initialValues.state);
      if (initialValues.postalCode !== undefined)
        setPostalCode(initialValues.postalCode);
      if (initialValues.country !== undefined)
        setCountry(initialValues.country);
      if (initialValues.isDefault !== undefined)
        setIsDefault(initialValues.isDefault);
    }
  }, [initialValues]);

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Client-side validation strictly matching backend Zod schema constraints.
   */
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    // Full Name: 2-100 characters
    if (!fullName.trim()) {
      errors.fullName = "Full name is required.";
    } else if (fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters long.";
    } else if (fullName.trim().length > 100) {
      errors.fullName = "Full name cannot exceed 100 characters.";
    }

    // Phone: 10-15 characters, valid phone regex
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!phoneRegex.test(phone.trim())) {
      errors.phone = "Invalid phone number format.";
    } else if (phone.trim().length < 10) {
      errors.phone = "Phone number must be at least 10 characters long.";
    } else if (phone.trim().length > 15) {
      errors.phone = "Phone number cannot exceed 15 characters.";
    }

    // Address Line 1: 5-200 characters
    if (!addressLine1.trim()) {
      errors.addressLine1 = "Address line 1 is required.";
    } else if (addressLine1.trim().length < 5) {
      errors.addressLine1 = "Address line 1 must be at least 5 characters long.";
    } else if (addressLine1.trim().length > 200) {
      errors.addressLine1 = "Address line 1 cannot exceed 200 characters.";
    }

    // City: 2-100 characters
    if (!city.trim()) {
      errors.city = "City is required.";
    } else if (city.trim().length < 2) {
      errors.city = "City must be at least 2 characters long.";
    } else if (city.trim().length > 100) {
      errors.city = "City cannot exceed 100 characters.";
    }

    // State: 2-100 characters
    if (!stateName.trim()) {
      errors.state = "State is required.";
    } else if (stateName.trim().length < 2) {
      errors.state = "State must be at least 2 characters long.";
    } else if (stateName.trim().length > 100) {
      errors.state = "State cannot exceed 100 characters.";
    }

    // Postal Code: 3-15 characters, alphanumeric regex
    const postalCodeRegex = /^[A-Za-z0-9\s-]+$/;
    if (!postalCode.trim()) {
      errors.postalCode = "Postal code is required.";
    } else if (!postalCodeRegex.test(postalCode.trim())) {
      errors.postalCode = "Invalid postal code format.";
    } else if (postalCode.trim().length < 3) {
      errors.postalCode = "Postal code must be at least 3 characters long.";
    } else if (postalCode.trim().length > 15) {
      errors.postalCode = "Postal code cannot exceed 15 characters.";
    }

    // Country: 2-100 characters (if provided)
    if (country.trim() && country.trim().length < 2) {
      errors.country = "Country must be at least 2 characters long.";
    } else if (country.trim().length > 100) {
      errors.country = "Country cannot exceed 100 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: CreateAddressInput = {
      label,
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() ? addressLine2.trim() : undefined,
      landmark: landmark.trim() ? landmark.trim() : undefined,
      city: city.trim(),
      state: stateName.trim(),
      postalCode: postalCode.trim(),
      country: country.trim() || DEFAULT_COUNTRY,
      isDefault,
    };

    await onSubmit(payload);
  };

  // Helper to get error for a specific field (client-side or server-side)
  const getFieldError = (fieldName: string): string | undefined => {
    return fieldErrors[fieldName] || serverError?.fieldErrors?.[fieldName];
  };

  return (
    <View style={styles.container}>
      {serverError && !serverError.fieldErrors && (
        <View style={styles.serverErrorBanner}>
          <Ionicons
            name="alert-circle"
            size={20}
            color={colors.error}
            style={styles.errorIcon}
          />
          <AppText variant="captionMedium" color="error" style={styles.errorText}>
            {serverError.message}
          </AppText>
        </View>
      )}

      {/* Address Type / Label Selector */}
      <AppCard variant="outlined" padding="md" style={styles.sectionCard}>
        <AppText variant="label" color="secondary" style={styles.sectionTitle}>
          ADDRESS TYPE
        </AppText>
        <View style={styles.labelChipsContainer}>
          {ADDRESS_LABELS.map((item) => {
            const isSelected = label === item;
            const iconName =
              item === "HOME"
                ? "home-outline"
                : item === "OFFICE"
                ? "briefcase-outline"
                : "location-outline";

            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.7}
                onPress={() => setLabel(item)}
                style={[
                  styles.chip,
                  isSelected ? styles.chipSelected : styles.chipUnselected,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Select ${item} address type`}
                accessibilityState={{ selected: isSelected }}
              >
                <Ionicons
                  name={iconName}
                  size={16}
                  color={isSelected ? colors.primary : colors.textSecondary}
                  style={styles.chipIcon}
                />
                <AppText
                  variant="captionMedium"
                  color={isSelected ? "brand" : "secondary"}
                >
                  {item}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </AppCard>

      {/* Contact Details Card */}
      <AppCard variant="outlined" padding="md" style={styles.sectionCard}>
        <AppText variant="label" color="secondary" style={styles.sectionTitle}>
          CONTACT DETAILS
        </AppText>

        <AppInput
          label="Full Name"
          placeholder="e.g. Rahul Sharma"
          value={fullName}
          onChangeText={(val) => {
            setFullName(val);
            clearFieldError("fullName");
          }}
          autoCapitalize="words"
          error={getFieldError("fullName")}
          leftIcon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <AppInput
          label="Phone Number"
          placeholder="e.g. 9876543210"
          value={phone}
          onChangeText={(val) => {
            setPhone(val);
            clearFieldError("phone");
          }}
          keyboardType="phone-pad"
          error={getFieldError("phone")}
          leftIcon={<Ionicons name="call-outline" size={20} color={colors.textSecondary} />}
          helperText="10-digit mobile number for delivery updates"
          required
        />
      </AppCard>

      {/* Address Details Card */}
      <AppCard variant="outlined" padding="md" style={styles.sectionCard}>
        <AppText variant="label" color="secondary" style={styles.sectionTitle}>
          ADDRESS INFORMATION
        </AppText>

        <AppInput
          label="Flat / House No. / Building / Street"
          placeholder="e.g. Flat 402, Green Valley Apts, 12th Main"
          value={addressLine1}
          onChangeText={(val) => {
            setAddressLine1(val);
            clearFieldError("addressLine1");
          }}
          error={getFieldError("addressLine1")}
          leftIcon={<Ionicons name="location-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <AppInput
          label="Area / Colony / Sector (Optional)"
          placeholder="e.g. Indiranagar"
          value={addressLine2}
          onChangeText={(val) => {
            setAddressLine2(val);
            clearFieldError("addressLine2");
          }}
          error={getFieldError("addressLine2")}
          leftIcon={<Ionicons name="business-outline" size={20} color={colors.textSecondary} />}
        />

        <AppInput
          label="Landmark (Optional)"
          placeholder="e.g. Near Metro Station / Behind City Hospital"
          value={landmark}
          onChangeText={(val) => {
            setLandmark(val);
            clearFieldError("landmark");
          }}
          error={getFieldError("landmark")}
          leftIcon={<Ionicons name="flag-outline" size={20} color={colors.textSecondary} />}
        />

        <View style={styles.twoColumnRow}>
          <View style={styles.twoColumnItem}>
            <AppInput
              label="City"
              placeholder="e.g. Bengaluru"
              value={city}
              onChangeText={(val) => {
                setCity(val);
                clearFieldError("city");
              }}
              autoCapitalize="words"
              error={getFieldError("city")}
              required
            />
          </View>
          <View style={styles.twoColumnItem}>
            <AppInput
              label="State"
              placeholder="e.g. Karnataka"
              value={stateName}
              onChangeText={(val) => {
                setStateName(val);
                clearFieldError("state");
              }}
              autoCapitalize="words"
              error={getFieldError("state")}
              required
            />
          </View>
        </View>

        <View style={styles.twoColumnRow}>
          <View style={styles.twoColumnItem}>
            <AppInput
              label="Postal Code / PIN"
              placeholder="e.g. 560038"
              value={postalCode}
              onChangeText={(val) => {
                setPostalCode(val);
                clearFieldError("postalCode");
              }}
              keyboardType="default"
              autoCapitalize="characters"
              error={getFieldError("postalCode")}
              required
            />
          </View>
          <View style={styles.twoColumnItem}>
            <AppInput
              label="Country"
              placeholder="India"
              value={country}
              onChangeText={(val) => {
                setCountry(val);
                clearFieldError("country");
              }}
              autoCapitalize="words"
              error={getFieldError("country")}
            />
          </View>
        </View>
      </AppCard>

      {/* Default Address Option */}
      <AppCard variant="outlined" padding="md" style={styles.sectionCard}>
        <View style={styles.switchRow}>
          <View style={styles.switchTextContainer}>
            <AppText variant="bodyBold" color="primary">
              Set as Default Address
            </AppText>
            <AppText variant="caption" color="secondary">
              Use this address for all future pickup and delivery orders
            </AppText>
          </View>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={isDefault ? colors.primary : colors.surface}
            accessibilityLabel="Set as default address"
          />
        </View>
      </AppCard>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <AppButton
          title={submitTitle}
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          loading={isSubmitting}
          style={styles.submitButton}
        />

        {onCancel && (
          <AppButton
            title="Cancel"
            onPress={onCancel}
            variant="ghost"
            size="md"
            disabled={isSubmitting}
            style={styles.cancelButton}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingBottom: spacing.xxl,
  },
  serverErrorBanner: {
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
  errorText: {
    flex: 1,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    letterSpacing: 0.8,
  },
  labelChipsContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  chipSelected: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipIcon: {
    marginRight: spacing.xs,
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  twoColumnItem: {
    flex: 1,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  buttonContainer: {
    marginTop: spacing.sm,
  },
  submitButton: {
    marginBottom: spacing.xs,
  },
  cancelButton: {
    marginTop: spacing.xs,
  },
});
