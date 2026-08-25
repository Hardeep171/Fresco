import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme, spacing as spacingTokens } from "../../../theme";

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
  color,
  orientation = "horizontal",
  thickness = 1,
  style,
}) => {
  const { colors } = useTheme();
  const dividerColor = color || colors.divider;
  const margin = spacingMarginMap[spacing];

  if (orientation === "vertical") {
    return (
      <View
        style={[
          styles.vertical,
          {
            width: thickness,
            backgroundColor: dividerColor,
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
          backgroundColor: dividerColor,
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
