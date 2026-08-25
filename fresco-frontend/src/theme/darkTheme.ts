import { ThemeColors, Theme } from "./theme.types";
import { typography } from "./typography";
import { spacing } from "./spacing";
import { radius } from "./radius";
import type { ViewStyle } from "react-native";

/**
 * FRESCO Dark Theme Color Tokens.
 * Professionally designed dark theme with deep hierarchical surfaces,
 * preserved FRESCO brand identity, and high-contrast accessible typography.
 */
export const darkColors: ThemeColors = {
  // Brand Palette (vibrant in dark mode for optimal contrast)
  primary: "#3B82F6",         // Vibrant Royal Blue
  primaryDark: "#1D4ED8",
  primaryLight: "#60A5FA",
  primarySurface: "#1E293B",  // Deep slate navy surface
  accent: "#FBBF24",          // Amber 400
  accentLight: "#78350F",

  // Backgrounds & Surfaces (Hierarchical dark palette)
  background: "#0B0F19",          // Deep Rich Slate Background
  backgroundSecondary: "#111827", // Subtle secondary background
  surface: "#1E293B",             // Slate 800 - Standard Cards & Containers
  surfaceElevated: "#283548",     // Slate 700 - Floating Modals & Sheets
  surfaceMuted: "#141E2E",        // Inset Gray-Navy Surface for Chips/Boxes
  surfaceDisabled: "#1E293B",     // Disabled component surface
  surfacePressed: "#334155",      // Pressed state

  // Typography (High contrast & readable)
  textPrimary: "#F8FAFC",     // Slate 50 - High contrast text
  textSecondary: "#94A3B8",   // Slate 400 - Clear secondary text
  textMuted: "#64748B",       // Slate 500 - Subdued hints & placeholders
  textDisabled: "#475569",    // Slate 600 - Disabled text
  textInverse: "#0F172A",     // Inverse dark text on light elements
  textPrimaryBrand: "#60A5FA",// Light brand text

  // Borders & Dividers
  border: "#334155",          // Slate 700 - Clean visible border
  borderLight: "#1E293B",     // Subtle divider
  borderDark: "#475569",      // Strong input border
  borderStrong: "#64748B",
  borderFocus: "#60A5FA",     // Focused input border
  borderError: "#F87171",     // Error border
  divider: "#283548",         // Card divider

  // Semantic Feedback & Alerts (Tuned for dark background)
  success: "#34D399",         // Emerald 400
  successSurface: "#064E3B",  // Deep Emerald 900 tint
  warning: "#FBBF24",         // Amber 400
  warningSurface: "#78350F",  // Deep Amber 900 tint
  error: "#F87171",           // Rose 400
  errorSurface: "#7F1D1D",    // Deep Rose 900 tint
  info: "#38BDF8",            // Sky 400
  infoSurface: "#0C4A6E",     // Deep Sky 900 tint

  // Inputs
  inputBackground: "#1E293B",
  inputBorder: "#334155",
  inputFocused: "#60A5FA",
  placeholder: "#64748B",

  // Modals & Overlays
  overlay: "rgba(0, 0, 0, 0.75)",
  backdrop: "rgba(0, 0, 0, 0.8)",
  cardBackground: "#1E293B",

  // Navigation
  navigationBackground: "#0B0F19",
  navigationBorder: "#1E293B",
  navigationCard: "#1E293B",
  tabBarBackground: "#0F172A",
  tabBarBorder: "#1E293B",
  tabBarActive: "#60A5FA",
  tabBarInactive: "#94A3B8",

  // Domain Lifecycle Maps (Dark mode vibrant accents)
  orderStatus: {
    PLACED: "#38BDF8",
    CONFIRMED: "#60A5FA",
    PICKUP_ASSIGNED: "#A78BFA",
    PICKED_UP: "#818CF8",
    UNDER_INSPECTION: "#FBBF24",
    IN_PROCESS: "#F472B6",
    READY_FOR_DELIVERY: "#2DD4BF",
    OUT_FOR_DELIVERY: "#FB923C",
    DELIVERED: "#34D399",
    CANCELLED: "#F87171",
  },

  paymentStatus: {
    PENDING: "#FBBF24",
    PAID: "#34D399",
    FAILED: "#F87171",
    REFUNDED: "#94A3B8",
  },

  itemCondition: {
    NORMAL: "#34D399",
    STAINED: "#FBBF24",
    DAMAGED: "#F87171",
    TORN: "#EF4444",
    COLOR_BLEED_RISK: "#C084FC",
  },
};

/**
 * Dark theme shadows: in dark mode, elevation and subtle surface borders
 * provide depth rather than muddy black shadows.
 */
export const darkShadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,

  sm: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,

  md: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,

  lg: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  } as ViewStyle,

  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 2,
  } as ViewStyle,

  modal: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  } as ViewStyle,
} as const;

export const darkTheme: Theme = {
  mode: "dark",
  isDark: true,
  colors: darkColors,
  typography,
  spacing,
  radius,
  shadows: darkShadows,
};
