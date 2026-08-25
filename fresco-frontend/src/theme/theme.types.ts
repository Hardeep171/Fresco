import { Typography } from "./typography";
import { Spacing } from "./spacing";
import { Radius } from "./radius";
import { Shadows } from "./shadows";

/** Supported user selectable theme modes */
export type ThemeMode = "light" | "dark" | "system";

/** Semantic color tokens for FRESCO theme system */
export interface ThemeColors {
  // Brand Palette
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySurface: string;
  accent: string;
  accentLight: string;

  // Backgrounds & Surfaces (Hierarchical)
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  surfaceDisabled: string;
  surfacePressed: string;

  // Typography
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  textInverse: string;
  textPrimaryBrand: string;

  // Borders & Dividers
  border: string;
  borderLight: string;
  borderDark: string;
  borderStrong: string;
  borderFocus: string;
  borderError: string;
  divider: string;

  // Semantic Feedback & Alerts
  success: string;
  successSurface: string;
  warning: string;
  warningSurface: string;
  error: string;
  errorSurface: string;
  info: string;
  infoSurface: string;

  // Inputs
  inputBackground: string;
  inputBorder: string;
  inputFocused: string;
  placeholder: string;

  // Modals & Overlays
  overlay: string;
  backdrop: string;
  cardBackground: string;

  // Navigation
  navigationBackground: string;
  navigationBorder: string;
  navigationCard: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;

  // Domain Lifecycle Maps
  orderStatus: Record<string, string>;
  paymentStatus: Record<string, string>;
  itemCondition: Record<string, string>;
}

/** Complete Theme object structure */
export interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  typography: Typography;
  spacing: Spacing;
  radius: Radius;
  shadows: Shadows;
}

/** Theme Context value */
export interface ThemeContextValue {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  systemColorScheme: "light" | "dark";
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}
