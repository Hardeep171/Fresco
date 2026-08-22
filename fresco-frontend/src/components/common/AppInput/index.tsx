import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radius } from "../../../theme";
import { AppText } from "../AppText";

export interface AppInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  editable?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  required?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  secureTextEntry = false,
  keyboardType = "default",
  returnKeyType,
  onSubmitEditing,
  editable = true,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  multiline = false,
  numberOfLines = 1,
  autoCapitalize = "none",
  autoCorrect = false,
  required = false,
  accessibilityLabel,
  style,
  inputStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isInteractive = editable && !disabled;
  const hasError = Boolean(error);

  // Border color based on focus & error state
  const getBorderColor = (): string => {
    if (hasError) return colors.borderError;
    if (isFocused) return colors.borderFocus;
    return colors.border;
  };

  const getBackgroundColor = (): string => {
    if (!isInteractive) return colors.surfaceMuted;
    return colors.surface;
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelRow}>
          <AppText variant="bodyMedium" color={hasError ? "error" : "primary"}>
            {label}
          </AppText>
          {required && (
            <AppText variant="bodyMedium" color="error" style={styles.requiredAsterisk}>
              *
            </AppText>
          )}
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
          },
          multiline && styles.multilineContainer,
        ]}
      >
        {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          editable={isInteractive}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={accessibilityLabel || label || placeholder}
          style={[
            styles.inputField,
            {
              color: isInteractive ? colors.textPrimary : colors.textDisabled,
            },
            multiline && styles.multilineInput,
            inputStyle,
          ]}
        />

        {secureTextEntry ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            style={styles.rightIconWrapper}
            accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
            accessibilityRole="button"
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIconWrapper}
          >
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>

      {hasError ? (
        <View style={styles.feedbackRow}>
          <Ionicons name="alert-circle" size={14} color={colors.error} style={styles.feedbackIcon} />
          <AppText variant="caption" color="error">
            {error}
          </AppText>
        </View>
      ) : helperText ? (
        <View style={styles.feedbackRow}>
          <AppText variant="caption" color="muted">
            {helperText}
          </AppText>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  requiredAsterisk: {
    marginLeft: spacing.xxs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: radius.md,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  multilineContainer: {
    alignItems: "flex-start",
    paddingVertical: spacing.sm,
    minHeight: 96,
  },
  inputField: {
    flex: 1,
    ...typography.presets.body,
    paddingVertical: spacing.sm,
  },
  multilineInput: {
    textAlignVertical: "top",
  },
  leftIconWrapper: {
    marginRight: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  rightIconWrapper: {
    marginLeft: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xs,
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xxs,
  },
  feedbackIcon: {
    marginRight: spacing.xs,
  },
});
