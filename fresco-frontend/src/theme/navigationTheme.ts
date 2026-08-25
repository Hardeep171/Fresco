import { Theme as NavigationTheme } from "@react-navigation/native";
import { Theme } from "./theme.types";

/**
 * Maps the active FRESCO application theme to React Navigation's Theme structure.
 * Ensures headers, tabs, cards, and backgrounds dynamically synchronize.
 */
export const createNavigationTheme = (appTheme: Theme): NavigationTheme => ({
  dark: appTheme.isDark,
  colors: {
    primary: appTheme.colors.primary,
    background: appTheme.colors.navigationBackground,
    card: appTheme.colors.navigationCard,
    text: appTheme.colors.textPrimary,
    border: appTheme.colors.navigationBorder,
    notification: appTheme.colors.accent,
  },
});
