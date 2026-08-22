import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors, spacing as spacingTokens } from "../../../theme";

export type DividerSpacing = "none" | "xs" | "sm" | "md" | "lg";
export type DividerOrientation = "horizontal" | "vertical";

export interface AppDividerProps {
  spacing?: DividerSpacing;
  color?: string;
  orientation?: DividerOrientation;
  thickness?: number;
  style?: ViewStyle;
}

export const AppDivider: React.FC<AppDividerProps> = ({
  spacing = "sm",
  color = colors.border,
  orientation = "horizontal",
  thickness = 1,
  style,
}) => {
  const margin = spacingMarginMap[spacing];

  if (orientation === "vertical") {
    return (
      <View
        style={[
          styles.vertical,
          {
            width: thickness,
            backgroundColor: color,
            marginHorizontal: margin,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.horizontal,
        {
          height: thickness,
          backgroundColor: color,
          marginVertical: margin,
        },
        style,
      ]}
    />
  );
};

const spacingMarginMap: Record<DividerSpacing, number> = {
  none: spacingTokens.none,
  xs: spacingTokens.xs,
  sm: spacingTokens.sm,
  md: spacingTokens.md,
  lg: spacingTokens.lg,
};

const styles = StyleSheet.create({
  horizontal: {
    width: "100%",
  },
  vertical: {
    height: "100%",
  },
});
