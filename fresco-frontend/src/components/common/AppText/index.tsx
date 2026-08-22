import React from "react";
import { Text as RNText, TextProps as RNTextProps, TextStyle } from "react-native";
import { colors, typography } from "../../../theme";

export type TextVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "bodyLarge"
  | "body"
  | "bodyMedium"
  | "bodyBold"
  | "caption"
  | "captionMedium"
  | "label";

export type TextColor =
  | "primary"
  | "secondary"
  | "muted"
  | "disabled"
  | "inverse"
  | "brand"
  | "success"
  | "warning"
  | "error"
  | "info";

export interface AppTextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  align?: TextStyle["textAlign"];
  children: React.ReactNode;
}

const colorMap: Record<TextColor, string> = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  muted: colors.textMuted,
  disabled: colors.textDisabled,
  inverse: colors.textInverse,
  brand: colors.primary,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.info,
};

export const AppText: React.FC<AppTextProps> = ({
  variant = "body",
  color = "primary",
  align = "left",
  style,
  children,
  ...rest
}) => {
  const presetStyle = typography.presets[variant];
  const textColor = colorMap[color];

  return (
    <RNText
      style={[
        presetStyle,
        { color: textColor, textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
};
