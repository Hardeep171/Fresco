/**
 * Centralized color design tokens for FRESCO mobile application.
 * All screen components MUST consume these tokens instead of hard-coded hex values.
 */
export const colors = {
  // Brand Palette
  primary: "#1E3A8A",         // Premium Deep Navy Blue
  primaryDark: "#172554",     // Dark Navy (pressed state, status bar)
  primaryLight: "#3B82F6",    // Vibrant Blue (accents, active tabs)
  primarySurface: "#EFF6FF",  // Light Blue tint for selected backgrounds
  accent: "#F59E0B",          // Amber / Gold (highlights, ratings)
  accentLight: "#FEF3C7",

  // Backgrounds & Surfaces
  background: "#F8FAFC",      // Clean Off-White Screen Background
  surface: "#FFFFFF",         // Pure White Cards & Containers
  surfaceElevated: "#FFFFFF", // Elevated Surface for Modals / Floating Cards
  surfaceMuted: "#F1F5F9",    // Muted Gray Surface for Chips / Inset Boxes
  surfaceDisabled: "#E2E8F0", // Disabled component surface

  // Typography Colors
  textPrimary: "#0F172A",     // Slate 900 (High-contrast body & headings)
  textSecondary: "#475569",   // Slate 600 (Subtitles, descriptions)
  textMuted: "#94A3B8",       // Slate 400 (Placeholders, subtle notes)
  textDisabled: "#CBD5E1",    // Slate 300 (Disabled button text)
  textInverse: "#FFFFFF",     // White text on dark backgrounds
  textPrimaryBrand: "#1E3A8A",// Brand colored text

  // Borders & Dividers
  border: "#E2E8F0",          // Default card / container border
  borderLight: "#F1F5F9",     // Subtle separator border
  borderDark: "#CBD5E1",      // Strong input border
  borderFocus: "#3B82F6",     // Input focused border
  borderError: "#EF4444",     // Input error border

  // Semantic Feedback Colors
  success: "#10B981",         // Emerald 500 (Completed, Paid, Verified)
  successSurface: "#ECFDF5",  // Emerald 50 (Success pill background)
  warning: "#F59E0B",         // Amber 500 (Pending, Attention, Alerts)
  warningSurface: "#FFFBEB",  // Amber 50 (Warning pill background)
  error: "#EF4444",           // Rose 500 (Failed, Rejected, Cancelled)
  errorSurface: "#FEF2F2",    // Rose 50 (Error pill background)
  info: "#0EA5E9",            // Sky 500 (Informational hints)
  infoSurface: "#F0F9FF",     // Sky 50 (Info pill background)

  // Verified Backend Order Lifecycle Status Color Map
  orderStatus: {
    PLACED: "#0EA5E9",
    CONFIRMED: "#3B82F6",
    PICKUP_ASSIGNED: "#8B5CF6",
    PICKED_UP: "#6366F1",
    UNDER_INSPECTION: "#F59E0B",
    IN_PROCESS: "#EC4899",
    READY_FOR_DELIVERY: "#14B8A6",
    OUT_FOR_DELIVERY: "#F97316",
    DELIVERED: "#10B981",
    CANCELLED: "#EF4444",
  },

  // Verified Backend Payment Status Color Map
  paymentStatus: {
    PENDING: "#F59E0B",
    PAID: "#10B981",
    FAILED: "#EF4444",
    REFUNDED: "#6B7280",
  },

  // Verified Backend Item Condition Color Map
  itemCondition: {
    NORMAL: "#10B981",
    STAINED: "#F59E0B",
    DAMAGED: "#EF4444",
    TORN: "#DC2626",
    COLOR_BLEED_RISK: "#9333EA",
  },
} as const;

export type Colors = typeof colors;
