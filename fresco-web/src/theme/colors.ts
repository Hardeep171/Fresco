export const colors = {
  // Brand Palette
  primary: "#1E3A8A",
  primaryDark: "#172554",
  primaryLight: "#3B82F6",
  primarySurface: "#EFF6FF",
  accent: "#F59E0B",
  accentLight: "#FEF3C7",

  // Backgrounds & Surfaces
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  surfaceMuted: "#F1F5F9",
  surfaceDisabled: "#E2E8F0",

  // Typography Colors
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  textDisabled: "#CBD5E1",
  textInverse: "#FFFFFF",
  textPrimaryBrand: "#1E3A8A",

  // Borders & Dividers
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  borderDark: "#CBD5E1",
  borderFocus: "#3B82F6",
  borderError: "#EF4444",

  // Semantic Feedback Colors
  success: "#10B981",
  successSurface: "#ECFDF5",
  warning: "#F59E0B",
  warningSurface: "#FFFBEB",
  error: "#EF4444",
  errorSurface: "#FEF2F2",
  info: "#0EA5E9",
  infoSurface: "#F0F9FF",

  // Order Lifecycle Status Color Map
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

  // Payment Status Color Map
  paymentStatus: {
    PENDING: "#F59E0B",
    PAID: "#10B981",
    FAILED: "#EF4444",
    REFUNDED: "#6B7280",
  },

  // Item Condition Color Map
  itemCondition: {
    NORMAL: "#10B981",
    STAINED: "#F59E0B",
    DAMAGED: "#EF4444",
    TORN: "#DC2626",
    COLOR_BLEED_RISK: "#9333EA",
  },
} as const;

export type Colors = typeof colors;
