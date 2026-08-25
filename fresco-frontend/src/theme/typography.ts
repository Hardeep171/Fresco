import type { TextStyle } from "react-native";

/**
 * Centralized typography design tokens for FRESCO mobile application.
 * Provides consistent font sizes, weights, and line heights.
 */

const fontFamily = "System";

export const typography = {
  fontFamily: {
    regular: fontFamily,
    medium: fontFamily,
    bold: fontFamily,
  },

  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    display: 32,
  },

  fontWeight: {
    regular: "400" as TextStyle["fontWeight"],
    medium: "500" as TextStyle["fontWeight"],
    semiBold: "600" as TextStyle["fontWeight"],
    bold: "700" as TextStyle["fontWeight"],
    extraBold: "800" as TextStyle["fontWeight"],
  },

  lineHeight: {
    xs: 15,
    sm: 18,
    md: 22,
    lg: 24,
    xl: 28,
    xxl: 32,
    display: 40,
  },

  // Pre-configured style presets
  presets: {
    display: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: "700" as TextStyle["fontWeight"],
    },
    h1: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: "700" as TextStyle["fontWeight"],
    },
    h2: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: "600" as TextStyle["fontWeight"],
    },
    h3: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: "600" as TextStyle["fontWeight"],
    },
    bodyLarge: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: "400" as TextStyle["fontWeight"],
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "400" as TextStyle["fontWeight"],
    },
    bodyMedium: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "500" as TextStyle["fontWeight"],
    },
    bodyBold: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600" as TextStyle["fontWeight"],
    },
    caption: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "400" as TextStyle["fontWeight"],
    },
    captionMedium: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "500" as TextStyle["fontWeight"],
    },
    label: {
      fontSize: 11,
      lineHeight: 15,
      fontWeight: "600" as TextStyle["fontWeight"],
      letterSpacing: 0.5,
    },
  },
} as const;

export type Typography = typeof typography;
