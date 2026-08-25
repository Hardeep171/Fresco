export { colors } from "./colors";
export { typography } from "./typography";
export { spacing } from "./spacing";
export { radius } from "./radius";
export { shadows } from "./shadows";

export { lightColors, lightTheme } from "./lightTheme";
export { darkColors, darkTheme, darkShadows } from "./darkTheme";
export { ThemeProvider, ThemeContext } from "./ThemeProvider";
export type { ThemeProviderProps } from "./ThemeProvider";
export { useTheme } from "./useTheme";
export { createNavigationTheme } from "./navigationTheme";
export { themeStorage } from "./themeStorage";

export type {
  ThemeMode,
  ThemeColors,
  Theme,
  ThemeContextValue,
} from "./theme.types";
export type { Typography } from "./typography";
export type { Spacing } from "./spacing";
export type { Radius } from "./radius";
export type { Shadows } from "./shadows";
export type { Colors } from "./colors";

import { lightTheme } from "./lightTheme";
export const theme = lightTheme;
